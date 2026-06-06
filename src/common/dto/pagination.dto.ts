/**
 * Reusable pagination primitives shared across feature modules.
 *
 * Kept dependency-free (no `class-validator`) so the boilerplate runs with
 * zero extra runtime packages, while staying trivial to swap for decorator
 * based validation later.
 */

/** Default page size when a client does not specify one. */
export const DEFAULT_PAGE_SIZE = 20;

/** Hard upper bound on page size to protect the server from huge responses. */
export const MAX_PAGE_SIZE = 100;

/** Normalized, validated pagination parameters. */
export class PaginationQueryDto {
  /** 1-based page number. */
  page!: number;

  /** Number of records per page. */
  limit!: number;

  /** Number of records to skip, derived from {@link page} and {@link limit}. */
  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}

/** Error thrown when raw pagination query parameters are invalid. */
export class PaginationValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "PaginationValidationError";
  }
}

/** Envelope wrapping a single page of results with navigation metadata. */
export interface PaginatedResult<T> {
  /** The records for the requested page. */
  data: T[];
  /** Pagination metadata describing the requested slice. */
  meta: {
    /** 1-based page number that was returned. */
    page: number;
    /** Page size that was applied. */
    limit: number;
    /** Total number of records across all pages. */
    total: number;
    /** Total number of pages given {@link total} and {@link limit}. */
    totalPages: number;
    /** Whether a next page exists. */
    hasNextPage: boolean;
    /** Whether a previous page exists. */
    hasPreviousPage: boolean;
  };
}

function parsePositiveInt(
  value: unknown,
  field: string,
  fallback: number,
): number {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new PaginationValidationError(
      `${field} must be a positive integer`,
      field,
    );
  }

  return parsed;
}

/**
 * Validate and normalize raw query parameters into a {@link PaginationQueryDto}.
 *
 * Missing values fall back to sensible defaults; `limit` is clamped to
 * {@link MAX_PAGE_SIZE}.
 *
 * @throws {PaginationValidationError} when `page` or `limit` is not a
 * positive integer.
 */
export function parsePaginationQuery(query: unknown): PaginationQueryDto {
  const record =
    typeof query === "object" && query !== null
      ? (query as Record<string, unknown>)
      : {};

  const page = parsePositiveInt(record.page, "page", 1);
  const requestedLimit = parsePositiveInt(
    record.limit,
    "limit",
    DEFAULT_PAGE_SIZE,
  );
  const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);

  const dto = new PaginationQueryDto();
  dto.page = page;
  dto.limit = limit;
  return dto;
}

/**
 * Slice an in-memory collection into a {@link PaginatedResult}.
 *
 * For database-backed repositories, prefer pushing `offset`/`limit` into the
 * query and supplying the pre-counted `total`.
 */
export function paginate<T>(
  items: readonly T[],
  pagination: PaginationQueryDto,
  total: number = items.length,
): PaginatedResult<T> {
  const { page, limit, offset } = pagination;
  const data = items.slice(offset, offset + limit);
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data: [...data],
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && total > 0,
    },
  };
}
