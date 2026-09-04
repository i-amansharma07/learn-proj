import { createClient } from "redis";

export const redis = createClient({
  url: "redis://localhost:6379",
});

redis.on("error", (error) => {
  console.log("redis error", error);
});

export async function connectRedis() {
  await redis.connect();

  console.log("redis connected");
}
