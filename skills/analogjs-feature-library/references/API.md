# With API Routes

Structure when `--api` is enabled (backend REST routes).

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
│   ├── models/                            # ✨ Data models (optional)
│   │   └── my-feature.model.ts
│   └── backend/                           # ✨ Backend folder
│       ├── index.ts                       # Backend barrel export
│       └── api/
│           └── routes/api/my-feature/
│               └── hello.ts               # REST endpoint handler
├── eslint.config.cjs
├── package.json
├── project.json
├── README.md
├── tsconfig.json
├── tsconfig.lib.json
├── tsconfig.spec.json
└── vite.config.mts
```

Route mapping examples:
- `hello.ts` → `GET /api/my-feature/hello`
- `hello.post.ts` → `POST /api/my-feature/hello`
- `users/[id].get.ts` → `GET /api/my-feature/users/:id`

Use for: REST APIs, backend services, data endpoints.
