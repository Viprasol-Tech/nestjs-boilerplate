import { Injectable } from "@nestjs/common";

/** Outcome of a single named health check. */
export interface HealthIndicator {
  /** Whether the dependency is currently healthy. */
  status: "up" | "down";
  /** Optional human-readable detail. */
  message?: string;
}

/** Aggregate health report returned by the health endpoint. */
export interface HealthReport {
  /** Overall status — `ok` only when every indicator is `up`. */
  status: "ok" | "error";
  /** Process uptime in whole seconds. */
  uptimeSeconds: number;
  /** ISO-8601 timestamp at which the report was generated. */
  timestamp: string;
  /** Per-dependency indicators keyed by name. */
  checks: Record<string, HealthIndicator>;
}

/**
 * A named, on-demand health probe. Register probes with
 * {@link HealthService.registerCheck} to extend the report with database,
 * cache, or downstream-service checks.
 */
export interface HealthCheck {
  (): HealthIndicator | Promise<HealthIndicator>;
}

/**
 * Collects health indicators and produces an aggregate {@link HealthReport}.
 *
 * Ships with a built-in `process` check (always up) and is extensible via
 * {@link registerCheck} so applications can probe their own dependencies.
 */
@Injectable()
export class HealthService {
  private readonly checks = new Map<string, HealthCheck>();

  /**
   * @param uptime Uptime function in seconds (injectable for tests).
   * @param clock Clock function returning the current `Date`.
   */
  constructor(
    private readonly uptime: () => number = () => process.uptime(),
    private readonly clock: () => Date = () => new Date(),
  ) {
    this.registerCheck("process", () => ({ status: "up" }));
  }

  /** Register (or replace) a named health check. */
  registerCheck(name: string, check: HealthCheck): this {
    this.checks.set(name, check);
    return this;
  }

  /** Remove a previously registered check. Returns whether it existed. */
  removeCheck(name: string): boolean {
    return this.checks.delete(name);
  }

  /** Run every registered check and assemble the aggregate report. */
  async check(): Promise<HealthReport> {
    const checks: Record<string, HealthIndicator> = {};

    for (const [name, probe] of this.checks) {
      try {
        checks[name] = await probe();
      } catch (err) {
        checks[name] = {
          status: "down",
          message: err instanceof Error ? err.message : String(err),
        };
      }
    }

    const allUp = Object.values(checks).every((c) => c.status === "up");

    return {
      status: allUp ? "ok" : "error",
      uptimeSeconds: Math.floor(this.uptime()),
      timestamp: this.clock().toISOString(),
      checks,
    };
  }

  /** Lightweight liveness probe — true if the process is running. */
  liveness(): { status: "ok" } {
    return { status: "ok" };
  }
}
