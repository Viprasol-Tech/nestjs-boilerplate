import "reflect-metadata";
import { describe, expect, it } from "vitest";
import {
  CurrentUser,
  IS_PUBLIC_KEY,
  Public,
  ROLES_KEY,
  Roles,
} from "./roles.decorator.js";

describe("Roles / Public metadata decorators", () => {
  it("Roles stores the provided roles under ROLES_KEY", () => {
    class Target {
      handler() {}
    }
    Roles("admin", "user")(Target.prototype, "handler", {
      value: Target.prototype.handler,
    });
    const meta = Reflect.getMetadata(ROLES_KEY, Target.prototype.handler);
    expect(meta).toEqual(["admin", "user"]);
  });

  it("Roles can be applied with a single role", () => {
    class Target {
      handler() {}
    }
    Roles("admin")(Target.prototype, "handler", {
      value: Target.prototype.handler,
    });
    expect(Reflect.getMetadata(ROLES_KEY, Target.prototype.handler)).toEqual([
      "admin",
    ]);
  });

  it("Public marks the handler with IS_PUBLIC_KEY", () => {
    class Target {
      handler() {}
    }
    Public()(Target.prototype, "handler", {
      value: Target.prototype.handler,
    });
    const meta = Reflect.getMetadata(IS_PUBLIC_KEY, Target.prototype.handler);
    expect(meta).toBe(true);
  });
});

describe("CurrentUser param decorator", () => {
  it("is a function usable as a parameter decorator", () => {
    expect(typeof CurrentUser).toBe("function");
    // Applying it must not throw when decorating a parameter.
    class Controller {
      handler(@CurrentUser() _user: unknown) {
        return _user;
      }
    }
    expect(new Controller()).toBeInstanceOf(Controller);
  });

  it("supports selecting a single property", () => {
    expect(typeof CurrentUser("id")).toBe("function");
  });
});
