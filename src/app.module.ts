import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter.js";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor.js";
import { HealthModule } from "./health/health.module.js";
import { ItemsModule } from "./items/items.module.js";
import { UsersModule } from "./users/users.module.js";

/**
 * Root application module wiring together every feature module and the
 * cross-cutting concerns that ship with the boilerplate.
 *
 * The global exception filter and logging interceptor are registered as
 * `APP_FILTER` / `APP_INTERCEPTOR` providers so they are instantiated through
 * the DI container. The {@link AuthGuard} and {@link SchemaValidationPipe} are
 * intentionally left for `main.ts` to register (they require a configured
 * token verifier / DTO registry), keeping this module side-effect free.
 */
@Module({
  imports: [HealthModule, ItemsModule, UsersModule],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
