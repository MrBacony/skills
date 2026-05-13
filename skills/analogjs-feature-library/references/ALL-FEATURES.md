# All Features Enabled

Full structure when all generator options are enabled. (Includes tRPC when explicitly requested.)

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
│   ├── models/
│   │   └── my-feature.model.ts
│   ├── pages/
│   │   └── my-feature/
│   │       ├── my-feature.page.ts
│   │       └── (my-feature).page.ts
│   ├── content/
│   │   └── my-feature/
│   │       ├── example-post.md
│   │       └── another-post.md
│   └── backend/
│       ├── index.ts
│       ├── api/
│       │   └── routes/api/my-feature/
│       │       └── hello.ts
│       └── trpc/
│           ├── context.ts
│           ├── trpc.ts
│           ├── trpc-client.ts
│           └── routers/
│               ├── index.ts
│               └── my-feature.ts
├── eslint.config.cjs
├── package.json
├── project.json
├── README.md
├── tsconfig.json
├── tsconfig.lib.json
├── tsconfig.spec.json
└── vite.config.mts
```
