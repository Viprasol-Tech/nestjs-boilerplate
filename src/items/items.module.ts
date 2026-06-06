import { Module } from "@nestjs/common";
import { ItemsController } from "./items.controller.js";
import { ItemsService } from "./items.service.js";

/**
 * Feature module bundling the items controller and service.
 *
 * Import this into the application's root module to expose the `/items`
 * REST endpoints.
 */
@Module({
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
