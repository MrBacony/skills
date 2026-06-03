# AnalogJS Architecture Rules Skill

## Overview

This skill enforces architectural standards for AnalogJS projects in Nx monorepos. It ensures apps remain pure boilerplate shells while all business logic lives in feature libraries.

## Documentation

- **SKILL.md** — Core principles, architectural patterns, and AnalogJS-specific rules
- **references/APP-RULES.md** — What belongs in an app shell (and what doesn't)
- **references/IMPORT-RULES.md** — Import boundary enforcement and cross-library rules
- **references/BEST-PRACTICES.md** — AnalogJS-specific conventions and naming standards

## Related Skills

- **`angular-developer`** — Angular best practices (Signals, DI, forms, components, testing)
- **`analogjs-feature-library`** — Feature library patterns, scaffolding, and layer responsibilities

## Validation Scripts

Run directly via `node`:

```bash
# App shell & directory structure
node .agents/skills/analogjs-architecture-rules/scripts/validate-architecture.js

# Feature library internal patterns
node .agents/skills/analogjs-architecture-rules/scripts/validate-feature-libraries.js

# Import boundary violations
node .agents/skills/analogjs-architecture-rules/scripts/validate-imports.js

# File naming & decorator conventions
node .agents/skills/analogjs-architecture-rules/scripts/lint-architecture.js

# Strict mode (warnings become errors)
node .agents/skills/analogjs-architecture-rules/scripts/validate-architecture.js --strict
```

### Exit Codes

- **0** — All checks passed
- **1** — Warnings found (non-blocking)
- **2** — Errors found (blocking)

## Key Rules

1. **Apps are boilerplate shells** — only `main.ts`, `app.config.ts`, `app.component.ts`, `pages/*.page.ts`, and global styles
2. **All business logic in feature libraries** — data-access, store, ui, pages, models, types, validation, backend
3. **Public API boundaries** — import via `@feature/*` public API, never internal paths
4. **AnalogJS file-based routing** — `provideFileRouter()`, `RouteMeta`, `export default class`
