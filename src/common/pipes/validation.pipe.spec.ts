import "reflect-metadata";
import { BadRequestException } from "@nestjs/common";
import type { ArgumentMetadata } from "@nestjs/common";
import { beforeEach, describe, expect, it } from "vitest";
import {
  CreateItemDto,
  validateCreateItemDto,
} from "../../items/dto/create-item.dto.js";
import { SchemaValidationPipe } from "./validation.pipe.js";

describe("SchemaValidationPipe", () => {
  let pipe: SchemaValidationPipe;

  const bodyMeta: ArgumentMetadata = {
    type: "body",
    metatype: CreateItemDto,
    data: undefined,
  };

  beforeEach(() => {
    pipe = new SchemaValidationPipe().register(
      CreateItemDto,
      validateCreateItemDto,
    );
  });

  it("validates and normalizes a registered DTO", () => {
    const result = pipe.transform({ name: "  Widget  " }, bodyMeta);
    expect(result).toBeInstanceOf(CreateItemDto);
    expect((result as CreateItemDto).name).toBe("Widget");
  });

  it("throws BadRequestException with field info on failure", () => {
    try {
      pipe.transform({ description: "no name" }, bodyMeta);
      throw new Error("expected to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      const response = (err as BadRequestException).getResponse() as Record<
        string,
        unknown
      >;
      expect(response.error).toBe("ValidationError");
      expect(response.field).toBe("name");
    }
  });

  it("passes through values with no registered validator", () => {
    const meta: ArgumentMetadata = {
      type: "body",
      metatype: String,
      data: undefined,
    };
    expect(pipe.transform("untouched", meta)).toBe("untouched");
  });

  it("passes through when metatype is undefined", () => {
    const meta: ArgumentMetadata = {
      type: "custom",
      metatype: undefined,
      data: undefined,
    };
    expect(pipe.transform({ any: 1 }, meta)).toEqual({ any: 1 });
  });
});
