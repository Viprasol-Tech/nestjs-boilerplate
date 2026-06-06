import { BadRequestException, Injectable } from "@nestjs/common";
import type { ArgumentMetadata, PipeTransform } from "@nestjs/common";

/**
 * A validator+transformer for a single DTO. Implementations receive the raw,
 * untrusted payload and return a normalized value, throwing a descriptive
 * error (typically with a `field` property) when the payload is invalid.
 */
export interface DtoValidator<T> {
  (payload: unknown): T;
}

/** Error shape understood by {@link SchemaValidationPipe} for field mapping. */
interface FieldError extends Error {
  field?: string;
}

/**
 * Global-ready validation pipe that delegates `@Body()`/`@Query()` validation
 * to a registered {@link DtoValidator} keyed by the parameter's `metatype`.
 *
 * This keeps the boilerplate free of a heavy validation dependency while still
 * giving the ergonomics of a single `app.useGlobalPipes(...)` registration.
 * Pass-through (no validator registered) values are returned untouched, so the
 * pipe is safe to apply globally.
 *
 * @example
 * ```ts
 * const pipe = new SchemaValidationPipe();
 * pipe.register(CreateItemDto, validateCreateItemDto);
 * app.useGlobalPipes(pipe);
 * ```
 */
@Injectable()
export class SchemaValidationPipe implements PipeTransform {
  private readonly validators = new Map<unknown, DtoValidator<unknown>>();

  /** Associate a DTO class (metatype) with its validator function. */
  register<T>(
    metatype: new (...args: never[]) => T,
    validator: DtoValidator<T>,
  ): this {
    this.validators.set(metatype, validator as DtoValidator<unknown>);
    return this;
  }

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const validator = metadata.metatype
      ? this.validators.get(metadata.metatype)
      : undefined;

    if (!validator) {
      return value;
    }

    try {
      return validator(value);
    } catch (err) {
      const fieldError = err as FieldError;
      throw new BadRequestException({
        statusCode: 400,
        error: "ValidationError",
        message: fieldError.message ?? "Validation failed",
        field: fieldError.field,
      });
    }
  }
}
