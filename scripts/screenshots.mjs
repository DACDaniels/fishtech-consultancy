// Full-page screenshots of every page on desktop and phone, for review.
// Usage: node scripts/screenshots.mjs [baseUrl] [outDir]
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';

const base = process.argv[2] || 'http://localhost:4321';
const out = process.argv[3] || 'screenshots';
mkdirSync(out, { recursive: true });
const pages = ['/', '/pond-prices', '/start-fish-farming-zimbabwe', '/areas-we-cover', '/404'];
const views = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: 'phone', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];
const local = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(existsSync(local) ? { executablePath: local } : {});
for (const v of views) {
  const ctx = await browser.newContext({ ...v, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const p of (process.env.PAGES ? process.env.PAGES.split(',') : pages)) {
    const res = await page.goto(base + p, { waitUntil: 'networkidle' }).catch(() => null);
    if (!res) continue;
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    const name = p === '/' ? 'home' : p.slice(1);
    await page.screenshot({ path: `${out}/${name}-${v.name}.png`, fullPage: true });
    console.log('shot', name, v.name);
  }
  await ctx.close();
}
await browser.close();
