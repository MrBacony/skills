# AnalogJS Library API Design

Use this reference when a library exposes backend behavior, shared contracts, or frontend-to-backend communication.

## Prefer REST by Default

Default to REST handlers under `src/backend/api/routes/api/<library>/`.

That matches the generator, the documented patterns in this workspace, and the simplest integration path for AnalogJS libraries.

Treat tRPC as **legacy**. Only add or preserve tRPC when the user explicitly asks for it or when you are working inside code that already depends on it.

## Keep Contracts in `src/models/`

Put serialized request/response contracts in `src/models/` instead of burying them in handlers or components.

Prefer this pattern for shared contracts:

- define a Zod schema
- export the inferred TypeScript type
- reuse the type in handlers and consumers

This keeps runtime validation and static typing aligned.

## Keep Handlers Thin

API handlers should do four things well:

1. Read request input
2. Validate or normalize input
3. Delegate to service/domain logic
4. Return a typed response

Do not let route files become the hidden service layer.

If a handler grows beyond simple orchestration, move logic into `src/lib/services/` or a backend-focused helper under `src/backend/`.

## Maintain Clear Client/Server Boundaries

Use these rules consistently:

- Browser-consumable exports belong in `src/index.ts`
- Server-only exports belong in `src/backend/index.ts`
- Cross-boundary contracts belong in `src/models/`

Do not import server-only code into route components or reusable browser components.

## Organize Endpoints by Feature

Prefer routes grouped by library/feature name:

```text
src/backend/api/routes/api/my-feature/
```

Within that folder:

- keep related endpoints together
- use nested folders for resource hierarchies when needed
- use dynamic segments only when the route shape truly requires them

File-based conventions should communicate the resource shape clearly.

## Use Services for Domain Logic

Put non-trivial behavior in services, not directly in route files.

Good fits for services:

- calling multiple backends
- shaping or aggregating data
- auth-aware orchestration
- caching decisions
- retries, fallbacks, or transformation rules

This keeps APIs easier to test and page components easier to reuse.

## Model for Change Without Over-Abstracting

Prefer explicit request/response types over generic “transport wrappers” unless the codebase already has a stable shared envelope.

Avoid abstractions like:

- “BaseApiService” created for one feature
- generic repository layers with no second consumer
- framework-agnostic wrappers that only add indirection

Be boring on purpose. Boring APIs age well.

## Content Libraries Are Not API Libraries

If the feature is fundamentally markdown/content-driven, keep API additions rare and intentional.

Only add backend code to a content library when there is a concrete runtime need such as preview, search, secured content access, or metadata enrichment.

## Auth, Sessions, and SSR-Sensitive Libraries

When a library touches auth, session state, or server-only runtime dependencies:

- keep secrets and token logic server-side
- avoid exposing auth implementation details through the frontend barrel
- verify the consuming app’s SSR bundling and aliases

If integration uses `@analog-tools/auth`, remember the consuming app may need `ssr.noExternal` configuration for workspace packages.

## Review Checklist

Before finalizing API design, verify:

- route files are thin
- contracts live in `src/models/`
- frontend barrel exports are client-safe
- backend barrel exists when server imports are needed
- tRPC was only included by explicit request
- the consuming app is wired to discover backend routes