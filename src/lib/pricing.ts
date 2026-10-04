// Price logic for the website. Every amount comes from the public price feed
// (https://ops.fishtech.co.zw/prices.json), passed in as `feed`. Nothing here
// contains a price. Shared by the pages (at build time) and the calculator,
// planner and delivery checker (in the browser).

export interface PondPrice { size: string; width_m: number; length_m: number; micron: number; price: number }
export interface Band { from_km: number; to_km: number | null; price: number }
export interface Town { place: string; km: number }
export interface Feed {
  currency: string;
  ponds: { depth_m: number; note?: string; prices: PondPrice[] };
  bird_nets: { size: string; price: number }[];
  fingerlings: { per: number; price: number };
  feed: { product: string; bag_kg: number; price: number }[];
  delivery: { name: string; per: string; measured_from: string; bands: Band[] };
  site_visit: { price: number; note?: string };
  towns: Town[];
  whatsapp: string;
  fetched_at?: string;
}
export interface FeedPlan {
  base_pond_m2: number;
  fingerlings_per_base_pond: number;
  bags_per_base_pond: { product: string; bags: number }[];
}
export interface PondSize { key: string; label: string; width: number; length: number; area: number }

/** True when an object looks like a usable price feed. */
export function isValidFeed(d: unknown): d is Feed {
  const f = d as Feed;
  return !!f && f.currency === 'USD' && Array.isArray(f.ponds?.prices) && f.ponds.prices.length > 0
    && Array.isArray(f.bird_nets) && (f.fingerlings?.price ?? 0) > 0 && Array.isArray(f.feed)
    && Array.isArray(f.delivery?.bands) && f.delivery.bands.length > 0
    && Array.isArray(f.towns) && typeof f.whatsapp === 'string';
}

/** "10 x 20 m" -> "10 × 20 m" for display. */
export function sizeLabel(size: string): string {
  return size.replace(/\s*x\s*/i, ' × ');
}

/** Whole US dollars, e.g. 1100 -> "$1,100". */
export function usd(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

/** Standard pond sizes in the feed, smallest first. */
export function pondSizes(feed: Feed): PondSize[] {
  const seen = new Map<string, PondSize>();
  for (const p of feed.ponds.prices) {
    if (!seen.has(p.size)) {
      seen.set(p.size, { key: p.size, label: sizeLabel(p.size), width: p.width_m, length: p.length_m, area: p.width_m * p.length_m });
    }
  }
  return [...seen.values()].sort((a, b) => a.area - b.area);
}

/** Liner thicknesses offered, thinnest first. */
export function microns(feed: Feed): number[] {
  return [...new Set(feed.ponds.prices.map((p) => p.micron))].sort((a, b) => a - b);
}

export function pondPrice(feed: Feed, size: string, micron: number): number | undefined {
  return feed.ponds.prices.find((p) => p.size === size && p.micron === micron)?.price;
}

/** Lowest pond price, for "from" figures. */
export function pondFrom(feed: Feed): number {
  return Math.min(...feed.ponds.prices.map((p) => p.price));
}

export function netPrice(feed: Feed, size: string): number | undefined {
  return feed.bird_nets.find((n) => n.size === size)?.price;
}

export function feedPrice(feed: Feed, product: string): number | undefined {
  return feed.feed.find((f) => f.product === product)?.price;
}

/** The delivery band for a road distance. A distance on a band edge belongs to the lower band. */
export function bandFor(feed: Feed, km: number): Band {
  const bands = [...feed.delivery.bands].sort((a, b) => a.from_km - b.from_km);
  return bands.find((b) => b.to_km === null || km <= b.to_km) ?? bands[bands.length - 1];
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Find a town in the feed by name, ignoring case and punctuation. */
export function findTown(feed: Feed, query: string): Town | undefined {
  const q = norm(query);
  if (!q) return undefined;
  return feed.towns.find((t) => norm(t.place) === q)
    ?? feed.towns.find((t) => q.split(' ').length > 0 && new RegExp(`(^| )${norm(t.place)}( |$)`).test(q));
}

/** How many times larger than the 10 × 10 m reference pond. */
export function scaleFor(plan: FeedPlan, areaM2: number): number {
  return areaM2 / plan.base_pond_m2;
}

export interface PlanLine { product: string; bags: number; bag_kg: number; kg: number; cost: number }
export interface StockingPlan { factor: number; fingerlings: number; fingerlingLots: number; fingerlingCost: number; lines: PlanLine[]; totalKg: number; feedCost: number }

/** Fingerlings and feed for a pond, scaled by area from the 10 × 10 m figures. An estimate. */
export function stockingPlan(feed: Feed, plan: FeedPlan, areaM2: number): StockingPlan {
  const factor = scaleFor(plan, areaM2);
  const fingerlings = Math.round(plan.fingerlings_per_base_pond * factor);
  const fingerlingLots = Math.ceil(fingerlings / feed.fingerlings.per);
  const lines: PlanLine[] = plan.bags_per_base_pond.map(({ product, bags }) => {
    const item = feed.feed.find((f) => f.product === product);
    const n = Math.ceil(bags * factor);
    const bag_kg = item?.bag_kg ?? 0;
    return { product, bags: n, bag_kg, kg: n * bag_kg, cost: n * (item?.price ?? 0) };
  });
  return {
    factor,
    fingerlings,
    fingerlingLots,
    fingerlingCost: fingerlingLots * feed.fingerlings.price,
    lines,
    totalKg: lines.reduce((s, l) => s + l.kg, 0),
    feedCost: lines.reduce((s, l) => s + l.cost, 0),
  };
}

export interface QuoteInput { size: string; micron: number; net: boolean; fingerlings: boolean; feed: boolean; town?: string }
export interface QuoteLine { label: string; amount: number }
export interface Quote { lines: QuoteLine[]; total: number; town?: Town; delivery?: number; note?: string }

/** Build an indicative quotation. Delivery is added once per order when the town is known. */
export function quote(feed: Feed, plan: FeedPlan, input: QuoteInput): Quote {
  const size = pondSizes(feed).find((s) => s.key === input.size);
  const pond = pondPrice(feed, input.size, input.micron);
  if (!size || pond === undefined) return { lines: [], total: 0, note: 'Choose a pond size and liner.' };
  const lines: QuoteLine[] = [{ label: `${size.label} pond, ${input.micron} micron liner`, amount: pond }];
  if (input.net) {
    const net = netPrice(feed, input.size);
    if (net !== undefined) lines.push({ label: `Bird net, ${size.label}`, amount: net });
  }
  const sp = stockingPlan(feed, plan, size.area);
  if (input.fingerlings) {
    lines.push({ label: `Fingerlings, ${sp.fingerlings.toLocaleString('en-US')}`, amount: sp.fingerlingCost });
  }
  if (input.feed) {
    lines.push({ label: `Feed, start to harvest, about ${sp.totalKg.toLocaleString('en-US')} kg`, amount: sp.feedCost });
  }
  const town = input.town ? findTown(feed, input.town) : undefined;
  let delivery: number | undefined;
  if (town) {
    delivery = bandFor(feed, town.km).price;
    lines.push({ label: `${feed.delivery.name}, ${town.place}`, amount: delivery });
  }
  const total = lines.reduce((s, l) => s + l.amount, 0);
  const note = input.town && !town ? 'We will confirm delivery for your area.' : undefined;
  return { lines, total, town, delivery, note };
}

/** A WhatsApp link with the message typed in and a tag saying which part of the site sent it. */
export function waLink(feed: Pick<Feed, 'whatsapp'>, message: string, tag: string): string {
  return `https://wa.me/${feed.whatsapp}?text=${encodeURIComponent(`${message} [web:${tag}]`)}`;
}

/** "+263 71 162 6305" from "263711626305". */
export function phoneDisplay(feed: Pick<Feed, 'whatsapp'>): string {
  const d = feed.whatsapp.replace(/\D/g, '');
  return d.length === 12 ? `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : `+${d}`;
}

/** The message a quotation sends to the assistant. */
export function quoteMessage(feed: Feed, input: QuoteInput, q: Quote): string {
  const size = pondSizes(feed).find((s) => s.key === input.size);
  const extras = [input.net && 'a bird net', input.fingerlings && 'fingerlings', input.feed && 'feed from start to harvest'].filter(Boolean);
  let m = `Hi FishTech, I'd like a ${size?.label ?? input.size} pond with ${input.micron} micron liner`;
  if (extras.length) m += `, plus ${extras.join(', ').replace(/, ([^,]*)$/, ' and $1')}`;
  m += '.';
  if (q.town) m += ` My farm is near ${q.town.place}.`;
  else if (input.town) m += ` My farm is near ${input.town.trim()}.`;
  if (q.total > 0) m += ` The website shows ${usd(q.total)}.`;
  return m;
}

/**
 * Resolve a price key used in the pages' markup (data-price="...") to an amount.
 * Keys: pond-from, pond:<size>:<micron>, net:<size>, net-from, fingerlings,
 * feed:<product>, feed-from, band:<index>, site-visit.
 */
export function resolvePrice(feed: Feed, key: string): number | undefined {
  const [kind, a, b] = key.split(':');
  switch (kind) {
    case 'pond-from': return pondFrom(feed);
    case 'pond': return pondPrice(feed, a, Number(b));
    case 'net': return netPrice(feed, a);
    case 'net-from': return Math.min(...feed.bird_nets.map((n) => n.price));
    case 'fingerlings': return feed.fingerlings.price;
    case 'feed': return feedPrice(feed, a);
    case 'feed-from': return Math.min(...feed.feed.map((f) => f.price));
    case 'band': return [...feed.delivery.bands].sort((x, y) => x.from_km - y.from_km)[Number(a)]?.price;
    case 'site-visit': return feed.site_visit.price;
    default: return undefined;
  }
}

/** "Up to 50 km", "50 to 150 km", "Over 300 km". */
export function bandLabel(b: Band): string {
  if (b.from_km === 0 && b.to_km !== null) return `Up to ${b.to_km} km`;
  if (b.to_km === null) return `Over ${b.from_km} km`;
  return `${b.from_km} to ${b.to_km} km`;
}

export function sortedBands(feed: Feed): Band[] {
  return [...feed.delivery.bands].sort((x, y) => x.from_km - y.from_km);
}
