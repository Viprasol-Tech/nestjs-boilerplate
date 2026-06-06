/**
 * Public API surface for the nestjs-boilerplate package.
 *
 * Re-exports the application and feature building blocks so consumers can
 * import them from a single entry point.
 */
import "reflect-metadata";

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
