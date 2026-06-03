# AnalogJS Best Practices

For Angular-specific best practices (Signals, DI, forms, components, testing, accessibility), see the **`angular-developer` skill**.

This guide covers only AnalogJS-specific and architecture-specific conventions for this workspace.

## App Shell First (No App Pages, No App Routes)

The application under `apps/*` is a **pure bootstrap shell**.

### Mandatory constraints

- No `src/app/pages/**` in apps
- No route definitions in app code (`Routes[]`, `provideRouter`, `withExtraRoutes`)
- No feature logic in app components/config
- App only wires platform providers and renders shell boilerplate

### Minimal app responsibilities

```typescript
// apps/website/src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(console.error);
```

```typescript
// apps/website/src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}
```

## Routing Ownership

Routing and page composition belong to feature libraries, not to the app shell.

- Feature entry points and page containers live in `libs/features/**`
- App shell must not define or own route trees
- Shared routing concerns (guards/resolvers/tokens) are provided from libraries

For concrete feature library routing patterns and structure, use **`analogjs-feature-library`**.

## Server Integration

**Use Nitro for backend routes**
```typescript
// src/lib/backend/routes/products.get.ts
import { defineEventHandler } from 'h3';

export default defineEventHandler(async () => {
  return await getProducts();
});
```

**Separate frontend and backend APIs**
```typescript
// src/index.ts (frontend API)
export { ProductService } from './lib/data-access/product.service';

// src/server.ts (backend API)
export { ProductServerRepository } from './lib/backend/product.repository';
```

## Content Routes

- Use markdown content (`.md`) for content-driven pages
- Keep content concerns separate from application shell logic

## Project Conventions

### Naming conventions

| Item | Convention | Example |
|------|-----------|---------|
| Component file | `.component.ts` | `product.component.ts` |
| Service file | `.service.ts` | `product.service.ts` |
| Store file | `.store.ts` | `product.store.ts` |
| Model file | `.model.ts` | `product.model.ts` |
| Type file | `.types.ts` | `product.types.ts` |
| Schema file | `.schema.ts` | `product.schema.ts` |
| Dialog file | `.dialog.ts` | `delete-product.dialog.ts` |

### Library organization

```
libs/
├── features/
│   ├── auth/
│   ├── products/
│   └── orders/
├── shared/
│   ├── ui/
│   ├── utils/
│   └── config/
```

---

**References:**
- [AnalogJS Documentation](https://analogjs.org/docs)
- `angular-developer` skill for Angular best practices
- `analogjs-feature-library` skill for feature library patterns
