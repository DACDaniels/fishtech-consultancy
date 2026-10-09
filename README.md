# fishtech.co.zw

The FishTech website: fish ponds, bird nets, tilapia fingerlings and feed across Zimbabwe.
Built with [Astro](https://astro.build) as static pages, hosted on Vercel.

Decisions and the brief live in the business repository, `DACDaniels/blueacre-ops`:
`docs/specs/website.md` (what the site must and must not say), `docs/brand/brand-identity.md`
(colours, logo, typeface; BDR-0003) and `docs/DECISIONS.md` (2026-10-04 entries).

## Search (Google)

- **One public address: `https://www.fishtech.co.zw`.** It is set once, in `astro.config.mjs` (`site`)
  and `src/lib/site.ts` (`SITE`); canonical tags, share links, the sitemap and structured data all
  follow it. The bare `fishtech.co.zw` must redirect **permanently** to www (Vercel domain setting).
- `public/robots.txt` points at `/sitemap-index.xml`, which `@astrojs/sitemap` builds.
- Structured data in `src/layouts/Base.astro` describes FishTech and names Daniel Anesu Chadambuka
  as founder (no founder section on the page, by decision).
- Browser tests fail if a page's canonical or the sitemap uses any other address, or if robots.txt
  points anywhere else. Decisions: `blueacre-ops/docs/DECISIONS.md` 2026-10-09, "Search".

## Prices: never typed into the code

Every price comes from the WhatsApp assistant's public price feed,
`https://ops.fishtech.co.zw/prices.json`, which is generated from
`blueacre-ops/docs/finance/pricing-policy.md`.

- **At build time** `scripts/fetch-prices.mjs` saves the feed to `src/data/prices.json`. If the
  feed cannot be reached, the last committed snapshot is used, so the site always builds.
- **In the browser** `src/scripts/live-prices.ts` fetches the feed again and updates every
  element marked `data-price="..."`. If the feed is slow or wrong, the build-time prices stay.
- To change a price, change the price policy and the bot; the site follows. Redeploying the
  site refreshes the snapshot.

The stocking and feed figures for a 10 × 10 m pond are in `src/data/feed-plan.json`, from
`blueacre-ops/docs/sales/customer-knowledge.md`. Town positions for the map are in
`src/data/town-coords.json` and are for drawing only.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install everything |
| `npm run dev` | Local site at http://localhost:4321 |
| `npm run build` | Fetch prices, then build to `dist/` |
| `npm test` | Price arithmetic tests (Vitest) |
| `npm run test:e2e` | Browser tests (Playwright): calculator, live prices, links, phone layout, forbidden words, search address and sitemap |
| `node scripts/screenshots.mjs` | Desktop and phone screenshots of every page into `screenshots/` |

## Brand files

`python3 scripts/build-brand.py` builds the logo SVGs in `public/brand/` (wordmark converted to
outlines). `node scripts/render-icons.mjs` renders the PNG icons and `node scripts/render-og.mjs`
the link-preview image. Colours come from `blueacre-ops/docs/brand/brand-identity.md`.

## Rules the tests enforce

No claim of registration or incorporation, no division plan, no unbuilt products beyond the
feeder (made to order) and Iris (in development), no invented figures or quotes, no costs or
margins. Every WhatsApp link carries the message and a `[web:...]` tag naming the part of the
site that sent the lead.
