---
name: conventional-commits
description: Write, validate, and fix Conventional Commits messages for git history. Use when asked to craft commit messages, rewrite or normalize commits, enforce Conventional Commits, choose commit types/scopes, add breaking change indicators, or map changes to semantic versioning.
---

# Conventional Commits

## Quick workflow

- Identify the change intent (feature, fix, docs, refactor, etc.).
- Determine scope (optional, short noun) from affected area.
- Decide if the change is breaking (major) and add `!` and/or `BREAKING CHANGE:` footer.
- Write a short, imperative subject line (no trailing period).
- Add a body when context is needed (what/why) and footers for references.

## Commit format

```
<type>[optional scope][!]: <subject>

[optional body]

[optional footers]
```

## Types (recommended defaults)

- `feat`: new user-facing capability (minor)
- `fix`: bug fix (patch)
- `docs`: documentation only
- `style`: formatting only (no code change)
- `refactor`: code change without behavior change
- `perf`: performance improvement
- `test`: add/modify tests only
- `build`: build system or external dependencies
- `ci`: CI configuration/scripts
- `chore`: maintenance tasks, tooling, cleanup
- `revert`: revert a previous commit

If a repository defines a custom type list, follow it and prefer their naming.

## Subject line rules

- Imperative mood ("add", "fix", "update", "remove")
- ≤ 72 characters if possible
- No trailing period
- Do not capitalize entire subject

## Breaking changes

- Mark with `!` after type/scope **and** include a footer:
  - `BREAKING CHANGE: <description>`
- If scope is unknown, use `type!:`.

## Footers

- Use `BREAKING CHANGE:` for breaking changes.
- Use issue references like `Refs: #123` or `Closes: #123` if needed.

## Output checklist

- Format matches Conventional Commits
- Type is accurate and consistent
- Scope is correct (or omitted)
- Breaking change indicated (if applicable)
- Subject is concise and imperative

## Examples

See `references/examples.md` for canonical examples and templates.
