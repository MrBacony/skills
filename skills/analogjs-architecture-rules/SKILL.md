---
name: analogjs-architecture-rules
description: Provides architectural guidelines and validation for AnalogJS projects. Enforces app-shell boundaries, import rules, and ensures apps contain only bootstrap boilerplate—no business logic. Delegates Angular and library best practices to dedicated skills. Includes Node.js validation scripts for automated architecture compliance checks.
---

# AnalogJS Architecture Rules Skill

This skill establishes and enforces architectural standards for AnalogJS projects within Nx monorepos. It focuses on app-shell constraints, import boundaries, and validation rules to ensure clean separation of concerns and maintainable codebases.

## Core Principles

### 1. **Apps as Shells, Not Containers**

AnalogJS applications must serve as **minimal bootstrapping shells**. All business logic belongs in feature libraries.

**What belongs in an app:**
- `src/main.ts` — Bootstrap entry point
- `src/main.server.ts` — SSR bootstrap (server-side rendering)
- `src/app/app.config.ts` — Angular app configuration and providers
- `src/app/app.config.server.ts` — Server-specific app configuration
- `src/app/app.component.ts` — Root component (routing outlet + minimal layout)
- `vite.config.ts` — Vite/Analog build configuration (project root)
- Global styles and assets

**What does NOT belong in an app:**
- ❌ Services with business logic (move to data-access libraries)
- ❌ Components beyond the app shell (move to UI libraries)
- ❌ State management (move to feature stores or @ngrx/signals)
- ❌ Domain models or repositories (move to data-access)
- ❌ App-level pages and route trees (these belong to libraries)
- ❌ Complex routing logic (keep route composition in libraries)

### 2. **Feature Library Organization**

Feature libraries are organized by domain/feature and follow a consistent internal structure.
For complete feature library patterns, scaffolding, and layer responsibilities, see the **`analogjs-library-best-practices` skill**.

#### Public API Boundaries

- **Frontend API (`src/index.ts`):** Export public-facing components, services, stores, and types
- **Backend API (`src/server.ts`):** Export server-side repositories, validators, schemas

### 3. **Routing and Pages Belong to Libraries**

Routes and page composition are owned by feature libraries, not by the app shell.

```
libs/features/<feature>/...
├── src/lib/pages/...
├── src/index.ts
└── src/server.ts
```

**Rules:**
- No `src/app/pages/**` inside app shells
- No app-owned route arrays or route trees
- Keep navigation and route composition in feature libraries
- Keep app shell focused on bootstrap and host layout only
- Follow the routing conventions from `analogjs-library-best-practices`

### 4. **Data Flow (Unidirectional)**

```
User Interaction
    ↓
Feature Entry Component
    ↓
Store (Signal-based state)
    ↓
Data-Access Service (API calls)
    ↓
Backend (Nitro API)
```

**Keep this flow clean:**
- Pages trigger store actions via methods
- Stores manage signals and derived signals
- Data-access services handle HTTP/repository logic
- Avoid direct API calls from components

## Angular Best Practices

For Angular-specific guidance (Signals, DI, forms, components, testing, accessibility), see the **`angular-developer` skill**.

Key points relevant to AnalogJS architecture:
- Use **Signals** and **OnPush** change detection in all components
- Use **`inject()`** function for dependency injection
- Use **standalone components** (default in Angular 19+)

## AnalogJS-Specific Guidelines

### Server Integration (Nitro)

- Backend routes in `src/backend/` or `src/lib/{feature}/backend/`
- Export repositories and services via `src/server.ts`
- Use Nitro middleware for cross-cutting concerns (auth, logging)
- Leverage SSR for SEO-critical pages

### Content Routes

- Use content routes (`.md` files) for markdown-based content
- Keep content separate from app logic
- Useful for docs, blog, landing pages

### Environment Configuration

```typescript
// ✅ App shell app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { requestContextInterceptor } from '@analogjs/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([requestContextInterceptor]),
    ),
  ],
};
```

## Import Rules & Boundaries

### Cross-Library Imports

**Allowed:**
- Library imports from its own `index.ts` public API
- Feature library imports from other feature library public APIs
- UI component imports into pages within same feature

**Forbidden:**
- Direct imports from library internals (e.g., `from '@feature/auth/lib/data-access'`)
- Circular imports between features
- App-level logic imports (business logic must be in libraries)
- Page components imported as reusable UI

```typescript
// ✅ GOOD (via public API)
import { AuthStore, LoginComponent } from '@feature/auth';

// ❌ AVOID (direct internal import)
import { AuthService } from '@feature/auth/lib/data-access/auth.service';

// ❌ AVOID (app importing feature logic)
// Inside app component
import { ProductStore } from '@feature/products/lib/store';
// (instead: define routes, let pages handle it)
```

## Validation Scripts

The skill includes Node.js validation scripts to ensure architectural compliance:

### `validate-architecture.js`
Checks directory structure and file organization:
- Apps contain only bootstrap files
- Feature libraries follow the recommended structure
- Page components are correctly placed

**Run:**
```bash
node .agents/skills/analogjs-architecture-rules/scripts/validate-architecture.js
```

### `validate-feature-libraries.js`
Enforces feature library patterns:
- Index exports are properly defined
- Internal structure matches conventions
- Data-access, store, UI separations

**Run:**
```bash
node .agents/skills/analogjs-architecture-rules/scripts/validate-feature-libraries.js
```

### `validate-imports.js`
Detects import boundary violations:
- Direct internal library imports (forbidden)
- Circular dependencies
- App-level logic imports

**Run:**
```bash
node .agents/skills/analogjs-architecture-rules/scripts/validate-imports.js
```

### `lint-architecture.js`
ESLint-based structural linting:
- Enforces forbidden import patterns
- Checks file naming conventions
- Validates component declarations

**Run:**
```bash
node .agents/skills/analogjs-architecture-rules/scripts/lint-architecture.js
```

## Workflow

### Creating a New Feature

1. **Use the generator:**
   ```bash
   npx nx g @analog-tools/generator:library \
     --name=products \
     --project=website \
     --pages=true \
     --api=true
   ```

2. **Refactor structure** if needed to match the recommended directory layout

3. **Define public APIs:**
   - Export from `src/index.ts` (frontend)
   - Export from `src/server.ts` (backend)

4. **Create routing/page composition in libraries** following `analogjs-library-best-practices`

5. **Run validation:**
   ```bash
   node .agents/skills/analogjs-architecture-rules/scripts/validate-architecture.js
   node .agents/skills/analogjs-architecture-rules/scripts/validate-imports.js
   ```

### Code Review Checklist

- [ ] App component contains only routing outlet and minimal layout
- [ ] All business logic moved to feature libraries
- [ ] Feature libraries follow the directory structure
- [ ] Public APIs properly exported via `index.ts` and `server.ts`
- [ ] No direct internal imports (using public APIs)
- [ ] No circular dependencies
- [ ] Routes are lazy-loaded where appropriate
- [ ] Components use Signals and OnPush change detection
- [ ] Services use `inject()` with `providedIn`

## Reference Guides

- **[APP-RULES.md](references/APP-RULES.md)** — App shell rules (boilerplate only, no business logic)
- **[IMPORT-RULES.md](references/IMPORT-RULES.md)** — Import boundary enforcement

## Related Skills

- **`angular-developer`** — Angular best practices (Signals, DI, forms, testing, routing)
- **`analogjs-library-best-practices`** — AnalogJS library architecture, routing, and structure conventions

## Resources

- [AnalogJS Official Documentation](https://analogjs.org/docs)
- [@ngrx/signals Documentation](https://ngrx.io/guide/signals)
- [Nx Monorepo Best Practices](https://nx.dev/concepts)

---

**Last updated:** 2026-05-28
