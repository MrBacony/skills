# Testing AnalogJS Libraries

Use this reference when adding or reviewing tests for AnalogJS libraries.

## Test the Right Layer

Match the test type to the architectural responsibility.

### `src/lib/services/`

Prioritize unit tests here. Services usually contain the real behavior:

- transformation logic
- orchestration
- API client behavior
- error mapping
- conditional flows

This is often the highest-value test surface.

### `src/lib/pages/`

Test page-level behavior when the component owns meaningful logic:

- loading states
- data fetching behavior
- conditional rendering
- user interactions
- coordination across child components/services

### `src/pages/`

Keep tests minimal. These files should be thin route wrappers.

If a route wrapper needs heavy testing, the design is probably wrong and the logic likely belongs in `src/lib/pages/`.

### `src/backend/api/routes/api/`

Test handlers for:

- input handling
- response shape
- delegation to services
- error behavior

Prefer schema-backed assertions for serialized responses when shared contracts exist.

## Keep Tests Close to the Code

Use colocated `*.spec.ts` files and follow the repo’s Vitest conventions.

Use `src/test-setup.ts` when the library provides shared setup.

## Favor Real Behavior Over Mock Theater

Mock only true boundaries:

- network calls
- framework/runtime services
- storage or external systems

Do not mock the unit under test or re-test Vitest mocks instead of actual library behavior.

## Test Architecture Boundaries

When working on library structure, add or run tests that prove the boundary decisions still hold.

Examples:

- a page component uses a service rather than owning transport logic
- an API handler returns a model-backed shape
- backend exports are not required for frontend-only use
- route wrappers remain thin and render the intended page component

## Cover Wiring-Sensitive Changes

If the task touches generation, routing, or integration behavior, verify more than unit tests.

Relevant checks may include:

- app build still succeeds
- Vite route/API discovery still works
- path aliases resolve correctly
- Tailwind styling still appears when templates use utility classes

In this workspace, generator tests already verify many structural combinations. Mirror that mindset when changing library scaffolding or integration.

## Focus on Contracts for Shared Models

When `src/models/` defines shared contracts, tests should assert against those contracts instead of loose object shapes.

This helps prevent frontend/backend drift.

## Practical Priorities

If time is limited, test in this order:

1. service logic
2. API handler behavior
3. page behavior with meaningful state
4. integration/wiring regressions
5. thin route wrappers only as smoke coverage

## Final Verification Mindset

Before claiming the library change is complete, verify:

- affected unit tests pass
- any integration-sensitive commands still pass
- no tests are compensating for bad architecture

Good tests protect clean structure. They should not normalize structural drift.