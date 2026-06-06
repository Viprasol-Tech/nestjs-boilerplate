import "reflect-metadata";
import { Test, type TestingModule } from "@nestjs/testing";
import { describe, expect, it } from "vitest";
import { AppModule } from "./app.module.js";
import { HealthService } from "./health/health.service.js";
import { ItemsService } from "./items/items.service.js";
import { UsersService } from "./users/users.service.js";

describe("AppModule", () => {
  it("compiles and wires every feature module", async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef.get(ItemsService)).toBeInstanceOf(ItemsService);
    expect(moduleRef.get(UsersService)).toBeInstanceOf(UsersService);
    expect(moduleRef.get(HealthService)).toBeInstanceOf(HealthService);

    await moduleRef.close();
  });
});
