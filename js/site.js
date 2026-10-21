/*!
 * Ravens Accessories: shared script (runs on every page).
 * You should not need to edit this file: all content lives in /config.js.
 */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const C = window.RAVENS_CONFIG;
  if (!C || typeof C !== 'object') {
    const box = document.createElement('div');
    box.className = 'config-error';
    box.setAttribute('role', 'alert');
    box.textContent = 'config.js could not be loaded. This usually means a typo in config.js (for example a missing comma or quote). Press F12 and open the Console to see the exact line.';
    document.body.prepend(box);
    return;
  }

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const isTodo = (v) => typeof v === 'string' && v.includes('TODO_');
  const hasValue = (v) => v != null && String(v).trim() !== '';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /** Create an element: h('a', { class: 'x', href: '#' }, 'text', childNode) */
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const c of children.flat(Infinity)) {
      if (c == null || c === false) continue;
      el.append(c instanceof Node ? c : String(c));
    }
    return el;
  }

  /* Labels with built-in fallbacks (so deleting a label never breaks the page) */
  const DEFAULT_LABELS = {
    buyNow: 'Buy now', soldOut: 'Sold out', price: 'Price:', salePrice: 'Sale price:', regularPrice: 'Regular price:',
    secureCheckout: 'Secure checkout with Stripe',
    checkoutNotReady: "Checkout isn't set up yet. Add the Stripe Payment Link for this option in config.js.",
    enlarge: 'Enlarge photo', showPhoto: 'Show photo {n}', tapToEnlarge: 'Tap to enlarge',
    nav: { story: 'Story', details: 'Details', reviews: 'Reviews', faq: 'FAQ' },
    countdown: { days: 'Days', hours: 'Hours', mins: 'Mins', secs: 'Secs' },
    timeLeft: { day: 'DAY', days: 'DAYS', hour: 'HOUR', hours: 'HOURS', minute: 'MINUTE', minutes: 'MINUTES' },
    trustTitle: 'Why shop with us', detailsTitle: 'Details', detailsSubtitle: '',
    details: { material: 'Material', stone: 'Stone', dimensions: 'Dimensions', weight: 'Weight', care: 'Care', allergy: 'Allergy note' },
    safetyTitle: 'Product safety information',
    safety: { manufacturer: 'Manufacturer', euResponsible: 'EU responsible person', identifier: 'Product identifier', warnings: 'Warnings' },
    reviewsTitle: 'Customer reviews', reviewCountOne: '1 review', reviewCountMany: '{count} reviews', basedOn: 'Based on {count}',
    ratingAria: 'Rated {rating} out of 5', verified: 'Verified purchase', showMore: 'Show more reviews', reviewPhotoAlt: 'Photo from {name}',
    faqTitle: 'Frequently asked questions', stickyBuy: 'Buy now', backToShop: 'Back to the shop'
  };
  const L = { ...DEFAULT_LABELS, ...(C.labels || {}) };
  for (const k of ['nav', 'countdown', 'timeLeft', 'details', 'safety']) L[k] = { ...DEFAULT_LABELS[k], ...((C.labels || {})[k] || {}) };

  /* Number, price and date formatting */
  const locale = get(C, 'site.locale') || 'en-IE';
  const currency = get(C, 'price.currency') || 'EUR';
  let priceFormat;
  try { priceFormat = new Intl.NumberFormat(locale, { style: 'currency', currency }); }
  catch (e) {
    console.warn('[Ravens] Invalid site.locale or price.currency in config.js. Falling back to en-IE / EUR.');
    priceFormat = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });
  }
  const fmtPrice = (n) => priceFormat.format(Number(n) || 0);
  const fmtNum = (n, digits = 1) => new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
  const fmtDate = (iso) => {
    const d = new Date(`${iso}T12:00:00`);
    return Number.isNaN(d.getTime()) ? String(iso || '') : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  };

  /* ------------------------------------------------------------------
     Site mode: "wishlist" (coming-soon page + sign-up) or "shop" (full store).
     Anything other than "wishlist" falls back to the shop.
     ------------------------------------------------------------------ */
  const MODE = C.mode === 'wishlist' ? 'wishlist' : 'shop';
  const W = C.wishlist || {};
  root.dataset.mode = MODE;

  /* ------------------------------------------------------------------
     Countdown targets: ONE fixed moment from config, identical for everyone
       shop:     sale.endsAt  (sale price until then)
       wishlist: wishlist.launchAt  (launch countdown)
     ------------------------------------------------------------------ */
  const regular = Number(get(C, 'price.regular'));
  const salePrice = Number(get(C, 'price.sale'));
  const saleEnd = Date.parse(get(C, 'sale.endsAt'));
  const saleEnabled = get(C, 'sale.enabled') === true;
  const salePricesOk = salePrice > 0 && salePrice < regular;
  if (MODE === 'shop' && saleEnabled && !Number.isFinite(saleEnd)) console.warn('[Ravens] sale.endsAt is not a valid date, so the sale is switched off. Use e.g. "2026-10-24T23:59:59+02:00".');
  if (MODE === 'shop' && saleEnabled && !salePricesOk) console.warn('[Ravens] price.sale must be lower than price.regular, so the sale is switched off.');

  const launchAt = Date.parse(W.launchAt);
  if (MODE === 'wishlist' && hasValue(W.launchAt) && !Number.isFinite(launchAt)) console.warn('[Ravens] wishlist.launchAt is not a valid date, so the launch countdown is switched off. Use e.g. "2026-11-20T20:00:00+01:00".');

  // The sale only ever applies in shop mode
  const isSaleActive = (now = Date.now()) => MODE === 'shop' && saleEnabled && salePricesOk && Number.isFinite(saleEnd) && now < saleEnd;
  const isLaunchPending = (now = Date.now()) => MODE === 'wishlist' && Number.isFinite(launchAt) && now < launchAt;
  const countdownEnd = MODE === 'shop' ? saleEnd : launchAt;
  const countdownRunning = () => (MODE === 'shop' ? isSaleActive() : isLaunchPending());
  // Rounded DOWN so the badge never overstates the discount
  const discountPct = () => (salePricesOk ? Math.floor((1 - salePrice / regular) * 100 + 1e-6) : 0);
  const currentPrice = () => (isSaleActive() ? salePrice : regular);

  function timeLeftText(ms = countdownEnd - Date.now()) {
    const T = L.timeLeft;
    const days = Math.floor(ms / 864e5);
    const hours = Math.floor(ms / 36e5);
    const mins = Math.max(1, Math.floor(ms / 6e4));
    if (days >= 1) return `${days} ${days === 1 ? T.day : T.days}`;
    if (hours >= 1) return `${hours} ${hours === 1 ? T.hour : T.hours}`;
    return `${mins} ${mins === 1 ? T.minute : T.minutes}`;
  }

  /* Tiny event bus: 'tick' (every second while a countdown runs), 'countdownend' (both modes)
     and 'saleend' (shop mode only) */
  const listeners = {};
  const on = (evt, fn) => { (listeners[evt] = listeners[evt] || []).push(fn); };
  const emit = (evt, data) => (listeners[evt] || []).forEach((fn) => fn(data));

  /* ------------------------------------------------------------------
     Template values: {token} → value. Used in texts throughout config.js
     ------------------------------------------------------------------ */
  const co = C.company || {};
  const P = C.product || {};
  const addressParts = [co.street, [co.postalCode, co.city].filter(hasValue).join(' '), co.country].filter(hasValue);
  const vars = {
    brand: get(C, 'brand.name') || '',
    tagline: get(C, 'brand.tagline') || '',
    productName: P.name || '',
    sku: P.sku || '',
    companyName: co.legalName || '',
    legalForm: co.legalForm || '',
    street: co.street || '',
    postalCode: co.postalCode || '',
    city: co.city || '',
    country: co.country || '',
    address: addressParts.join(', '),
    enterpriseNumber: co.enterpriseNumber || '',
    vatNumber: co.vatNumber || '',
    registerCourt: co.registerCourt || '',
    email: co.email || '',
    phone: co.phone || '',
    responseTime: co.responseTime || '',
    hostingProvider: co.hostingProvider || '',
    emailProvider: co.emailProvider || '',
    orderRetention: get(C, 'legal.orderRetention') || '',
    website: (get(C, 'site.url') || '').replace(/\/+$/, ''),
    withdrawalDays: get(C, 'returns.withdrawalDays') || 14,
    refundDays: get(C, 'returns.refundDays') || 14,
    returnAddress: get(C, 'returns.returnAddress') || addressParts.join(', '),
    returnCostText: get(C, 'returns.returnCostText') || '',
    shipsFrom: get(C, 'shipping.shipsFrom') || '',
    processingTime: get(C, 'shipping.processingTime') || '',
    deliverySummary: get(C, 'shipping.deliverySummary') || '',
    carrier: get(C, 'shipping.carrier') || '',
    customsNote: get(C, 'shipping.customsNote') || '',
    material: get(C, 'product.details.material') || '',
    allergyNote: get(C, 'product.details.allergyNote') || '',
    regularPrice: fmtPrice(regular),
    salePrice: fmtPrice(salePrice),
    launchDate: Number.isFinite(launchAt) ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(launchAt) : '',
    launchDateShort: Number.isFinite(launchAt) ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(launchAt) : '',
    wishlistDiscount: Number(get(C, 'wishlist.offer.discount')) > 0 ? `${Number(get(C, 'wishlist.offer.discount'))}%` : '',
    offerTerms: get(C, 'wishlist.offer.terms') || '',
    year: String(new Date().getFullYear()),
    lastUpdated: get(C, 'legal.lastUpdated') || ''
  };
  Object.defineProperties(vars, {
    discount: { get: () => `${discountPct()}%`, enumerable: true },
    timeLeft: { get: () => timeLeftText(), enumerable: true },
    price: { get: () => fmtPrice(currentPrice()), enumerable: true }
  });

  /** Replace {tokens} in a string (plain text). */
  const tpl = (str, extra = {}) =>
    String(str == null ? '' : str).replace(/\{(\w+)\}/g, (m, key) => {
      const v = key in extra ? extra[key] : vars[key];
      return v == null ? m : String(v);
    });

  const safeHref = (url) => (/^(https?:|mailto:|tel:|#|\/|\.{0,2}\/|[\w-]+\.html)/i.test(url) && !/^javascript:/i.test(url) ? url : '#');

  /** Like tpl(), but returns DOM nodes: {email} becomes a mailto link, [text](url) a link. */
  function rich(str, extra = {}) {
    const frag = document.createDocumentFragment();
    const s = String(str == null ? '' : str);
    const re = /\[([^\]]+)\]\(([^)\s]+)\)|\{email\}/g;
    let last = 0;
    let m;
    // Only the TODO_ placeholder itself gets the yellow highlight, not the whole sentence
    const addText = (t) => {
      if (!t) return;
      tpl(t, extra).split(/(TODO_[A-Z0-9_]+)/).forEach((part) => {
        if (part) frag.append(isTodo(part) ? h('span', { class: 'is-todo' }, part) : part);
      });
    };
    while ((m = re.exec(s))) {
      addText(s.slice(last, m.index));
      if (m[1]) frag.append(h('a', { href: safeHref(m[2]) }, tpl(m[1], extra)));
      else frag.append(emailLink());
      last = re.lastIndex;
    }
    addText(s.slice(last));
    return frag;
  }

  function emailLink() {
    const e = vars.email;
    return isTodo(e) || !hasValue(e) ? h('span', { class: 'is-todo' }, e || 'TODO_SUPPORT_EMAIL') : h('a', { href: `mailto:${e}` }, e);
  }

  /* ------------------------------------------------------------------
     Icons (inline SVG, stroke = currentColor)
     ------------------------------------------------------------------ */
  const ICONS = {
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    truck: '<path d="M2 6.5h12v9.5H2zM14 9.5h4l3 3.2V16h-7z"/><circle cx="6" cy="17.5" r="1.9"/><circle cx="17" cy="17.5" r="1.9"/>',
    return: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    gem: '<path d="M6.5 3.5h11L21.5 9 12 20.5 2.5 9z"/><path d="M2.5 9h19M12 20.5 8.5 9l3.5-5.5L15.5 9z"/>',
    feather: '<path d="M20 4.2c-4.8-1-10.4 1.3-12.8 6.4L5 15.8V19h3.2l5-2.2c5.1-2.4 7.4-8 6.8-12.6z"/><path d="M16.5 7.5 3 21M8.5 15h6"/>',
    shield: '<path d="M12 3 4.5 6v6c0 4.6 3.2 7.9 7.5 9 4.3-1.1 7.5-4.4 7.5-9V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    sparkle: '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="m19 15 .7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8S10.7 3.5 8.2 3.5a2.25 2.25 0 0 0 0 4.5M12 8s1.3-4.5 3.8-4.5a2.25 2.25 0 0 1 0 4.5"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"/>',
    heart: '<path d="M12 20.5s-7.5-4.6-9.2-9.4A4.7 4.7 0 0 1 12 7.6a4.7 4.7 0 0 1 9.2 3.5c-1.7 4.8-9.2 9.4-9.2 9.4z"/>',
    check: '<path d="m4.5 12.5 4.8 4.8L19.5 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    'chevron-left': '<path d="m15 5-7 7 7 7"/>',
    'chevron-right': '<path d="m9 5 7 7-7 7"/>',
    'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    zoom: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5"/>'
  };
  const STAR = '<path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/>';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function svg(inner, size, filled) {
    const el = document.createElementNS(SVG_NS, 'svg');
    el.setAttribute('viewBox', '0 0 24 24');
    if (size) { el.setAttribute('width', size); el.setAttribute('height', size); }
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('focusable', 'false');
    el.setAttribute('class', 'icon');
    if (filled) el.setAttribute('fill', 'currentColor');
    else {
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke', 'currentColor');
      el.setAttribute('stroke-width', '1.6');
      el.setAttribute('stroke-linecap', 'round');
      el.setAttribute('stroke-linejoin', 'round');
    }
    el.innerHTML = inner;
    return el;
  }
  const icon = (name, size = 22) => svg(ICONS[name] || ICONS.sparkle, size, false);

  /** Star rating (supports fractions, e.g. 4.6). Rendered as one image for screen readers. */
  function stars(rating) {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    const row = (cls) => h('span', { class: `stars__row ${cls}` }, Array.from({ length: 5 }, () => svg(STAR, null, true)));
    const fill = row('stars__row--fill');
    fill.style.width = `${(r / 5) * 100}%`;
    return h('span', { class: 'stars', role: 'img', 'aria-label': tpl(L.ratingAria, { rating: Number.isInteger(r) ? r : fmtNum(r) }) }, row('stars__row--empty'), fill);
  }

  /* ------------------------------------------------------------------
     Bind config values into static HTML
       data-cfg="path.in.config"  → text from config.js (tokens filled)
       data-var="email"           → computed value (see vars above)
       data-mailto                → turns an <a data-var="email"> into a mailto link
       data-if="phone"            → element hidden when that value is empty
     ------------------------------------------------------------------ */
  function setText(el, value) {
    el.textContent = value;
    el.classList.toggle('is-todo', isTodo(value));
  }
  function applyBindings(scope = document) {
    $$('[data-cfg]', scope).forEach((el) => {
      const v = get(C, el.dataset.cfg);
      if (typeof v === 'string' || typeof v === 'number') setText(el, tpl(v));
    });
    $$('[data-label]', scope).forEach((el) => {
      const v = get(L, el.dataset.label);
      if (typeof v === 'string') el.textContent = tpl(v);
    });
    $$('[data-var]', scope).forEach((el) => {
      const v = vars[el.dataset.var];
      if (hasValue(v)) setText(el, String(v));
      if (el.hasAttribute('data-mailto') && hasValue(v) && !isTodo(v)) el.setAttribute('href', `mailto:${v}`);
    });
    $$('[data-if]', scope).forEach((el) => { el.hidden = !hasValue(vars[el.dataset.if]); });
    $$('[data-rich]', scope).forEach((el) => {
      const v = get(C, el.dataset.rich);
      if (hasValue(v)) el.replaceChildren(rich(v));
    });
    $$('img[data-logo]').forEach((img) => {
      const src = get(C, 'brand.logo');
      if (hasValue(src) && img.getAttribute('src') !== src) img.src = src;
    });
    // Elements that belong to one mode only: <div data-mode="shop" hidden> / <div data-mode="wishlist" hidden>
    $$('[data-mode]', scope).forEach((el) => { el.hidden = el.dataset.mode !== MODE; });
    // The footer's payment note is about Stripe; wishlist mode has its own (or none)
    if (MODE === 'wishlist' && 'footerNote' in W) {
      $$('[data-cfg="footer.note"]', scope).forEach((el) => { setText(el, tpl(W.footerNote || '')); el.hidden = !hasValue(W.footerNote); });
    }
  }

  /* Lists rendered from config: shipping table (shipping page), next steps (thank-you page) */
  function renderLists() {
    const rows = (get(C, 'shipping.deliveryTimes') || []).filter((r) => r && hasValue(r.region));
    $$('[data-render="delivery-times"]').forEach((tbody) => {
      tbody.replaceChildren(...rows.map((r) => h('tr', null, h('td', null, r.region), h('td', null, r.time || ''))));
    });
    const steps = (get(C, 'success.steps') || []).filter(hasValue);
    $$('[data-render="success-steps"]').forEach((ul) => {
      ul.replaceChildren(...steps.map((s) => h('li', null, icon('check', 18), h('span', null, rich(s)))));
      ul.hidden = !steps.length;
    });
  }

  /* ------------------------------------------------------------------
     <head>: title, description, Open Graph, Twitter (home page only)
     ------------------------------------------------------------------ */
  function setMeta(attr, key, value) {
    if (!hasValue(value)) return;
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) { el = h('meta', { [attr]: key }); document.head.append(el); }
    el.setAttribute('content', value);
  }
  function applyMeta() {
    const S = C.site || {};
    const page = document.body.dataset.page;
    const brand = vars.brand;
    if (hasValue(S.themeColor)) setMeta('name', 'theme-color', S.themeColor);
    if (page !== 'home') {
      const t = document.body.dataset.title;
      if (t) document.title = brand ? `${t} | ${brand}` : t;
      return;
    }
    const base = vars.website;
    const abs = (p) => (/^https?:\/\//i.test(p) ? p : `${base}/${String(p).replace(/^\/+/, '')}`);
    const seo = MODE === 'wishlist' ? (W.seo || {}) : {};
    const title = tpl(seo.title || S.title || brand);
    const desc = tpl(seo.description || S.description || '');
    document.title = title;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:site_name', brand);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', `${base}/`);
    if (hasValue(S.ogImage)) setMeta('property', 'og:image', abs(S.ogImage));
    setMeta('property', 'og:image:alt', S.ogImageAlt);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', desc);
    if (hasValue(S.ogImage)) setMeta('name', 'twitter:image', abs(S.ogImage));
    setMeta('name', 'twitter:image:alt', S.ogImageAlt);
    setMeta('name', 'twitter:site', S.twitterHandle);
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical && base) canonical.href = `${base}/`;
    if (hasValue(S.language)) root.lang = S.language;
  }

  /* ------------------------------------------------------------------
     Countdown bar
       shop:     sale countdown; the bar disappears when the sale ends
       wishlist: launch countdown; afterwards (or without a date) the bar
                 shows the simple "coming soon" line instead
     ------------------------------------------------------------------ */
  function initCountdown() {
    const bar = $('#sale-bar');
    if (!bar) return;
    const timer = $('.countdown', bar);
    const title = $('.sale-bar__title', bar);
    const subtitle = $('.sale-bar__subtitle', bar);
    if (MODE === 'wishlist') {
      if (W.showBar === false) { bar.hidden = true; return; }
      setText(title, tpl(W.barTitle || ''));
      setText(subtitle, tpl(W.barSubtitle || ''));
    }
    const countdownOver = () => {
      if (MODE === 'shop') { bar.hidden = true; return; }
      bar.classList.add('sale-bar--simple');
      timer.hidden = true;
      subtitle.hidden = true;
      setText(title, tpl(W.barFallback || ''));
      bar.hidden = !hasValue(W.barFallback);
    };
    if (!countdownRunning()) { countdownOver(); return; }
    const cells = {};
    ['days', 'hours', 'mins', 'secs'].forEach((u) => { cells[u] = $(`[data-unit="${u}"]`, bar); });
    let lastLabel = '';
    const render = (ms) => {
      const s = Math.max(0, Math.floor(ms / 1000));
      const parts = { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), mins: Math.floor((s % 3600) / 60), secs: s % 60 };
      for (const k in parts) {
        const v = String(parts[k]).padStart(2, '0');
        if (cells[k] && cells[k].textContent !== v) cells[k].textContent = v;
      }
      // Screen readers get a calm, minute-level label instead of a live ticking region
      const label = `${parts.days} ${L.countdown.days}, ${parts.hours} ${L.countdown.hours}, ${parts.mins} ${L.countdown.mins}`;
      if (timer && label !== lastLabel) { timer.setAttribute('aria-label', label); lastLabel = label; }
    };
    render(countdownEnd - Date.now());
    bar.hidden = false;
    on('tick', render);
    on('countdownend', countdownOver);
  }

  /* ------------------------------------------------------------------
     Scrolling announcement marquee
     ------------------------------------------------------------------ */
  function initMarquee() {
    const wrap = $('#marquee');
    if (!wrap) return;
    const track = $('.marquee__track', wrap);
    const srList = $('.marquee__sr', wrap);
    let builtText = '';

    const currentItems = () =>
      ((MODE === 'wishlist' ? W.announcements : C.announcements) || [])
        .filter((a) => a && hasValue(a.text) && (!a.saleOnly || isSaleActive()) && (!a.beforeLaunch || isLaunchPending()))
        .map((a) => tpl(a.text));

    function build() {
      const items = currentItems();
      builtText = items.join('|');
      if (!items.length) { wrap.hidden = true; return; }
      wrap.hidden = false;
      if (srList) srList.replaceChildren(...items.map((t) => h('li', null, t)));
      const item = (t) => h('span', { class: 'marquee__item' }, t);
      const group = h('div', { class: 'marquee__group' }, items.map(item));
      track.replaceChildren(group);
      if (reducedMotion.matches) { wrap.classList.add('marquee--static'); return; }
      wrap.classList.remove('marquee--static');
      // Repeat the items until one group is wider than the bar, then clone it once:
      // animating the track by -50% then loops seamlessly.
      let guard = 0;
      while (group.scrollWidth < wrap.clientWidth && guard++ < 30) items.forEach((t) => group.append(item(t)));
      track.append(group.cloneNode(true));
      track.style.setProperty('--marquee-duration', `${Math.max(12, group.scrollWidth / 55)}s`);
    }

    build();
    let lastWidth = wrap.clientWidth;
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (wrap.clientWidth !== lastWidth) { lastWidth = wrap.clientWidth; build(); } }, 200);
    });
    reducedMotion.addEventListener?.('change', build);
    on('countdownend', build);
    // {timeLeft} changes once a day/hour; rebuild only when the text really changes
    on('tick', () => { if (currentItems().join('|') !== builtText) build(); });
  }

  /* ------------------------------------------------------------------
     One shared ticker, aligned to whole seconds, based on the real clock
     ------------------------------------------------------------------ */
  function startTicker() {
    if (!countdownRunning()) { root.classList.remove('sale-active'); return; }
    if (MODE === 'shop') root.classList.add('sale-active');
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      root.classList.remove('sale-active');
      emit('countdownend');
      if (MODE === 'shop') emit('saleend');
    };
    const tick = () => {
      if (finished) return;
      if (!countdownRunning()) { finish(); return; }
      emit('tick', countdownEnd - Date.now());
      setTimeout(tick, 1000 - (Date.now() % 1000) + 10);
    };
    tick();
    // Background tabs throttle timers: re-check immediately when the tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !countdownRunning()) finish();
    });
  }

  /* ------------------------------------------------------------------
     Subtle reveal-on-scroll
     ------------------------------------------------------------------ */
  function initReveal() {
    const els = $$('.reveal');
    if (!els.length || reducedMotion.matches || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    root.classList.add('reveal-ready');
    els.forEach((el) => io.observe(el));
  }

  /* Developer hint: how many TODO_ placeholders are left */
  function reportTodos() {
    const found = JSON.stringify(C).match(/TODO_[A-Z0-9_]+/g);
    if (found) console.info(`[Ravens] ${new Set(found).size} placeholder(s) left in config.js:`, [...new Set(found)].join(', '));
  }

  /* ------------------------------------------------------------------
     Public API for page scripts (product.js)
     ------------------------------------------------------------------ */
  window.Ravens = {
    C, L, $, $$, h, get, tpl, rich, icon, stars, emailLink, isTodo, hasValue,
    fmtPrice, fmtNum, fmtDate, vars, on, emit, reducedMotion,
    mode: MODE, W, isLaunchPending, launchAt,
    isSaleActive, discountPct, currentPrice, regular, salePrice, saleEnd
  };

  applyBindings();
  renderLists();
  applyMeta();
  initCountdown();
  initMarquee();

  // Page scripts (deferred, loaded after this file) register their listeners first
  document.addEventListener('DOMContentLoaded', () => {
    startTicker();
    initReveal();
    reportTodos();
  });
})();
