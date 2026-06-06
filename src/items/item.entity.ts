/** A persisted item record managed by the {@link ItemsService}. */
export interface Item {
  /** Auto-incrementing unique identifier. */
  id: number;
  /** Human readable name. */
  name: string;
  /** Optional description. */
  description?: string;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
}
