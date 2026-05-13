# With Pages

Structure when `--pages` is enabled (file-based routes).

```
libs/my-feature/
├── src/
│   ├── index.ts
│   ├── test-setup.ts
│   ├── lib/
│   │   ├── components/
│   │   │   └── my-feature.component.ts
│   │   └── services/
│   │       └── my-feature.service.ts
│   └── pages/                             # ✨ File-based routes
│       └── my-feature/
│           ├── my-feature.page.ts         # Routable page component
│           └── (my-feature).page.ts       # Layout wrapper
├── eslint.config.cjs
├── package.json
├── project.json
├── README.md
├── tsconfig.json
├── tsconfig.lib.json
├── tsconfig.spec.json
└── vite.config.mts
```

Route mapping:
- `my-feature.page.ts` → `/my-feature`
- `(my-feature).page.ts` → Layout route (wraps child routes)

Use for: Features with UI pages, routes, navigation.
