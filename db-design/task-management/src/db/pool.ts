import { Pool } from "pg";
import { config } from "../config/env";
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  // host: "localhost",
  // port: 5432,
  // password: "postgres",
  // database: "app_db",
  // user: "postgres",
  // connectionTimeoutMillis: 3000,
});

export const pingDB = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("Database ping completed, DB connected");
  } catch (err: any) {
    console.error(`Failed to connect with DB: ${err.message}`);
    throw err;
  }
};
