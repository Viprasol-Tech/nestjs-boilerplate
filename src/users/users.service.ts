import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  PaginatedResult,
  PaginationQueryDto,
} from "../common/dto/pagination.dto.js";
import { paginate } from "../common/dto/pagination.dto.js";
import type { CreateUserDto } from "./dto/create-user.dto.js";
import type { User } from "./user.entity.js";

/**
 * In-memory CRUD service for {@link User} records with unique-email
 * enforcement and pagination support. Swap the internal array for a real
 * repository to add persistence.
 */
@Injectable()
export class UsersService {
  private readonly users: User[] = [];
  private nextId = 1;

  /**
   * Create and store a new user.
   *
   * @throws {ConflictException} when the email is already taken.
   */
  create(dto: CreateUserDto): User {
    const email = dto.email.toLowerCase();
    if (this.users.some((u) => u.email === email)) {
      throw new ConflictException(`Email ${email} is already in use`);
    }

    const user: User = {
      id: this.nextId++,
      name: dto.name,
      email,
      roles: dto.roles ?? ["user"],
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  /** Return a paginated slice of users. */
  findAll(pagination: PaginationQueryDto): PaginatedResult<User> {
    return paginate(this.users, pagination);
  }

  /**
   * Return a single user by id.
   *
   * @throws {NotFoundException} when no user with the given id exists.
   */
  findOne(id: number): User {
    const user = this.users.find((candidate) => candidate.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  /** Return a single user by email, or `undefined` when not found. */
  findByEmail(email: string): User | undefined {
    const normalized = email.toLowerCase();
    return this.users.find((candidate) => candidate.email === normalized);
  }

  /**
   * Delete a user by id.
   *
   * @throws {NotFoundException} when no user with the given id exists.
   */
  remove(id: number): User {
    const index = this.users.findIndex((candidate) => candidate.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const [removed] = this.users.splice(index, 1);
    return removed;
  }

  /** Total number of stored users. */
  count(): number {
    return this.users.length;
  }
}
