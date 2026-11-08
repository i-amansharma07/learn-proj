import { postgres, elasticSearch } from "../infra/client.js";

import { countProductsByCategory as countPostgres } from "./queries/postgres.js";

import { countProductsByCategory as countElasticsearch } from "./queries/elasticsearch.js";

import { runBenchmark } from "./metric.js";

const CATEGORY = "Electronics";

async function printExecutionPlan(label: string) {
  const result = await postgres.query(
    `
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT COUNT(*)
      FROM products
      WHERE category = $1
    `,
    [CATEGORY],
  );

  console.log(`\n${label}`);

  for (const row of result.rows) {
    console.log(row["QUERY PLAN"]);
  }
}

async function main() {
  console.log("\nCategory filtering benchmark");
  console.log("----------------------------");
  console.log(`Category: ${CATEGORY}`);

  // Prepare visibility information and statistics.
  await postgres.query("VACUUM (ANALYZE) products");

  // --------------------------------
  // 1. PostgreSQL baseline
  // --------------------------------

  await postgres.query("DROP INDEX IF EXISTS idx_products_category");

  await postgres.query("ANALYZE products");

  await printExecutionPlan("PostgreSQL baseline execution plan:");

  const pgBaseline = await runBenchmark("PostgreSQL (no category index)", () =>
    countPostgres(CATEGORY),
  );

  // --------------------------------
  // 2. PostgreSQL optimized
  // --------------------------------

  await postgres.query(`
    CREATE INDEX idx_products_category
    ON products(category)
  `);

  await postgres.query("ANALYZE products");

  await printExecutionPlan("PostgreSQL optimized execution plan:");

  const pgOptimized = await runBenchmark("PostgreSQL (category index)", () =>
    countPostgres(CATEGORY),
  );

  // --------------------------------
  // 3. Elasticsearch
  // --------------------------------

  const esResult = await runBenchmark("Elasticsearch (keyword term)", () =>
    countElasticsearch(CATEGORY),
  );

  // --------------------------------
  // 4. Validate results
  // --------------------------------

  const counts = [
    pgBaseline.lastValue,
    pgOptimized.lastValue,
    esResult.lastValue,
  ];

  if (counts.some((count) => count !== counts[0])) {
    throw new Error(`Result mismatch: ${JSON.stringify(counts)}`);
  }

  console.log(`\nVerified matching products: ${counts[0]}`);

  // --------------------------------
  // 5. Print results
  // --------------------------------

  console.table(
    [pgBaseline, pgOptimized, esResult].map(({ stats }) => ({
      Database: stats.name,
      Average: `${stats.averageMs.toFixed(3)} ms`,
      P50: `${stats.p50Ms.toFixed(3)} ms`,
      P95: `${stats.p95Ms.toFixed(3)} ms`,
      Minimum: `${stats.minMs.toFixed(3)} ms`,
      Maximum: `${stats.maxMs.toFixed(3)} ms`,
    })),
  );
}

main()
  .catch((error) => {
    console.error("Category benchmark failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await postgres.end();
    await elasticSearch.close();
  });
