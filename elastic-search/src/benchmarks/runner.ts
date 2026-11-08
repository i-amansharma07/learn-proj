import { postgres, elasticSearch } from "../infra/client.js";

import { findProductById } from "./queries/postgres.js";

import { getProductById, searchProductById } from "./queries/elasticsearch.js";

import { runBenchmark } from "./metric.js";

async function main() {
  // Get one existing UUID outside the measured operations.
  const sample = await postgres.query<{ id: string }>(
    "SELECT id FROM products LIMIT 1",
  );

  const productId = sample.rows[0]?.id;

  if (!productId) {
    throw new Error("No products found. Run the seed script first.");
  }

  console.log("\nExact UUID lookup benchmark");
  console.log("---------------------------");
  console.log(`Product ID: ${productId}`);
  console.log("Warm-up: 20 requests");
  console.log("Measured requests: 100\n");

  const results = [];

  // PostgreSQL primary-key lookup.
  const pgResult = await runBenchmark("PostgreSQL (primary key)", () =>
    findProductById(productId),
  );

  results.push(pgResult);

  // Elasticsearch direct document retrieval.
  const esGetResult = await runBenchmark("Elasticsearch (GET)", () =>
    getProductById(productId),
  );

  results.push(esGetResult);

  // Elasticsearch term search.
  const esSearchResult = await runBenchmark("Elasticsearch (term search)", () =>
    searchProductById(productId),
  );

  results.push(esSearchResult);

  // Verify correctness outside the measured timings.
  for (const result of results) {
    if (result.lastValue !== productId) {
      throw new Error(`${result.stats.name} returned an unexpected product ID`);
    }
  }

  console.log("All three implementations returned the expected product.");

  console.table(
    results.map(({ stats }) => ({
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
    console.error("Benchmark failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await postgres.end();
    await elasticSearch.close();
  });
