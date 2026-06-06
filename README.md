<div align="center">
  <img src="docs/assets/logo.png" alt="Viprasol Tech" width="120" />
</div>

# nestjs-boilerplate

> NestJS + TypeScript starter with a module, controller, service, and DTO validation.

Built and maintained by **Viprasol Tech**.

<div align="center">

[![CI](https://github.com/Viprasol-Tech/nestjs-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/Viprasol-Tech/nestjs-boilerplate/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](https://www.typescriptlang.org/)

</div>

A minimal, production-shaped NestJS starter that demonstrates the core building blocks of a clean backend module: a feature **module**, a REST **controller**, an injectable **service** with in-memory CRUD, and a **DTO** with runtime validation. Everything is written in strict TypeScript and fully unit-tested with [Vitest](https://vitest.dev/) using `@nestjs/testing`.

## Features

- **Feature module** (`ItemsModule`) wiring a controller and service together.
- **REST controller** (`ItemsController`) exposing `GET /items`, `POST /items`, and `GET /items/:id`.
- **Injectable service** (`ItemsService`) with in-memory CRUD and auto-incrementing ids.
- **DTO validation** (`CreateItemDto` + `validateCreateItemDto`) with descriptive, typed errors — no extra runtime dependency required.
- **`NotFoundException`** raised for missing records, surfaced as proper HTTP 404s by Nest.
- **Strict TypeScript** with `experimentalDecorators` and `emitDecoratorMetadata`.
- **Real unit tests** driving the service and controller through `Test.createTestingModule`.

## Install

```bash
npm install
```

## Usage

Compose the feature module into your application root and bootstrap as usual:

```ts
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "nestjs-boilerplate";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
```

Use the service directly (for example, in another provider or a test):

```ts
import { ItemsService } from "nestjs-boilerplate";

const items = new ItemsService();

const created = items.create({ name: "Widget", description: "A widget" });
// => { id: 1, name: "Widget", description: "A widget", createdAt: "..." }

items.findAll();        // => [ { id: 1, ... } ]
items.findOne(created.id); // => { id: 1, ... }
items.findOne(999);     // => throws NotFoundException
```

Validate request payloads with the bundled DTO helper:

```ts
import { validateCreateItemDto, CreateItemValidationError } from "nestjs-boilerplate";

try {
  const dto = validateCreateItemDto({ name: "  Gadget  " });
  console.log(dto.name); // "Gadget" (trimmed)
} catch (err) {
  if (err instanceof CreateItemValidationError) {
    console.error(`Invalid field: ${err.field}`);
  }
}
```

### Endpoints

| Method | Path          | Description                  |
| ------ | ------------- | ---------------------------- |
| GET    | `/items`      | List all items               |
| POST   | `/items`      | Create an item (validated)   |
| GET    | `/items/:id`  | Fetch a single item by id    |

## API notes

- `ItemsService` keeps state in memory; swap the internal array for a real repository to add persistence.
- `ItemsController` injects the service via an explicit `@Inject(ItemsService)` token so dependency injection is robust across transpilers.
- `validateCreateItemDto` throws `CreateItemValidationError` (with a `field` property) for invalid input, making it easy to map to a `BadRequestException` or a custom exception filter.
- The package re-exports `AppModule`, `ItemsModule`, `ItemsController`, `ItemsService`, `Item`, `CreateItemDto`, and the validation helpers from its entry point.

## Scripts

```bash
npm run build      # compile to dist/ with tsc
npm run typecheck  # tsc --noEmit
npm test           # run the Vitest suite
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and our [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.

## Contact — Viprasol Tech Private Limited

- Website: [viprasol.com](https://viprasol.com)
- Email: [support@viprasol.com](mailto:support@viprasol.com)
- Telegram: [t.me/viprasol_help](https://t.me/viprasol_help) | WhatsApp: +91 96336 52112
- GitHub: [@Viprasol-Tech](https://github.com/Viprasol-Tech) | [LinkedIn](https://www.linkedin.com/in/viprasol/) | X [@viprasol](https://twitter.com/viprasol)

## License

[MIT](LICENSE) (c) 2025 Viprasol Tech Private Limited
