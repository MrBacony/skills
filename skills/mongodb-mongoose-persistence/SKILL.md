---
name: mongodb-mongoose-persistence
description: Implement MongoDB persistence with Mongoose in AnalogJS/Nx applications. Use when setting up MongoDB connection management, defining schemas/models, building repositories, creating h3/Nitro API routes, validating inputs, adding seed/healthcheck scripts, or writing Vitest tests for Mongoose data access.
---

# MongoDB Mongoose Persistence

## Overview

Provide repeatable patterns and scripts for MongoDB persistence in AnalogJS/Nx apps using Mongoose, covering connection management, schemas/models, repositories, API routes, validation, and tests.

## Workflow

### 1) Confirm data requirements
- Identify collections, indexes, and unique constraints.
- Decide validation strategy (Zod recommended) and error handling conventions.

### 2) Configure environment
- Expect `MONGODB_URI` and optionally `MONGODB_URI_TEST` for tests.
- If `.env` is missing, create it with placeholders and keep secrets out of git.

### 3) Implement connection singleton
- Place in a shared data-access library (e.g., `libs/shared/data-access/`).
- Cache the connection to avoid multiple connections during SSR/HMR.
- Export a `connectToDatabase()` function.

### 4) Define schemas and models
- Use typed interfaces and schema-level indexes.
- Reuse models via `mongoose.models` to prevent redefinition errors.

### 5) Build repository layer
- Keep database logic in repositories with typed return values.
- Store each domain repository in its related library:
	- guest domain: `libs/guest-management/backend/`
	- user domain: `libs/user/backend/`
- Use `lean()` for read operations in API routes.
- Translate database errors into domain-specific errors.

### 6) Use @analog-tools/inject for server DI
- **Mandatory:** Check whether `@analog-tools/inject` is installed (e.g., in `package.json`).
- If not installed, ask whether it should be installed before using it.
- If installed, use it for server-side DI: mark services with `@Injectable()` and resolve dependencies via `inject()` in API routes or repositories.
- Prefer DI for reusable services like repositories or database helpers to keep handlers thin.
- Note: TypeScript decorators require `target: ES2015` or later in `tsconfig.json` (no `reflect-metadata` needed).

### 7) Add API routes
- Use AnalogJS `server/routes/api/*` or `libs/<library>/src/backend/api/routes/api/*`.
- Validate inputs with Zod (or existing validation library).
- Use `defineEventHandler` and `readBody` for input handling.

### 8) Test with Vitest
- Use a dedicated test database via `MONGODB_URI_TEST`.
- Connect in `beforeAll`, disconnect in `afterAll`.
- Clean collections per test for isolation.

## Resources

- `scripts/mongoose-healthcheck.mjs`: verify connectivity and ping the server.
- `scripts/mongoose-seed.mjs`: seed sample data (adapt to your schema).
- `references/analogjs-mongoose.md`: detailed patterns and code templates.
- `@analog-tools/inject` (optional): DI utilities for server-side services and API routes.

