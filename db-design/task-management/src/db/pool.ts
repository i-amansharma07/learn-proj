import console from "console";
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
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
    console.log("Database connected");
  } catch (err: any) {
    console.error(`Failed to connect with DB: ${err.message}`);
    throw err;
  }
};
