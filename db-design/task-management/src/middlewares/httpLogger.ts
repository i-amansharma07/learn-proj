import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { pinoLogger, createLogger } from "../observability/logger";
import { requestContext } from "../observability/requestContext";

export function httpLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = randomUUID();

  const requestLogger = createLogger(pinoLogger.child({ requestId }));

  const startTime = process.hrtime.bigint();

  let responseFinished = false;

  requestContext.run(
    {
      requestId,
      logger: requestLogger,
    },
    () => {
      res.setHeader("X-Request-Id", requestId);

      res.once("finish", () => {
        responseFinished = true;
        const responseTime = Number(process.hrtime.bigint() - startTime) / 1e6;

        const logData = {
          method: req.method,
          url: req.path,
          statusCode: Number(res.statusCode),
          responseTimeMs: Number(Number(responseTime).toFixed(2)),
        };
        if (res.statusCode >= 500) {
          requestLogger.http(
            { ...logData, layer: "http", operation: "request_completed" },
            "HTTP request completed",
          );
        } else if (res.statusCode >= 400) {
          requestLogger.http(
            { ...logData, layer: "http", operation: "request_completed" },
            "HTTP request completed",
          );
        } else {
          requestLogger.http(
            { ...logData, layer: "http", operation: "request_completed" },
            "HTTP request completed",
          );
        }
      });

      // Client disconnected before response completion
      res.once("close", () => {
        if (!responseFinished) {
          const responseTime =
            Number(process.hrtime.bigint() - startTime) / 1e6;

          requestLogger.http(
            {
              layer: "http",
              operation: "request_aborted",

              method: req.method,
              url: req.path,
              statusCode: res.statusCode,
              responseTimeMs: Number(responseTime.toFixed(2)),
              responseAborted: true,
            },
            "HTTP connection closed before response completed",
          );
        }
      });

      next();
    },
  );
}
