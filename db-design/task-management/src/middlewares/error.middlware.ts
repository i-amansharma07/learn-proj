import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

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
  if (res.headersSent) {
    return next(err);
  }

  // Application error
  if (err instanceof ApiError) {
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
    switch (err.code) {
      //unique key
      case "23505":
        return res.status(409).json({
          success: false,
          message: "A record with these details already exists",
        });

      //foreign key
      case "23503":
        return res.status(409).json({
          success: false,
          message: "The operation conflicts with related records",
        });

      //not null
      case "23502":
        return res.status(409).json({
          success: false,
          message: "The supplied files can not be",
        });

      case "23514":
        return res.status(400).json({
          success: false,
          message: "The supplied data violates a data constraint",
        });

      default:
        break;
    }
  }

  console.error("Unhandled error:", err);

  return res
    .status(500)
    .json(new ApiResponse({}, "Unexpected Error at our end", 500));
};
