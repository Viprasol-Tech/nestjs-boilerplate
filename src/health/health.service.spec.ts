import "reflect-metadata";
import { beforeEach, describe, expect, it } from "vitest";
import { HealthService } from "./health.service.js";

describe("HealthService", () => {
  let service: HealthService;

  beforeEach(() => {
    service = new HealthService(
      () => 123.9,
      () => new Date("2025-01-01T00:00:00.000Z"),
    );
  });

  it("reports ok with the built-in process check", async () => {
    const report = await service.check();
    expect(report.status).toBe("ok");
    expect(report.checks.process).toEqual({ status: "up" });
    expect(report.uptimeSeconds).toBe(123);
    expect(report.timestamp).toBe("2025-01-01T00:00:00.000Z");
  });

  it("aggregates a registered healthy check", async () => {
    service.registerCheck("db", () => ({ status: "up", message: "connected" }));
    const report = await service.check();
    expect(report.status).toBe("ok");
    expect(report.checks.db).toEqual({ status: "up", message: "connected" });
  });

  it("reports error when any check is down", async () => {
    service.registerCheck("cache", () => ({ status: "down" }));
    const report = await service.check();
    expect(report.status).toBe("error");
  });

  it("awaits async checks", async () => {
    service.registerCheck("remote", async () => ({ status: "up" }));
    const report = await service.check();
    expect(report.checks.remote.status).toBe("up");
  });

  it("captures thrown checks as down", async () => {
    service.registerCheck("flaky", () => {
      throw new Error("kaboom");
    });
    const report = await service.check();
    expect(report.status).toBe("error");
    expect(report.checks.flaky).toEqual({ status: "down", message: "kaboom" });
  });

  it("supports removing a check", async () => {
    service.registerCheck("temp", () => ({ status: "down" }));
    expect(service.removeCheck("temp")).toBe(true);
    const report = await service.check();
    expect(report.status).toBe("ok");
    expect(report.checks.temp).toBeUndefined();
  });

  it("liveness always returns ok", () => {
    expect(service.liveness()).toEqual({ status: "ok" });
  });
});
