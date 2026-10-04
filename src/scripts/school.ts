// A school of tilapia fingerlings, drawn on a canvas. Each fish follows three simple
// rules (keep apart, match the neighbours' heading, stay with the group), the school
// cruises towards a slowly wandering point, and every fish darts away from the
// pointer or a finger. Pauses off screen. Colour comes from the brand tokens.

type Fish = { x: number; y: number; vx: number; vy: number; s: number; ph: number };

export function startSchool(canvas: HTMLCanvasElement, host: HTMLElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const small = matchMedia('(max-width: 700px)').matches;
  const N = small ? 42 : 90;
  const dpr = Math.min(1.5, window.devicePixelRatio || 1);
  let w = 0, h = 0;
  let glow = '25, 211, 197';
  const readColour = () => { glow = getComputedStyle(document.documentElement).getPropertyValue('--glow-rgb').trim() || glow; };
  readColour();
  new MutationObserver(readColour).observe(document.documentElement, { attributes: true, attributeFilter: ['data-palette'] });

  const size = () => {
    w = host.clientWidth; h = host.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener('resize', size);

  // The school starts together in the open water to the right of the headline.
  const fish: Fish[] = Array.from({ length: N }, () => ({
    x: w * (small ? 0.35 : 0.6) + Math.random() * w * 0.2, y: h * (0.25 + Math.random() * 0.25),
    vx: 1.2 + Math.random(), vy: (Math.random() - 0.5) * 0.6,
    s: 0.75 + Math.random() * 0.6, ph: Math.random() * 6.28,
  }));
  const pointer = { x: -9999, y: -9999 };
  const setPointer = (cx: number, cy: number) => { const r = host.getBoundingClientRect(); pointer.x = cx - r.left; pointer.y = cy - r.top; };
  host.addEventListener('pointermove', (e) => setPointer(e.clientX, e.clientY), { passive: true });
  host.addEventListener('pointerdown', (e) => setPointer(e.clientX, e.clientY), { passive: true });
  host.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });

  let visible = true, raf = 0, prev = performance.now();
  const MAX = small ? 2.1 : 2.6, MIN = 0.9;

  function step(t: number) {
    raf = 0;
    if (!visible || document.hidden) { prev = t; return; }
    const dt = Math.min(2.5, (t - prev) / 16.67);
    prev = t;
    // Where the school is heading: a slow figure of eight, biased to the open water on the right.
    const tx = w * (small ? 0.5 : 0.7) + Math.sin(t / 7000) * w * (small ? 0.3 : 0.16);
    const ty = h * (small ? 0.62 : 0.38) + Math.sin(t / 4300) * h * 0.16;
    for (const f of fish) {
      let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0;
      for (const o of fish) {
        if (o === f) continue;
        const dx = o.x - f.x, dy = o.y - f.y, d2 = dx * dx + dy * dy;
        if (d2 < 3600) {
          n++; ax += o.vx; ay += o.vy; cx += o.x; cy += o.y;
          if (d2 < 260) { sx -= dx / (d2 + 1); sy -= dy / (d2 + 1); }
        }
      }
      if (n) {
        f.vx += ((ax / n - f.vx) * 0.05 + (cx / n - f.x) * 0.0009) * dt;
        f.vy += ((ay / n - f.vy) * 0.05 + (cy / n - f.y) * 0.0009) * dt;
      }
      f.vx += (sx * 1.6 + (tx - f.x) * 0.00022) * dt;
      f.vy += (sy * 1.6 + (ty - f.y) * 0.00022) * dt;
      const px = f.x - pointer.x, py = f.y - pointer.y, pd2 = px * px + py * py;
      if (pd2 < 16900) { const k = (1 - Math.sqrt(pd2) / 130) * 0.9; f.vx += (px / Math.sqrt(pd2 + 1)) * k * dt; f.vy += (py / Math.sqrt(pd2 + 1)) * k * dt; }
      const sp = Math.hypot(f.vx, f.vy) || 1;
      const lim = pd2 < 16900 ? MAX * 1.8 : MAX;
      if (sp > lim) { f.vx *= lim / sp; f.vy *= lim / sp; } else if (sp < MIN) { f.vx *= MIN / sp; f.vy *= MIN / sp; }
      f.x += f.vx * dt; f.y += f.vy * dt;
      if (f.y < h * 0.12) f.vy += 0.05 * dt; else if (f.y > h * 0.92) f.vy -= 0.05 * dt;
      if (f.x > w + 80) f.vx -= 0.06 * dt;
      f.ph += (0.25 + Math.hypot(f.vx, f.vy) * 0.08) * dt;
    }
    ctx!.clearRect(0, 0, w, h);
    for (const f of fish) {
      const a = Math.atan2(f.vy, f.vx), wag = Math.sin(f.ph) * 0.35, L = (small ? 13 : 16) * f.s, B = (small ? 4 : 4.8) * f.s;
      ctx!.save();
      ctx!.translate(f.x, f.y);
      ctx!.rotate(a);
      ctx!.fillStyle = `rgba(${glow}, ${0.32 + f.s * 0.3})`;
      ctx!.beginPath();
      ctx!.moveTo(L * 0.55, 0);
      ctx!.quadraticCurveTo(L * 0.15, -B, -L * 0.45, -B * 0.25);
      ctx!.lineTo(-L * 0.45, B * 0.25);
      ctx!.quadraticCurveTo(L * 0.15, B, L * 0.55, 0);
      ctx!.fill();
      ctx!.rotate(wag);
      ctx!.beginPath();
      ctx!.moveTo(-L * 0.42, 0);
      ctx!.lineTo(-L * 0.85, -B * 0.85);
      ctx!.lineTo(-L * 0.75, 0);
      ctx!.lineTo(-L * 0.85, B * 0.85);
      ctx!.closePath();
      ctx!.fill();
      ctx!.restore();
    }
    raf = requestAnimationFrame(step);
  }
  const go = () => { if (!raf) { prev = performance.now(); raf = requestAnimationFrame(step); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) go(); }).observe(host);
  document.addEventListener('visibilitychange', go);
  go();
  canvas.classList.add('on');
}
