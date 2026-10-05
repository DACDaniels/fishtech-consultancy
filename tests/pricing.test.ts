import { describe, expect, it } from 'vitest';
import feedJson from '../src/data/prices.json';
import planJson from '../src/data/feed-plan.json';
import {
  bandFor, findTown, isValidFeed, microns, pondFrom, pondPrice, pondSizes, quote,
  quoteMessage, sizeLabel, stockingPlan, usd, waLink, phoneDisplay, type Feed, type FeedPlan,
} from '../src/lib/pricing';

const feed = feedJson as unknown as Feed;
const plan = planJson as FeedPlan;

// A fixed feed so the arithmetic tests do not depend on today's prices.
const fixed: Feed = {
  currency: 'USD',
  ponds: { depth_m: 1.5, prices: [
    { size: '10 x 10 m', width_m: 10, length_m: 10, micron: 250, price: 100 },
    { size: '10 x 10 m', width_m: 10, length_m: 10, micron: 300, price: 120 },
    { size: '10 x 20 m', width_m: 10, length_m: 20, micron: 250, price: 200 },
  ] },
  bird_nets: [{ size: '10 x 10 m', price: 10 }, { size: '10 x 20 m', price: 20 }],
  fingerlings: { per: 1500, price: 50 },
  feed: [
    { product: 'Starter 2', bag_kg: 10, price: 2 }, { product: 'Starter 3', bag_kg: 10, price: 2 },
    { product: 'Juvenile 1', bag_kg: 25, price: 3 }, { product: 'Juvenile 2', bag_kg: 25, price: 3 },
    { product: 'Grower', bag_kg: 25, price: 4 },
  ],
  delivery: { name: 'Delivery and logistics', per: 'order', measured_from: 'Harare', bands: [
    { from_km: 0, to_km: 50, price: 1 }, { from_km: 50, to_km: 150, price: 2 },
    { from_km: 150, to_km: 300, price: 3 }, { from_km: 300, to_km: null, price: 4 },
  ] },
  site_visit: { price: 5 },
  towns: [{ place: 'Harare', km: 0 }, { place: 'Bindura', km: 88 }, { place: 'Lake Chivero', km: 35 }, { place: 'Bulawayo', km: 439 }],
  whatsapp: '263711626305',
};

describe('the live snapshot', () => {
  it('is a valid feed with every standard size in every liner', () => {
    expect(isValidFeed(feed)).toBe(true);
    for (const s of pondSizes(feed)) for (const m of microns(feed)) expect(pondPrice(feed, s.key, m)).toBeGreaterThan(0);
  });
  it('has a bird net price for every pond size', () => {
    for (const s of pondSizes(feed)) expect(feed.bird_nets.some((n) => n.size === s.key)).toBe(true);
  });
  it('has every feed product the plan uses', () => {
    for (const l of plan.bags_per_base_pond) expect(feed.feed.some((f) => f.product === l.product)).toBe(true);
  });
  it('never contains a cost, margin, feeder or Iris', () => {
    const text = JSON.stringify(feed).toLowerCase();
    for (const word of ['cost', 'margin', 'feeder', 'iris', 'profeeds']) expect(text).not.toContain(word);
  });
});

describe('sizes and formatting', () => {
  it('sorts sizes by area and labels them with ×', () => {
    expect(pondSizes(fixed).map((s) => s.label)).toEqual(['10 × 10 m', '10 × 20 m']);
    expect(sizeLabel('20 x 30 m')).toBe('20 × 30 m');
  });
  it('formats dollars', () => {
    expect(usd(1100)).toBe('$1,100');
    expect(usd(430)).toBe('$430');
  });
  it('finds the lowest pond price', () => expect(pondFrom(fixed)).toBe(100));
  it('formats the phone number', () => expect(phoneDisplay(fixed)).toBe('+263 71 162 6305'));
});

describe('delivery bands', () => {
  it('puts a distance on a band edge in the lower band', () => {
    expect(bandFor(fixed, 0).price).toBe(1);
    expect(bandFor(fixed, 50).price).toBe(1);
    expect(bandFor(fixed, 51).price).toBe(2);
    expect(bandFor(fixed, 300).price).toBe(3);
    expect(bandFor(fixed, 875).price).toBe(4);
  });
  it('finds towns by name, inside a sentence too', () => {
    expect(findTown(fixed, 'bindura')?.km).toBe(88);
    expect(findTown(fixed, 'Chiweshe, near Bindura')?.place).toBe('Bindura');
    expect(findTown(fixed, 'lake chivero')?.km).toBe(35);
    expect(findTown(fixed, 'Nowhere')).toBeUndefined();
  });
});

describe('stocking and feed plan', () => {
  it('matches the 10 × 10 m figures exactly', () => {
    const p = stockingPlan(feed, plan, 100);
    expect(p.fingerlings).toBe(1500);
    expect(p.totalKg).toBe(470);
  });
  it('scales by area', () => {
    const p = stockingPlan(fixed, plan, 200);
    expect(p.fingerlings).toBe(3000);
    expect(p.fingerlingLots).toBe(2);
    expect(p.fingerlingCost).toBe(100);
    expect(p.totalKg).toBe(940);
    // 2×2 + 2×2 + 4×3 + 8×3 + 24×4
    expect(p.feedCost).toBe(4 + 4 + 12 + 24 + 96);
  });
});

describe('quotation', () => {
  it('adds pond, extras and one delivery charge', () => {
    const q = quote(fixed, plan, { size: '10 x 10 m', micron: 300, net: true, fingerlings: true, feed: false, town: 'Bindura' });
    expect(q.lines.map((l) => l.amount)).toEqual([120, 10, 50, 2]);
    expect(q.total).toBe(182);
  });
  it('leaves delivery out and says so when the town is unknown', () => {
    const q = quote(fixed, plan, { size: '10 x 10 m', micron: 250, net: false, fingerlings: false, feed: false, town: 'Somewhere' });
    expect(q.total).toBe(100);
    expect(q.note).toMatch(/confirm delivery/);
  });
  it('writes a WhatsApp message with the request and a source tag', () => {
    const input = { size: '10 x 10 m', micron: 300, net: true, fingerlings: false, feed: false, town: 'Bindura' };
    const msg = quoteMessage(fixed, input, quote(fixed, plan, input));
    expect(msg).toBe("Hi FishTech, I'd like a 10 × 10 m pond with 300 micron liner, plus a bird / predator net. My farm is near Bindura. The website shows $132.");
    const link = waLink(fixed, msg, 'calculator');
    expect(link.startsWith('https://wa.me/263711626305?text=')).toBe(true);
    expect(decodeURIComponent(link.split('text=')[1])).toContain('[web:calculator]');
  });
});
