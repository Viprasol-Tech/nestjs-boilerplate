import "reflect-metadata";
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockExecutionContext } from "../testing/execution-context.mock.js";
import type { ErrorResponseBody } from "./http-exception.filter.js";
import { AllExceptionsFilter } from "./http-exception.filter.js";

describe("AllExceptionsFilter", () => {
  let filter: AllExceptionsFilter;
  let captured: ErrorResponseBody | undefined;
  let statusCode: number | undefined;

  const response = {
    status(code: number) {
      statusCode = code;
      return response;
    },
    json(body: ErrorResponseBody) {
      captured = body;
      return body;
    },
  };

  function hostFor(url = "/widgets", method = "GET") {
    return createMockExecutionContext({ request: { url, method }, response });
  }

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    captured = undefined;
    statusCode = undefined;
  });

  it("formats an HttpException into the standard envelope", () => {
    filter.catch(new NotFoundException("missing"), hostFor("/widgets/9"));
    expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(captured).toMatchObject({
      statusCode: 404,
      message: "missing",
      path: "/widgets/9",
    });
    expect(typeof captured?.timestamp).toBe("string");
  });

  it("preserves validation message arrays", () => {
    const exception = new BadRequestException({
      message: ["name is required", "email is invalid"],
      error: "ValidationError",
    });
    filter.catch(exception, hostFor());
    expect(captured?.message).toEqual([
      "name is required",
      "email is invalid",
    ]);
    expect(captured?.error).toBe("ValidationError");
  });

  it("maps unknown errors to a 500 without leaking details", () => {
    const errSpy = vi.spyOn(filter["logger"], "error").mockImplementation(() => undefined);
    filter.catch(new Error("secret stack detail"), hostFor());
    expect(statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(captured?.message).toBe("Internal server error");
    expect(captured?.error).toBe("InternalServerError");
    expect(errSpy).toHaveBeenCalledOnce();
  });

  it("normalize handles string HttpException payloads", () => {
    const result = filter.normalize(new NotFoundException("nope"));
    expect(result).toMatchObject({ statusCode: 404, message: "nope" });
  });

  it("normalize handles non-error throwables", () => {
    const result = filter.normalize("just a string");
    expect(result.statusCode).toBe(500);
    expect(result.error).toBe("InternalServerError");
  });
});
