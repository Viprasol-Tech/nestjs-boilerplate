import "reflect-metadata";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { CreateUserValidationError } from "./dto/create-user.dto.js";
import { UsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";

describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = moduleRef.get<UsersController>(UsersController);
    service = moduleRef.get<UsersService>(UsersService);
  });

  it("is defined with an injected service", () => {
    expect(controller).toBeInstanceOf(UsersController);
    expect(service).toBeInstanceOf(UsersService);
  });

  it("creates a user via validated body", () => {
    const user = controller.create({ name: "Ada", email: "ada@example.com" });
    expect(user.id).toBe(1);
    expect(user.email).toBe("ada@example.com");
  });

  it("rejects an invalid body", () => {
    expect(() => controller.create({ name: "" })).toThrow(
      CreateUserValidationError,
    );
  });

  it("surfaces ConflictException on duplicate email", () => {
    controller.create({ name: "A", email: "dup@example.com" });
    expect(() =>
      controller.create({ name: "B", email: "dup@example.com" }),
    ).toThrow(ConflictException);
  });

  it("returns a paginated list with metadata", () => {
    for (let i = 1; i <= 15; i++) {
      controller.create({ name: `U${i}`, email: `u${i}@example.com` });
    }
    const page = controller.findAll({ page: "2", limit: "10" });
    expect(page.data).toHaveLength(5);
    expect(page.meta.page).toBe(2);
    expect(page.meta.total).toBe(15);
  });

  it("defaults pagination when query is empty", () => {
    controller.create({ name: "A", email: "a@example.com" });
    const page = controller.findAll({});
    expect(page.meta.page).toBe(1);
    expect(page.data).toHaveLength(1);
  });

  it("finds a single user", () => {
    const created = controller.create({ name: "A", email: "a@example.com" });
    expect(controller.findOne(created.id)).toEqual(created);
  });

  it("removes a user (admin route)", () => {
    const created = controller.create({ name: "A", email: "a@example.com" });
    expect(controller.remove(created.id)).toEqual(created);
    expect(() => controller.findOne(created.id)).toThrow(NotFoundException);
  });
});
