import cron from "node-cron";
import { connectRedis, redis } from "./redis";

//That's the fundamental distributed-lock mechanism.

console.log("application started...");

async function main() {
  await connectRedis();

  /** SCENE - 1 */
  // when every job runs it first try to set a lock if lock dont exists then it knows some other server has done the job
  // else it completes the job and lock is already set (but how does locked is removed when cron job is done who sets it free)

  //* SCENE - 2 */
  //
  cron.schedule("* * * * *", async () => {
    console.log("cron job Triggered at : ", new Date().toISOString());

    const lock = await redis.set("cron:process-orders:lock", "locked", {
      NX: true, // set this only if not exists else dont set this key
      EX: 30, // 300 sec -> 5min
    });

    if (!lock) {
      console.log("lock not acquired")
      return;
    };

    try {
      console.log("Lock acquired", JSON.stringify(lock));

      await processingOrder();
      console.log("processed orders");
    } catch (e) {
      console.log("failed to process orders");
    }
  });

  async function processingOrder() {
    console.log("processing orders");
  }
}

main();
