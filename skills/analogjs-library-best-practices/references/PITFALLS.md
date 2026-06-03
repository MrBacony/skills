# AnalogJS Library Pitfalls

Use this reference as a pre-flight check before finalizing AnalogJS library work.

## Common Structural Mistakes

### Putting real logic in `src/pages/`

`src/pages/` is for AnalogJS route wrappers, not for feature implementation.

If a route file grows real state, side effects, or domain logic, move that behavior into `src/lib/pages/` or `src/lib/services/`.

### Exporting server code from `src/index.ts`

This leaks server-only concerns into browser-facing imports and creates bundling pain.

Keep server exports in `src/backend/index.ts`.

### Mixing contracts into components or handlers

If request/response types are reused across boundaries, put them in `src/models/`.

Do not force consumers to import a UI component or a route file just to reuse a data shape.

## Generator and Wiring Traps

### Assuming the consumer app auto-discovers everything

Pages and backend routes are not magically available everywhere.

When a library contributes pages or APIs, verify the consuming app has the correct Vite configuration:

- `additionalPagesDirs`
- `additionalAPIDirs`

### Assuming placeholder/example files always exist

The generator’s structure is reliable; example content is not something to depend on architecturally.

Different flags and versions can leave some directories empty except for `.gitkeep` files.

Design against folder responsibilities, not placeholder files.

### Forgetting Tailwind scan coverage

If utility classes exist in library templates but the app is not scanning library sources, the UI can look mysteriously unstyled.

When styles vanish, check Tailwind scanning before blaming the component.

## Technology Choice Traps

### Reaching for tRPC by reflex

In this workspace, tRPC is legacy. Do not introduce it just because it is “type-safe.” REST plus shared models is the default path.

### Overbuilding shared abstractions

Not every library needs a base service, repository layer, or “core” module.

If the abstraction has only one consumer, it is often just renamed complexity.

### Turning every library into a fullstack feature

Many libraries only need components, only content, or only backend behavior.

Do not create pages, backend folders, and content routes all at once unless the requirements actually demand them.

## Angular-Specific Drift

### Falling back to legacy Angular patterns

Avoid reintroducing:

- NgModules
- `CommonModule`
- `RouterModule`
- constructor injection as the default habit
- legacy `*ngIf` / `*ngFor`

Prefer the workspace’s current Angular conventions instead.

### Testing thin wrappers instead of behavior

If the most elaborate tests target `src/pages/*.page.ts`, you are probably testing the wrong layer.

Move behavior down into `src/lib/pages/` or services, then test there.

## Final Review Questions

Ask these before wrapping up:

- Is this the smallest library shape that fits?
- Are route wrappers still thin?
- Are contracts shared from `src/models/`?
- Is backend code kept out of the frontend barrel?
- Is REST still sufficient?
- Is consumer-app wiring verified?

If any answer is “not sure,” there is still a loose screw in the bookshelf.