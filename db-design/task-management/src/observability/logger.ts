import pino from "pino";
import { config } from "../config/env";
import { LogContext, ErrorContext } from "./log-events";

const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;

type LogLevel = (typeof LOG_LEVELS)[number];

/*
=> more the serious
  debug - 20
  info  - 30
  warn - 40
  error - 50
  fatal - 60
*/

function getLogLevel(): LogLevel {
  const value = config.LOG_LEVEL ?? "debug";

  if (LOG_LEVELS.includes(value as LogLevel)) {
    return value as LogLevel;
  }

  throw Error(
    `Invalid LOG_LEVEL "${value}", Expected on of : ${LOG_LEVELS.join(", ")}`,
  );
}

const pinoLogger = pino({
  level: getLogLevel(), //starting point of severity
  base: {
    // service: "task-management-api",
    environment: config.NODE_ENV ?? "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
  },
  redact: {
    paths: ["password", "password_hash"], //exclude logging these
  },
  ...(config.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false,
      },
    },
  }),
});

export const logger = {
  debug(context: LogContext, message: string) {
    pinoLogger.debug(context, message);
  },
  info(context: LogContext, message: string) {
    pinoLogger.info(context, message);
  },
  warn(context: LogContext, message: string) {
    pinoLogger.warn(context, message);
  },
  error(context: ErrorContext, message: string) {
    pinoLogger.error(context, message);
  },
  fatal(context: ErrorContext, message: string) {
    pinoLogger.fatal(context, message);
  },
};
