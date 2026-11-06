import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { pinoLogger, createLogger } from "../observability/logger";
import { requestContext } from "../observability/requestContext";
import {
  httpRequestDuration,
  httpRequestTotal,
  httpRequestsInProgress,
} from "../observability/metrics/http-metric";
import { hrtime } from "node:process";

function getRouteLabel(req: Request): string {
  if (req.route?.path) {
    const routePath = Array.isArray(req.route.path)
      ? req.route.path[0]
      : req.route.path;
    return `${req.baseUrl}${routePath}`;
  }

  return "unmatched";
}

export function httpLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = randomUUID();

  const requestLogger = createLogger(pinoLogger.child({ requestId }));

  const startTime = hrtime.bigint();

  let responseFinished = false;
  let metricRecorded = false;
  const path = req.path;
  //exluding monitoring endpoint from http traffic metric
  const shouldSkipMetric = path === "/metrics" || path.startsWith("/health");

  if (!shouldSkipMetric) {
    httpRequestsInProgress.labels(req.method).inc();
  }

  const completeRequestMetrics = (statusCode: string) => {
    if (shouldSkipMetric || metricRecorded) return;
    metricRecorded = true;

    const durationSeconds = Number(hrtime.bigint() - startTime) / 1e9;

    const route = getRouteLabel(req);

    httpRequestTotal.labels(req.method, route, statusCode).inc();

    httpRequestDuration
      .labels(req.method, route, statusCode)
      .observe(durationSeconds);

    httpRequestsInProgress.labels(req.method).dec();
  };

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

        completeRequestMetrics(String(res.statusCode));

        const logData = {
          method: req.method,
          url: req.path,
          statusCode: Number(res.statusCode),
          responseTimeMs: Number(Number(responseTime).toFixed(2)),
        };
        if (res.statusCode >= 500) {
          requestLogger.http(
            { ...logData, layer: "http", operation: "request_completed" },
            "HTTP request completed with 500",
          );
        } else if (res.statusCode >= 400) {
          requestLogger.http(
            { ...logData, layer: "http", operation: "request_completed" },
            "HTTP request completed with 500",
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
          const responseTime = Number(hrtime.bigint() - startTime) / 1e6;

          completeRequestMetrics("aborted");

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
