# Changelog

Format based on [Keep a Changelog](https://keepachangelog.com/); versioning
follows [SemVer](https://semver.org/).

## [0.2.0] - 2025

### Added
- **Auth guard** (`AuthGuard`) with bearer-token authentication and role-based
  authorization, plus a pluggable `TokenVerifier` (`InMemoryTokenVerifier`).
- **Decorators** `@Roles()`, `@Public()`, and `@CurrentUser()` for declarative
  authorization and principal injection.
- **Global validation pipe** (`SchemaValidationPipe`) mapping DTO validators to
  metatypes and emitting `BadRequestException`s with field context.
- **Global exception filter** (`AllExceptionsFilter`) producing a uniform JSON
  error envelope and hiding internals for unexpected errors.
- **Logging interceptor** (`LoggingInterceptor`) recording method, path, and
  request duration (with an injectable clock).
- **Health module** (`HealthModule`) exposing `GET /health` (readiness, 503 on
  failure) and `GET /health/live` (liveness), with extensible health checks.
- **Pagination primitives** (`parsePaginationQuery`, `paginate`,
  `PaginationQueryDto`, `PaginatedResult`) with clamping and metadata.
- **Second feature module** (`UsersModule`) demonstrating unique-email CRUD,
  role assignment, pagination, and an admin-only delete route.
- Global filter and interceptor wired through the DI container in `AppModule`.
- Expanded the test suite from 14 to 94 tests covering every new building block
  via `@nestjs/testing` and lightweight execution-context doubles.

### Changed
- Rewrote `README.md` to flagship standard with badges, architecture diagram,
  API tables, roadmap, and FAQ.
- `index.ts` now re-exports the full public surface (modules, guards, filters,
  interceptors, pipes, decorators, and pagination helpers).

## [0.1.0] - 2025

### Added
- Initial release of nestjs-boilerplate: NestJS + TypeScript starter with a module, controller, service, and DTO validation.
