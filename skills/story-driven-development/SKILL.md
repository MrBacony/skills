---
name: story-driven-development
description: 'Create or update a Storybook story for every component and every relevant behavior, state, and variation. Use when implementing or changing UI components, Storybook stories, component states, interactions, visual regressions, Komponenten, Verhalten, Zustände, Varianten, or reusable UI. Works alongside test-driven-development and is not mutually exclusive.'
license: MIT
---

# Story-Driven Development (SDD)

## Overview

Story-Driven Development treats Storybook stories as living documentation for UI behavior.

**Core principle:** every component and every relevant behavior gets its own Storybook story.

If a component can render, change state, or react to interaction in a meaningful way, that behavior must be represented by a story.

This skill complements `test-driven-development`. They are **parallel practices**, not alternatives.

- **TDD** proves correctness and prevents regressions.
- **SDD** documents and demonstrates visual states, interactions, and usage.

Use both when working on UI. No turf war, only better software.

## When to Use

**Always for UI work involving components:**

- New components
- Changes to component behavior
- New visual states or variants
- Interaction changes
- Reusable UI extracted into a library
- Refactors that change rendering, inputs, outputs, or user-visible behavior

**Especially important when:**

- A component has multiple states (`loading`, `error`, `empty`, `disabled`, `expanded`, `selected`, etc.)
- A component exposes variants through inputs/props/args
- A reviewer needs to understand behavior quickly without booting the whole app

## Relationship to TDD

`story-driven-development` and `test-driven-development` can and should run together.

When both apply:

1. Follow TDD for logic and behavior verification.
2. Add or update Storybook stories for every relevant component state and behavior.
3. Keep tests and stories aligned as the implementation evolves.

**Important:**

- A Storybook story is **not** a substitute for a test.
- A test is **not** a substitute for a Storybook story.
- If the UI changed, both artifacts may need to change.

## The Rule

```
NO COMPONENT OR COMPONENT-BEHAVIOR CHANGE WITHOUT A CORRESPONDING STORY
```

If you add a state and there is no story for it, the job is not done.

## What Counts as a Separate Story

Create a separate story for each relevant behavior or state, not one giant catch-all story.

Typical story set:

- `Primary` or `Default`
- `Loading`
- `Error`
- `Empty`
- `Disabled`
- `Selected`
- `Expanded`
- `Submitting`
- `WithLongContent`
- `WithValidationError`

Use only the states that actually matter for the component.

### Good

- One story per meaningful state
- Story names describe observable behavior
- Stories are minimal and focused
- Args and controls make the state easy to inspect

### Bad

- One mega-story trying to show everything at once
- Story names like `Test`, `State1`, `Variant2`
- Stories that hide the behavior behind complex setup
- Stories skipped because “the test already covers it”

## Procedure

### 1. Identify the behavior matrix

Before or during implementation, list the meaningful UI states and interactions.

Ask:

- What does the component look like by default?
- What changes when data is missing?
- What changes when loading fails?
- What changes when the component is disabled or busy?
- What visual or interaction variants exist?

If the answer changes what the user sees or can do, it likely needs its own story.

### 2. Create or update the story file next to the component

Follow the repository component conventions:

- `src/lib/<component>/<component>.stories.ts`

Keep the story close to the component so behavior, tests, and stories evolve together.

### 3. Start with a base story

Every reusable component should have a clear baseline story such as `Primary` or `Default`.

That story should:

- Render the component with realistic inputs
- Demonstrate intended usage
- Expose relevant args/controls
- Be simple enough for a reviewer to understand in seconds

### 4. Add one story per meaningful behavior

For every important state or behavior, create a dedicated story.

Examples:

- Validation message visible
- Button becomes disabled while submitting
- Accordion expanded
- Empty result state shown
- Error banner rendered
- Alternate visual variant selected

Do not compress distinct behaviors into one story if separate stories would improve clarity.

### 5. Document the component through the stories

Each story set should help other developers understand:

- What the component is for
- Which inputs/args matter
- Which states are supported
- Accessibility expectations when relevant

Stories are documentation that actually runs.

### 6. Verify the story coverage

Before calling the work complete, confirm:

- Every new component has a story file
- Every relevant behavior/state has a dedicated story
- Story names are descriptive
- Stories still match the implemented UI
- Storybook can render or build the updated stories when feasible

## Repository Expectations

This repository already expects components to be both story-driven and test-driven.

For reusable components, prefer:

- shared UI library placement when the component is reusable
- colocated test and story files
- clear prop/arg documentation
- accessibility notes where helpful

## Review Checklist

Before marking UI work done:

- [ ] Component exists in the right library/location
- [ ] Test coverage follows `test-driven-development` where applicable
- [ ] A Storybook story exists for the component
- [ ] Every meaningful behavior/state has its own story
- [ ] Story names are behavior-oriented and readable
- [ ] Stories act as living documentation, not just scaffolding

## Common Rationalizations

| Excuse                                           | Reality                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| "A default story is enough"                      | Not if the component has meaningful alternate states.                    |
| "The tests already prove it"                     | Tests prove behavior; stories demonstrate it. You need both.             |
| "It is a tiny visual change"                     | Small visual changes still need visible documentation.                   |
| "I will add the stories later"                   | Later usually means forgotten. Add them with the change.                 |
| "One story with many controls covers everything" | Controls help exploration, but distinct states still need named stories. |

## Final Rule

```
Component change -> story coverage updated
Behavior change -> dedicated story added or updated
Otherwise -> not story-driven development
```

## REFERENCES

This repository benefits from a "story-first" workflow. The following references are practical, copy‑ready guidance you can follow when creating stories for the navigation/sidenav work (or any component work).

### Story-first quick checklist

- Create stories before changing implementation; stories act as the canonical visual spec for reviewers.
- Keep stories minimal and focused: one meaningful state per story.
- Include fixtures for i18n (e.g. `de`) and user state (with/without favorites) so visuals are reproducible.
- Co-locate stories next to the component: `src/lib/<component>/<component>.stories.ts`.

### Suggested Sidenav story states (minimum)

- `Default` (desktop baseline)
- `Expanded submenu` (shows expanded group and caret-down)
- `Active submenu` (highlighted subitem with peach background)
- `Starred / Favorited item` (star visible)
- `Empty favorites` (favorites area empty)
- `Mobile drawer` (narrow viewport, drawer/open state)

### Baseline screenshots (local workflow)

- Path for baselines: `openspec/changes/update-navigation-using-screendesign/baselines/`
- Filename pattern: `<component>.<story>.<viewport>.png` (example: `sidenav.default.desktop.png`).
- Recommended desktop viewport for baseline capture: 1366×768 (or agreed project token). Document the chosen viewport in the same folder.
- Capture method (example):

```bash
# start Storybook locally
npx nx run ui:storybook

# capture with a small Playwright script or utility that opens the story URL and screenshots it
node scripts/capture-storybook-baselines.js --out openspec/changes/update-navigation-using-screendesign/baselines
```

Example minimal Playwright snippet (save as `scripts/capture-storybook-baselines.js`):

```javascript
const { chromium } = require('playwright');
(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
	// Story URL pattern: /?path=/story/<kind>--<story>
	await page.goto('http://localhost:6006/?path=/story/sidenav--default');
	await page.screenshot({ path: 'openspec/changes/update-navigation-using-screendesign/baselines/sidenav.default.desktop.png' });
	await browser.close();
})();
```

### Visual diff guidance (local)

- This project does not require a CI visual-regression job for this change; baselines are captured and reviewed locally. If you run local diffs, pick a tolerable threshold (example: 2% pixel diff or 10px absolute differences) and flag larger diffs for manual review.

### Notes / Links

- Remember to reference `openspec/changes/update-navigation-using-screendesign/tasks.md` when adding stories and baselines.
- Use Storybook stories as the primary pixel-review harness before wiring changes into the app shell.

See detailed references and runnable snippets in `references/REFERENCE.md` and `scripts/` inside this skill folder.
