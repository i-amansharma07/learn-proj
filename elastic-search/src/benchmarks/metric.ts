import { performance } from "node:perf_hooks";

export type BenchmarkStats = {
  name: string;
  iterations: number;
  averageMs: number;
  p50Ms: number;
  p95Ms: number;
  minMs: number;
  maxMs: number;
};

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);

  const index = Math.ceil((p / 100) * sorted.length) - 1;

  return sorted[Math.max(0, index)];
}

export async function runBenchmark(
  name: string,
  operation: () => Promise<string | undefined>,
  warmup = 20,
  iterations = 100
): Promise<{ stats: BenchmarkStats; lastValue?: string }> {
  // 1. Warm-up: execute queries without recording their time.
  for (let i = 0; i < warmup; i++) {
    await operation();
  }

  const durations: number[] = [];
  let lastValue: string | undefined;

  // 2. Actual measurement.
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    lastValue = await operation();

    const end = performance.now();

    durations.push(end - start);
  }

  const total = durations.reduce((sum, value) => sum + value, 0);

  return {
    lastValue,
    stats: {
      name,
      iterations,
      averageMs: total / iterations,
      p50Ms: percentile(durations, 50),
      p95Ms: percentile(durations, 95),
      minMs: Math.min(...durations),
      maxMs: Math.max(...durations),
    },
  };
}
