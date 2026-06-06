/** A user resolved from an incoming request's credentials. */
export interface AuthenticatedUser {
  /** Stable unique identifier for the principal. */
  id: string;
  /** Roles granted to the principal, used for authorization checks. */
  roles: string[];
}

/**
 * Minimal shape of an HTTP request the auth layer needs to read from and
 * write the resolved user onto. Kept framework-agnostic so it works with
 * Express, Fastify, or a plain test double.
 */
export interface AuthenticatedRequest {
  /** Case-insensitive request headers. */
  headers: Record<string, string | string[] | undefined>;
  /** Populated by the {@link AuthGuard} once credentials are verified. */
  user?: AuthenticatedUser;
}

/**
 * Resolves an {@link AuthenticatedUser} from a bearer token, or `null` when
 * the token is unknown/invalid. Swap the in-memory implementation for a JWT
 * verifier or a database lookup in a real application.
 */
export interface TokenVerifier {
  verify(token: string): AuthenticatedUser | null;
}
