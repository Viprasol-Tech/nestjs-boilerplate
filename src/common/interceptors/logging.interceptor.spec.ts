import "reflect-metadata";
import type { CallHandler } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { of, throwError } from "rxjs";
import { createMockExecutionContext } from "../testing/execution-context.mock.js";
import { LoggingInterceptor } from "./logging.interceptor.js";

describe("LoggingInterceptor", () => {
  let interceptor: LoggingInterceptor;
  let logSpy: ReturnType<typeof vi.fn>;
  let warnSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    let t = 1000;
    // Advance the clock by 5ms on each call so duration is deterministic.
    interceptor = new LoggingInterceptor(() => {
      const current = t;
      t += 5;
      return current;
    });
    logSpy = vi.fn();
    warnSpy = vi.fn();
    vi.spyOn(interceptor["logger"], "log").mockImplementation(logSpy);
    vi.spyOn(interceptor["logger"], "warn").mockImplementation(warnSpy);
  });

  function handler(observable: ReturnType<CallHandler["handle"]>): CallHandler {
    return { handle: () => observable };
  }

  it("logs method, path, and duration on success", async () => {
    const ctx = createMockExecutionContext({
      request: { method: "GET", url: "/users" },
    });

    const value = await new Promise((resolve, reject) => {
      interceptor
        .intercept(ctx, handler(of("ok")))
        .subscribe({ next: resolve, error: reject });
    });

    expect(value).toBe("ok");
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy.mock.calls[0][0]).toContain("GET /users");
    expect(logSpy.mock.calls[0][0]).toContain("ms");
  });

  it("logs a warning when the handler errors", async () => {
    const ctx = createMockExecutionContext({
      request: { method: "POST", url: "/users" },
    });

    await expect(
      new Promise((resolve, reject) => {
        interceptor
          .intercept(ctx, handler(throwError(() => new Error("boom"))))
          .subscribe({ next: resolve, error: reject });
      }),
    ).rejects.toThrow("boom");

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0][0]).toContain("POST /users failed");
    expect(warnSpy.mock.calls[0][0]).toContain("boom");
  });

  it("falls back to placeholders for missing request fields", async () => {
    const ctx = createMockExecutionContext({ request: {} });
    await new Promise((resolve) => {
      interceptor
        .intercept(ctx, handler(of(1)))
        .subscribe({ next: resolve });
    });
    expect(logSpy.mock.calls[0][0]).toContain("? ?");
  });
});
