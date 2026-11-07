import "dotenv/config";

import { Pool } from "pg";
import { Client } from "@elastic/elasticsearch";

export const postgres = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const elasticSearch = new Client({
  node: process.env.ELASTICSEARCH_NODE,
});
