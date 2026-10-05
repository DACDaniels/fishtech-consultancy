// Common questions. Answers are built from the price feed so prices stay current,
// and from blueacre-ops/docs/sales/customer-knowledge.md for everything else.
import { bandFor, pondPrice, sortedBands, usd, type Feed } from './pricing';

export interface QA { q: string; a: string[] }

export function faqs(feed: Feed): QA[] {
  const bands = sortedBands(feed);
  const small = pondPrice(feed, '10 x 10 m', 250);
  const big = pondPrice(feed, '20 x 30 m', 400);
  return [
    { q: 'How much does a fish pond cost?', a: [
      `A 10 × 10 m pond, 1.5 m deep, with 250 micron liner is ${usd(small ?? 0)}. The largest standard pond, 20 × 30 m with 400 micron liner, is ${usd(big ?? 0)}. Every size and liner is on our pond prices page.`,
    ] },
    { q: 'Do you work outside Harare?', a: [
      `Yes, across the whole of Zimbabwe. Delivery and logistics is one charge per order, from ${usd(bands[0].price)} to ${usd(bands[bands.length - 1].price)}, depending on the road distance from Harare to your farm or its nearest town.`,
    ] },
    { q: 'What does a site visit cost, and do I need one?', a: [
      `${usd(feed.site_visit.price)}, and it's optional. We test your water, including its pH, check that the soil holds water, look at slope, drainage, flooding and access, and mark out the pond. If you go ahead with the job, the visit fee comes off the price.`,
    ] },
    { q: 'How do I pay?', a: [
      'Half before we start and half when the pond is finished. Our quotations hold for 30 days.',
    ] },
    { q: 'How many fish can I keep in one pond?', a: [
      'A 10 × 10 m pond, 1.5 m deep, holds 1,500 fingerlings. Larger ponds hold more in proportion: a 20 × 20 m pond holds about 6,000.',
    ] },
    { q: 'How long until my fish are ready to sell?', a: [
      'Tilapia usually take about 6 to 8 months to reach a size buyers like, if they are fed well and the water is good.',
    ] },
    { q: 'Can you guarantee my harvest?', a: [
      "No. Growth, survival and harvest weight depend on your water, feeding, fingerlings and daily care, so we won't promise a figure. We'll help you plan, and you can ask us on WhatsApp at any time along the way.",
    ] },
    { q: 'Can you build other sizes, or deeper ponds?', a: [
      'Other sizes, yes. Ask us on WhatsApp for a price. We build in firm ground to 1.5 m deep. For deeper ponds, or soft or wet ground, ask us first so we can look at the site.',
    ] },
  ];
}

export function faqJsonLd(items: QA[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a.join(' ') } })),
  };
}

export { bandFor };
