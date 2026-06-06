/**
 * Public API surface for the nestjs-boilerplate package.
 *
 * Re-exports the application, feature modules, and the cross-cutting building
 * blocks (guards, filters, interceptors, pipes, decorators) so consumers can
 * import them from a single entry point.
 */
import "reflect-metadata";

// Application + feature modules
export { AppModule } from "./app.module.js";
export { ItemsModule } from "./items/items.module.js";
export { ItemsController } from "./items/items.controller.js";
export { ItemsService } from "./items/items.service.js";
export type { Item } from "./items/item.entity.js";
export {
  CreateItemDto,
  CreateItemValidationError,
  validateCreateItemDto,
} from "./items/dto/create-item.dto.js";

export { UsersModule } from "./users/users.module.js";
export { UsersController } from "./users/users.controller.js";
export { UsersService } from "./users/users.service.js";
export type { User, UserRole } from "./users/user.entity.js";
export {
  CreateUserDto,
  CreateUserValidationError,
  validateCreateUserDto,
} from "./users/dto/create-user.dto.js";

export { HealthModule } from "./health/health.module.js";
export { HealthController } from "./health/health.controller.js";
export { HealthService } from "./health/health.service.js";
export type {
  HealthCheck,
  HealthIndicator,
  HealthReport,
} from "./health/health.service.js";

// Cross-cutting building blocks
export {
  Roles,
  Public,
  CurrentUser,
  ROLES_KEY,
  IS_PUBLIC_KEY,
} from "./common/decorators/roles.decorator.js";
export { AuthGuard } from "./common/guards/auth.guard.js";
export {
  InMemoryTokenVerifier,
  TOKEN_VERIFIER,
} from "./common/auth/token-verifier.js";
export type {
  AuthenticatedUser,
  AuthenticatedRequest,
  TokenVerifier,
} from "./common/auth/auth.types.js";
export {
  AllExceptionsFilter,
} from "./common/filters/http-exception.filter.js";
export type { ErrorResponseBody } from "./common/filters/http-exception.filter.js";
export { LoggingInterceptor } from "./common/interceptors/logging.interceptor.js";
export {
  SchemaValidationPipe,
} from "./common/pipes/validation.pipe.js";
export type { DtoValidator } from "./common/pipes/validation.pipe.js";
export {
  PaginationQueryDto,
  PaginationValidationError,
  parsePaginationQuery,
  paginate,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "./common/dto/pagination.dto.js";
export type { PaginatedResult } from "./common/dto/pagination.dto.js";
