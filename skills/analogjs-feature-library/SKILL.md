---
name: analogjs-feature-library
description: Provides best practices for AnalogJS feature libraries and their scaffolding using the @analog-tools/generator. Use when designing, creating, or refactoring feature libraries in an Nx AnalogJS monorepo. Covers architectural patterns (data-access, UI, store, pages, backend), scaffolding workflows, and integration standards.
---

# AnalogJS Feature Library Skill

This skill provides guidance for scaffolding and implementing AnalogJS feature libraries following the workspace's best practices.

## Core Architectural Patterns

Feature libraries should follow a structured directory layout to ensure separation of concerns and maintainability.

### Recommended Directory Structure

For complex features, use the following structure under `src/lib/`:

- **`data-access/`**: HTTP services, API clients, and repositories.
- **`store/`**: Signal-based state management (e.g., `@ngrx/signals`).
- **`ui/`**: Presentational (dumb) components.
- **`page/`**: Smart components and container components (not routable, those go in `src/pages/`).
- **`models/`**: Domain models and database schemas.
- **`types/`**: TypeScript interfaces and types.
- **`validation/`**: Zod schemas and validation logic.
- **`dialogs/`**: Feature-specific dialogs and modals.

### Public API Separation

- **`src/index.ts`**: Frontend public API (components, stores, services, client types).
- **`src/server.ts`**: Backend public API (repositories, schemas, server-side validation).
- **`src/backend/`**: Nitro API routes and backend-only helpers.
- **`src/pages/`**: File-based routing (pages discoverable by AnalogJS).

## Scaffolding the Library

### 1. Prerequisite: Install the Generator

Ensure `@analog-tools/generator` is installed:

```bash
npm install -D @analog-tools/generator @nx/devkit
```

### 2. Decision Flow: Feature Selection

Determine which features to enable based on the library's purpose. Consult the **Library Patterns** guide ([PATTERNS.md](references/PATTERNS.md)) for details.

| Purpose | --pages | --api | --contentRoutes |
|---------|---------|-------|-----------------|
| UI components only | ❌ | ❌ | ❌ |
| Content/docs library | ❌ | ❌ | ✅ |
| Fullstack feature | ✅ | ✅ | ❌ |

**tRPC is legacy. Only include `--trpc` when explicitly asked.**

### 3. Execution

Run the generator:

```bash
npx nx g @analog-tools/generator:library \
  --name=<lib-name> \
  --project=<app-project> \
  --pages=<true|false> \
  --api=<true|false> \
  --contentRoutes=<true|false>
```

### 4. Post-Scaffolding Refinement

After generation, refactor the `src/lib/` directory to match the **Recommended Directory Structure** if the feature is complex.

## Application Integration

The generator automatically updates:
1. `tsconfig.base.json` (path aliases)
2. `vite.config.ts` (AnalogJS plugin registration)
3. `tailwind.config.ts` (content paths)

### Manual Steps
- Verify Tailwind paths in `tailwind.config.ts`.
- Ensure new backend repositories are provided in the app's server configuration if necessary.

## Reference Guides

- **[PATTERNS.md](references/PATTERNS.md)** -- Detailed walkthroughs for common library types.
- **Reference: generated structures**
  - **[MINIMAL.md](references/MINIMAL.md)** -- Minimal library layout (no options).
  - **[PAGES.md](references/PAGES.md)** -- Pages-enabled layout (file-based routes).
  - **[API.md](references/API.md)** -- API routes / backend layout.
  - **[TRPC.md](references/TRPC.md)** -- tRPC (legacy) support and structure.
  - **[CONTENT.md](references/CONTENT.md)** -- Content routes / markdown-driven layout.
  - **[ALL-FEATURES.md](references/ALL-FEATURES.md)** -- Full layout when all features enabled.
  - **[FILES.md](references/FILES.md)** -- File descriptions and generated-vs-custom guidance.
