import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  host: "localhost",
  port: 5432,
  password: "postgres",
  database: "app_db",
  user  : "postgres"
});
