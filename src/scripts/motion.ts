// FishTech motion system. One set of timings and easings, and a small set of named
// patterns that pages opt into with data-motion="...". Documented in docs/MOTION.md.
// Everything is skipped for people who prefer reduced motion: content is then simply shown.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { resolvePrice, usd, type Feed } from '../lib/pricing';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Timings in seconds. */
export const DUR = { quick: 0.3, base: 0.7, slow: 1.0, epic: 1.4 } as const;
/** Easing curves. "out" for things arriving, "inOut" for things travelling, "water" for idle loops. */
export const EASE = { out: 'expo.out', soft: 'power3.out', inOut: 'power2.inOut', water: 'sine.inOut' } as const;
/** Gap between items in a group, in seconds. */
export const STAGGER = 0.07;
/** Where on screen things start: when their top passes 85% of the viewport height. */
const START = 'top 85%';

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

declare global { interface Window { __motionReady?: boolean } }

function onEnter(el: Element, fn: () => void) {
  ScrollTrigger.create({ trigger: el, start: START, once: true, onEnter: fn });
}

const patterns: Record<string, (el: HTMLElement) => void> = {
  // Heading lines rise from behind a mask.
  lines(el) {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'm-line' });
    gsap.set(el, { visibility: 'visible' });
    gsap.set(split.lines, { yPercent: 105 });
    onEnter(el, () => gsap.to(split.lines, { yPercent: 0, duration: DUR.slow, ease: EASE.out, stagger: STAGGER }));
  },
  // A block fades and rises.
  fade(el) {
    gsap.set(el, { opacity: 0, y: 28 });
    onEnter(el, () => gsap.to(el, { opacity: 1, y: 0, duration: DUR.slow, ease: EASE.soft, delay: Number(el.dataset.delay || 0) }));
  },
  // Children arrive one after another.
  list(el) {
    const kids = Array.from(el.children);
    gsap.set(kids, { opacity: 0, y: 24 });
    onEnter(el, () => gsap.to(kids, { opacity: 1, y: 0, duration: DUR.base, ease: EASE.soft, stagger: STAGGER }));
  },
  // A photo is uncovered from the bottom up while it settles from a slight zoom.
  wipe(el) {
    const img = el.querySelector('img');
    gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
    if (img) gsap.set(img, { scale: 1.15 });
    onEnter(el, () => {
      gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: DUR.epic, ease: 'power4.inOut' });
      if (img) gsap.to(img, { scale: 1, duration: DUR.epic + 0.4, ease: EASE.out });
    });
  },
  // A price or number counts up to its value, keeping the $ and commas.
  count(el) {
    const text = el.textContent || '';
    const target = Number(text.replace(/[^0-9.]/g, ''));
    if (!target) return;
    const prefix = text.match(/^[^0-9]*/)?.[0] ?? '';
    const obj = { v: 0 };
    el.textContent = prefix + '0';
    onEnter(el, () => gsap.to(obj, {
      v: target, duration: DUR.slow, ease: 'power2.out',
      onUpdate: () => { el.textContent = prefix + Math.round(obj.v).toLocaleString('en-US'); },
      onComplete: () => {
        const feed = (window as Window & { FISHTECH_FEED?: Feed }).FISHTECH_FEED;
        const v = feed && el.dataset.price ? resolvePrice(feed, el.dataset.price) : undefined;
        el.textContent = v !== undefined ? usd(v) : text;
      },
    }));
  },
  // Lines in an SVG draw themselves.
  draw(el) {
    const paths = el.querySelectorAll<SVGGeometryElement>('[data-draw]');
    paths.forEach((p) => { p.setAttribute('pathLength', '1'); gsap.set(p, { strokeDasharray: 1, strokeDashoffset: 1 }); });
    onEnter(el, () => gsap.to(paths, { strokeDashoffset: 0, duration: DUR.epic, ease: EASE.inOut, stagger: 0.12 }));
  },
  // Gentle depth: the image inside moves a little slower than the page.
  parallax(el) {
    const img = el.querySelector('img, video');
    if (!img) return;
    gsap.set(img, { scale: 1.12 });
    gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  },
  // A line fills as the reader moves through a sequence (used by "How a job runs").
  progress(el) {
    const bar = el.querySelector<HTMLElement>('[data-progress-bar]');
    if (!bar) return;
    gsap.fromTo(bar, { scaleY: 0 }, { scaleY: 1, ease: 'none', transformOrigin: 'top', scrollTrigger: { trigger: el, start: 'top 60%', end: 'bottom 60%', scrub: 0.4 } });
    el.querySelectorAll<HTMLElement>('[data-step]').forEach((step) =>
      ScrollTrigger.create({ trigger: step, start: 'top 60%', end: 'bottom 60%', toggleClass: { targets: step, className: 'is-active' } }));
  },
  // Hands the moment to CSS: adds .in when the element arrives (map, chat).
  cue(el) { onEnter(el, () => el.classList.add('in')); },
};

export function initMotion(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-motion]').forEach((el) => {
    for (const name of (el.dataset.motion || '').split(' ')) patterns[name]?.(el);
  });
}

if (reduced()) {
  document.querySelectorAll<HTMLElement>('[data-motion~="cue"]').forEach((el) => el.classList.add('in'));
} else {
  const start = () => { initMotion(); window.__motionReady = true; document.documentElement.classList.add('motion-ready'); };
  if (document.fonts?.ready) document.fonts.ready.then(start); else start();
}
