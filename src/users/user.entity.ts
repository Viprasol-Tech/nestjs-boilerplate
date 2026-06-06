/** Roles a user can hold, used for authorization decisions. */
export type UserRole = "admin" | "user";

/** A persisted user record managed by the {@link UsersService}. */
export interface User {
  /** Auto-incrementing unique identifier. */
  id: number;
  /** Display name. */
  name: string;
  /** Unique, lowercased email address. */
  email: string;
  /** Roles granted to the user. */
  roles: UserRole[];
  /** ISO-8601 creation timestamp. */
  createdAt: string;
}
