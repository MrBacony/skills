# Import Rules & Boundaries

A strict import policy prevents architecture violations and maintains separation of concerns across the monorepo.

## Import Hierarchy

```
App (shell only)
  ↓ imports from
Feature Libraries (via public APIs)
  ↓ imports from
Shared Libraries (utils, UI patterns)
  ↓ imports from
Third-Party Libraries & Angular
```

## Valid Imports

### From App

```typescript
// ✅ Import feature libraries via public API
import { AuthStore } from '@feature/auth';
import { ProductListComponent } from '@feature/products';

// ✅ Import shared utilities
import { Button } from '@shared/ui';
import { environment } from '@config/environment';

// ✅ Import Angular
import { Component } from '@angular/core';
import { Routes } from '@angular/router';

// ✅ Import third-party
import { signalStore } from '@ngrx/signals';
```

### From Feature Libraries

```typescript
// ✅ Import from own public APIs
export { /* ... */ } from '../index';

// ✅ Import from other feature libraries via public API
import { UserService } from '@feature/auth';
import { OrderStore } from '@feature/orders';

// ✅ Import from shared libraries
import { Button, Card } from '@shared/ui';
import { Logger } from '@shared/utils';

// ✅ Import Angular & third-party
import { Component, inject } from '@angular/core';
import { z } from 'zod';
```

## Forbidden Imports

### Direct Internal Library Imports

**❌ Never import internal library paths:**
```typescript
// FORBIDDEN
import { ProductService } from '@feature/products/lib/data-access';
import { CartStore } from '@feature/cart/src/lib/store';
import { ProductCardComponent } from '@feature/products/ui';

// CORRECT
import { ProductService, CartStore, ProductCardComponent } from '@feature/products';
```

**Why?** Internal structure is an implementation detail. Public APIs ensure:
- Version stability when refactoring
- Clear contracts between libraries
- Explicit about what's publicly supported

### Circular Dependencies

**❌ Library A cannot import from Library B if Library B imports from Library A:**
```typescript
// In @feature/auth
import { UserStore } from '@feature/users';  // If users imports from auth, this is circular!

// In @feature/users
import { AuthStore } from '@feature/auth';   // ← CIRCULAR!
```

**Resolution:**
- Extract shared logic into a shared library
- Use an event bus or pub/sub pattern
- Reorganize feature boundaries

### App-Level Logic Imports from Features

**❌ Do NOT create global state or services in the app:**
```typescript
// In app.config.ts
export const globalAuthStore = signalStore(/* ... */);  // ← WRONG!

// In app.component.ts
constructor(private authService: AuthService) {}  // ← Business logic in app!
```

**Correct approach:**
- Create feature stores injected where needed
- Use lazy-loaded providers
- Pages coordinate state through stores

### Backend-Only Imports in Frontend

**❌ Do NOT import from `server.ts` in frontend code:**
```typescript
// In a component
import { UserServerRepository } from '@feature/users';  // ← Exported from server.ts!
```

**Correct approach:**
- Create a `UserService` in data-access (for frontend)
- Export server repositories only from `server.ts`
- Keep frontend/backend concerns separate

### Page Component Imports as Reusable Components

**❌ Page components are smart, not reusable:**
```typescript
// In another page
import { ProductsPage } from '@feature/products';  // ← ProductsPage is NOT reusable!

// In a component
<app-products-page></app-products-page>  // ← WRONG!
```

**Correct approach:**
- Import reusable UI components: `ProductListComponent`
- Use pages only as routable entry points
- Keep pages out of public exports

## File-Based Path Convention

### Aliases (via `tsconfig.base.json`)

```json
{
  "compilerOptions": {
    "paths": {
      "@feature/*": ["libs/features/*/src"],
      "@shared/*": ["libs/shared/*/src"],
      "@config/*": ["libs/config/src"],
      "@pages/*": ["libs/pages/*/src"]
    }
  }
}
```

### Using Path Aliases

```typescript
// ✅ GOOD: Uses path alias
import { AuthStore } from '@feature/auth';

// ❌ AVOID: Relative paths
import { AuthStore } from '../../../libs/features/auth/src';

// ❌ AVOID: Full node_modules path
import { AuthStore } from '@schilling-bc/feature-auth';
```

## Nx Boundary Rules

Define boundary rules in `nx.json` or `project.json` to enforce imports at the Nx level:

**Example `nx.json` rule:**
```json
{
  "workspaceLayout": {
    "appsDir": "apps",
    "libsDir": "libs"
  },
  "plugins": [
    {
      "plugin": "@nx/linter/eslint",
      "options": {
        "targetName": "lint"
      }
    }
  ],
  "targetDefaults": {
    "lint": {
      "options": {
        "lintFilePatterns": [
          "{projectRoot}/**/*.ts",
          "!{projectRoot}/**/*.spec.ts"
        ]
      }
    }
  }
}
```

**Example ESLint rule configuration (`.eslintrc.json`):**
```json
{
  "overrides": [
    {
      "files": ["*.ts"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "allow": ["@feature/*", "@shared/*", "@config/*"],
            "depConstraints": [
              {
                "sourceTag": "app",
                "onlyDependOnLibsWithTags": ["feature", "shared", "config"]
              },
              {
                "sourceTag": "feature",
                "onlyDependOnLibsWithTags": ["feature", "shared", "config"]
              },
              {
                "sourceTag": "shared",
                "onlyDependOnLibsWithTags": ["shared"]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

## Validation Checks

The `validate-imports.js` script detects:

- ✓ Direct internal library imports (`@feature/*/lib/...`)
- ✓ Circular dependencies between libraries
- ✓ App-level logic imports (services, stores in app)
- ✓ Backend-only imports in frontend code
- ✓ Page component imports as reusable components
- ✓ Missing public API exports

**Run validation:**
```bash
node .agents/skills/analogjs-architecture-rules/scripts/validate-imports.js
```

## Examples

### ✅ Correct Import Structure

**App Config (AnalogJS uses file-based routing, no manual route definitions):**
```typescript
// apps/website/src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideFileRouter } from '@analogjs/router';
import { withComponentInputBinding } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(withComponentInputBinding()),
  ],
};
```

**Page with RouteMeta (replaces manual route guards):**
```typescript
// apps/website/src/app/pages/products.page.ts
import { Component, inject } from '@angular/core';
import { RouteMeta } from '@analogjs/router';

export const routeMeta: RouteMeta = {
  title: 'Products',
  canActivate: [authGuard],
};

@Component({
  template: `<h1>Products</h1>`,
})
export default class ProductsPageComponent {
  store = inject(ProductStore);
}
```

**Feature Library Imports:**
```typescript
// libs/features/products/src/lib/pages/products.page.ts
import { Component, inject } from '@angular/core';
import { ProductStore } from '../store/product.store';
import { ProductListComponent } from '../ui/product-list.component';

@Component({
  selector: 'app-products',
  template: `<app-product-list [products]="store.products()" />`,
  imports: [ProductListComponent],
})
export class ProductsPage {
  store = inject(ProductStore);
}
```

**Cross-Feature Import:**
```typescript
// libs/features/orders/src/lib/data-access/order.service.ts
import { Injectable } from '@angular/core';
import { UserService } from '@feature/auth';  // ✅ Via public API

@Injectable()
export class OrderService {
  constructor(private userService: UserService) {}
}
```

### ❌ Anti-Patterns

**Direct internal import:**
```typescript
// ❌ WRONG
import { ProductService } from '@feature/products/lib/data-access/product.service';

// ✅ CORRECT
import { ProductService } from '@feature/products';
```

**Circular dependency:**
```typescript
// libs/features/auth/src/lib/store/auth.store.ts
import { UserStore } from '@feature/users';  // ← users also imports from auth!

// libs/features/users/src/lib/store/user.store.ts
import { AuthStore } from '@feature/auth';   // ← CIRCULAR!
```

**App-level business logic:**
```typescript
// ❌ WRONG: App component with service
export class AppComponent {
  constructor(private productService: ProductService) {}
}

// ✅ CORRECT: Feature page handles state
export class ProductsPage {
  store = inject(ProductStore);
}
```

---

**Enforcement:** Violations are caught by ESLint rules and the `validate-imports.js` script.
