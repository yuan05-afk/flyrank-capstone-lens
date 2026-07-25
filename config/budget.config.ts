export const BUDGET_CONFIG = {
  /** Soft stop for live-provider batches. Seed providers stay at $0. */
  maxBatchUsd: Number(process.env.MAX_BATCH_USD || 2.5),
  leaseMs: Number(process.env.JOB_LEASE_MS || 30_000),
  maxAttempts: Number(process.env.JOB_MAX_ATTEMPTS || 3),
} as const;
