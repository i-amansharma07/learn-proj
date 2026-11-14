import { Pool } from "pg";

const globalForPg = globalThis as unknown as {
  pgPool?: Pool;
};

console.log(process.env.DATABASE_URL);

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

//in prod modules dont hot reload
if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export const pingDb = async () => {
  try {
    const res = await pool.query(`SELECT NOW`);
    if (res.rows[0]) {
      console.log("DB ping checked");
    }
  } catch (err: unknown) {
    console.log("error pinging the DB");
  } finally {
    await pool.end();
  }
};
