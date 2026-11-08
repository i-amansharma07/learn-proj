import { postgres, elasticSearch } from "../infra/client.js";

import { searchProductsFullText as searchPostgres } from "./queries/postgres.js";

import { searchProductsFullText as searchElasticsearch } from "./queries/elasticsearch.js";

import { runBenchmark } from "./metric.js";

const SEARCH_TEXT = "wireless noise cancelling headphones";

const INDEX_NAME = "idx_products_search";

const SEARCH_EXPRESSION = `
  to_tsvector(
    'simple',
    COALESCE(name, '') || ' ' || COALESCE(description, '')
  )
`;

async function printExecutionPlan(label: string) {
  const result = await postgres.query(
    `
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT id
      FROM products
      WHERE ${SEARCH_EXPRESSION}
        @@ plainto_tsquery('simple', $1)
      ORDER BY id
      LIMIT 10
    `,
    [SEARCH_TEXT],
  );

  console.log(`\n${label}`);

  for (const row of result.rows) {
    console.log(row["QUERY PLAN"]);
  }
}

async function main() {
  console.log("\nFull-text search benchmark");
  console.log("--------------------------");
  console.log(`Search: "${SEARCH_TEXT}"`);

  // Prepare PostgreSQL statistics and visibility information.
  await postgres.query("VACUUM (ANALYZE) products");

  // --------------------------------
  // 1. PostgreSQL baseline
  // --------------------------------

  await postgres.query(`DROP INDEX IF EXISTS ${INDEX_NAME}`);
  await postgres.query("ANALYZE products");

  await printExecutionPlan("PostgreSQL baseline execution plan:");

  const pgBaseline = await runBenchmark("PostgreSQL (without GIN)", () =>
    searchPostgres(SEARCH_TEXT),
  );

  // --------------------------------
  // 2. PostgreSQL optimized
  // --------------------------------

  await postgres.query(`
    CREATE INDEX ${INDEX_NAME}
    ON products
    USING GIN (${SEARCH_EXPRESSION})
  `);

  await postgres.query("ANALYZE products");

  await printExecutionPlan("PostgreSQL optimized execution plan:");

  const pgOptimized = await runBenchmark("PostgreSQL (with GIN)", () =>
    searchPostgres(SEARCH_TEXT),
  );

  // --------------------------------
  // 3. Elasticsearch
  // --------------------------------

  const esResult = await runBenchmark("Elasticsearch (combined_fields)", () =>
    searchElasticsearch(SEARCH_TEXT),
  );

  // --------------------------------
  // 4. Validate matching counts
  // --------------------------------

  const baselineData = JSON.parse(pgBaseline.lastValue!);
  const optimizedData = JSON.parse(pgOptimized.lastValue!);
  const esData = JSON.parse(esResult.lastValue!);

  const counts = [baselineData.total, optimizedData.total, esData.total];

  if (counts.some((count) => count !== counts[0])) {
    console.error("Search result count mismatch:", counts);

    throw new Error(
      "PostgreSQL and Elasticsearch returned different match counts",
    );
  }

  console.log(`\nVerified matching documents: ${counts[0]}`);

  console.log("\nTop 10 PostgreSQL IDs:");
  console.log(optimizedData.ids);

  console.log("\nTop 10 Elasticsearch IDs:");
  console.log(esData.ids);

  // --------------------------------
  // 5. Print benchmark report
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
    console.error("Full-text benchmark failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await postgres.end();
    await elasticSearch.close();
  });
