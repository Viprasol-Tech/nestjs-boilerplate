import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import type { TokenVerifier } from "../auth/auth.types.js";
import { TOKEN_VERIFIER } from "../auth/token-verifier.js";
import { IS_PUBLIC_KEY, ROLES_KEY } from "../decorators/roles.decorator.js";

/**
 * Guard that authenticates requests from a `Authorization: Bearer <token>`
 * header and authorizes them against the roles declared by {@link Roles}.
 *
 * Behaviour:
 * - Routes marked with {@link Public} skip authentication entirely.
 * - A missing/malformed or unknown token yields `401 Unauthorized`.
 * - A valid token whose user lacks a required role yields `403 Forbidden`.
 * - The resolved user is attached to `request.user` for downstream handlers.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TOKEN_VERIFIER) private readonly tokenVerifier: TokenVerifier,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const token = this.extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException("Missing or malformed bearer token");
    }

    const user = this.tokenVerifier.verify(token);
    if (!user) {
      throw new UnauthorizedException("Invalid or expired token");
    }
    request.user = user;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some((role) => user.roles.includes(role));
      if (!hasRole) {
        throw new ForbiddenException(
          `Requires one of the following roles: ${requiredRoles.join(", ")}`,
        );
      }
    }

    return true;
  }

  private extractBearerToken(request: AuthenticatedRequest): string | null {
    const header = request.headers["authorization"];
    const raw = Array.isArray(header) ? header[0] : header;
    if (!raw) {
      return null;
    }
    const [scheme, token] = raw.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) {
      return null;
    }
    return token.trim() || null;
  }
}
