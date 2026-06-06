import "reflect-metadata";
import { ServiceUnavailableException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

describe("HealthController", () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = moduleRef.get<HealthController>(HealthController);
    service = moduleRef.get<HealthService>(HealthService);
  });

  it("is defined with an injected service", () => {
    expect(controller).toBeInstanceOf(HealthController);
    expect(service).toBeInstanceOf(HealthService);
  });

  it("returns the report when healthy", async () => {
    const report = await controller.readiness();
    expect(report.status).toBe("ok");
    expect(report.checks.process.status).toBe("up");
  });

  it("throws ServiceUnavailableException when a check is down", async () => {
    service.registerCheck("db", () => ({ status: "down" }));
    await expect(controller.readiness()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it("exposes a liveness probe", () => {
    expect(controller.liveness()).toEqual({ status: "ok" });
  });
});
