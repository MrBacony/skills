# AnalogJS Library Architecture

This reference captures the preferred architecture for AnalogJS libraries in this Nx workspace.

## Choose the Smallest Viable Library Shape

Start from the feature’s real responsibilities, then choose the smallest matching shape.

| Library shape | Add | Avoid by default |
|---|---|---|
| UI component library | `src/lib/components`, `src/lib/services` | `src/pages`, `src/backend`, `src/content` |
| Content/docs library | `src/content` | pages/backend unless content needs runtime UI or APIs |
| Fullstack feature | `src/pages`, `src/lib/pages`, `src/backend`, `src/models` | tRPC unless explicitly requested |
| API service library | `src/backend`, `src/lib/services`, `src/models` | UI pages |
| Shared utility library | `src/index.ts`, utility files, types | Analog routing/backend folders |

Favor composition over “future-proofing.” If a library does not need routes or server code today, do not scaffold them just in case.

## Canonical Layout

Use this as the default mental model:

```text
libs/my-feature/
├── src/
│   ├── index.ts
│   ├── test-setup.ts
│   ├── lib/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── models/
│   ├── pages/                    # optional
│   ├── backend/                  # optional
│   │   ├── index.ts
│   │   └── api/routes/api/my-feature/
│   └── content/                  # optional
```

Treat that as a responsibility map, not a requirement that every folder must exist.

## Folder Responsibilities

### `src/index.ts`

Expose the **frontend-safe** public API only. Export reusable components, services, and shared types that are safe for browser consumers.

Do **not** export server handlers, server-only helpers, or backend runtime dependencies from here.

### `src/backend/index.ts`

Expose the server-side public API when the library has backend functionality. This is the correct entry point for server consumers and the place mapped to `@scope/lib/backend`.

### `src/lib/components/`

Store reusable presentational or composable UI pieces here. These should be easy to reuse across multiple pages or features.

Keep them focused on rendering, interaction, and local UI state.

### `src/lib/pages/`

Store page-level feature components here. This is where route-facing UI and orchestration belong.

Use this folder for:

- resource loading
- page state
- composition of reusable components
- feature-specific layout decisions

Do not hide route wrappers here; this folder is for actual page implementations.

### `src/lib/services/`

Store business logic, orchestration, API clients, and reusable domain operations here.

Prefer moving non-trivial data loading, transformation, or side-effect logic into services instead of bloating components.

### `src/models/`

Store contracts shared across boundaries here.

Prefer this folder for:

- DTOs
- request/response types
- Zod schemas for runtime validation
- serializable shared types

If data is sent over HTTP or shared between frontend and backend, it belongs here more often than not.

### `src/pages/`

Use AnalogJS file-based route wrappers here. These should stay thin:

- default-export the route component
- import a page implementation from `src/lib/pages/`
- avoid business logic beyond minimal route composition

Typical pattern:

- `src/pages/my-feature/(my-feature).page.ts` → grouped/index route
- `src/pages/my-feature/my-feature.page.ts` → standard route entry

### `src/backend/api/routes/api/<library>/`

Place REST handlers here using Nitro/H3 file conventions.

Keep handlers thin. They should validate input, call services, and return typed responses rather than hosting business logic directly.

### `src/content/`

Use this only for markdown-driven libraries. Keep it content-first; do not casually turn a content library into a fullstack feature unless the requirements clearly justify it.

## Separation of Concerns

Enforce these boundaries consistently:

- **Route wrapper** → `src/pages/`
- **Page implementation** → `src/lib/pages/`
- **Reusable UI** → `src/lib/components/`
- **Business logic** → `src/lib/services/`
- **Contracts** → `src/models/`
- **Server-only runtime** → `src/backend/`

If a file seems to belong in two places, it usually means the file is doing too much.

## Angular + AnalogJS Conventions Inside Libraries

Follow the workspace’s modern Angular conventions:

- Use standalone APIs.
- Prefer `inject()` over constructor injection.
- Prefer signals, `computed()`, and `resource()` where appropriate.
- Use modern template control flow.
- Avoid NgModules and legacy structural directives.
- Keep filenames kebab-case.

Generated code is a starting point, not a finish line. If the scaffold is structurally correct but stylistically dated, bring it in line with current workspace conventions.

## Consumer-App Wiring

Libraries that contribute routes or backend handlers must be wired into each consuming app.

### TypeScript paths

Expect root aliases in `tsconfig.base.json`:

- `@scope/my-feature` → `libs/my-feature/src/index.ts`
- `@scope/my-feature/backend` → `libs/my-feature/src/backend/index.ts` when backend exists

### Vite + Analog plugin

When pages are enabled, the app must include:

- `additionalPagesDirs: ['/libs/my-feature/src/pages']`

When API or tRPC support is enabled, the app must include:

- `additionalAPIDirs: ['/libs/my-feature/src/backend/api']`

Each consuming app must be updated separately.

### Tailwind scanning

If library templates use utility classes, ensure the app scans library sources. If Tailwind patching is disabled or incomplete, styles can silently disappear.

### SSR bundling

If server-side execution touches workspace packages or SSR-sensitive dependencies, verify `ssr.noExternal` in the consuming app.

## Generator Reality Check

The generator provides structure and wiring, but treat it as a skeleton.

Important nuances from this workspace:

- `src/lib/components/`, `src/lib/pages/`, and `src/lib/services/` are foundational structure.
- `src/pages/`, `src/backend/`, and `src/content/` are optional and driven by flags.
- Backend aliases are only added when API or tRPC is enabled.
- Example files may vary by option and generator version; do not build architectural assumptions around example content existing.

Design around folder responsibilities, not around placeholder files.