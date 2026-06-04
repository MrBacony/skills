# Story-Driven Development — Reference

This reference contains practical guidance, checklists and small runnable examples to support the `story-driven-development` skill.

## Quick checklist

- Stories first: create stories BEFORE implementation changes.
- One story per meaningful state (Default, Expanded, Active, Starred, EmptyFavorites, MobileDrawer).
- Co-locate stories next to components: `src/lib/<component>/<component>.stories.ts`.
- Include fixtures for i18n (e.g. `de`) and user state (with/without favorites).
- Capture baseline screenshots from Storybook and store under `openspec/changes/<change>/baselines/`.

## Baseline capture (local)

- Recommended desktop viewport: 1366×768 (document choice).
- Filename pattern: `<component>.<story>.<viewport>.png` (e.g. `sidenav.default.desktop.png`).
- Use the example script in `../scripts/capture-storybook-baselines.js` to capture baselines. Install Playwright and run Storybook first.

## Local visual diff guidance

- No mandatory CI visual job for this change. Run diffs locally with Pixelmatch or Playwright image comparison.
- Suggested tolerances: <=2% pixel diff or <=10px absolute variance for non-critical layout. Larger diffs require manual sign-off.

## Accessibility checks

- Verify keyboard navigation for Sidenav (Tab, Arrow keys, Enter/Space to toggle expand).
- Ensure `aria-current="page"` on active links and `aria-expanded` on toggles.

## Examples & links

- Playwright capture example: `scripts/capture-storybook-baselines.js` (node + playwright)
- Agent Skills specification: [https://agentskills.io/specification](https://agentskills.io/specification)

## Script usage examples

- Default (uses built-in story list and default outDir):

```bash
node .agents/skills/story-driven-development/scripts/capture-storybook-baselines.js
```

- Provide custom stories and out directory:

```bash
node .agents/skills/story-driven-development/scripts/capture-storybook-baselines.js --outDir=openspec/changes/update-navigation-using-screendesign/baselines --story='/?path=/story/sidenav--default:sidenav.default.desktop.png' --story='/?path=/story/sidenav--expanded-submenu:sidenav.expanded.desktop.png'
```

## Maintenance

- Keep this file focused. Move long runnable helpers to `scripts/` and reference them here.
