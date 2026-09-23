import { pool } from "./pool";

const result = await pool.query("SELECT NOW()");

console.log(result.rows[0]);

await pool.end();
