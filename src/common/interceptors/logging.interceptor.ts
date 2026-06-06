import { Injectable, Logger } from "@nestjs/common";
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";

interface MinimalRequest {
  method?: string;
  url?: string;
}

/**
 * Interceptor that logs every request's method, path, and wall-clock
 * duration once the handler completes (or errors).
 *
 * Register globally in `main.ts` via
 * `app.useGlobalInterceptors(new LoggingInterceptor())`.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  /**
   * @param now Clock function (injectable for deterministic tests).
   */
  constructor(private readonly now: () => number = Date.now) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<MinimalRequest>();
    const method = request.method ?? "?";
    const url = request.url ?? "?";
    const start = this.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(`${method} ${url} ${this.now() - start}ms`);
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          this.logger.warn(
            `${method} ${url} failed after ${this.now() - start}ms: ${message}`,
          );
        },
      }),
    );
  }
}
