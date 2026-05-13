# With Content Routes

Structure when `--contentRoutes` is enabled (markdown-driven content).

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
│   └── content/                           # ✨ Markdown content directory
│       └── my-feature/
│           ├── example-post.md
│           ├── another-post.md
│           └── ...
├── eslint.config.cjs
├── package.json
├── project.json
├── README.md
├── tsconfig.json
├── tsconfig.lib.json
├── tsconfig.spec.json
└── vite.config.mts
```

Content discovery:
- AnalogJS content API discovers `.md` files in `src/content/`
- Frontmatter (YAML) in markdown parsed as metadata

Use for: Blog, documentation, content-driven features.
