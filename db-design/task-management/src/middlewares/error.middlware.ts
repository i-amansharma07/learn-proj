import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { getLogger } from "../observability/logger";
import { serialiseError } from "../utils/helper";
import type { LogLayer } from "../observability/log-events";

type PgError = Error & {
  code: string;
  constraint?: string;
};

function isPgError(err: unknown): err is PgError {
  return (
    err instanceof Error &&
    "code" in err &&
    typeof err.code === "string" &&
    /^[0-9A-Z]{5}$/.test(err.code)
  );
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  const logger = getLogger();
  if (res.headersSent) {
    return next(err);
  }

  // Application error
  if (err instanceof ApiError) {
    const context = {
      layer: "GlobalErrorMiddleware" as LogLayer,
      operation: "error.application",
    };
    if (err.statusCode >= 500) {
      logger.error(
        {
          ...context,
          err: serialiseError(err),
        },
        "Application error",
      );
    } else {
      logger.warn(
        {
          ...context,
        },
        "Application error",
      );
    }
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details !== undefined && {
        details: err.details,
      }),
    });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    logger.warn(
      {
        layer: "GlobalErrorMiddleware",
        operation: "error.validation",
        issueCount: err.issues.length,
      },
      "Request validation failed",
    );
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  //db errors
  if (isPgError(err)) {
    const context = {
      layer: "GlobalErrorMiddleware" as LogLayer,
      operation: "error.database",
      code: err.code,
      constraint: err.constraint,
    };
    switch (err.code) {
      //unique key
      case "23505":
        logger.warn(context, "Database unique constraint violation");
        return res.status(409).json({
          success: false,
          message: "A record with these details already exists",
        });

      //foreign key
      case "23503":
        logger.warn(context, "Database foreign key constraint violation");
        return res.status(409).json({
          success: false,
          message: "The operation conflicts with related records",
        });

      //not null
      case "23502":
        logger.warn(context, "Database not-null constraint violation");

        return res.status(409).json({
          success: false,
          message: "The supplied files can not be",
        });

      case "23514":
        logger.warn(context, "Database check constraint violation");
        return res.status(400).json({
          success: false,
          message: "The supplied data violates a data constraint",
        });

      //developement error
      case "42601":
        logger.warn(context, "Database syntax error");
        return res.status(500).json({
          success: false,
          message: "DB syntax error",
        });
      default:
        logger.error(
          { ...context, err: serialiseError(err) },
          "Unexpected database error",
        );
        return res.status(500).json({
          success: false,
          message: "DB Level error",
        });
    }
  }

  //Unexpected error
  logger.error(
    {
      layer: "GlobalErrorMiddleware",
      operation: "error.unhandled",
      err: serialiseError(err),
    },
    "Unhandled application error",
  );

  return res.status(500).json({
    success: false,
    message: "Unexpected Error at our end",
  });
};
