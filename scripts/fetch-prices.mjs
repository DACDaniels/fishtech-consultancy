// Fetch the live public price feed at build time and save a snapshot.
// If the feed cannot be reached, the last committed snapshot is kept, so the
// site always builds. Prices are never typed into the code.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FEEDS = [
  'https://ops.fishtech.co.zw/prices.json',
  'https://blueacre-quotation-bot.onrender.com/prices.json',
];
const OUT = 'src/data/prices.json';

function valid(d) {
  return d && d.currency === 'USD' && Array.isArray(d.ponds?.prices) && d.ponds.prices.length > 0
    && Array.isArray(d.bird_nets) && d.fingerlings?.price > 0 && Array.isArray(d.feed)
    && Array.isArray(d.delivery?.bands) && Array.isArray(d.towns) && typeof d.whatsapp === 'string';
}

for (const url of FEEDS) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!valid(data)) throw new Error('feed shape not recognised');
    data.fetched_at = new Date().toISOString();
    writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
    console.log(`prices: snapshot saved from ${url}`);
    process.exit(0);
  } catch (err) {
    console.warn(`prices: ${url} failed (${err.message})`);
  }
}
if (existsSync(OUT) && valid(JSON.parse(readFileSync(OUT, 'utf8')))) {
  console.warn('prices: using the last committed snapshot');
} else {
  console.error('prices: no feed and no snapshot; cannot build without prices');
  process.exit(1);
}
