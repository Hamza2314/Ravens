/*!
 * Ravens Accessories: product page (index.html).
 * Everything shown here comes from /config.js.
 */
(() => {
  'use strict';

  const R = window.Ravens;
  if (!R) return;
  const { C, L, $, $$, h, tpl, rich, icon, stars, isTodo, hasValue, fmtPrice, fmtNum, fmtDate, on } = R;
  const root = document.documentElement;
  const WISHLIST = R.mode === 'wishlist';
  const W = R.W || {};

  const P = C.product || {};
  const images = (P.images || []).filter((im) => im && hasValue(im.src));
  const variants = (P.variants || []).filter((v) => v && hasValue(v.name));
  const reviews = (Array.isArray(C.reviews) ? C.reviews : [])
    .filter((r) => {
      const ok = r && hasValue(r.name) && hasValue(r.text) && Number(r.rating) >= 1 && Number(r.rating) <= 5;
      if (r && !ok) console.warn('[Ravens] Skipped a review in config.js. It needs a name, a text and a rating from 1 to 5:', r);
      return ok;
    })
    .map((r) => ({ ...r, rating: Math.round(Number(r.rating)) }))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const reviewCountText = (n) => (n === 1 ? L.reviewCountOne : tpl(L.reviewCountMany, { count: n }));

  let selected = Math.max(0, variants.findIndex((v) => !v.soldOut));
  let galleryGoTo = null;

  const setText = (sel, value) => {
    const el = typeof sel === 'string' ? $(sel) : sel;
    if (!el) return;
    el.textContent = value == null ? '' : String(value);
    el.classList.toggle('is-todo', isTodo(el.textContent));
  };

  /* ------------------------------------------------------------------
     Lightbox (native <dialog>: focus trap + Esc for free)
     ------------------------------------------------------------------ */
  const Lightbox = (() => {
    const dlg = $('#lightbox');
    if (!dlg || typeof dlg.showModal !== 'function') {
      return { open: (list, i) => window.open(list[i].src, '_blank', 'noopener') };
    }
    const img = $('.lightbox__img', dlg);
    const cap = $('.lightbox__caption', dlg);
    const counter = $('.lightbox__counter', dlg);
    const prev = $('.lightbox__nav--prev', dlg);
    const next = $('.lightbox__nav--next', dlg);
    let list = [];
    let idx = 0;
    let opener = null;

    function show(i) {
      idx = (i + list.length) % list.length;
      const it = list[idx];
      img.src = it.src;
      img.alt = it.alt || '';
      cap.textContent = it.caption || '';
      cap.hidden = !it.caption;
      counter.textContent = list.length > 1 ? `${idx + 1} / ${list.length}` : '';
      prev.hidden = next.hidden = list.length < 2;
    }
    function open(items, i = 0, from = null) {
      list = items;
      opener = from;
      show(i);
      dlg.showModal();
      root.classList.add('is-locked');
    }

    dlg.addEventListener('close', () => {
      root.classList.remove('is-locked');
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    });
    $('.lightbox__close', dlg).addEventListener('click', () => dlg.close());
    prev.addEventListener('click', () => show(idx - 1));
    next.addEventListener('click', () => show(idx + 1));
    dlg.addEventListener('keydown', (e) => {
      if (list.length < 2) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
    });

    // Swipe left/right; a tap on the dark area closes
    let startX = null;
    let swiped = false;
    dlg.addEventListener('pointerdown', (e) => { startX = e.clientX; swiped = false; });
    dlg.addEventListener('pointerup', (e) => {
      if (startX == null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50 && list.length > 1) { swiped = true; show(idx + (dx < 0 ? 1 : -1)); }
    });
    dlg.addEventListener('click', (e) => {
      if (swiped) { swiped = false; return; }
      if (e.target === dlg || e.target.classList.contains('lightbox__stage') || e.target.classList.contains('lightbox__figure')) dlg.close();
    });
    return { open };
  })();

  /* ------------------------------------------------------------------
     Gallery: native scroll-snap (smooth swipe on phones) + thumbnails
     ------------------------------------------------------------------ */
  function renderGallery() {
    const gallery = $('#gallery');
    if (!gallery) return;
    if (!images.length) { gallery.hidden = true; return; }

    const track = $('.gallery__track', gallery);
    const thumbs = $('.gallery__thumbs', gallery);
    const counter = $('.gallery__counter', gallery);
    const prev = $('.gallery__nav--prev', gallery);
    const next = $('.gallery__nav--next', gallery);
    const n = images.length;
    // Tapping a photo opens its "zoom" version when there is one (e.g. the main photo without room for highlights)
    const lightboxItems = images.map((im) => ({ src: hasValue(im.zoom) ? im.zoom : im.src, alt: im.alt }));
    const highlights = (P.photoHighlights || []).filter((x) => x && hasValue(x.text));

    images.forEach((im, i) => {
      track.append(
        h('div', { class: 'gallery__slide', role: 'group', 'aria-roledescription': 'slide', 'aria-label': `${i + 1} / ${n}` },
          h('button', { type: 'button', class: 'gallery__zoom', onclick: (e) => Lightbox.open(lightboxItems, i, e.currentTarget) },
            h('img', {
              src: im.src, alt: im.alt || '', width: 1200, height: 1200, draggable: 'false', decoding: 'async',
              loading: i === 0 ? 'eager' : 'lazy', fetchpriority: i === 0 ? 'high' : null
            }),
            h('span', { class: 'visually-hidden' }, ` (${L.enlarge})`)),
          // Highlights on the first photo: icon + short text, in a column on the left
          i === 0 && highlights.length
            ? h('ul', { class: 'photo-highlights', 'aria-label': 'Highlights' },
                highlights.map((x) => h('li', { class: 'photo-highlights__item' },
                  h('span', { class: 'photo-highlights__icon' }, icon(x.icon, 24)),
                  // keep numbers and units together on one line ("4.3 g", "16 mm")
                  h('span', { class: 'photo-highlights__text' }, tpl(x.text).replace(/(\d)\s+(mm|cm|g)\b/gi, '$1 $2')))))
            : null)
      );
      if (n > 1) {
        thumbs.append(
          h('button', { type: 'button', class: 'gallery__thumb', 'aria-label': tpl(L.showPhoto, { n: i + 1 }), onclick: () => goTo(i) },
            h('img', { src: im.src, alt: '', width: 96, height: 96, loading: 'lazy', decoding: 'async' }))
        );
      }
    });

    const hint = $('.gallery__hint', gallery);
    if (hint) hint.append(icon('zoom', 14), L.tapToEnlarge);
    prev.append(icon('chevron-left', 20));
    next.append(icon('chevron-right', 20));

    if (n < 2) {
      prev.hidden = next.hidden = counter.hidden = thumbs.hidden = true;
    }

    let current = -1;
    const behavior = () => (R.reducedMotion.matches ? 'auto' : 'smooth');

    function setActive(i) {
      if (i === current) return;
      current = i;
      $$('.gallery__thumb', thumbs).forEach((t, k) => t.setAttribute('aria-current', k === i ? 'true' : 'false'));
      counter.textContent = `${i + 1} / ${n}`;
      prev.disabled = i === 0;
      next.disabled = i === n - 1;
      const t = thumbs.children[i];
      if (t && thumbs.scrollWidth > thumbs.clientWidth) {
        thumbs.scrollTo({ left: t.offsetLeft - (thumbs.clientWidth - t.clientWidth) / 2, behavior: behavior() });
      }
    }
    // While an arrow/thumbnail slide is animating, remember where it is heading, so the
    // counter doesn't flicker and a quick second click always counts from the right photo.
    let heading = null;
    let settle = 0;
    const indexNow = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    const from = () => (heading != null ? heading : current);

    function goTo(i) {
      const target = Math.max(0, Math.min(n - 1, i));
      heading = target;
      track.scrollTo({ left: target * track.clientWidth, behavior: behavior() });
      setActive(target);
    }

    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      // Swiping by hand: follow the finger live. Arrow-triggered slide: wait for it to land.
      if (heading == null) raf = requestAnimationFrame(() => setActive(indexNow()));
      clearTimeout(settle);
      settle = setTimeout(() => {
        // Only "land" once the slide has really arrived (the browser can pause briefly mid-slide)
        if (heading != null && Math.abs(track.scrollLeft - heading * track.clientWidth) > 2) return;
        heading = null;
        setActive(indexNow());
      }, 160);
    }, { passive: true });
    // The visitor takes over (finger, trackpad, mouse wheel): follow them live again
    ['pointerdown', 'touchstart', 'wheel'].forEach((evt) => track.addEventListener(evt, () => { heading = null; }, { passive: true }));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(from() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(from() - 1); }
    });
    prev.addEventListener('click', () => goTo(from() - 1));
    next.addEventListener('click', () => goTo(from() + 1));
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => { track.scrollLeft = current * track.clientWidth; }).observe(track);
    }

    setActive(0);
    galleryGoTo = goTo;
  }

  /* ------------------------------------------------------------------
     Price (sale price + crossed-out regular price only while the sale runs)
     ------------------------------------------------------------------ */
  function renderPrice() {
    const sale = R.isSaleActive();
    setText('#price-current-label', sale ? L.salePrice : L.price);
    setText('#price-current', fmtPrice(R.currentPrice()));
    setText('#price-regular-label', L.regularPrice);
    setText('#price-regular-value', fmtPrice(R.regular));
    $('#price-regular').hidden = !sale;
    const badge = $('#price-badge');
    badge.hidden = !sale;
    badge.textContent = `-${R.discountPct()}%`;

    const ref = $('#price-reference');
    const refText = C.price && C.price.referenceNote;
    ref.hidden = !(sale && hasValue(refText));
    if (!ref.hidden) ref.textContent = tpl(refText);

    const note = $('#price-note');
    note.textContent = tpl((C.price && C.price.taxNote) || '');
    note.hidden = !note.textContent;

    setText('#sticky-price', fmtPrice(R.currentPrice()));
    const stickyRegular = $('#sticky-regular');
    stickyRegular.hidden = !sale;
    stickyRegular.textContent = fmtPrice(R.regular);
  }

  /* ------------------------------------------------------------------
     Variants + Buy buttons (Stripe Payment Links)
     ------------------------------------------------------------------ */
  const isValidLink = (s) => typeof s === 'string' && /^https:\/\/\S+$/.test(s.trim()) && !isTodo(s);

  function checkoutLink(v) {
    if (!v) return { url: null, field: '' };
    const key = R.isSaleActive() ? 'stripeLinkSale' : 'stripeLinkRegular';
    return { url: isValidLink(v[key]) ? v[key].trim() : null, field: key };
  }

  function renderVariants() {
    const fieldset = $('#variants');
    const options = $('.variants__options', fieldset);
    setText('#variant-label', P.variantLabel || 'Option');
    variants.forEach((v, i) => {
      const input = h('input', {
        type: 'radio', name: 'variant', class: 'variant__input', value: v.id || String(i),
        checked: i === selected, disabled: !!v.soldOut,
        onchange: () => { selected = i; updateVariant(true); }
      });
      options.append(
        h('label', { class: 'variant' }, input,
          h('span', { class: `variant__pill${isTodo(v.name) ? ' is-todo' : ''}` }, v.name,
            v.soldOut ? h('span', { class: 'visually-hidden' }, ` (${L.soldOut})`) : null))
      );
    });
    fieldset.hidden = variants.length < 2;
    updateVariant(false);
  }

  function updateVariant(fromUser) {
    const v = variants[selected];
    setText('#variant-name', v ? v.name : '');
    setText('#sticky-name', [P.name, variants.length > 1 && v ? v.name : null].filter(Boolean).join(' · '));
    if (fromUser && v && Number.isInteger(v.image) && galleryGoTo) galleryGoTo(v.image);
    $('#buy-msg').textContent = '';
    updateBuy();
  }

  function updateBuy() {
    const v = variants[selected];
    const soldOut = !v || !!v.soldOut;
    const { url } = checkoutLink(v);
    ['#buy-button', '#sticky-buy-button'].forEach((sel) => {
      const btn = $(sel);
      if (!btn) return;
      $('.btn__label', btn).textContent = soldOut ? L.soldOut : sel === '#buy-button' ? L.buyNow : L.stickyBuy;
      btn.setAttribute('href', url && !soldOut ? url : '#product');
      if (soldOut) btn.setAttribute('aria-disabled', 'true');
      else btn.removeAttribute('aria-disabled');
    });
  }

  function onBuyClick(e) {
    const v = variants[selected];
    if (!v || v.soldOut) { e.preventDefault(); return; }
    const { url, field } = checkoutLink(v);
    if (url) return; // normal navigation to Stripe Checkout
    e.preventDefault();
    const msg = $('#buy-msg');
    msg.textContent = L.checkoutNotReady;
    console.warn(`[Ravens] Missing Stripe Payment Link: product.variants[${selected}].${field} in config.js`);
    if (e.currentTarget.id === 'sticky-buy-button') $('#buy-button').scrollIntoView({ block: 'center', behavior: R.reducedMotion.matches ? 'auto' : 'smooth' });
  }

  /* ------------------------------------------------------------------
     Small blocks
     ------------------------------------------------------------------ */
  function renderHeader() {
    setText('#product-eyebrow', R.vars.brand);
    setText('#product-title', P.name);
    const short = $('#product-short');
    if (hasValue(P.shortDescription)) short.replaceChildren(rich(P.shortDescription));
    else short.hidden = true;
    const secure = $('#secure-note');
    secure.prepend(icon('lock', 15));
    setText($('span', secure), L.secureCheckout);
  }

  function renderRatingSummary() {
    const el = $('#rating-summary');
    if (!el || !reviews.length) return; // stays hidden: no reviews → no rating
    el.replaceChildren(stars(avgRating), h('span', null, `${fmtNum(avgRating)} · ${reviewCountText(reviews.length)}`));
    el.hidden = false;
  }

  function renderTrust() {
    const list = $('#trust-list');
    const items = ((WISHLIST ? W.trust : C.trust) || []).filter((t) => t && hasValue(t.title) && !R.needsMissingEmail(t));
    if (!items.length) { $('#trust').hidden = true; return; }
    list.style.setProperty('--cols', String(Math.min(items.length, 5)));
    list.replaceChildren(...items.map((t) =>
      h('li', { class: 'trust__item' },
        h('span', { class: 'trust__icon' }, icon(t.icon, 20)),
        h('div', null,
          h('p', { class: 'trust__title' }, rich(t.title)),
          hasValue(t.text) ? h('p', { class: 'trust__text' }, rich(t.text)) : null))
    ));
  }

  function renderStory() {
    const s = P.story || {};
    const feats = (P.features || []).filter((f) => f && hasValue(f.title));
    const paragraphs = (s.paragraphs || []).filter(hasValue);
    if (!hasValue(s.title) && !paragraphs.length && !feats.length) { $('#story').hidden = true; return; }
    setText('#story-eyebrow', s.eyebrow);
    setText('#story-title', s.title);
    const storyNodes = paragraphs.map((p) => h('p', null, rich(p)));
    if (hasValue(s.closing)) storyNodes.push(h('p', { class: 'story__closing' }, rich(s.closing)));
    $('#story-body').replaceChildren(...storyNodes);
    $('#features').replaceChildren(...feats.map((f) =>
      h('li', { class: 'feature reveal' },
        h('span', { class: 'feature__icon' }, icon(f.icon, 24)),
        h('h3', { class: 'feature__title' }, tpl(f.title)),
        hasValue(f.text) ? h('p', { class: 'feature__text' }, rich(f.text)) : null)
    ));
  }

  function renderLifestyle() {
    const ls = P.lifestyle || {};
    const photos = (ls.photos || []).filter((p) => p && hasValue(p.src));
    if (!photos.length) { $('#lifestyle').hidden = true; return; }
    setText('#lifestyle-title', ls.title);
    const sub = $('#lifestyle-subtitle');
    if (hasValue(ls.subtitle)) setText(sub, ls.subtitle); else sub.hidden = true;
    // Photos only, in ONE row that scrolls sideways (swipe on phones, arrows on desktop).
    // Tapping a photo still opens it large.
    const items = photos.map((p) => ({ src: p.src, alt: p.alt }));
    const track = $('#lifestyle-grid');
    track.replaceChildren(...photos.map((p, i) =>
      h('li', { class: 'rail__item' },
        h('button', { type: 'button', class: 'lifestyle__btn', onclick: (e) => Lightbox.open(items, i, e.currentTarget) },
          h('img', { src: p.src, alt: p.alt || '', width: 1200, height: 1500, loading: 'lazy', decoding: 'async', draggable: 'false' }),
          h('span', { class: 'visually-hidden' }, ` (${L.enlarge})`)))
    ));

    const rail = $('#lifestyle-rail');
    const prev = $('.rail__btn--prev', rail);
    const next = $('.rail__btn--next', rail);
    prev.append(icon('chevron-left', 20));
    next.append(icon('chevron-right', 20));
    // One step = one photo + the gap between photos
    const step = () => {
      const first = track.children[0];
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first ? first.getBoundingClientRect().width + gap : track.clientWidth;
    };
    const behavior = () => (R.reducedMotion.matches ? 'auto' : 'smooth');
    // Quick double clicks should move two photos: step from where the scroll is heading,
    // not from where it is mid-animation.
    let target = null;
    let settle = 0;
    const go = (dir) => {
      const s = step();
      const max = track.scrollWidth - track.clientWidth;
      const from = target != null ? target : track.scrollLeft;
      target = Math.max(0, Math.min(max, Math.round(from / s) * s + dir * s));
      track.scrollTo({ left: target, behavior: behavior() });
    };
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    const update = () => {
      const scrollable = track.scrollWidth > track.clientWidth + 2;
      prev.hidden = next.hidden = !scrollable;
      const left = target != null ? target : track.scrollLeft;
      prev.disabled = left <= 2;
      next.disabled = left + track.clientWidth >= track.scrollWidth - 2;
    };
    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
      clearTimeout(settle);
      settle = setTimeout(() => { target = null; update(); }, 180); // scrolling has stopped
    }, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
    update();
  }

  function detailRow(label, value) {
    const dd = Array.isArray(value)
      ? h('dd', null, h('ul', { class: 'details__bullets' }, value.filter(hasValue).map((v) => h('li', null, rich(v)))))
      : h('dd', null, rich(value));
    return h('div', { class: 'details__row' }, h('dt', null, label), dd);
  }

  function renderDetails() {
    const d = P.details || {};
    const DL = L.details;
    const filled = (v) => (Array.isArray(v) ? v.some(hasValue) : hasValue(v));
    const rows = [
      [DL.material, d.material], [DL.stone, d.stone], [DL.dimensions, d.dimensions],
      [DL.weight, d.weight], [DL.care, d.care], [DL.allergy, d.allergyNote],
      ...((d.extra || []).filter(Boolean).map((x) => [x.label, x.value]))
    ].filter(([label, value]) => hasValue(label) && filled(value));
    $('#details-list').replaceChildren(...rows.map(([label, value]) => detailRow(label, value)));

    const s = P.safety || {};
    const SL = L.safety;
    const safetyRows = [
      [SL.manufacturer, s.manufacturer], [SL.euResponsible, s.euResponsiblePerson],
      [SL.identifier, hasValue(s.identifier) ? s.identifier : P.sku], [SL.warnings, s.warnings]
    ].filter(([label, value]) => hasValue(label) && hasValue(value));
    const safety = $('#safety');
    if (safetyRows.length) {
      $('#safety-title').prepend(icon('plus', 16));
      setText($('#safety-title span'), L.safetyTitle);
      $('#safety-list').replaceChildren(...safetyRows.flatMap(([label, value]) => [h('dt', null, label), h('dd', null, rich(value))]));
    } else {
      safety.hidden = true;
    }
    if (!rows.length && !safetyRows.length) $('#details').hidden = true;
  }

  function reviewCard(r) {
    const photoAlt = tpl(L.reviewPhotoAlt, { name: r.name });
    return h('li', { class: 'review reveal', tabindex: '-1' },
      h('div', { class: 'review__top' },
        stars(r.rating),
        r.verified === true ? h('span', { class: 'review__verified' }, icon('check', 14), L.verified) : null),
      h('p', { class: 'review__text' }, r.text),
      hasValue(r.photo)
        ? h('button', { type: 'button', class: 'review__photo', onclick: (e) => Lightbox.open([{ src: r.photo, alt: photoAlt }], 0, e.currentTarget) },
            h('img', { src: r.photo, alt: photoAlt, width: 88, height: 88, loading: 'lazy', decoding: 'async' }))
        : null,
      h('div', { class: 'review__footer' },
        h('span', { class: 'review__name' }, r.name),
        h('span', { class: 'review__meta' }, [r.country, hasValue(r.date) ? fmtDate(r.date) : null].filter(hasValue).join(' · ')))
    );
  }

  function renderReviews() {
    const section = $('#reviews');
    if (WISHLIST || !reviews.length) {
      // No reviews (or not selling yet) → no section, no rating, no nav link. Nothing is ever faked.
      section.hidden = true;
      $$('[data-nav="reviews"]').forEach((el) => { el.hidden = true; });
      return;
    }
    section.hidden = false;
    setText('#reviews-avg', fmtNum(avgRating));
    $('#reviews-stars').replaceChildren(stars(avgRating));
    setText('#reviews-count', tpl(L.basedOn, { count: reviewCountText(reviews.length) }));

    const grid = $('#reviews-grid');
    const more = $('#reviews-more');
    const perPage = Math.max(1, parseInt(C.reviewsPerPage, 10) || 6);
    let shown = 0;
    const showNext = () => {
      const batch = reviews.slice(shown, shown + perPage).map(reviewCard);
      batch.forEach((card) => card.classList.add('is-visible'));
      grid.append(...batch);
      shown += batch.length;
      more.hidden = shown >= reviews.length;
      return batch[0];
    };
    $('.btn__label', more).textContent = L.showMore;
    more.addEventListener('click', () => {
      const first = showNext();
      if (first) first.focus();
    });
    showNext();
    const note = $('#reviews-note');
    if (hasValue(C.reviewsNote)) note.textContent = tpl(C.reviewsNote); else note.hidden = true;
  }

  function renderFaq() {
    const items = ((WISHLIST ? W.faq : C.faq) || []).filter((f) => f && hasValue(f.q) && f.a && !R.needsMissingEmail(f));
    if (!items.length) { $('#faq').hidden = true; return; }
    $('#faq-list').replaceChildren(...items.map((f) =>
      h('details', { class: 'faq__item' },
        h('summary', null, h('span', null, tpl(f.q)), icon('plus', 20)),
        h('div', { class: 'faq__answer' }, [].concat(f.a).filter(hasValue).map((p) => h('p', null, rich(p)))))
    ));
  }

  /* ------------------------------------------------------------------
     Wishlist mode: "coming soon" line + email sign-up sent to Brevo.
     Posts straight to Brevo's form endpoint (the same request Brevo's own
     embed script makes): no Brevo script, no reCAPTCHA, no cookies.
     ------------------------------------------------------------------ */
  function renderWishlist() {
    setText('#soon-badge', W.badge || 'Coming soon');
    const soonDate = $('#soon-date');
    const line = hasValue(W.launchLine) && hasValue(R.vars.launchDate) ? tpl(W.launchLine) : '';
    soonDate.textContent = line;
    soonDate.hidden = !line;

    const form = $('#wishlist-form');
    const email = $('#wishlist-email');
    const consent = $('#wishlist-consent');
    const submit = $('#wishlist-submit');
    const label = $('.btn__label', submit);
    const msg = $('#wishlist-msg');
    const B = W.brevo || {};
    const F = B.fields || {};

    // The wishlist offer (e.g. "50% off at launch") above the form + its small print below
    const offer = tpl(W.formBadge || '');
    if (hasValue(offer) && hasValue(R.vars.wishlistDiscount)) {
      setText('#wishlist-offer-badge', offer);
      $('#wishlist-offer').hidden = false;
    }
    const terms = $('#wishlist-terms');
    if (hasValue(R.vars.offerTerms)) { terms.replaceChildren(rich(R.vars.offerTerms)); terms.hidden = false; }

    setText('#wishlist-title', tpl(W.formTitle || ''));
    const text = $('#wishlist-text');
    if (hasValue(W.formText)) text.replaceChildren(rich(W.formText)); else text.hidden = true;
    setText('#wishlist-email-label', W.emailLabel || 'Email address');
    email.placeholder = W.emailPlaceholder || '';
    $('#wishlist-consent-text').replaceChildren(rich(W.consentText || ''));
    label.textContent = W.button || 'Add to wishlist';

    // Optional "which one do you like?", only when Brevo has an attribute to store it in
    const variantSet = $('#wishlist-variants');
    if (hasValue(F.variant) && variants.length > 1) {
      setText('#wishlist-variant-question', tpl(W.variantQuestion || ''));
      $('.variants__options', variantSet).replaceChildren(...variants.map((v) =>
        h('label', { class: 'variant' },
          h('input', { type: 'radio', name: 'wishlist-variant', class: 'variant__input', value: v.name }),
          h('span', { class: `variant__pill${isTodo(v.name) ? ' is-todo' : ''}` }, v.name))
      ));
      variantSet.hidden = false;
    }

    $('#wishlist-success-icon').append(icon('check', 26));
    setText('#wishlist-success-title', tpl(W.successTitle || ''));
    $('#wishlist-success-text').replaceChildren(rich(W.successText || ''));

    const formUrl = typeof B.formUrl === 'string' ? B.formUrl.trim() : '';
    const formUrlOk = /^https?:\/\/\S+$/.test(formUrl) && !isTodo(formUrl);

    // "…or email us at {email}" only once a support email is filled in
    const errorText = () => (R.emailReady() ? W.errorText : (W.errorTextNoEmail || W.errorText));
    const showError = (text, field) => {
      msg.replaceChildren(rich(text || ''));
      [email, consent].forEach((el) => el.removeAttribute('aria-invalid'));
      if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
    };
    const clearError = (el) => () => { el.removeAttribute('aria-invalid'); msg.textContent = ''; };
    email.addEventListener('input', clearError(email));
    consent.addEventListener('change', clearError(consent));

    const succeed = () => {
      form.hidden = true;
      const done = $('#wishlist-success');
      done.hidden = false;
      done.focus();
      stickyOff();
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submit.disabled) return;
      const value = email.value.trim();
      if (!value || !email.checkValidity() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { showError(W.invalidEmail, email); return; }
      if (!consent.checked) { showError(W.consentRequired, consent); return; }
      if ($('#wishlist-hp').value) { succeed(); return; } // spam bot filled the hidden field: pretend it worked
      if (!formUrlOk) {
        showError(W.notReady);
        console.warn('[Ravens] wishlist.brevo.formUrl in config.js is not set, so sign-ups cannot be sent yet.');
        return;
      }

      const data = new FormData();
      data.append(F.email || 'EMAIL', value);
      if (hasValue(F.optIn)) data.append(F.optIn, '1');
      const choice = form.querySelector('input[name="wishlist-variant"]:checked');
      if (choice && hasValue(F.variant)) data.append(F.variant, choice.value);
      data.append('email_address_check', ''); // Brevo's own spam-trap field, must stay empty
      data.append('locale', B.locale || 'en');

      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');
      label.textContent = W.sending || '…';
      msg.textContent = '';
      try {
        const res = await fetch(`${formUrl}${formUrl.includes('?') ? '&' : '?'}isAjax=1`, { method: 'POST', body: data, credentials: 'omit' });
        let json = null;
        try { json = await res.json(); } catch (_) { /* not JSON, e.g. wrong form URL */ }
        if (res.ok && json && json.success) { succeed(); return; }
        console.warn('[Ravens] Brevo did not accept the sign-up:', res.status, json);
        const detail = json && ((json.errors && Object.values(json.errors).find(hasValue)) || json.message);
        showError(hasValue(detail) ? String(detail) : errorText());
      } catch (err) {
        console.warn('[Ravens] Could not reach Brevo:', err);
        showError(errorText());
      } finally {
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
        label.textContent = W.button || 'Add to wishlist';
      }
    });
  }

  /* ------------------------------------------------------------------
     Sticky bar (mobile): visible once the main Buy button (shop) or the
     wishlist form (wishlist) is scrolled past
     ------------------------------------------------------------------ */
  let stickyOff = () => {};
  function initSticky() {
    const bar = $('#sticky-buy');
    const target = WISHLIST ? $('#wishlist') : $('#buy-button');
    if (!bar || !target) return;
    if (WISHLIST) {
      setText('#sticky-name', P.name);
      setText('#sticky-price', tpl(W.stickyText || ''));
      $('#sticky-regular').hidden = true;
      const btn = $('#sticky-buy-button');
      $('.btn__label', btn).textContent = W.stickyButton || 'Join the wishlist';
      btn.setAttribute('href', '#wishlist');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        target.scrollIntoView({ block: 'center', behavior: R.reducedMotion.matches ? 'auto' : 'smooth' });
        const input = $('#wishlist-email');
        if (input && !$('#wishlist-form').hidden) input.focus({ preventScroll: true });
      });
    }
    let visible = null;
    let disabled = false;
    const setVisible = (show) => {
      show = show && !disabled;
      if (show === visible) return;
      visible = show;
      bar.classList.toggle('is-visible', show);
      bar.inert = !show;
      bar.setAttribute('aria-hidden', String(!show));
    };
    // A scroll check (not IntersectionObserver): it also catches fast flings and
    // anchor jumps that skip straight past the button without "crossing" it.
    let raf = 0;
    const check = () => { raf = 0; setVisible(target.getBoundingClientRect().bottom < 0); };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    check();
    stickyOff = () => { disabled = true; setVisible(false); };
  }

  /* ------------------------------------------------------------------
     Structured data (Google): Product + Offer. aggregateRating ONLY with real reviews.
     ------------------------------------------------------------------ */
  function renderJsonLd() {
    const el = $('#product-jsonld');
    if (!el) return;
    const base = R.vars.website;
    const abs = (p) => (/^https?:\/\//i.test(p) ? p : `${base}/${String(p).replace(/^\/+/, '')}`);
    const sale = R.isSaleActive();
    const company = C.company || {};
    const seller = { '@type': 'Organization', name: hasValue(company.legalName) && !isTodo(company.legalName) ? company.legalName : R.vars.brand };
    const offers = (variants.length ? variants : [{}]).map((v) => {
      const offer = {
        '@type': 'Offer',
        url: `${base}/`,
        priceCurrency: (C.price && C.price.currency) || 'EUR',
        price: R.currentPrice().toFixed(2),
        availability: `https://schema.org/${v.soldOut ? 'OutOfStock' : 'InStock'}`,
        itemCondition: 'https://schema.org/NewCondition',
        seller
      };
      if (hasValue(v.name)) offer.name = v.name;
      if (hasValue(v.sku)) offer.sku = v.sku;
      if (sale) offer.priceValidUntil = new Date(R.saleEnd).toISOString().slice(0, 10);
      return offer;
    });
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: P.name,
      description: P.shortDescription || (C.site && C.site.description) || '',
      image: images.map((im) => abs(im.src)),
      brand: { '@type': 'Brand', name: R.vars.brand },
      offers: offers.length === 1 ? offers[0] : offers
    };
    if (hasValue(P.sku)) data.sku = P.sku;
    if (reviews.length) {
      data.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1
      };
      data.review = reviews.slice(0, 10).map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.name },
        ...(hasValue(r.date) ? { datePublished: r.date } : {}),
        reviewBody: r.text,
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 }
      }));
    }
    el.textContent = JSON.stringify(data);
  }

  /* ------------------------------------------------------------------
     Go
     ------------------------------------------------------------------ */
  renderHeader();
  renderGallery();
  if (WISHLIST) {
    renderWishlist();
  } else {
    renderPrice();
    renderVariants();
    renderRatingSummary();
  }
  renderTrust();
  renderStory();
  renderLifestyle();
  renderDetails();
  renderReviews();
  renderFaq();
  initSticky();

  if (WISHLIST) {
    // Nothing to buy yet → no Product/price data for Google until shop mode
    const ld = $('#product-jsonld');
    if (ld) ld.remove();
    return;
  }

  renderJsonLd();
  $('#buy-button').addEventListener('click', onBuyClick);
  $('#sticky-buy-button').addEventListener('click', onBuyClick);

  // The moment the sale ends: regular price, no badge, regular-price Stripe link
  on('saleend', () => {
    renderPrice();
    updateBuy();
    renderJsonLd();
  });
})();
