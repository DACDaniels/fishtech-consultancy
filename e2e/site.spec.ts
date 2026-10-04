import { expect, test, type Page } from '@playwright/test';
import feedJson from '../src/data/prices.json' with { type: 'json' };

const feed = feedJson as any;
const PAGES = ['/', '/pond-prices', '/start-fish-farming-zimbabwe', '/areas-we-cover', '/404'];
const price = (size: string, micron: number) => feed.ponds.prices.find((p: any) => p.size === size && p.micron === micron).price;
const net = (size: string) => feed.bird_nets.find((n: any) => n.size === size).price;
const band = (km: number) => feed.delivery.bands.find((b: any) => b.to_km === null || km <= b.to_km).price;
const usd = (n: number) => '$' + n.toLocaleString('en-US');

// Words that must never appear on the public site (CLAUDE.md reality check and
// docs/specs/website.md §3). Case-insensitive, whole words.
const FORBIDDEN = [
  '\\(pvt\\)', 'pvt', 'private limited', 'limited', 'ltd', 'registered in', 'registration number', 'incorporated',
  'consultancy', 'aquaculture group', 'blue acre', 'blue tech', 'blue fry', 'blue feed', 'blue cages', 'blue farms', 'blue commerce',
  'nust', 'azolla', 'profeeds', 'margin', 'biomass', 'camera', 'payback', 'investor', 'funding', 'valuation',
  'tonnes', 'years experience', 'projects completed', 'mr moyo', '\\$235',
];

async function noBlockedFeed(page: Page) {
  // Keep tests independent of the live feed unless a test replaces it.
  await page.route('https://ops.fishtech.co.zw/prices.json', (r) => r.fulfill({ status: 503, body: '' }));
}

for (const path of PAGES) {
  test(`${path}: loads, no forbidden claims, tagged WhatsApp links`, async ({ page }) => {
    await noBlockedFeed(page);
    const res = await page.goto(path);
    expect(res?.status()).toBeLessThan(path === '/404' ? 500 : 400);
    const text = (await page.locator('body').innerText()).toLowerCase();
    const head = (await page.evaluate(() => [
      document.title,
      ...[...document.querySelectorAll('meta[content]')].map((m) => m.getAttribute('content')),
      ...[...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
    ].join(' '))).toLowerCase();
    for (const w of FORBIDDEN) {
      expect(text, `"${w}" on ${path}`).not.toMatch(new RegExp(`\\b${w}\\b`));
      expect(head, `"${w}" in head of ${path}`).not.toMatch(new RegExp(`\\b${w}\\b`));
    }
    const links = await page.locator('a[href^="https://wa.me/"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    expect(links.length).toBeGreaterThan(0);
    for (const l of links) {
      expect(l).toContain(`https://wa.me/${feed.whatsapp}?text=`);
      expect(decodeURIComponent(l.split('text=')[1])).toMatch(/\[web:[a-z0-9-]+\]$/);
    }
    const missingAlt = await page.locator('img:not([alt])').count();
    expect(missingAlt).toBe(0);
    expect(await page.locator('h1').count()).toBe(1);
  });

  test(`${path}: no sideways scrolling on a phone`, async ({ page }) => {
    await noBlockedFeed(page);
    await page.setViewportSize({ width: 360, height: 760 });
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('calculator adds pond, net and one delivery charge, and writes the WhatsApp message', async ({ page }) => {
  await noBlockedFeed(page);
  await page.goto('/');
  const calc = page.locator('#prices');
  await calc.locator('input[name="size"][value="20 x 20 m"]').check();
  await calc.locator('input[name="micron"][value="400"]').check();
  await calc.locator('input[name="net"]').check();
  await calc.getByLabel(/Where is your farm/).fill('Bindura');
  const expected = price('20 x 20 m', 400) + net('20 x 20 m') + band(88);
  await expect(calc.locator('[data-total]')).toHaveText(usd(expected));
  const href = await calc.locator('[data-send]').getAttribute('href');
  const msg = decodeURIComponent(href!.split('text=')[1]);
  expect(msg).toContain('20 × 20 m pond with 400 micron liner, plus a bird net');
  expect(msg).toContain('near Bindura');
  expect(msg).toContain(usd(expected));
  expect(msg).toMatch(/\[web:calculator\]$/);
});

test('calculator says so when a town is not on the list', async ({ page }) => {
  await noBlockedFeed(page);
  await page.goto('/');
  await page.locator('#prices').getByLabel(/Where is your farm/).fill('Nowhereville');
  await expect(page.locator('#prices [data-town-help]')).toContainText("isn't on our list");
  await expect(page.locator('#prices [data-total]')).toHaveText(usd(price('10 x 10 m', 250)));
});

test('prices refresh from the live feed after the page loads', async ({ page }) => {
  const changed = structuredClone(feed);
  for (const p of changed.ponds.prices) p.price += 1;
  await page.route('https://ops.fishtech.co.zw/prices.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(changed) }));
  await page.goto('/pond-prices');
  await expect(page.locator('[data-price="pond:10 x 10 m:250"]').first()).toHaveText(usd(price('10 x 10 m', 250) + 1));
});

test('a broken live feed leaves the build-time prices in place', async ({ page }) => {
  await page.route('https://ops.fishtech.co.zw/prices.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"nonsense":true}' }));
  await page.goto('/pond-prices');
  await page.waitForTimeout(500);
  await expect(page.locator('[data-price="pond:10 x 10 m:250"]').first()).toHaveText(usd(price('10 x 10 m', 250)));
});

test('delivery checker gives the band for a town', async ({ page }) => {
  await noBlockedFeed(page);
  await page.goto('/areas-we-cover');
  await page.getByLabel('Check delivery to your area').fill('Mutare');
  await expect(page.locator('[data-out]')).toContainText(`Delivery and logistics: ${usd(band(263))}`);
});

test('planner scales fingerlings and feed by pond area', async ({ page }) => {
  await noBlockedFeed(page);
  await page.goto('/start-fish-farming-zimbabwe');
  await page.locator('[data-planner] input[value="20 x 20 m"]').check();
  await expect(page.locator('[data-planner] [data-fish]')).toHaveText('6,000');
  await expect(page.locator('[data-planner] [data-kg]')).toHaveText('1,880 kg');
});
