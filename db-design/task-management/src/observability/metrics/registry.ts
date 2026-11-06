import { Registry, collectDefaultMetrics } from "prom-client";
import { config } from "../../config/env";

//central container holding all the metrics you define.
export const register = new Registry();

register.setDefaultLabels({
  service: "task-management-api",
  environment: config.NODE_ENV ?? "development",
});

// Collect Node.js process metrics (It automatically collects Node.js runtime metrics.)
collectDefaultMetrics({
  register,
  prefix: "nodejs_",
});
