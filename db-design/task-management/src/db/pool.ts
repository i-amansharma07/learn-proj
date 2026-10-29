import { Pool } from "pg";
import { config } from "../config/env";
import { logger } from "../observability/logger";
import { serialiseError } from "../utils/helper";

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  // host: "localhost",
  // port: 5432,
  // password: "postgres",
  // database: "app_db",
  // user: "postgres",
  idleTimeoutMillis: 10000, //connection will wait after which it dies (cleanup)
  max: 20,
  connectionTimeoutMillis: 10000, //app waits for getting a connection with db (new connection to pool)
});

//a new connection will be
//created and stored in pool after use in this call
export const pingDB = async () => {
  try {
    await pool.query("SELECT NOW()");
    logger.info(
      { layer: "startup", operation: "pingDB" },
      "Database connection verified",
    );
  } catch (error) {
    const err = serialiseError(error);
    logger.error(
      {
        layer: "startup",
        operation: "pingDB failed",
        err,
      },
      "DB startup failed",
    );
    throw err;
  }
};

export const disconnectDB = async () => {
  logger.info(
    { layer: "shutdown", operation: "disconnectDB" },
    "Diconnecting DB",
  );
  try {
    await pool.end();
    logger.info(
      { layer: "shutdown", operation: "disconnectDB" },
      "DB disconnected",
    );
  } catch (error) {
    const err = serialiseError(error);
    logger.error(
      { layer: "shutdown", operation: "disconnectDB", err },
      "Error disconnecting db",
    );
    throw err;
  }
};

export const dbHealthCheck = () => pingDB;
