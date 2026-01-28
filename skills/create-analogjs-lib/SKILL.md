---
name: create-analogjs-lib
description: Scaffold AnalogJS libraries using the @analog-tools/generator. Use when users want to create a new library for an Nx AnalogJS monorepo, or when they ask to "generate/scaffold/create an analog lib". Covers decision guidance for choosing appropriate generator options (pages, API, content routes) based on library purpose, executing the generator command, understanding the generated structure, and integrating the library with the application. Only include tRPC when the user explicitly asks for it (legacy).
---

# Create AnalogJS Lib Skill

Use this skill to scaffold AnalogJS libraries in the Nx monorepo using `@analog-tools/generator:library`.

## Prerequisite: Install the Generator

If `@analog-tools/generator` is not installed in the workspace, install it before running any generator:

```bash
npm install -D @analog-tools/generator @nx/devkit
```

Only run the generator after these dev dependencies are present.

## Decision Flow: Choosing Library Features

Before running the generator, determine which options to enable based on the library's purpose. Consult the **Library Patterns** guide ([PATTERNS.md](references/PATTERNS.md)) for common use cases and detailed feature explanations.

**tRPC is legacy. Only include `--trpc` when the user explicitly asks for tRPC.**

**Quick decision matrix:**

| Purpose | --pages | --api | --trpc | --contentRoutes |
|---------|---------|-------|--------|-----------------|
| UI components only | ❌ | ❌ | ❌ | ❌ |
| Content/docs library | ❌ | ❌ | ❌ | ✅ |
| Feature with pages | ✅ | ❌ | ❌ | ❌ |
| API service (REST) | ❌ | ✅ | ❌ | ❌ |
| API service (tRPC, legacy) | ❌ | ✅ | ✅ | ❌ |
| **Fullstack feature** | ✅ | ✅ | ❌ | ❌ |

## Scaffolding the Library

### Basic Workflow

1. **Gather requirements:**
   - Library name (kebab-case, e.g., `user-dashboard`, `shared-ui`, `api-service`)
   - Target application project (e.g., `analog-example`)
  - Required features (pages, API, content routes; tRPC only if explicitly requested)

2. **Run the generator:**
   ```bash
   npx nx g @analog-tools/generator:library \
     --name=<lib-name> \
     --project=<app-project> \
     --pages=<true|false> \
     --api=<true|false> \
     --trpc=<true|false> \
     --contentRoutes=<true|false>
   ```
   Add `--trpc=true` **only when the user explicitly asks for tRPC**.

3. **Verify the generated structure** matches expectations (see the Library Structure section below).

4. **Update application configuration** (see the Application Integration section below).

### Library Structure

The generator creates a structured library under `libs/<lib-name>/` with:

- **Core files:** `index.ts` (public API barrel), `package.json`, build config, TypeScript paths
- **Source organization:** `src/lib/` for components and services
- **Optional directories** (based on enabled features):
  - `src/pages/` -- File-based routing (if `--pages=true`)
  - `src/backend/api/` -- REST routes (if `--api=true`; tRPC is legacy and only on explicit request)
  - `src/content/` -- Markdown content (if `--contentRoutes=true`)

For detailed structure examples, see [GENERATED-STRUCTURE.md](references/GENERATED-STRUCTURE.md).

## Application Integration

After running the generator, the tool automatically updates the target application:

### What Gets Updated Automatically

1. **`tsconfig.base.json`** -- Adds path alias (e.g., `@monorepo/user-dashboard` → `libs/user-dashboard/src`)
2. **`vite.config.ts`** -- Registers library pages and API routes in AnalogJS plugin config
3. **`tailwind.config.(js|ts)`** -- Adds library `src/` to Tailwind content array (unless `--patchTailwind=false`)

### What Requires Manual Steps

- **Environment variables** -- If using REST API or tRPC (legacy, explicit request only), ensure backend endpoints are accessible
- **Tailwind content paths** -- Verify the library's `src/` directory is included in the app's Tailwind config
- **API route discovery** -- For dynamic routes with `[id]` params, verify Nitro recognizes them in dev/build

### Verification Commands

After generation, verify integration with:

```bash
# Check TypeScript paths are registered
cat tsconfig.base.json | grep "@"

# Ensure Vite recognizes the library in AnalogJS plugin config
cat vite.config.ts | grep -A 10 "analog("

# Run the app to verify no TypeScript errors
npx nx serve <app-project>
```

## Common Scenarios

### Scenario 1: UI Component Library

Create a reusable component library with no pages or backend.

```bash
npx nx g @analog-tools/generator:library \
  --name=shared-ui \
  --project=analog-example
```

**What gets created:**
- `libs/shared-ui/src/lib/components/`
- `libs/shared-ui/src/lib/services/`
- Public API in `libs/shared-ui/src/index.ts`

**Next steps:** Export components from `index.ts`, use in the app with `import { MyComponent } from '@monorepo/shared-ui'`.

### Scenario 2: Fullstack Feature

Create a complete feature with pages and REST API support.

```bash
npx nx g @analog-tools/generator:library \
  --name=user-dashboard \
  --project=analog-example \
  --pages=true \
  --api=true
```

**What gets created:**
- File-based pages in `libs/user-dashboard/src/pages/`
- REST API handlers in `libs/user-dashboard/src/backend/api/`
- Wired into app automatically

**Next steps:** See [PATTERNS.md](references/PATTERNS.md) → Fullstack Feature section for detailed workflow.

**If the user explicitly asks for tRPC (legacy):** add `--trpc=true` and follow the tRPC notes in [PATTERNS.md](references/PATTERNS.md).

### Scenario 3: Content/Documentation Library

Create a library for hosting markdown content (blog posts, docs, etc.).

```bash
npx nx g @analog-tools/generator:library \
  --name=blog \
  --project=analog-example \
  --contentRoutes=true
```

**What gets created:**
- Directory structure in `libs/blog/src/content/`
- Markdown files discoverable by AnalogJS content routing

**Next steps:** Add markdown files to `src/content/`, configure routing in the app.

## Advanced Options

### Skip Example Files

For cleaner scaffolding, use `--skipExamples=true` to generate empty directories with `.gitkeep` instead of example files:

```bash
npx nx g @analog-tools/generator:library \
  --name=core-lib \
  --project=analog-example \
  --skipExamples=true
```

### Disable Tailwind Patching

If the library doesn't use Tailwind or you want to manually manage Tailwind paths:

```bash
npx nx g @analog-tools/generator:library \
  --name=data-lib \
  --project=analog-example \
  --patchTailwind=false
```

### Custom Component Prefix

For Angular component selectors (default is `lib`):

```bash
npx nx g @analog-tools/generator:library \
  --name=shared-ui \
  --project=analog-example \
  --componentPrefix=ui
```

Generates selectors like `<ui-button>`, `<ui-modal>`, etc.

## Using the Generated Library

### Importing and Exporting

The generator creates an `index.ts` barrel export. Keep this file updated as you add public APIs:

```typescript
// libs/my-feature/src/index.ts
export * from './lib/components/button.component';
export * from './lib/services/feature.service';
```

Import in the app:

```typescript
import { FeatureService, Button } from '@monorepo/my-feature';
```

### TypeScript Path Resolve

The path alias is automatically registered in `tsconfig.base.json`. Use the package name format:

```typescript
// App component
import { SharedService } from '@monorepo/my-feature'; // ✅ Works
import { SharedService } from 'libs/my-feature/src'; // ❌ Avoid
```

## Troubleshooting

**Issue: Library not found in TypeScript (red squiggles)**

→ Check `tsconfig.base.json` for the library path alias. Run `npx nx workspace-lint` to verify.

**Issue: Pages not routing, API routes not discovered**

→ Check that `vite.config.ts` includes the library in AnalogJS plugin config. Look for `pages`, `api`, and `routes` properties.

**Issue: Tailwind styles not applying to library components**

→ Verify the library `src/` path is in `tailwind.config.ts` `content` array. Re-build if already running in dev mode.

**Issue: Module import errors at runtime**

→ Ensure `--patchTailwind=false` was not used, or manually add paths to `tailwind.config.ts` and build config.

## Reference Guides

- **[PATTERNS.md](references/PATTERNS.md)** -- Detailed walkthroughs for common library types
- **[GENERATED-STRUCTURE.md](references/GENERATED-STRUCTURE.md)** -- Full file/directory reference for generated output
