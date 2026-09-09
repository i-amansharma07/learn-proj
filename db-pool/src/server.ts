import { ConnectionPool } from "./db";

const pool = new ConnectionPool(2);

async function request(id: number) {
  console.log(`\n Request ${id} wants a connection `);
  const connection = await pool.acquire();
  console.log(`Request ${id} got connection ${connection?._id}`);
  await connection?.query(`SELECT * from Users where id = ${id}`);
  pool.release(connection!);
  console.log(`Request ${id} finished`);
}

async function main() {
  await Promise.all([
    request(1),
    request(2),
    request(3),
    request(4),
    request(5),
    request(6),
    request(7),
    request(7),
    request(9),
    request(10),
  ]);
}

main()
