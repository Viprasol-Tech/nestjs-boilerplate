import "reflect-metadata";
import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { ItemsService } from "./items.service.js";

describe("ItemsService", () => {
  let service: ItemsService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [ItemsService],
    }).compile();

    service = moduleRef.get<ItemsService>(ItemsService);
  });

  it("starts empty", () => {
    expect(service.findAll()).toEqual([]);
  });

  it("creates an item with an auto-incrementing id and timestamp", () => {
    const item = service.create({ name: "Widget", description: "A widget" });

    expect(item.id).toBe(1);
    expect(item.name).toBe("Widget");
    expect(item.description).toBe("A widget");
    expect(typeof item.createdAt).toBe("string");
    expect(Number.isNaN(Date.parse(item.createdAt))).toBe(false);
  });

  it("assigns sequential ids across multiple creates", () => {
    const first = service.create({ name: "One" });
    const second = service.create({ name: "Two" });

    expect(first.id).toBe(1);
    expect(second.id).toBe(2);
  });

  it("findAll returns all created items", () => {
    service.create({ name: "One" });
    service.create({ name: "Two" });

    const all = service.findAll();
    expect(all).toHaveLength(2);
    expect(all.map((i) => i.name)).toEqual(["One", "Two"]);
  });

  it("findAll returns a defensive copy", () => {
    service.create({ name: "One" });
    const snapshot = service.findAll();
    snapshot.pop();

    expect(service.findAll()).toHaveLength(1);
  });

  it("findOne returns the matching item", () => {
    const created = service.create({ name: "Findable" });
    expect(service.findOne(created.id)).toEqual(created);
  });

  it("findOne throws NotFoundException for a missing id", () => {
    expect(() => service.findOne(999)).toThrow(NotFoundException);
    expect(() => service.findOne(999)).toThrow("Item with id 999 not found");
  });
});
