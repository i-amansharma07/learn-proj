import { Counter, Gauge, Histogram } from "prom-client";
import { register } from "./registry";

// 1. total http requests
// sum(rate(http_requests_total[5m]))
// Which endpoints receive the most traffic?
// Is traffic increasing?
// How many requests return 4xx?
// How many requests return 5xx?
export const httpRequestTotal = new Counter({
  name: "http_request_total",
  help: "Total number of HTTP requests received",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"] as const,

  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestsInProgress = new Gauge({
  name: "http_requests_in_progress",
  help: "Number of HTTP requests currently being processed",
  labelNames: ["method"] as const,
  registers: [register],
});
