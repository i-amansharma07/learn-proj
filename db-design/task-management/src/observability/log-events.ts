export type LogLayer =
  | "http"
  | "controller"
  | "service"
  | "repository"
  | "database"
  | "startup"
  | "shutdown"
  | "ErrorEvent";

export interface LogContext {
  layer: LogLayer;
  operation: string;
  requestId?: string;
}

export interface ErrorContext extends LogContext {
  err: Error;
}
