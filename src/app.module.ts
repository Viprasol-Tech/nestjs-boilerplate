import { Module } from "@nestjs/common";
import { ItemsModule } from "./items/items.module.js";

/** Root application module wiring together every feature module. */
@Module({
  imports: [ItemsModule],
})
export class AppModule {}
