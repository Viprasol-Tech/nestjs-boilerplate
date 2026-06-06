import "reflect-metadata";
import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { CreateItemValidationError } from "./dto/create-item.dto.js";
import { ItemsController } from "./items.controller.js";
import { ItemsService } from "./items.service.js";

describe("ItemsController", () => {
  let controller: ItemsController;
  let service: ItemsService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [ItemsService],
    }).compile();

    controller = moduleRef.get<ItemsController>(ItemsController);
    service = moduleRef.get<ItemsService>(ItemsService);
  });

  it("is defined with an injected service", () => {
    expect(controller).toBeInstanceOf(ItemsController);
    expect(service).toBeInstanceOf(ItemsService);
  });

  it("create delegates to the service and validates the body", () => {
    const result = controller.create({ name: "Gadget", description: "Shiny" });

    expect(result.id).toBe(1);
    expect(result.name).toBe("Gadget");
    expect(service.findAll()).toHaveLength(1);
  });

  it("create trims the name via DTO validation", () => {
    const result = controller.create({ name: "  Trimmed  " });
    expect(result.name).toBe("Trimmed");
  });

  it("create rejects an invalid body", () => {
    expect(() => controller.create({ description: "missing name" })).toThrow(
      CreateItemValidationError,
    );
    expect(service.findAll()).toHaveLength(0);
  });

  it("findAll returns items produced through the service", () => {
    controller.create({ name: "A" });
    controller.create({ name: "B" });

    expect(controller.findAll().map((i) => i.name)).toEqual(["A", "B"]);
  });

  it("findOne delegates to the service", () => {
    const created = controller.create({ name: "Target" });
    expect(controller.findOne(created.id)).toEqual(created);
  });

  it("findOne surfaces NotFoundException from the service", () => {
    expect(() => controller.findOne(404)).toThrow(NotFoundException);
  });
});
