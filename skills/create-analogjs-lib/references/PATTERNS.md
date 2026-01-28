# Library Patterns

This guide walks through detailed examples for common library types created with the `@analog-tools/generator:library`.

**Note:** tRPC support is legacy. Only include tRPC when the user explicitly asks for it.

## Table of Contents

- [Pattern 1: UI Component Library](#pattern-1-ui-component-library)
- [Pattern 2: Content/Documentation Library](#pattern-2-contentdocumentation-library)
- [Pattern 3: Fullstack Feature](#pattern-3-fullstack-feature)
- [Pattern 4: API Service Library](#pattern-4-api-service-library)
- [Pattern 5: Monorepo Shared Utilities](#pattern-5-monorepo-shared-utilities)

---

## Pattern 1: UI Component Library

**Purpose:** Reusable Angular components for the monorepo.

**Use Case:** Shared buttons, forms, modals, layout components used across multiple apps.

### Generation Command

```bash
npx nx g @analog-tools/generator:library \
  --name=shared-ui \
  --project=analog-example \
  --componentPrefix=ui
```

### What Gets Created

```
libs/shared-ui/
├── src/
│   ├── index.ts                    # Public API barrel
│   ├── lib/
│   │   ├── components/
│   │   │   ├── button.component.ts
│   │   │   └── modal.component.ts
│   │   └── services/
│   │       └── theme.service.ts
│   └── test-setup.ts
├── package.json
├── project.json
└── vite.config.mts
```

### Workflow

1. **Organize components** by UI grouping:
   ```
   lib/components/
   ├── form/
   │   ├── input.component.ts
   │   ├── select.component.ts
   │   └── checkbox.component.ts
   ├── layout/
   │   ├── header.component.ts
   │   └── sidebar.component.ts
   └── ...
   ```

2. **Export from barrel:**
   ```typescript
   // libs/shared-ui/src/index.ts
   export * from './lib/components/button.component';
   export * from './lib/components/modal.component';
   export * from './lib/services/theme.service';
   ```

3. **Use in app:**
   ```typescript
   import { UiButton, UiModal } from '@monorepo/shared-ui';
   ```

### Key Points

- **No pages, no API, no tRPC** -- components only
- **Tailwind integration** -- automatically patched, styles apply to components
- **Shared services** -- place shared logic (theme provider, config) in `lib/services/`
- **Test setup** -- testing utilities pre-configured, import from `test-setup.ts`

---

## Pattern 2: Content/Documentation Library

**Purpose:** Host markdown content (blog, documentation, guides) discoverable by AnalogJS.

**Use Case:** Multi-tenant blog, product documentation library, changelog hub.

### Generation Command

```bash
npx nx g @analog-tools/generator:library \
  --name=blog \
  --project=analog-example \
  --contentRoutes=true
```

### What Gets Created

```
libs/blog/
├── src/
│   ├── index.ts
│   └── content/
│       └── blog/
│           ├── example-post.md
│           └── another-post.md
├── package.json
└── vite.config.mts
```

### Workflow

1. **Add markdown files** to `src/content/<section>/`:
   ```
   src/content/
   ├── blog/
   │   ├── 2025-01-intro.md
   │   ├── 2025-02-advanced.md
   │   └── ...
   └── docs/
       ├── getting-started.md
       ├── api-reference.md
       └── ...
   ```

2. **Configure frontmatter** (YAML) in markdown:
   ```markdown
   ---
   title: Getting Started
   date: 2025-01-28
   author: Your Name
   ---
   
   # Getting Started
   
   Your content here...
   ```

3. **Access in application** via AnalogJS content API or routing:
   ```typescript
   import { injectContentFiles } from '@analogjs/content';
   
   export default async () => {
     const posts = injectContentFiles(
       (meta) => meta.filename.includes('/blog/')
     );
     return posts;
   };
   ```

### Key Points

- **AnalogJS content routing** -- automatically discovers markdown in `src/content/`
- **Frontmatter metadata** -- define custom fields for sorting/filtering
- **Multiple sections** -- organize blog, docs, guides in separate subdirectories
- **No components, no API** -- content-first library

---

## Pattern 3: Fullstack Feature

**Purpose:** Complete feature with pages, backend REST API, and frontend components.

**Use Case:** User dashboard, admin panel, settings management -- anything needing UI pages + backend services.

### Generation Command

```bash
npx nx g @analog-tools/generator:library \
  --name=user-dashboard \
  --project=analog-example \
  --pages=true \
  --api=true
```

### What Gets Created

```
libs/user-dashboard/
├── src/
│   ├── index.ts
│   ├── lib/
│   │   └── components/
│   │       └── dashboard.component.ts
│   ├── pages/
│   │   └── user-dashboard/
│   │       ├── user-dashboard.page.ts
│   │       └── (user-dashboard).page.ts
│   ├── backend/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   └── routes/api/user-dashboard/
│   │   │       └── hello.ts
├── package.json
└── vite.config.mts
```

### Frontend Workflow

1. **Build page components** in `src/pages/`:
   ```typescript
   // libs/user-dashboard/src/pages/user-dashboard/user-dashboard.page.ts
   import { Component } from '@angular/core';
   import { DashboardComponent } from '../../lib/components/dashboard.component';
   
   @Component({
     selector: 'app-user-dashboard-page',
     imports: [DashboardComponent],
     template: '<app-dashboard></app-dashboard>'
   })
   export default class UserDashboardPage {}
   ```

2. **Create reusable components** in `src/lib/components/`:
   ```typescript
   // libs/user-dashboard/src/lib/components/dashboard.component.ts
   import { Component, inject } from '@angular/core';
   import { UserDashboardService } from '../services/user-dashboard.service';
   
   @Component({
     selector: 'app-dashboard',
     template: '<!-- dashboard template -->'
   })
   export class DashboardComponent {
     private service = inject(UserDashboardService);
   }
   ```

3. **Add services** for state management and business logic:
   ```typescript
   // libs/user-dashboard/src/lib/services/user-dashboard.service.ts
   import { Injectable, inject } from '@angular/core';
   import { HttpClient } from '@angular/common/http';
   
   @Injectable({ providedIn: 'root' })
   export class UserDashboardService {
     private http = inject(HttpClient);
     
     getUser() {
       return this.http.get('/api/user-dashboard/user');
     }
   }
   ```

### Legacy tRPC (explicit request only)

If the user explicitly asks for tRPC, re-run or extend the generator with `--trpc=true` and use the following workflow.

1. **Define tRPC routers** in `src/backend/trpc/routers/`:
   ```typescript
   // libs/user-dashboard/src/backend/trpc/routers/user-dashboard.ts
   import { router, publicProcedure } from '../trpc';
   import { z } from 'zod';
   
   export const userDashboardRouter = router({
     getUser: publicProcedure
       .query(async ({ ctx }) => {
         // Fetch user data
         return { id: 1, name: 'John' };
       }),
     updateUser: publicProcedure
       .input(z.object({ name: z.string() }))
       .mutation(async ({ input, ctx }) => {
         // Update user
         return { id: 1, name: input.name };
       })
   });
   ```

2. **Export from tRPC index:**
   ```typescript
   // libs/user-dashboard/src/backend/trpc/routers/index.ts
   import { router } from '../trpc';
   import { userDashboardRouter } from './user-dashboard';
   
   export const appRouter = router({
     userDashboard: userDashboardRouter
   });
   ```

3. **Use tRPC client in components:**
   ```typescript
   import { trpc } from '@monorepo/user-dashboard/backend';
   
   export class DashboardComponent {
     user$ = trpc.userDashboard.getUser.query();
   }
   ```

### Key Points

- **File-based routing** -- pages in `src/pages/*.page.ts` auto-route
- **API logic separation** -- REST in `api/routes/`; tRPC is legacy and only on explicit request
- **Type safety** -- tRPC provides end-to-end type inference from backend → frontend (legacy)
- **Automatic wiring** -- pages and API routes discovered by Vite/AnalogJS
- **Barrel exports** -- update `src/index.ts` or `src/backend/index.ts` for public APIs

---

## Pattern 4: API Service Library

**Purpose:** Standalone backend services exposed via REST API (no pages).

**Use Case:** Email service, authentication helpers, payment processing, data sync.

### Generation Command

```bash
npx nx g @analog-tools/generator:library \
  --name=payment-service \
  --project=analog-example \
  --api=true
```

### What Gets Created

```
libs/payment-service/
├── src/
│   ├── index.ts                    # Public API
│   ├── lib/
│   │   └── services/
│   │       └── payment.service.ts
│   └── backend/
│       ├── index.ts
│       ├── api/
│       │   └── routes/api/payment-service/
│       │       └── charge.post.ts
├── package.json
└── vite.config.mts
```

### Workflow

1. **Implement business logic** in `src/lib/services/`:
   ```typescript
   // libs/payment-service/src/lib/services/payment.service.ts
   export class PaymentService {
     async processCharge(amount: number, token: string) {
       // Payment logic
       return { id: '123', amount, status: 'success' };
     }
   }
   ```

2. **Expose via tRPC router (legacy, explicit request only):**
   ```typescript
   // libs/payment-service/src/backend/trpc/routers/payment.ts
   import { router, publicProcedure } from '../trpc';
   import { PaymentService } from '../../lib/services/payment.service';
   
   const paymentService = new PaymentService();
   
   export const paymentRouter = router({
     charge: publicProcedure
       .input(z.object({ amount: z.number(), token: z.string() }))
       .mutation(async ({ input }) => {
         return paymentService.processCharge(input.amount, input.token);
       })
   });
   ```

3. **Expose via REST:**
   ```typescript
   // libs/payment-service/src/backend/api/routes/api/payment-service/charge.post.ts
   import { defineEventHandler } from 'h3';
   import { PaymentService } from '../../../../../../lib/services/payment.service';
   
   const paymentService = new PaymentService();
   
   export default defineEventHandler(async (event) => {
     const { amount, token } = await readBody(event);
     return paymentService.processCharge(amount, token);
   });
   ```

### Key Points

- **No pages** -- pure backend/service library
- **Reusable service classes** -- business logic in `src/lib/services/`
- **REST-first** -- tRPC is legacy and only used on explicit request
- **Type-safe RPC** -- tRPC provides inference; REST requires manual types (legacy)

---

## Pattern 5: Monorepo Shared Utilities

**Purpose:** Pure TypeScript utilities (no Angular components, no pages, no backend).

**Use Case:** Validators, helpers, constants, type definitions shared across monorepo.

### Generation Command

```bash
npx nx g @analog-tools/generator:library \
  --name=shared-utils \
  --project=analog-example
```

### What Gets Created

```
libs/shared-utils/
├── src/
│   ├── index.ts                    # Barrel export
│   ├── lib/
│   │   ├── validators.ts
│   │   ├── helpers.ts
│   │   ├── constants.ts
│   │   └── types.ts
├── package.json
└── vite.config.mts
```

### Workflow

1. **Organize utilities** logically:
   ```typescript
   // libs/shared-utils/src/lib/validators.ts
   export const isValidEmail = (email: string): boolean => {
     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   };
   
   export const isValidPhoneNumber = (phone: string): boolean => {
     return /^\d{10}$/.test(phone);
   };
   ```

2. **Define shared types:**
   ```typescript
   // libs/shared-utils/src/lib/types.ts
   export interface User {
     id: string;
     email: string;
     name: string;
   }
   
   export type ApiResponse<T> = {
     data: T;
     status: 'success' | 'error';
   };
   ```

3. **Export from barrel:**
   ```typescript
   // libs/shared-utils/src/index.ts
   export * from './lib/validators';
   export * from './lib/helpers';
   export * from './lib/constants';
   export * from './lib/types';
   ```

4. **Use in components/services:**
   ```typescript
   import { isValidEmail, User } from '@monorepo/shared-utils';
   ```

### Key Points

- **No frontend or backend overhead** -- pure utilities
- **Framework-agnostic** -- can be used in Node, browser, anywhere
- **TypeScript-first** -- leverage typing for contracts
- **Lightweight** -- minimal dependencies, fast to build/test
