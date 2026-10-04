// Render the link-preview image shown when the site is shared (1200 × 630).
import { chromium } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';

const photo = readFileSync('src/assets/photos/douglasdale-walkway-dusk.jpg').toString('base64');
const logo = readFileSync('public/brand/fishtech-logo-white.svg', 'utf8');
const font = readFileSync('node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2').toString('base64');
const html = `<!doctype html><html><head><style>
@font-face{font-family:A;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900;font-stretch:62% 125%}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;display:grid;grid-template-columns:690px 510px;background:#063A43;font-family:A,sans-serif}
.l{padding:56px 60px;display:flex;flex-direction:column;justify-content:space-between;color:#fff}
.l svg{height:62px;width:264px;align-self:flex-start}
h1{font-size:76px;line-height:.95;font-weight:800;font-stretch:70%;letter-spacing:-.01em}
p{font-size:26px;color:#B7D3D1}p b{color:#F5B82E}
.r{background:url(data:image/jpeg;base64,${photo}) center 60%/cover}
</style></head><body><div class="l">${logo}<h1>Fish ponds, built properly, anywhere in Zimbabwe</h1><p>Ponds, nets, fingerlings and feed. <b>Get a price on WhatsApp, any time.</b></p></div><div class="r"></div></body></html>`;
const local = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(existsSync(local) ? { executablePath: local } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.waitForTimeout(300);
await page.screenshot({ path: 'public/og/fishtech.jpg', type: 'jpeg', quality: 86 });
await browser.close();
console.log('wrote public/og/fishtech.jpg');
