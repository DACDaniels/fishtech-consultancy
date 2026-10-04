// Live behaviour for every calculator on a page.
import { currentFeed } from './live-prices';
import {
  bandFor, findTown, pondSizes, quote, quoteMessage, stockingPlan, usd, waLink,
  type Feed, type FeedPlan, type QuoteInput,
} from '../lib/pricing';

const PX = 12;
const CX = 228;
const CY = 186;
const STROKE: Record<number, number> = { 250: 3, 300: 5, 400: 8 };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function setAttrs(el: Element | null, attrs: Record<string, number | string>) {
  if (!el) return;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
}

function setup(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('[data-form]')!;
  const svg = root.querySelector<SVGSVGElement>('[data-drawing]')!;
  const plan = JSON.parse(root.dataset.plan || '{}') as FeedPlan;
  const tag = root.dataset.tag || 'calculator';
  const $ = <T extends Element>(s: string) => root.querySelector<T>(s);
  let cur = { w: 0, h: 0 };
  let anim = 0;
  let shownTotal = 0;

  const pond = svg.querySelector('[data-pond]');
  const net = svg.querySelector('[data-net]');
  const fish = svg.querySelector('[data-fish]');
  {
    const r = pond!;
    cur = { w: Number(r.getAttribute('width')), h: Number(r.getAttribute('height')) };
  }

  function draw(w: number, h: number) {
    const x = CX - w / 2, y = CY - h / 2;
    setAttrs(pond, { x, y, width: w, height: h });
    setAttrs(net, { x, y, width: w, height: h });
    setAttrs(svg.querySelector('[data-dim-top]'), { x1: x, x2: x + w, y1: y - 22, y2: y - 22 });
    setAttrs(svg.querySelector('[data-tick-tl]'), { x1: x, x2: x, y1: y - 30, y2: y - 14 });
    setAttrs(svg.querySelector('[data-tick-tr]'), { x1: x + w, x2: x + w, y1: y - 30, y2: y - 14 });
    setAttrs(svg.querySelector('[data-label-len]'), { x: CX, y: y - 30 });
    setAttrs(svg.querySelector('[data-dim-left]'), { x1: x - 22, x2: x - 22, y1: y, y2: y + h });
    setAttrs(svg.querySelector('[data-tick-lt]'), { x1: x - 30, x2: x - 14, y1: y, y2: y });
    setAttrs(svg.querySelector('[data-tick-lb]'), { x1: x - 30, x2: x - 14, y1: y + h, y2: y + h });
    setAttrs(svg.querySelector('[data-label-wid]'), { x: x - 34, y: CY + 4 });
  }

  function animateTo(w: number, h: number) {
    cancelAnimationFrame(anim);
    const from = { ...cur };
    if (reduce) { cur = { w, h }; draw(w, h); return; }
    const t0 = performance.now();
    const step = (t: number) => {
      const k = easeOut(Math.min(1, (t - t0) / 320));
      cur = { w: from.w + (w - from.w) * k, h: from.h + (h - from.h) * k };
      draw(cur.w, cur.h);
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  function countTo(el: HTMLElement, value: number) {
    const from = shownTotal;
    shownTotal = value;
    if (reduce || from === value) { el.textContent = usd(value); return; }
    const t0 = performance.now();
    const step = (t: number) => {
      const k = easeOut(Math.min(1, (t - t0) / 300));
      el.textContent = usd(from + (value - from) * k);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function read(): QuoteInput {
    const fd = new FormData(form);
    return {
      size: String(fd.get('size')),
      micron: Number(fd.get('micron')),
      net: fd.get('net') === 'on',
      fingerlings: fd.get('fingerlings') === 'on',
      feed: fd.get('feed') === 'on',
      town: String(fd.get('town') || '').trim() || undefined,
    };
  }

  function townHelp(feed: Feed, input: QuoteInput) {
    const help = $<HTMLElement>('[data-town-help]');
    if (!help || !input.town) return;
    const t = findTown(feed, input.town);
    if (t) {
      const b = bandFor(feed, t.km);
      help.textContent = t.km === 0
        ? `${t.place}: delivery and logistics is ${usd(b.price)} per order.`
        : `${t.place} is about ${t.km} km from Harare by road. Delivery and logistics: ${usd(b.price)} per order.`;
    } else if (input.town.length > 2) {
      help.textContent = `${input.town} isn't on our list yet. Our assistant will work out the distance when you send this.`;
    }
  }

  function update() {
    const feed = currentFeed();
    const input = read();
    const q = quote(feed, plan, input);
    const size = pondSizes(feed).find((s) => s.key === input.size);
    if (size) {
      animateTo(size.length * PX, size.width * PX);
      svg.querySelector('[data-label-len]')!.textContent = `${size.length} m`;
      svg.querySelector('[data-label-wid]')!.textContent = `${size.width} m`;
      const sp = stockingPlan(feed, plan, size.area);
      if (fish) { fish.textContent = `${sp.fingerlings.toLocaleString('en-US')} fish`; fish.toggleAttribute('hidden', !input.fingerlings); }
    }
    pond?.setAttribute('stroke-width', String(STROKE[input.micron] ?? 4));
    net?.toggleAttribute('hidden', !input.net);

    const lines = $<HTMLElement>('[data-lines]')!;
    lines.replaceChildren(...q.lines.map((l) => {
      const li = document.createElement('li');
      const a = document.createElement('span'); a.textContent = l.label;
      const b = document.createElement('span'); b.className = 'num'; b.textContent = usd(l.amount);
      li.append(a, b);
      return li;
    }));
    countTo($<HTMLElement>('[data-total]')!, q.total);
    const note = $<HTMLElement>('[data-note]')!;
    note.textContent = q.note ?? (q.town ? `Includes one delivery and logistics charge to ${q.town.place}.` : 'Add your town to include delivery and logistics.');
    townHelp(feed, input);
    const send = $<HTMLAnchorElement>('[data-send]')!;
    send.href = waLink(feed, quoteMessage(feed, input, q), tag);
  }

  shownTotal = Number(($<HTMLElement>('[data-total]')!.textContent || '0').replace(/[^0-9.]/g, ''));
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', (e) => e.preventDefault());
  addEventListener('fishtech:prices', update);
  update();
}

document.querySelectorAll<HTMLElement>('[data-calc]').forEach(setup);
