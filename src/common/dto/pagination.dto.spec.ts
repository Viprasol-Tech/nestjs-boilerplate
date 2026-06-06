import { describe, expect, it } from "vitest";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  PaginationValidationError,
  paginate,
  parsePaginationQuery,
} from "./pagination.dto.js";

describe("parsePaginationQuery", () => {
  it("applies defaults for an empty query", () => {
    const dto = parsePaginationQuery({});
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(DEFAULT_PAGE_SIZE);
    expect(dto.offset).toBe(0);
  });

  it("parses string query parameters", () => {
    const dto = parsePaginationQuery({ page: "3", limit: "10" });
    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(10);
    expect(dto.offset).toBe(20);
  });

  it("accepts numeric query parameters", () => {
    const dto = parsePaginationQuery({ page: 2, limit: 5 });
    expect(dto.offset).toBe(5);
  });

  it("clamps limit to the maximum page size", () => {
    const dto = parsePaginationQuery({ limit: 1000 });
    expect(dto.limit).toBe(MAX_PAGE_SIZE);
  });

  it("treats non-object queries as empty", () => {
    expect(parsePaginationQuery(null).page).toBe(1);
    expect(parsePaginationQuery("nope").limit).toBe(DEFAULT_PAGE_SIZE);
  });

  it("rejects a non-positive page", () => {
    expect(() => parsePaginationQuery({ page: "0" })).toThrow(
      PaginationValidationError,
    );
    expect(() => parsePaginationQuery({ page: -1 })).toThrow(/page/);
  });

  it("rejects a non-integer limit", () => {
    expect(() => parsePaginationQuery({ limit: "abc" })).toThrow(
      PaginationValidationError,
    );
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it("returns the first page with correct metadata", () => {
    const result = paginate(items, parsePaginationQuery({ page: 1, limit: 10 }));
    expect(result.data).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  });

  it("returns a middle page", () => {
    const result = paginate(items, parsePaginationQuery({ page: 2, limit: 10 }));
    expect(result.data).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(result.meta.hasNextPage).toBe(true);
    expect(result.meta.hasPreviousPage).toBe(true);
  });

  it("returns the last (partial) page", () => {
    const result = paginate(items, parsePaginationQuery({ page: 3, limit: 10 }));
    expect(result.data).toEqual([21, 22, 23, 24, 25]);
    expect(result.meta.hasNextPage).toBe(false);
    expect(result.meta.hasPreviousPage).toBe(true);
  });

  it("handles an empty collection", () => {
    const result = paginate([], parsePaginationQuery({}));
    expect(result.data).toEqual([]);
    expect(result.meta).toMatchObject({
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it("returns a defensive copy of the data slice", () => {
    const result = paginate(items, parsePaginationQuery({ limit: 5 }));
    result.data.pop();
    expect(items).toHaveLength(25);
  });

  it("honours an explicit total for db-style pagination", () => {
    const page = paginate([1, 2, 3], parsePaginationQuery({ page: 2, limit: 3 }), 9);
    expect(page.meta.total).toBe(9);
    expect(page.meta.totalPages).toBe(3);
    expect(page.meta.hasNextPage).toBe(true);
  });
});
