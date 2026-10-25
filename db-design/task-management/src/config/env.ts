import { z } from "zod";

const envSchema = z.strictObject({
  DATABASE_URL: z.string().trim().min(1, "DATABASE_URL is required"),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const getEnv = (key: string): string | undefined => process.env[key];

const result = envSchema.safeParse({
  DATABASE_URL: getEnv("DATABASE_URL"),
  PORT: getEnv("PORT"),
  NODE_ENV: getEnv("NODE_ENV"),
});

if (!result.success) {
  console.error("Invalid environment configuration:");

  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }

  process.exit(1);
}

console.log("env config loaded");
export const config = Object.freeze(result.data);
