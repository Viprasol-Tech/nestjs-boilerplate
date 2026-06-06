import "reflect-metadata";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { beforeEach, describe, expect, it } from "vitest";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { InMemoryTokenVerifier } from "../auth/token-verifier.js";
import { IS_PUBLIC_KEY, ROLES_KEY } from "../decorators/roles.decorator.js";
import { createMockExecutionContext } from "../testing/execution-context.mock.js";
import { AuthGuard } from "./auth.guard.js";

describe("AuthGuard", () => {
  let verifier: InMemoryTokenVerifier;
  let reflector: Reflector;
  let guard: AuthGuard;

  beforeEach(() => {
    verifier = new InMemoryTokenVerifier({
      "admin-token": { id: "1", roles: ["admin", "user"] },
      "user-token": { id: "2", roles: ["user"] },
    });
    reflector = new Reflector();
    guard = new AuthGuard(reflector, verifier);
  });

  function contextFor(
    request: AuthenticatedRequest,
    meta: { roles?: string[]; isPublic?: boolean } = {},
  ) {
    const handler = () => undefined;
    if (meta.roles) {
      Reflect.defineMetadata(ROLES_KEY, meta.roles, handler);
    }
    if (meta.isPublic) {
      Reflect.defineMetadata(IS_PUBLIC_KEY, true, handler);
    }
    return createMockExecutionContext({ request, handler });
  }

  it("allows public routes without a token", () => {
    const ctx = contextFor({ headers: {} }, { isPublic: true });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("rejects requests missing an Authorization header", () => {
    const ctx = contextFor({ headers: {} });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it("rejects a malformed Authorization header", () => {
    const ctx = contextFor({ headers: { authorization: "Basic abc" } });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it("rejects an unknown token", () => {
    const ctx = contextFor({ headers: { authorization: "Bearer nope" } });
    expect(() => guard.canActivate(ctx)).toThrow(/Invalid or expired/);
  });

  it("authenticates a valid token and attaches the user", () => {
    const request: AuthenticatedRequest = {
      headers: { authorization: "Bearer user-token" },
    };
    const ctx = contextFor(request);
    expect(guard.canActivate(ctx)).toBe(true);
    expect(request.user).toEqual({ id: "2", roles: ["user"] });
  });

  it("authorizes a user holding the required role", () => {
    const ctx = contextFor(
      { headers: { authorization: "Bearer admin-token" } },
      { roles: ["admin"] },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("forbids a user lacking the required role", () => {
    const ctx = contextFor(
      { headers: { authorization: "Bearer user-token" } },
      { roles: ["admin"] },
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("accepts a case-insensitive bearer scheme", () => {
    const request: AuthenticatedRequest = {
      headers: { authorization: "bearer admin-token" },
    };
    expect(guard.canActivate(contextFor(request))).toBe(true);
  });

  it("supports revoking a token", () => {
    expect(verifier.revoke("user-token")).toBe(true);
    const ctx = contextFor({ headers: { authorization: "Bearer user-token" } });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
