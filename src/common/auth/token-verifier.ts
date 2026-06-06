import { Injectable } from "@nestjs/common";
import type { AuthenticatedUser, TokenVerifier } from "./auth.types.js";

/** Injection token for the {@link TokenVerifier} implementation. */
export const TOKEN_VERIFIER = "TOKEN_VERIFIER";

/**
 * A simple in-memory {@link TokenVerifier} mapping opaque bearer tokens to
 * users. Useful for local development, demos, and tests; replace with a JWT
 * verifier (e.g. `jsonwebtoken`) or an identity provider in production.
 */
@Injectable()
export class InMemoryTokenVerifier implements TokenVerifier {
  private readonly tokens = new Map<string, AuthenticatedUser>();

  /**
   * @param seed Optional initial token-to-user mappings.
   */
  constructor(seed?: Record<string, AuthenticatedUser>) {
    if (seed) {
      for (const [token, user] of Object.entries(seed)) {
        this.tokens.set(token, user);
      }
    }
  }

  /** Register (or overwrite) a token-to-user mapping. */
  register(token: string, user: AuthenticatedUser): void {
    this.tokens.set(token, user);
  }

  /** Remove a token mapping. Returns whether a mapping existed. */
  revoke(token: string): boolean {
    return this.tokens.delete(token);
  }

  /** Resolve the user for a token, or `null` if unknown. */
  verify(token: string): AuthenticatedUser | null {
    return this.tokens.get(token) ?? null;
  }
}
