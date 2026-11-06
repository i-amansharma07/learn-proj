import { Gauge, Counter, Histogram } from "prom-client";
import type { Pool } from "pg";
import { pool } from "../../db/pool";
import { register } from "./registry";

//Counter goes up only, gauge goes up and down
export const dbPoolTotalConnections = new Gauge({
  name: "db_pool_connections_total",
  help: "Total number of PostgreSQL pool connections",
  registers: [register],
  collect() {
    this.set(pool.totalCount);
  },
});

export const dbPoolIdleConnections = new Gauge({
  name: "db_pool_connections_idle",
  help: "Total Number of PostgreSQL pool connections",
  registers: [register],
  collect() {
    this.set(pool.idleCount);
  },
});

export const dbPoolWaitingRequest = new Gauge({
  name: "db_pool_waiting_requests",
  help: "Number of requests waiting for a PostgreSQL connection",
  registers: [register],
  collect() {
    this.set(pool.waitingCount);
  },
});

export const dbQueryDuration = new Histogram({
  name: "db_query_duration_seconds",
  help: "Duration of PostgreSQL queries in seconds",
  labelNames: ["operation"] as const,
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2],
  registers: [register],
});

export const dbQueryErrors = new Counter({
  name: "db_query_errors_total",
  help: "Total number of failed PostgreSQL queries",
  labelNames: ["operation"] as const,
  registers: [register],
});
