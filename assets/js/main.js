// naftaliro.dev
// flavor switcher, the wallpaper, the less-style % on posts, and the content warning.
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ── catppuccin flavors ───────────────────────────── */

  const FLAVORS = ['mocha', 'macchiato', 'frappe', 'latte'];
  const PRETTY = { mocha: 'mocha', macchiato: 'macchiato', frappe: 'frappé', latte: 'latte' };
  let flavor = FLAVORS.includes(root.dataset.flavor) ? root.dataset.flavor : 'mocha';

  function setFlavor(f, save) {
    flavor = f;
    root.dataset.flavor = f;
    $$('.flavor-name').forEach(el => { el.textContent = PRETTY[f]; });
    $('#flavor')?.setAttribute('aria-label', `catppuccin flavor: ${PRETTY[f]}. click to switch`);
    const base = getComputedStyle(root).getPropertyValue('--base').trim();
    $('meta[name="theme-color"]')?.setAttribute('content', base);
    if (save) { try { localStorage.setItem('flavor', f); } catch {} }
    wall.build();
  }
  const nextFlavor = () => setFlavor(FLAVORS[(FLAVORS.indexOf(flavor) + 1) % FLAVORS.length], true);
  $('#flavor')?.addEventListener('click', nextFlavor);
  addEventListener('keydown', e => {
    if (e.key !== 't' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    nextFlavor();
  });

  /* ── how far into a post you are, like less ───────── */

  const pos = $('#pos');
  const story = $('.prose');
  if (pos && story) {
    const update = () => {
      if (!story.offsetHeight) { pos.textContent = 'cw'; return; }
      const r = story.getBoundingClientRect();
      const pct = Math.round(Math.min(Math.max((innerHeight - r.top) / r.height, 0), 1) * 100);
      pos.textContent = r.top > 0 && scrollY < 40 ? 'top' : pct >= 100 ? 'end' : `${pct}%`;
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
    pos.update = update;
  }

  /* ── content warning ──────────────────────────────── */

  const cw = $('.cw');
  $('#cw-go')?.addEventListener('click', () => {
    $$('.gated').forEach(el => el.classList.add('open'));
    cw.classList.add('passed');
    $('#story-start')?.focus();
    pos?.update?.();
  });

  /* ── wallpaper ────────────────────────────────────── */
  // the same prairie as 3hz.dev, a few hours earlier. the sun's going down,
  // one kestrel is still out hunting and the other is already on the wire.
  // it's drawn once and never moves, so it stays out of the way while you read.

  const wall = (() => {
    const canvas = $('#wall');
    if (!canvas) return { build() {} };
    const ctx = canvas.getContext('2d');
    const P = {};
    let W = 0;

    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
    const HOVER = ['#...........#', '##.........##', '.##.......##.', '..###.#.###..', '....#####....', '.....###.....', '.....###.....', '....##.##....'];
    const PERCH = ['.##..', '###..', '.###.', '.###.', '.####', '..###', '...#.', '...#.'];

    const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const css = c => `rgb(${c[0]},${c[1]},${c[2]})`;
    function rng(seed) {
      return () => {
        seed |= 0; seed = seed + 0x6d2b79f5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    function sprite(rows, x0, y0, color) {
      ctx.fillStyle = css(color);
      rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') ctx.fillRect(x0 + x, y0 + y, 1, 1); });
    }

    function build() {
      const cs = getComputedStyle(root);
      ['crust', 'mantle', 'base', 'surface0', 'surface1', 'overlay0', 'overlay1', 'mauve', 'peach', 'yellow', 'pink', 'lavender']
        .forEach(k => { P[k] = hex(cs.getPropertyValue('--' + k).trim()); });
      const light = flavor === 'latte';

      const scale = innerWidth < 720 ? 3 : 4;
      W = Math.ceil(innerWidth / scale);
      const H = Math.ceil(Math.max(innerHeight, canvas.clientHeight || 0) / scale);
      canvas.width = W;
      canvas.height = H;

      const rand = rng(7);
      const img = ctx.createImageData(W, H);
      const d = img.data;
      const put = (x, y, c) => { const i = (y * W + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; };

      // where the column isn't, so the birds and the sun don't end up behind it
      const margin = (innerWidth - 800) / 2 / scale;
      const roomy = margin > 24;
      const horizon = Math.round(H * 0.8);

      // sky: dusk. purple up high, going peachy at the horizon
      const warm = mix(P.base, P.peach, light ? 0.18 : 0.26);
      const dusk = mix(P.base, P.mauve, light ? 0.1 : 0.16);
      const stops = light
        ? [[0, P.crust], [0.5, P.mantle], [0.78, P.base], [0.9, dusk], [1, warm]]
        : [[0, P.crust], [0.38, P.mantle], [0.66, P.base], [0.84, dusk], [1, warm]];
      for (let y = 0; y < H; y++) {
        const t = Math.min(y / horizon, 1);
        let s = 0;
        while (s < stops.length - 2 && t > stops[s + 1][0]) s++;
        const [p0, c0] = stops[s], [p1, c1] = stops[s + 1];
        const k = (t - p0) / (p1 - p0);
        for (let x = 0; x < W; x++) put(x, y, k > BAYER[(y & 3) * 4 + (x & 3)] ? c1 : c0);
      }

      // the sun, half behind the treeline, with a dithered edge. on phones the column
      // covers the whole middle, so the sun and the birds only show up when there's room
      const sx = Math.round(W - margin * 0.45), sy = horizon - 4, sr = 8;
      const sun = mix(warm, mix(P.peach, P.yellow, 0.35), light ? 0.4 : 0.5);
      if (roomy) for (let y = sy - sr - 2; y <= sy + sr; y++) for (let x = sx - sr - 2; x <= sx + sr + 2; x++) {
        if (x < 0 || x >= W || y < 0 || y >= H) continue;
        const dist = Math.hypot(x - sx, y - sy) - sr;
        if (dist < 0 || (dist < 2 && dist / 2 < BAYER[(y & 3) * 4 + (x & 3)])) put(x, y, sun);
      }

      // stars, only the first few are out
      if (!light) {
        const n = Math.round(W * horizon / 900);
        for (let i = 0; i < n; i++) {
          const x = Math.floor(rand() * W), y = Math.floor(Math.pow(rand(), 1.8) * horizon * 0.45);
          put(x, y, rand() < 0.15 ? P.lavender : rand() < 0.5 ? P.overlay1 : P.overlay0);
        }
      }

      // hills, same shapes as 3hz (it's still illinois)
      const ph = [rand() * 9, rand() * 9, rand() * 9, rand() * 9];
      const far = mix(P.surface0, P.base, 0.25);
      const mid = light ? P.surface0 : P.mantle;
      const near = light ? P.surface1 : P.crust;
      const farY = x => horizon - 4 - Math.round(Math.sin(x * 0.011 + ph[0]) * 4 + Math.sin(x * 0.037 + ph[1]) * 2 + Math.abs(Math.sin(x * 0.29 + ph[2])) * 3);
      const midY = x => horizon + 3 + Math.round(Math.sin(x * 0.008 + ph[3]) * 2);
      const nearY = x => Math.round(H * 0.93 + Math.sin(x * 0.02 + ph[1]) * 2);
      for (let x = 0; x < W; x++) {
        for (let y = Math.max(farY(x), 0); y < H; y++) put(x, y, far);
        for (let y = midY(x); y < H; y++) put(x, y, mid);
        for (let y = nearY(x); y < H; y++) put(x, y, near);
        if (rand() < 0.45) {
          const h = 1 + Math.floor(rand() * 3);
          for (let k = 1; k <= h; k++) if (nearY(x) - k >= 0) put(x, nearY(x) - k, near);
        }
      }
      ctx.putImageData(img, 0, 0);

      // power line
      const ink = light ? P.overlay0 : P.crust;
      const wireC = light ? mix(P.surface0, P.surface1, 0.4) : mix(P.crust, P.surface0, 0.6);
      const gapX = 110, poleH = 30;
      const poles = [];
      for (let x = 14 - Math.round(ph[0] * 6); x < W + gapX; x += gapX) poles.push(x);
      ctx.fillStyle = css(ink);
      poles.forEach(x => {
        const g = midY(x);
        ctx.fillRect(x, g - poleH, 2, poleH);
        ctx.fillRect(x - 5, g - poleH + 2, 12, 1);
        ctx.fillRect(x - 5, g - poleH + 1, 1, 1);
        ctx.fillRect(x + 6, g - poleH + 1, 1, 1);
      });
      const wire = [];
      ctx.fillStyle = css(wireC);
      for (let i = 0; i < poles.length - 1; i++) {
        const a = poles[i], b = poles[i + 1];
        for (const off of [-5, 6]) {
          const ya = midY(a) - poleH + 1, yb = midY(b) - poleH + 1;
          for (let x = a + off; x < b + off; x++) {
            const u = (x - a - off) / gapX;
            const y = Math.round(ya + (yb - ya) * u + 5 * 4 * u * (1 - u));
            ctx.fillRect(x, y, 1, 1);
            if (off === 6) wire[x] = y;
          }
        }
      }

      // the birds
      if (!roomy) return;
      const px = Math.round(W - margin * 0.7);
      if (wire[px] != null) sprite(PERCH, px - 2, wire[px] - 6, ink);
      sprite(HOVER, Math.round(margin / 2 - 6), horizon - 30, ink);
    }

    let resizeT;
    addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        const w = Math.ceil(innerWidth / (innerWidth < 720 ? 3 : 4));
        if (w !== W || Math.abs(innerHeight - canvas.clientHeight) > 120) build();
      }, 150);
    });

    return { build };
  })();

  setFlavor(flavor, false);
})();
