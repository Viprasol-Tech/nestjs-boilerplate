import { Injectable, NotFoundException } from "@nestjs/common";
import type { CreateItemDto } from "./dto/create-item.dto.js";
import type { Item } from "./item.entity.js";

/**
 * In-memory CRUD service for {@link Item} records.
 *
 * Acts as a drop-in stand-in for a real repository so the boilerplate runs
 * with zero infrastructure. Swap the internal array for a database-backed
 * repository when wiring up a real persistence layer.
 */
@Injectable()
export class ItemsService {
  private readonly items: Item[] = [];
  private nextId = 1;

  /** Create and store a new item, returning the persisted record. */
  create(dto: CreateItemDto): Item {
    const item: Item = {
      id: this.nextId++,
      name: dto.name,
      description: dto.description,
      createdAt: new Date().toISOString(),
    };
    this.items.push(item);
    return item;
  }

  /** Return all stored items (a defensive copy). */
  findAll(): Item[] {
    return [...this.items];
  }

  /**
   * Return a single item by id.
   *
   * @throws {NotFoundException} when no item with the given id exists.
   */
  findOne(id: number): Item {
    const item = this.items.find((candidate) => candidate.id === id);
    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    return item;
  }
}
