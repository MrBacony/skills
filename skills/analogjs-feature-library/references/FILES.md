# File Descriptions & Generated vs Custom Files

This document contains core file descriptions and guidance on generated vs custom files.

## Core Files

| File | Purpose |
|------|---------|
| `src/index.ts` | **Public API barrel** -- exports all public symbols. Update this as you add exports. |
| `src/test-setup.ts` | Vitest setup, test utilities. Import in test files. |
| `package.json` | NPM metadata, dependencies (auto-updated by generator). |
| `project.json` | Nx configuration (targets, metadata). |
| `tsconfig.json` | Root TypeScript config for the library. |
| `tsconfig.lib.json` | Library build configuration (extends `tsconfig.json`). |
| `tsconfig.spec.json` | Test configuration (extends `tsconfig.json`). |
| `vite.config.mts` | Build configuration (Vite/Vitest). |
| `eslint.config.cjs` | ESLint rules for the library. |
| `README.md` | Library documentation. |

## Frontend (Pages & Components)

| Directory | Purpose |
|-----------|---------|
| `src/lib/components/` | Reusable Angular components. |
| `src/lib/services/` | Shared services (dependency injection). |
| `src/pages/` | File-based routing pages (if `--pages=true`). |

Pages Naming Convention:
- `*.page.ts` -- Route component (routable)
- `(name).page.ts` -- Layout component (groups routes)

## Backend (API & tRPC)

| Directory | Purpose |
|-----------|---------|
| `src/backend/index.ts` | Backend barrel export (queries, mutations, router). |
| `src/backend/api/routes/api/` | REST endpoints (H3 event handlers). |
| `src/backend/trpc/` | tRPC server setup and routers (legacy, explicit request only). |
| `src/backend/trpc/context.ts` | Request context builder (legacy). |
| `src/backend/trpc/trpc.ts` | tRPC router and procedure initialization (legacy). |
| `src/backend/trpc/trpc-client.ts` | Frontend-safe tRPC client (legacy). |
| `src/backend/trpc/routers/` | tRPC router definitions (legacy). |
| `src/models/` | TypeScript types/interfaces for data. |

## Content

| Directory | Purpose |
|-----------|---------|
| `src/content/` | Markdown files (discoverable by AnalogJS). |

## Generated vs. Custom Files

The generator creates example files by default. You can:

1. Use the examples as templates, then customize them.
2. Delete examples and write your own.
3. Skip examples with `--skipExamples=true` (creates empty dirs with `.gitkeep`).

### Example Files (Created by Generator)

- `src/lib/components/my-feature.component.ts`
- `src/lib/services/my-feature.service.ts`
- `src/pages/my-feature/*.page.ts` (if `--pages=true`)
- `src/backend/api/routes/api/my-feature/hello.ts` (if `--api=true`)
- `src/backend/trpc/routers/my-feature.ts` (if `--trpc=true`, legacy)
- `src/content/my-feature/example-post.md` (if `--contentRoutes=true`)

### Files You Must Maintain

- `src/index.ts` -- Keep barrel exports up-to-date
- `src/backend/index.ts` -- Export public backend APIs (routers, etc.)
- `src/backend/trpc/routers/index.ts` -- Combine sub-routers for AppRouter type
