// Render PNG icons from the brand SVGs (run after scripts/build-brand.py).
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const icon = readFileSync('public/brand/fishtech-icon.svg', 'utf8');
const mark = readFileSync('public/brand/fishtech-mark.svg', 'utf8');
const jobs = [
  ['public/favicon-32.png', 32, mark],
  ['public/apple-touch-icon.png', 180, icon],
  ['public/brand/icon-192.png', 192, icon],
  ['public/brand/icon-512.png', 512, icon],
];
import { existsSync } from 'node:fs';
const local = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(existsSync(local) ? { executablePath: local } : {});
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const [out, size, svg] of jobs) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{width:${size}px;height:${size}px;display:block}</style>${svg}`);
  await page.screenshot({ path: out, omitBackground: true });
  console.log('wrote', out);
}
await browser.close();
