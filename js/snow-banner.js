/*!
 * Ravens Accessories: snow banner (index.html).
 * Falling snow + a light band and star glints on the earring that follow
 * scrolling (and the mouse on computers). Settings: config.js → banner.
 * Visitors with "reduce motion" switched on see the still photo.
 */
(() => {
  'use strict';

  const R = window.Ravens;
  if (!R) return;
  const { C, $, h, tpl, hasValue } = R;
  const B = C.banner || {};
  const section = $('#snow-banner');
  if (!section) return;
  if (B.show === false || !hasValue(B.image)) { section.hidden = true; return; }

  const frame = $('.snow-banner__frame', section);
  const stage = $('.snow-banner__stage', section);
  const img = $('.snow-banner__img', section);
  const shineLayer = $('.snow-banner__shine', section);
  const band = $('.snow-banner__band', section);
  const glintLayer = $('.snow-banner__glints', section);
  const canvas = $('.snow-banner__snow', section);

  /* ---------- Texts and photo from config ---------- */
  if (img.getAttribute('src') !== B.image) img.src = B.image;
  img.alt = B.alt || '';
  $('#snow-banner-title').textContent = tpl(B.title || '');
  const subtitle = R.mode === 'wishlist' ? B.subtitle : B.shopSubtitle;
  const subEl = $('#snow-banner-subtitle');
  const needsDate = /\{launchDate(Short)?\}/.test(subtitle || '');
  subEl.textContent = tpl(subtitle || '');
  subEl.hidden = !hasValue(subtitle) || (needsDate && !hasValue(R.vars.launchDate));

  /* ---------- Shine area + glints (positions in % of the photo) ---------- */
  const A = B.shineArea || { x: 50, y: 50, rx: 14, ry: 30 };
  stage.style.setProperty('--shine-x', `${A.x}%`);
  stage.style.setProperty('--shine-y', `${A.y}%`);
  stage.style.setProperty('--shine-rx', `${A.rx}%`);
  stage.style.setProperty('--shine-ry', `${A.ry}%`);
  const glints = (B.sparkles || []).filter((p) => Array.isArray(p) && p.length === 2).map(([x, y]) => {
    const el = h('span', { class: 'glint' });
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;
    glintLayer.append(el);
    return { el, x: x / 100, last: 0 };
  });

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const reduce = R.reducedMotion.matches;

  /* ---------- Snow ---------- */
  const ctx = canvas.getContext('2d');
  let cw = 0;
  let ch = 0;
  let flakes = [];
  // One soft snowflake, drawn once and reused: white core + faint grey rim so it also shows on white snow
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  {
    const s = sprite.getContext('2d');
    const g = s.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.7, 'rgba(120,135,160,0.22)');
    g.addColorStop(1, 'rgba(120,135,160,0)');
    s.fillStyle = g;
    s.fillRect(0, 0, 64, 64);
  }
  const newFlake = (anywhere) => {
    const z = Math.random(); // 0 = far away (small, slow) … 1 = close (big, fast)
    return {
      x: Math.random() * cw,
      y: anywhere ? Math.random() * ch : -8 - Math.random() * 20,
      r: 0.9 + z * 2.8,
      vy: 0.28 + z * 0.95,
      vx: (Math.random() - 0.5) * 0.25,
      phase: Math.random() * Math.PI * 2,
      sway: 0.25 + Math.random() * 0.7,
      a: 0.5 + z * 0.45
    };
  };
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cw = frame.clientWidth;
    ch = frame.clientHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = B.snow === false ? 0 : clamp(Math.round((cw * ch) / 4200), 24, 140);
    while (flakes.length < n) flakes.push(newFlake(true));
    flakes.length = n;
  }
  function drawSnow(dt, scrollDy) {
    ctx.clearRect(0, 0, cw, ch);
    for (const f of flakes) {
      if (dt) {
        f.phase += 0.012 * dt;
        // falling + drifting; scrolling pushes the flakes a little (closer flakes more)
        f.y += f.vy * dt - scrollDy * (0.12 + f.r * 0.05);
        f.x += (f.vx + Math.sin(f.phase) * f.sway * 0.35) * dt;
        if (f.y > ch + 10) Object.assign(f, newFlake(false));
        if (f.y < -40) f.y = ch + 5;
        if (f.x < -10) f.x = cw + 10;
        if (f.x > cw + 10) f.x = -10;
      }
      const d = f.r * 4;
      ctx.globalAlpha = f.a;
      ctx.drawImage(sprite, f.x - d / 2, f.y - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
  }

  resize();
  if (reduce) {
    // Still photo: a few still flakes, no light band, no twinkles
    shineLayer.hidden = true;
    drawSnow(0, 0);
    new ResizeObserver(() => { resize(); drawSnow(0, 0); }).observe(frame);
    return;
  }

  /* ---------- Light band + glints ---------- */
  // f = horizontal position of the light on the photo (0 = left edge, 1 = right edge)
  const restStart = 0.38;                    // where the light rests at the top of the page
  const restTravel = 0.32;                   // how far it travels while you scroll past the banner
  let fTarget = restStart;
  let fNow = 0.3;                            // starts a bit to the left: a small sweep on page load
  let pointerOn = false;
  let stageW = stage.clientWidth;
  let lastGlow = -1;

  const twinkle = (g, strength = 1) => {
    const now = performance.now();
    if (now - g.last < 650) return;
    g.last = now;
    const s = 0.55 + Math.random() * 0.55 * strength;
    g.el.animate([
      { opacity: 0, transform: 'translate(-50%, -50%) scale(0.2) rotate(0deg)' },
      { opacity: 1, transform: `translate(-50%, -50%) scale(${s}) rotate(25deg)`, offset: 0.35 },
      { opacity: 0, transform: `translate(-50%, -50%) scale(${s * 0.35}) rotate(55deg)` }
    ], { duration: 650 + Math.random() * 400, easing: 'ease-out' });
  };
  const twinkleNear = (pos, spread, strength) => {
    const near = glints.filter((g) => Math.abs(g.x - pos) < spread);
    const pool = near.length ? near : glints;
    if (pool.length) twinkle(pool[Math.floor(Math.random() * pool.length)], strength);
  };

  const scrollPos = () => {
    const rect = section.getBoundingClientRect();
    const bottom = rect.top + window.scrollY + rect.height;
    return clamp(window.scrollY / Math.max(200, bottom - 40), 0, 1);
  };

  let lastScrollY = window.scrollY;
  let scrollDy = 0;
  let scrollTravel = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const dy = y - lastScrollY;
    lastScrollY = y;
    scrollDy += dy;
    scrollTravel += Math.abs(dy);
    if (!pointerOn) fTarget = restStart + restTravel * scrollPos();
  }, { passive: true });

  // Computers: the light follows the mouse over the banner
  let pointerTravel = 0;
  let lastPX = null;
  frame.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    pointerOn = true;
    fTarget = clamp((e.clientX - r.left) / r.width, 0.2, 0.8);
    if (lastPX != null) pointerTravel += Math.abs(e.clientX - lastPX);
    lastPX = e.clientX;
  });
  frame.addEventListener('pointerleave', () => {
    pointerOn = false;
    lastPX = null;
    fTarget = restStart + restTravel * scrollPos();
  });

  /* ---------- One animation loop, only while the banner is on screen ---------- */
  let running = false;
  let visible = true;
  let last = 0;
  let nextIdle = performance.now() + 1200;

  function frameStep(now) {
    if (!running) return;
    const dt = last ? clamp((now - last) / 16.67, 0, 3) : 1;
    last = now;

    // light band: ease towards its target
    fNow += (fTarget - fNow) * Math.min(1, 0.12 * dt);
    const bw = band.offsetWidth;
    band.style.transform = `translate3d(${(fNow * stageW - bw / 2).toFixed(1)}px, 0, 0) rotate(18deg)`;
    // the earring brightens slightly while the light is on it
    const glow = clamp(1 - Math.abs(fNow - A.x / 100) / (A.rx / 100), 0, 1);
    if (Math.abs(glow - lastGlow) > 0.004) { stage.style.setProperty('--glow', glow.toFixed(3)); lastGlow = glow; }

    // glints: stones flash when the light passes over them…
    for (const g of glints) if (Math.abs(g.x - fNow) < 0.018) twinkle(g, 1);
    // …more sparkle while you scroll or move the mouse…
    while (scrollTravel > 70) { scrollTravel -= 70; twinkleNear(fNow, 0.12, 1.2); }
    while (pointerTravel > 60) { pointerTravel -= 60; twinkleNear(fNow, 0.08, 1); }
    // …and a gentle twinkle now and then when nothing moves
    if (now > nextIdle) { twinkleNear(fNow, 0.5, 0.7); nextIdle = now + 1400 + Math.random() * 2200; }

    drawSnow(dt, scrollDy);
    scrollDy = 0;
    requestAnimationFrame(frameStep);
  }
  const start = () => {
    if (running || !visible || document.hidden) return;
    running = true;
    last = 0;
    requestAnimationFrame(frameStep);
  };
  const stop = () => { running = false; };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start(); else stop();
  }).observe(section);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
  new ResizeObserver(() => { resize(); stageW = stage.clientWidth; }).observe(frame);

  fTarget = restStart + restTravel * scrollPos();
  start();
})();
