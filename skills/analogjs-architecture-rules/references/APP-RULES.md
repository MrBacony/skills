# App Shell Rules

> **The app is a pure boilerplate shell — nothing more.**
> It bootstraps Angular, configures providers, and renders a `<router-outlet>`.
> **Zero** business logic, services, components, stores, or domain models belong here.

AnalogJS applications in this workspace must be **minimal bootstrapping shells** with no business logic whatsoever. The app exists solely to wire up the framework and hand off to feature libraries via file-based routing.

## ✅ What Belongs in an App

### Required Files

```
apps/website/
├── vite.config.ts                   # Vite/Analog build config
├── src/
│   ├── main.ts                      # Bootstrap entry point
│   ├── main.server.ts               # SSR bootstrap
│   ├── styles.css                   # Global styles (Tailwind)
│   ├── test-setup.ts                # Test configuration
│   ├── vite-env.d.ts                # Vite type declarations
│   └── app/
│       ├── app.config.ts            # Angular AppConfig with provideFileRouter()
│       ├── app.config.server.ts     # Server-specific config
│       ├── app.component.ts         # Root component (router outlet)
│       └── pages/                   # AnalogJS file-based routes
│           ├── (home).page.ts       # / (index route)
│           ├── about.page.ts        # /about
│           └── ...
├── public/
│   └── [app-wide static assets]
├── project.json
└── tsconfig.json
```

### Permitted Content

**`main.ts` — Bootstrap only:**
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
```

**`app.config.ts` — Configuration with AnalogJS file router:**
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideFileRouter, requestContextInterceptor } from '@analogjs/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(),
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([requestContextInterceptor]),
    ),
  ],
};
```

**`app.component.ts` — Shell layout only:**
```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: ` <router-outlet></router-outlet> `,
})
export class AppComponent {}
```

**Page files (`src/app/pages/*.page.ts`) — File-based routing:**

Routes are NOT defined in a separate `app.routes.ts`. AnalogJS discovers routes
automatically from `src/app/pages/` via `provideFileRouter()`.

```typescript
// src/app/pages/(home).page.ts
import { Component } from '@angular/core';

@Component({
  template: `<h1>Welcome</h1>`,
})
export default class HomePageComponent {}
```

```typescript
// src/app/pages/products/[productId].page.ts
import { Component, Input } from '@angular/core';
import { RouteMeta } from '@analogjs/router';

export const routeMeta: RouteMeta = {
  title: 'Product Details',
  canActivate: [() => true],
};

@Component({
  template: `<h2>Product: {{ productId }}</h2>`,
})
export default class ProductDetailsPageComponent {
  @Input() productId!: string;
}
```

### Global Configuration

- **Global styles** (`src/styles.css`) — yes, if using Tailwind CSS
- **App-level providers** in `appConfig` (auth guards, interceptors)
- **Public assets** in `public/` directory
- **Environment config** imports and setup

## ❌ What Does NOT Belong in an App

### Business Logic
- ❌ Services with API calls or data fetching
- ❌ Repositories or database access
- ❌ Complex state management
- ❌ Domain models or DTOs
- ❌ Validation schemas or logic
- ❌ Authentication/authorization implementations

### Components
- ❌ Page components (move to `src/app/pages/` as `*.page.ts` files)
- ❌ Reusable UI components (move to feature UI libraries)
- ❌ Feature-specific containers (move to feature pages)

### Feature Code
- ❌ Feature folders or feature modules
- ❌ Feature stores or state management
- ❌ Feature services
- ❌ Feature routes (AnalogJS discovers routes from `src/app/pages/` automatically)

### Backend Code
- ❌ API routes (move to feature `src/backend/` or `src/lib/{feature}/backend/`)
- ❌ Server middleware (place in shared backend library)
- ❌ Database schemas (place in data-access or feature libraries)

## File Organization

```
✅ GOOD
apps/website/
├── vite.config.ts
├── src/
│   ├── main.ts
│   ├── main.server.ts
│   ├── styles.css
│   └── app/
│       ├── app.config.ts
│       ├── app.config.server.ts
│       ├── app.component.ts
│       └── pages/
│           ├── (home).page.ts
│           └── about.page.ts
├── public/
│   └── images/

❌ AVOID
apps/website/
├── src/
│   └── app/
│       ├── [all of the above +]
│       ├── lib/
│       │   ├── products/              # ← Feature code in app!
│       │   │   ├── ui/
│       │   │   └── data-access/
│       │   └── cart/
│       ├── services/                  # ← Business logic in app!
│       │   └── product.service.ts
│       ├── components/                # ← Components in app!
│       │   ├── product-list/
│       │   └── product-card/
│       └── models/                    # ← Domain models in app!
│           └── product.model.ts
```

## Import Rules for Apps

**Allowed:**
- Import from `@feature/*` (feature library public APIs)
- Import from `@pages/*` (shared page components)
- Import from `@shared/*` (shared UI/utilities)
- Import from `@angular/*`
- Import from third-party libraries

**Forbidden:**
- Import from internal feature paths: `@feature/auth/lib/...`
- Create local services or components
- Import from other app's `src/`

## Validation Checks

The validation script checks:
- ✓ No `lib/` subdirectory in app
- ✓ No `services/` subdirectory
- ✓ No `components/` subdirectory (except app shell)
- ✓ Routes are imported from feature libraries
- ✓ Configuration is properly separated
- ✓ No direct feature imports (via public APIs only)

**Run validation:**
```bash
node .agents/skills/analogjs-architecture-rules/scripts/validate-architecture.js
```

## Examples

### ✅ Correct App Structure
See `website/` application in this workspace for reference.

### Common Mistakes to Avoid

**❌ WRONG: Feature code in app**
```
apps/website/src/app/lib/products/
├── components/
├── services/
└── store/
```
→ Move to `libs/features/products/`

**❌ WRONG: Business logic in components**
```typescript
// In app component
export class AppComponent {
  products$ = this.http.get('/api/products');
  constructor(private http: HttpClient) {}
}
```
→ Create a feature library with data-access service

**❌ WRONG: Global state in app**
```typescript
// In app.config.ts
export const productStore = signal([]);
```
→ Create a feature store in the product feature library

---

**Enforcement:** The validation scripts detect these violations and report them as warnings or errors (configurable).
