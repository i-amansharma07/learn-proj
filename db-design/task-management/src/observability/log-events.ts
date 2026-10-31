export type LogLayer =
  | "http"
  | "controller"
  | "service"
  | "repository"
  | "database"
  | "startup"
  | "shutdown"
  | "ErrorEvent"
  | "GlobalErrorMiddleware";

export interface LogContext {
  layer: LogLayer;
  operation: string;
  rowsAffected?: number | null;
  rowsFetched?: number | null;

  [key: string]: unknown;
}

export interface ErrorContext extends LogContext {
  err: Error;
}

export interface HttpLogContext extends LogContext {
  layer: "http";
  operation: "request_completed" | "request_aborted";

  method: string;
  url: string;
  statusCode: number;
  responseTimeMs: number;
  responseAborted?: boolean;
}
