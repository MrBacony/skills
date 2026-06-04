// Simple Playwright script to capture Storybook story screenshots for baselines.
// Usage:
// 1) npm i -D playwright
// 2) npx nx run ui:storybook
// 3) node .agents/skills/story-driven-development/scripts/capture-storybook-baselines.js

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node capture-storybook-baselines.js [--outDir=dir] [--host=http://localhost:6006] [--viewport=WxH] --story=storyPath:file.png [--story=...]');
  console.log('Example:');
  console.log("  node capture-storybook-baselines.js --outDir=openspec/changes/update-navigation-using-screendesign/baselines --story='/?path=/story/sidenav--default:sidenav.default.desktop.png'");
}

function parseArgs(argv) {
  const opts = { outDir: 'openspec/changes/update-navigation-using-screendesign/baselines', host: 'http://localhost:6006', viewport: { width: 1366, height: 768 }, stories: [] };
  for (const arg of argv) {
    if (arg.startsWith('--outDir=')) opts.outDir = arg.split('=')[1];
    else if (arg.startsWith('--host=')) opts.host = arg.split('=')[1];
    else if (arg.startsWith('--viewport=')) {
      const v = arg.split('=')[1]; const [w,h] = v.split('x').map(Number); opts.viewport = { width: w||1366, height: h||768 };
    } else if (arg.startsWith('--story=')) {
      const v = arg.split('=')[1];
      const parts = v.split(':');
      if (parts.length !== 2) { console.warn('Ignoring invalid --story value:', v); continue; }
      opts.stories.push({ url: parts[0], file: parts[1] });
    } else if (arg === '--help' || arg === '-h') { usage(); process.exit(0); }
  }
  return opts;
}

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(args.outDir);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: args.viewport });

  const defaultStories = [
    { url: '/?path=/story/sidenav--default', file: 'sidenav.default.desktop.png' },
    { url: '/?path=/story/sidenav--expanded-submenu', file: 'sidenav.expanded.desktop.png' },
    { url: '/?path=/story/sidenav--active-submenu', file: 'sidenav.active.desktop.png' },
    { url: '/?path=/story/sidenav--starred', file: 'sidenav.starred.desktop.png' },
    { url: '/?path=/story/sidenav--empty-favorites', file: 'sidenav.empty-favorites.desktop.png' },
    { url: '/?path=/story/sidenav--mobile-drawer', file: 'sidenav.mobile.desktop.png' }
  ];

  const stories = args.stories.length ? args.stories : defaultStories;

  for (const s of stories) {
    const url = args.host.replace(/\/$/, '') + s.url;
    const outPath = path.join(outDir, s.file);
    console.log('Capturing', url, '->', outPath);
    await page.goto(url);
    await page.waitForTimeout(300); // allow simple animations to settle
    await page.screenshot({ path: outPath });
  }

  await browser.close();
  console.log('Baselines saved to', outDir);
})();
