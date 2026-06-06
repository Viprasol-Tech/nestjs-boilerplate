import { describe, expect, it } from "vitest";
import {
  CreateUserDto,
  CreateUserValidationError,
  validateCreateUserDto,
} from "./create-user.dto.js";

describe("validateCreateUserDto", () => {
  it("normalizes a valid payload", () => {
    const dto = validateCreateUserDto({
      name: "  Ada  ",
      email: "ADA@Example.COM",
    });
    expect(dto).toBeInstanceOf(CreateUserDto);
    expect(dto.name).toBe("Ada");
    expect(dto.email).toBe("ada@example.com");
    expect(dto.roles).toEqual(["user"]);
  });

  it("accepts explicit roles and dedupes them", () => {
    const dto = validateCreateUserDto({
      name: "Grace",
      email: "grace@example.com",
      roles: ["admin", "user", "admin"],
    });
    expect(dto.roles).toEqual(["admin", "user"]);
  });

  it("rejects a non-object body", () => {
    expect(() => validateCreateUserDto(null)).toThrow(CreateUserValidationError);
  });

  it("rejects a missing name", () => {
    expect(() =>
      validateCreateUserDto({ email: "a@b.com" }),
    ).toThrow(/name/);
  });

  it("rejects an invalid email", () => {
    expect(() =>
      validateCreateUserDto({ name: "X", email: "not-an-email" }),
    ).toThrow(/email/);
  });

  it("rejects an unknown role", () => {
    try {
      validateCreateUserDto({
        name: "X",
        email: "x@y.com",
        roles: ["superuser"],
      });
      throw new Error("expected to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(CreateUserValidationError);
      expect((err as CreateUserValidationError).field).toBe("roles");
    }
  });

  it("rejects an empty roles array", () => {
    expect(() =>
      validateCreateUserDto({ name: "X", email: "x@y.com", roles: [] }),
    ).toThrow(/roles/);
  });
});
