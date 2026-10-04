// Pond-floor caustics: the moving net of light that sunlight throws through rippling
// water. Our own WebGL shader: two layers of animated cell edges (Worley noise, F2 − F1),
// gently warped, coloured from the brand tokens. Renders at reduced resolution, pauses
// off screen and in background tabs, and does nothing if WebGL is unavailable.

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision mediump float;
uniform vec2 uRes; uniform float uTime; uniform vec3 uGlow; uniform vec3 uDeep; uniform vec3 uInk;
vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
float cells(vec2 x, float t){
  vec2 n = floor(x), f = fract(x); float a = 8.0, b = 8.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j)); vec2 o = h2(n + g); o = 0.5 + 0.42 * sin(t + 6.2831 * o);
    float d = length(g + o - f); if (d < a) { b = a; a = d; } else if (d < b) { b = d; }
  }
  return b - a;
}
float vnoise(vec2 x){
  vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  float a = h2(i).x, b = h2(i + vec2(1.0, 0.0)).x, c = h2(i + vec2(0.0, 1.0)).x, d = h2(i + vec2(1.0, 1.0)).x;
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
void main(){
  vec2 q = gl_FragCoord.xy / uRes;
  vec2 p = vec2(gl_FragCoord.x / uRes.y, q.y * 1.25);
  // Domain warp twice so the cells bend into the soft, uneven loops real caustics make.
  vec2 w = vec2(vnoise(p * 2.2 + uTime * 0.12), vnoise(p * 2.2 - uTime * 0.1 + 5.0)) - 0.5;
  w += 0.5 * (vec2(sin(p.y * 4.0 + uTime * 0.7), cos(p.x * 3.3 - uTime * 0.6)));
  w *= 0.12;
  float e1 = cells((p + w) * 5.0, uTime * 0.45);
  float e2 = cells((p - w * 1.3) * 7.5 + 3.7, uTime * 0.6 + 1.3);
  // Thin bright filaments; where both layers cross, a hot spot.
  float l1 = pow(1.0 - smoothstep(0.0, 0.09, e1), 3.0);
  float l2 = pow(1.0 - smoothstep(0.0, 0.07, e2), 3.0);
  float c = l1 * 0.55 + l2 * 0.35 + l1 * l2 * 1.6;
  // Light comes and goes in patches, as it does through a moving surface.
  float patch = smoothstep(0.25, 0.85, vnoise(p * 1.3 + vec2(uTime * 0.06, -uTime * 0.04)));
  c *= 0.25 + 0.75 * patch;
  float light = smoothstep(-0.1, 1.0, q.y);
  float sun = smoothstep(1.25, 0.15, length((q - vec2(0.78, 0.92)) * vec2(1.0, 1.3)));
  vec3 base = mix(uInk, uDeep, light);
  gl_FragColor = vec4(base + uGlow * c * (0.06 + 0.3 * light) * (0.25 + 0.75 * sun), 1.0);
}`;

function rgb(v: string): [number, number, number] {
  const h = v.trim().replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
}

export function startCaustics(canvas: HTMLCanvasElement, host: HTMLElement) {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = u('uRes'), uTime = u('uTime'), uGlow = u('uGlow'), uDeep = u('uDeep'), uInk = u('uInk');

  const colours = () => {
    const cs = getComputedStyle(document.documentElement);
    gl.uniform3fv(uGlow, rgb(cs.getPropertyValue('--glow')));
    gl.uniform3fv(uDeep, rgb(cs.getPropertyValue('--deep')));
    gl.uniform3fv(uInk, rgb(cs.getPropertyValue('--ink-deep')));
  };
  const scale = matchMedia('(max-width: 700px)').matches ? 0.35 : 0.5;
  const size = () => {
    canvas.width = Math.max(1, Math.round(host.clientWidth * scale));
    canvas.height = Math.max(1, Math.round(host.clientHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };
  colours(); size();
  addEventListener('resize', size);
  new MutationObserver(colours).observe(document.documentElement, { attributes: true, attributeFilter: ['data-palette'] });

  let visible = true, raf = 0, last = 0;
  const t0 = performance.now();
  const frame = (t: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    if (t - last > 33) { // about 30 frames a second is plenty for water
      last = t;
      gl.uniform1f(uTime, (t - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    raf = requestAnimationFrame(frame);
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) go(); }).observe(host);
  document.addEventListener('visibilitychange', go);
  go();
  canvas.classList.add('on');
}
