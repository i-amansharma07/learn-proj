import { faker } from "@faker-js/faker";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";

import { postgres, elasticSearch } from "../infra/client.js";
import { createProductIndex, PRODUCT_INDEX } from "../infra/product-index.js";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  createdAt: string;
}

const TOTAL_PRODUCTS = 100_000;
const BATCH_SIZE = 1_000;

const catalogue = [
  { category: "Audio", type: "Wireless Headphones" },
  { category: "Audio", type: "Bluetooth Speaker" },
  { category: "Audio", type: "Noise Cancelling Earbuds" },
  { category: "Electronics", type: "Smart Watch" },
  { category: "Electronics", type: "USB-C Hub" },
  { category: "Electronics", type: "Mechanical Keyboard" },
  { category: "Electronics", type: "Gaming Mouse" },
  { category: "Fashion", type: "Running Shoes" },
];

const brands = [
  "Sony",
  "JBL",
  "Apple",
  "Samsung",
  "Logitech",
  "Bose",
  "Anker",
  "Nike",
];

const generateProducts = (count: number): Product[] => {
  faker.seed(42);

  return Array.from({ length: count }, (_, i) => {
    const item = catalogue[i % catalogue.length];

    const brand = faker.helpers.arrayElement(brands);

    const suffix = faker.helpers.arrayElement([
      "Pro",
      "Lite",
      "Ultra",
      "Studio",
      "Sport",
      "Elite",
      "",
    ]);

    const name = `${brand} ${item.type} ${suffix}`.trim();

    return {
      id: randomUUID(),
      name,

      description: `${name}. ${faker.commerce.productDescription()}`,

      category: item.category,
      brand,

      price: Number(
        faker.number
          .float({
            min: 20,
            max: 2000,
            fractionDigits: 2,
          })
          .toFixed(2),
      ),

      stock: faker.number.int({
        min: 0,
        max: 500,
      }),

      createdAt: faker.date
        .recent({
          days: 365,
        })
        .toISOString(),
    };
  });
};

// PostgreSQL insertion
async function insertIntoPostgres(products: Product[]) {
  const start = performance.now();

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    const values: (string | number)[] = [];

    const placeholders = batch.map((product, index) => {
      const offset = index * 8;

      values.push(
        product.id,
        product.name,
        product.description,
        product.category,
        product.brand,
        product.price,
        product.stock,
        product.createdAt,
      );

      return `(
        $${offset + 1},
        $${offset + 2},
        $${offset + 3},
        $${offset + 4},
        $${offset + 5},
        $${offset + 6},
        $${offset + 7},
        $${offset + 8}
      )`;
    });

    await postgres.query(
      `
        INSERT INTO products (
          id,
          name,
          description,
          category,
          brand,
          price,
          stock,
          created_at
        )
        VALUES ${placeholders.join(",")}
      `,
      values,
    );

    console.log(
      `PostgreSQL: ${Math.min(i + BATCH_SIZE, products.length)} / ${products.length}`,
    );
  }

  return performance.now() - start;
}

// elasticSearch bulk indexing
async function indexIntoelasticSearch(products: Product[]) {
  const start = performance.now();

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    const operations = batch.flatMap((product) => [
      {
        index: {
          _index: PRODUCT_INDEX,
          _id: product.id,
        },
      },
      product,
    ]);

    const response = await elasticSearch.bulk({
      operations,
      refresh: false,
    });

    if (response.errors) {
      const failures = response.items
        .filter((item) => item.index?.error)
        .slice(0, 5);

      throw new Error(
        `elasticSearch bulk indexing failed: ${JSON.stringify(failures)}`,
      );
    }

    console.log(
      `elasticSearch: ${Math.min(i + BATCH_SIZE, products.length)} / ${products.length}`,
    );
  }

  return performance.now() - start;
}

async function main() {
  try {
    console.log("\nStarting data generation...\n");

    const generationStart = performance.now();

    const products = generateProducts(TOTAL_PRODUCTS);

    const generationTime = performance.now() - generationStart;

    console.log(`Generated ${products.length} products`);

    // Create PostgreSQL table
    await postgres.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        stock INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL
      )
    `);

    // Reset previous benchmark data
    await postgres.query("TRUNCATE TABLE products");

    await createProductIndex();

    console.log("\nInserting into PostgreSQL...\n");

    const postgresTime = await insertIntoPostgres(products);

    console.log("\nIndexing into elasticSearch...\n");

    const elasticSearchTime = await indexIntoelasticSearch(products);

    console.log("\nRefreshing elasticSearch index...\n");

    const refreshStart = performance.now();

    await elasticSearch.indices.refresh({
      index: PRODUCT_INDEX,
    });

    const refreshTime = performance.now() - refreshStart;

    const pgCount = await postgres.query("SELECT COUNT(*) FROM products");

    const esCount = await elasticSearch.count({
      index: PRODUCT_INDEX,
    });

    console.log("\n========== BENCHMARK RESULTS ==========\n");

    console.table([
      {
        operation: "Data generation",
        durationMs: generationTime.toFixed(2),
      },
      {
        operation: "PostgreSQL insertion",
        durationMs: postgresTime.toFixed(2),
      },
      {
        operation: "elasticSearch indexing",
        durationMs: elasticSearchTime.toFixed(2),
      },
      {
        operation: "elasticSearch refresh",
        durationMs: refreshTime.toFixed(2),
      },
    ]);

    console.log("PostgreSQL records:", pgCount.rows[0].count);
    console.log("elasticSearch records:", esCount.count);
  } finally {
    await postgres.end();
    await elasticSearch.close();
  }
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exitCode = 1;
});
