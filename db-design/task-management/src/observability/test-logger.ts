import { logger } from "./logger";
//
// console.log("*****************");

logger.debug({ layer: "service", operation: "createUser" }, "user created");
logger.info({ layer: "service", operation: "createUser" }, "user created");
logger.warn({ layer: "service", operation: "createUser" }, "user created");
logger.error(
  { layer: "service", operation: "createUser", err: new Error("failed") },
  "user not created",
);
logger.error(
  {
    layer: "startup",
    operation: "initApp",
    err: new Error("failed app startup"),
  },
  "App failed to launch",
);
