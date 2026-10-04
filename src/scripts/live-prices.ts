// Refresh every price on the page from the live feed, so a price changed in the
// price list shows here without a rebuild. If the feed is slow or down, the
// build-time prices stay. Other scripts listen for the 'fishtech:prices' event.
import { isValidFeed, resolvePrice, usd, type Feed } from '../lib/pricing';

const FEED_URL = 'https://ops.fishtech.co.zw/prices.json';

declare global { interface Window { FISHTECH_FEED?: Feed } }

function snapshot(): Feed | undefined {
  const el = document.getElementById('feed-snapshot');
  try { return el ? JSON.parse(el.textContent || '') : undefined; } catch { return undefined; }
}

export function currentFeed(): Feed {
  return (window.FISHTECH_FEED ?? (window.FISHTECH_FEED = snapshot())) as Feed;
}

function apply(feed: Feed) {
  document.querySelectorAll<HTMLElement>('[data-price]').forEach((el) => {
    const v = resolvePrice(feed, el.dataset.price || '');
    if (v !== undefined) el.textContent = usd(v);
  });
}

async function refresh() {
  try {
    const res = await fetch(FEED_URL, { signal: AbortSignal.timeout(6000), cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    if (!isValidFeed(data)) return;
    window.FISHTECH_FEED = data;
    apply(data);
    window.dispatchEvent(new CustomEvent('fishtech:prices', { detail: data }));
  } catch { /* keep build-time prices */ }
}

currentFeed();
if (document.readyState === 'complete') refresh();
else addEventListener('load', () => refresh(), { once: true });
