# Conventional Commit examples

## Table of contents

- [Templates](#templates)
- [Typical commits](#typical-commits)
- [Breaking changes](#breaking-changes)
- [Reverts](#reverts)

## Templates

- `type: subject`
- `type(scope): subject`
- `type(scope)!: subject`

## Typical commits

- `feat(auth): add OAuth2 device flow`
- `fix(parser): handle empty input`
- `docs(readme): add installation steps`
- `refactor(ui): simplify modal state`
- `perf(cache): reduce memory allocations`
- `test(api): add pagination tests`
- `build(deps): bump axios to 1.6.0`
- `ci(github): add lint job`
- `chore: remove unused scripts`

## Breaking changes

- `feat(api)!: remove deprecated v1 endpoints`

```
feat(api)!: remove deprecated v1 endpoints

BREAKING CHANGE: v1 endpoints were removed; use /v2/* instead.
```

## Reverts

- `revert: feat(auth): add OAuth2 device flow`

```
revert: feat(auth): add OAuth2 device flow

This reverts commit 9fceb02.
```
