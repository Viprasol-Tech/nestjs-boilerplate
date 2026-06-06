import type { ExecutionContext } from "@nestjs/common";

/** Options for {@link createMockExecutionContext}. */
export interface MockContextOptions {
  /** Object returned by `switchToHttp().getRequest()`. */
  request?: unknown;
  /** Object returned by `switchToHttp().getResponse()`. */
  response?: unknown;
  /** Value returned by `getHandler()`. */
  handler?: () => void;
  /** Value returned by `getClass()`. */
  controllerClass?: new (...args: never[]) => unknown;
}

/**
 * Build a minimal {@link ExecutionContext} double sufficient for unit-testing
 * guards, interceptors, filters, and param decorators without spinning up a
 * full Nest application.
 */
export function createMockExecutionContext(
  options: MockContextOptions = {},
): ExecutionContext {
  const handler = options.handler ?? (() => undefined);
  const controllerClass =
    options.controllerClass ?? (class MockController {} as never);

  const httpHost = {
    getRequest: <T>() => options.request as T,
    getResponse: <T>() => options.response as T,
    getNext: <T>() => undefined as T,
  };

  return {
    switchToHttp: () => httpHost,
    getHandler: () => handler,
    getClass: () => controllerClass,
    getArgs: () => [] as never,
    getArgByIndex: () => undefined as never,
    switchToRpc: () => {
      throw new Error("not implemented");
    },
    switchToWs: () => {
      throw new Error("not implemented");
    },
    getType: () => "http",
  } as unknown as ExecutionContext;
}
