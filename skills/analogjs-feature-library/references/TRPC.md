# With tRPC (Legacy)

Only include tRPC when explicitly requested. This is considered legacy in these docs.

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
│   └── backend/                           # ✨ Backend folder
│       ├── index.ts
│       ├── api/
│       │   └── routes/api/my-feature/
│       │       └── hello.ts
│       └── trpc/                          # ✨ tRPC infrastructure
│           ├── context.ts                 # Request context
│           ├── trpc.ts                    # tRPC router setup
│           ├── trpc-client.ts             # Frontend client
│           └── routers/
│               ├── index.ts               # Main router (combines sub-routers)
│               └── my-feature.ts          # Feature router
├── eslint.config.cjs
├── package.json
├── project.json
├── README.md
├── tsconfig.json
├── tsconfig.lib.json
├── tsconfig.spec.json
└── vite.config.mts
```

Key files and purpose:

| File | Purpose |
|------|---------|
| `trpc.ts` | Initialize tRPC Router and Procedure |
| `context.ts` | Build request context (auth, db, etc.) |
| `routers/my-feature.ts` | Define tRPC routes (queries, mutations) |
| `routers/index.ts` | Combine routers, export AppRouter type |
| `trpc-client.ts` | Frontend client for type-safe RPC calls |

Use for: Type-safe RPC, fullstack features with type inference (legacy).
