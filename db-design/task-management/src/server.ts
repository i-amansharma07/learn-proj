import "dotenv/config";
import { config } from "./config/env";
import { app } from "./app";
import { pingDB } from "./db/pool";
import { shutdown } from "./utils/shutdown";
import { logger } from "./observability/logger";
import { serialiseError } from "./utils/helper";

const port = config.PORT ?? 4000;

process.on("uncaughtException", (error) => {
  logger.fatal(
    { layer: "startup", operation: "uncaughtException", err: error },
    "Uncaught exception; application cannot safely continue",
  );
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.fatal(
    { layer: "startup", operation: "unhandledRejection", err },
    "Unhandled promise rejection",
  );
  process.exit(1);
});

//prepare dependencies/services over here, can be injected into a container
async function bootstrapApp(): Promise<void> {
  logger.info(
    { layer: "startup", operation: "bootstrap" },
    "Bootstrapping application",
  );
  try {
    await pingDB();
    //other external services which are used by application
  } catch (error) {
    const err = serialiseError(error);
    logger.fatal(
      { layer: "startup", operation: "bootstrap", err },
      "Error while Bootstrapping Application",
    );
    process.exit(1);
  }
}

function createServer(): void {
  logger.info(
    { layer: "startup", operation: "createServer" },
    "Creating Server",
  );
  const server = app
    .listen(port, () => {
      logger.info(
        { layer: "startup", operation: "listening" },
        `Server listening on port ${port}`,
      );
    })
    .on("error", (error) => {
      const err = serialiseError(error);
      logger.fatal(
        { layer: "ErrorEvent", operation: "server.onError", err },
        "Server on Error event triggered",
      );
      process.exit(1);
    });

  process.on("SIGTERM", () => {
    shutdown(server, "SIGTERM");
  });

  process.on("SIGINT", () => {
    shutdown(server, "SIGINT");
  });
}

const start = async (): Promise<void> => {
  await bootstrapApp();
  createServer();
};

start();
