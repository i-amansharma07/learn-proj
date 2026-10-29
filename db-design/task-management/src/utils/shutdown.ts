import { Server } from "http";
import { disconnectDB } from "../db/pool";
import { logger } from "../observability/logger";
import { serialiseError } from "./helper";

let shuttingDown = false;

export const shutdown = (server: Server, signal: string) => {
  if (shuttingDown) return;
  const err = serialiseError(signal);
  logger.fatal(
    { layer: "shutdown", operation: "shutdown", err },
    `Shutting down gracefully due to signal  : ${signal}`,
  );

  shuttingDown = true;

  server.close(async () => {
    logger.info(
      { layer: "shutdown", operation: "server.close" },
      "https server is closed",
    );
    try {
      await disconnectDB();

      logger.info(
        { layer: "shutdown", operation: "server.close" },
        "Completed Shutting down",
      );
      console.log("Completed Shutting down");
    } catch (error) {
      const err = serialiseError(error);
      logger.fatal(
        { layer: "shutdown", operation: "server.close", err },
        `Error while closing server`,
      );
      process.exit(1);
    }
  });
};
