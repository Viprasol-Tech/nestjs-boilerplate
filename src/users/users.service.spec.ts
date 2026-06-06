import "reflect-metadata";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { parsePaginationQuery } from "../common/dto/pagination.dto.js";
import { UsersService } from "./users.service.js";

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();
    service = moduleRef.get<UsersService>(UsersService);
  });

  function seed(count: number): void {
    for (let i = 1; i <= count; i++) {
      service.create({ name: `User ${i}`, email: `user${i}@example.com` });
    }
  }

  it("creates a user with defaults", () => {
    const user = service.create({ name: "Ada", email: "Ada@Example.com" });
    expect(user.id).toBe(1);
    expect(user.email).toBe("ada@example.com");
    expect(user.roles).toEqual(["user"]);
    expect(Number.isNaN(Date.parse(user.createdAt))).toBe(false);
  });

  it("honours explicit roles", () => {
    const user = service.create({
      name: "Admin",
      email: "admin@example.com",
      roles: ["admin"],
    });
    expect(user.roles).toEqual(["admin"]);
  });

  it("rejects duplicate emails", () => {
    service.create({ name: "A", email: "dup@example.com" });
    expect(() =>
      service.create({ name: "B", email: "DUP@example.com" }),
    ).toThrow(ConflictException);
  });

  it("assigns sequential ids", () => {
    seed(2);
    expect(service.count()).toBe(2);
    expect(service.findOne(1).id).toBe(1);
    expect(service.findOne(2).id).toBe(2);
  });

  it("paginates the first page", () => {
    seed(25);
    const result = service.findAll(parsePaginationQuery({ page: 1, limit: 10 }));
    expect(result.data).toHaveLength(10);
    expect(result.meta.total).toBe(25);
    expect(result.meta.totalPages).toBe(3);
    expect(result.meta.hasNextPage).toBe(true);
  });

  it("paginates the last page", () => {
    seed(25);
    const result = service.findAll(parsePaginationQuery({ page: 3, limit: 10 }));
    expect(result.data).toHaveLength(5);
    expect(result.meta.hasNextPage).toBe(false);
  });

  it("finds a user by email (case-insensitive)", () => {
    service.create({ name: "Ada", email: "ada@example.com" });
    expect(service.findByEmail("ADA@example.com")?.name).toBe("Ada");
    expect(service.findByEmail("missing@example.com")).toBeUndefined();
  });

  it("throws NotFoundException for a missing id", () => {
    expect(() => service.findOne(999)).toThrow(NotFoundException);
  });

  it("removes a user", () => {
    seed(2);
    const removed = service.remove(1);
    expect(removed.id).toBe(1);
    expect(service.count()).toBe(1);
    expect(() => service.findOne(1)).toThrow(NotFoundException);
  });

  it("throws when removing a missing user", () => {
    expect(() => service.remove(404)).toThrow(NotFoundException);
  });
});
