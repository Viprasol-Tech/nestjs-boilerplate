import { SetMetadata, createParamDecorator } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { AuthenticatedRequest, AuthenticatedUser } from "../auth/auth.types.js";

/** Metadata key under which required roles are stored. */
export const ROLES_KEY = "roles";

/** Metadata key marking a route as publicly accessible (auth skipped). */
export const IS_PUBLIC_KEY = "isPublic";

/**
 * Attach the set of roles allowed to invoke a route handler or controller.
 *
 * Used together with the {@link AuthGuard}, which reads this metadata via the
 * Nest `Reflector` and rejects requests whose authenticated user lacks one of
 * the listed roles.
 *
 * @example
 * ```ts
 * @Roles("admin")
 * @Delete(":id")
 * remove(@Param("id") id: string) { ... }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Mark a route (or whole controller) as public, bypassing the auth guard.
 *
 * @example
 * ```ts
 * @Public()
 * @Get("health")
 * health() { ... }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Parameter decorator extracting the authenticated user attached to the
 * request by the {@link AuthGuard}.
 *
 * Pass a property name to extract a single field, e.g. `@CurrentUser("id")`.
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser | AuthenticatedUser[keyof AuthenticatedUser] | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) {
      return undefined;
    }
    return data ? user[data] : user;
  },
);
