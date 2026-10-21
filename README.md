# Ravens Accessories: wishlist page + one-product shop

A fast, static website for Ravens Accessories. Plain HTML + CSS + JavaScript: no framework, no build step, no backend, no cookies, no tracking.

The site has **two modes**, switched with one line in `config.js`:

| Mode | What visitors see |
|---|---|
| **`"wishlist"`** (current) | "Coming soon" page: product photos, story, launch countdown and a **"Join the wishlist"** email form. Everyone on the wishlist gets **50% off at launch**. No prices, no checkout. |
| **`"shop"`** | The full store: prices, sale countdown, options, Stripe "Buy now", reviews. All of it is still in the code, just not shown in wishlist mode. |

**You only ever edit two things:**

1. **`config.js`**: every text, date, discount, price, variant, Stripe link, review, FAQ entry and company detail.
2. **`/images`**: your photos.

Every value that still needs your input contains **`TODO_`**. On the local preview, these values are highlighted in yellow on the page, and the browser console (F12) lists the ones that are left.

A backup of the shop version from before the wishlist change is at `Desktop\Ravens-backups\ravens-shop-v1-2026-10-21.zip`.

---

## Contents

1. [Switching mode](#1-switching-mode)
2. [Wishlist mode](#2-wishlist-mode)
3. [Brevo setup (where sign-ups go)](#3-brevo-setup)
4. [Launch day: from wishlist to shop](#4-launch-day)
5. [Preview locally](#5-preview-locally)
6. [Shop settings in config.js](#6-shop-settings-in-configjs)
7. [Photos & image sizes](#7-photos--image-sizes)
8. [Stripe Payment Links](#8-stripe-payment-links)
9. [Deploy (Netlify / Cloudflare Pages / Vercel)](#9-deploy)
10. [Before you go live: checklist](#10-before-you-go-live)
11. [Full TODO list](#11-full-todo-list)
12. [Files](#12-files)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Switching mode

At the top of `config.js`:

```js
mode: "wishlist",   // or "shop"
```

Nothing is deleted when you switch. In wishlist mode the shop parts (price, options, Buy now, sale countdown, reviews, Google price data) are simply not shown, and in shop mode the wishlist form is not shown.

> `config.js` is a public file: anyone can open it through the page source. So don't paste your Stripe links into it until you are ready to sell.

---

## 2. Wishlist mode

Everything is in the `wishlist: { … }` section of `config.js`.

### Launch countdown

```js
launchAt: "2026-11-10T20:00:00+01:00",
```

- One fixed moment, the same for every visitor, never restarts on reload.
- Belgium: `+01:00` in winter time, `+02:00` in summer time (last Sunday of March → last Sunday of October).
- Set to **10 November 2026, 20:00** (Belgian time).
- When the moment passes, the countdown is replaced by the line "COMING SOON ✦ JOIN THE WISHLIST FOR 50% OFF" (`barFallback`) and the "LAUNCHING IN …" item leaves the scrolling bar. The site does **not** switch to shop mode by itself; you do that on launch day (section 4).
- No date yet? Set `launchAt: ""`. The bar then just shows the "coming soon" line. Also rewrite the first FAQ answer, which mentions the date.

### The 50% wishlist offer

```js
offer: {
  discount: 50,
  terms: "One code per person, for one order. Valid for TODO_OFFER_VALIDITY after launch."
},
```

- `discount` appears everywhere as `{wishlistDiscount}` ("50%"): top bar, scrolling bar, the badge above the form, the form text, the consent line, the trust row, the FAQ and the link preview. Change the number once and all texts follow.
- `terms` is the small print under the form and in the FAQ. **Fill in `TODO_OFFER_VALIDITY`** (e.g. "7 days") and make sure the terms match the Stripe promotion code you create on launch day.
- It is a promise: give the discount to **everyone** on the list, exactly as described.

### The sign-up form

- Email field, an unticked consent checkbox (required), and the **Add to wishlist** button.
- After a successful sign-up the form is replaced by "Almost there ✦ We've sent a confirmation link to your inbox…". That text assumes Brevo's **double opt-in** (recommended). If you don't use double opt-in, change `successTitle` / `successText`.
- Errors are shown under the button: invalid email, consent missing, Brevo rejected the sign-up, or Brevo unreachable ("…email us at {email}").
- A hidden spam trap catches most bots; their submissions are never sent to Brevo.
- The form sends the data straight to Brevo with the same request Brevo's own embed code makes, but **without** Brevo's script, reCAPTCHA or cookies, so the site stays cookie-free.
- Optional question "Which one do you like most?": shown only when you set `brevo.fields.variant` (section 3, step 3). The options are your product variant names.

### The snow banner (under the header, both modes)

Settings: `banner: { … }` in `config.js`.

- The photo `images/banner-snowbloom.jpg` with **"Snowbloom"** and **"Launching 10 November"** (`title`, `subtitle`; in shop mode `shopSubtitle`, "Now available").
- **Falling snow** on the banner (`snow: false` switches it off).
- **Sparkle that follows the visitor:** while scrolling, a band of light sweeps across the earring and its stones twinkle (faster scrolling = more sparkle); on computers the light also follows the mouse over the banner; when nothing moves, an occasional gentle twinkle.
- Visitors who switched on "reduce motion" on their device see the still photo.
- The animation stops while the banner is off screen or the tab is in the background, to save battery.
- **Changing the photo?** `shineArea` and `sparkles` describe where the earring and its stones are in *this* photo. With a new photo they need new positions, otherwise the twinkles land in the wrong places. A wider version (2400 px or more) looks sharper on big screens.
- `show: false` removes the banner completely.

### What else changes in wishlist mode

| Part | Wishlist mode |
|---|---|
| Top bar | "LAUNCHING IN ⏳" countdown to `launchAt` |
| Scrolling bar | `wishlist.announcements` |
| Trust row | `wishlist.trust` |
| FAQ | `wishlist.faq` |
| Mobile sticky bar | "50% off at launch" + "Join the wishlist" (scrolls to the form) |
| Footer note | `wishlist.footerNote` instead of the Stripe note |
| Page title / Google / link previews | `wishlist.seo` |
| Reviews, price, Buy now, Google product data | hidden |
| Story, lifestyle photos, details, legal pages | same as shop mode |

---

## 3. Brevo setup

Brevo (brevo.com, an EU company) stores the sign-ups and sends the confirmation email and, later, your launch email. The free plan is enough to start. Menu names in Brevo can differ slightly from the steps below.

1. Create a free account at <https://www.brevo.com>.
2. **Contacts → Lists → Create a list**, e.g. "Wishlist".
3. *(Optional, for the "which one do you like" question)* **Contacts → Settings → Contact attributes → Create**: type **Text**, name e.g. `FAVOURITE`.
4. **Contacts → Forms → Create a subscription form**:
   - Keep the **Email** field.
   - Add the **Opt-in** field (the GDPR consent checkbox).
   - If you did step 3, add the `FAVOURITE` attribute as a field too.
   - Save to the list "Wishlist".
   - Turn on **Double opt-in** (confirmation email) and set the page people see after confirming to your website.
   - **Don't enable reCAPTCHA**: it loads Google scripts, which the site's privacy setup blocks.
5. **Share → Embed** and copy the HTML. Look for `action="https://….sibforms.com/serve/…"` and paste that URL into config.js:

```js
brevo: {
  formUrl: "https://a1b2c3d4.sibforms.com/serve/MUIFA…",
  locale: "en",
  fields: { email: "EMAIL", optIn: "OPT_IN", variant: "" }   // variant: "FAVOURITE" if you did step 3
}
```

   Check that the field names in the embed code (`name="EMAIL"`, `name="OPT_IN"`) match `fields`.
6. Deploy, then sign up on the live site with your own email: you should see "Almost there", receive the confirmation email, and after clicking it find yourself in the "Wishlist" list.

Until `formUrl` is filled in, the form shows "The wishlist isn't connected yet…" instead of failing silently.

---

## 4. Launch day

1. **Stripe discount code** (Stripe dashboard → Product catalogue → **Coupons → New**):
   - Coupon: **50% off**, duration **once**.
   - Add a **promotion code** for it, e.g. `RAVENS50`, with an expiry date that matches your `offer.terms` (e.g. 7 days after launch). Optionally tick "limit to first-time order".
   - A shared code can be passed on to people outside the list. If that matters, create single-use codes instead (one per person, max. 1 redemption each).
2. **Payment Links**: open each regular-price link → enable **Allow promotion codes**, so customers can enter the code at checkout.
3. **config.js**:
   - Fill in the Stripe links (section 8).
   - Set `sale.enabled: false` (recommended at launch: see the note below).
   - Change `mode: "wishlist"` to `mode: "shop"`.
   - Run `node tools/sync-head.mjs` (updates the link-preview texts) and deploy.
4. **Brevo → Campaigns → Create an email campaign** to the "Wishlist" list: the launch announcement, the code, how long it is valid, and the link to the shop.

> **Why `sale.enabled: false` at launch?** The shop's built-in sale shows a crossed-out "was" price. EU rules only allow that if you actually charged that price during the 30 days before the reduction, which isn't possible on day one for a new product. Giving the 50% through the wishlist code avoids that problem and keeps the discount a real perk for the people who signed up. Have this checked by your lawyer.

---

## 5. Preview locally

Open a terminal in this folder and run **one** of these:

```bash
python -m http.server 8000      # Python (pre-installed on most computers)
npx serve .                     # Node.js
```

Then open <http://localhost:8000>.

> Don't just double-click `index.html`. Browsers block some features (such as the fonts) on `file://` pages.

---

## 6. Shop settings in config.js

These settings are used in shop mode. Open `config.js` in any text editor (VS Code, Notepad++, even Notepad). Change only the text between the `"quotes"`, and keep the commas. If you break the syntax, the page shows a red box saying so; press F12 → Console to see the line number.

### Sale end date (countdown)

```js
sale: {
  enabled: true,
  endsAt: "2026-10-24T23:59:59+02:00",
```

- The countdown runs to this **one fixed moment**. It is the same for every visitor and never restarts on reload: no cookies, no localStorage, no "evergreen" tricks.
- When the moment passes, the following happens automatically, even for visitors who have the page open:
  - the countdown bar disappears
  - the sale price, crossed-out price and `-50%` badge disappear
  - the regular price is shown
  - sale-only announcements disappear from the scrolling bar
  - the Buy button switches to the regular-price Stripe link
- `enabled: false` switches the whole sale off (see the launch-day note in section 4).

### Prices (EU Omnibus rule)

```js
price: { currency: "EUR", regular: 59.90, sale: 29.95, ... }
```

- **`regular` must be the lowest price you actually charged in the 30 days before the sale** (EU Directive 2019/2161, Belgian Code of Economic Law art. VI.18). Never show an invented "was" price.
- The `-50%` badge and the `{discount}` text are calculated from these two numbers, and rounded **down** so they never overstate the discount.
- Prices must include VAT for consumers.
- `referenceNote` shows a small line, "Lowest price in the 30 days before the sale: €59.90", under the sale price. Set it to `""` to hide it.

### Scrolling announcements

```js
announcements: [
  { text: "{discount} OFF · ENDS IN {timeLeft} ✦", saleOnly: true },
  { text: "FREE WORLDWIDE SHIPPING 🌍" }
],
```

`{timeLeft}` is calculated from `sale.endsAt` and shows `4 DAYS`, `1 DAY`, `5 HOURS` and so on, so the bar never claims "ends in 4 days" on the last day. `saleOnly: true` items disappear when the sale ends.

### Product, variants, photos (both modes)

- `product.name`, `shortDescription`, `sku`, `details` (material, stone, dimensions, weight, care, allergy note) and `safety` (EU GPSR product-safety info: manufacturer, warnings).
- `product.images`: list of `{ src, alt }`. The first entry is the main image. `alt` describes the photo for blind visitors and Google.
- `product.variants`: one entry per option (for example Silver / Black). With only one variant, the selector is hidden. `image: 1` makes the gallery jump to photo 2 when that variant is selected. `soldOut: true` shows the option greyed out. Each variant needs **two Stripe links** (see section 8).
- `product.story`, `product.features` (3–4 highlights; icons: `gem, feather, shield, sparkle, gift, moon, heart, globe, lock, truck, return, mail, check`) and `product.lifestyle.photos`: photos only (no captions), shown as **one row** that visitors swipe on phones or scroll with arrows on desktop. 4–8 photos look best; tapping one opens it large.
- Any section whose content is empty is hidden automatically.

### Reviews (shop mode)

- The `reviews` array is **empty by default**. While it is empty, the review section, the star rating next to the product and the "Reviews" menu link are all hidden. Nothing is ever faked.
- To add a review, copy the commented example inside `reviews: [ ]`, remove the `//` and fill it in:

```js
reviews: [
  {
    name: "Firstname L.",
    country: "Belgium",
    date: "2026-11-02",                    // YYYY-MM-DD
    rating: 5,                             // 1 to 5
    text: "What the customer wrote, unedited.",
    photo: "images/reviews/review-1.jpg",  // optional
    verified: true                         // only if you checked they bought from you
  },
],
```

- The average rating, the count, the stars and Google's `aggregateRating` are all **calculated** from this list. The first 6 reviews are shown, and a "Show more reviews" button reveals the rest. The "Verified purchase" badge only appears with `verified: true`.
- Only publish real reviews, with the customer's permission. Fake reviews are illegal in the EU.

### Tokens you can use in texts

Write these inside any text in `config.js` and they are filled in automatically:

| Token | Becomes |
|---|---|
| `{email}` | your support email (as a clickable link) |
| `{productName}` `{brand}` | product name / brand name |
| `{wishlistDiscount}` `{offerTerms}` | e.g. `50%` / the offer's small print |
| `{launchDate}` | e.g. `10 November 2026` |
| `{timeLeft}` | e.g. `4 DAYS` (until the launch in wishlist mode, until the sale ends in shop mode) |
| `{discount}` | the shop sale discount, e.g. `50%` |
| `{regularPrice}` `{salePrice}` `{price}` | formatted prices (`{price}` = current price) |
| `{withdrawalDays}` `{refundDays}` | from `returns` |
| `{processingTime}` `{deliverySummary}` `{shipsFrom}` `{carrier}` | from `shipping` |
| `{material}` `{allergyNote}` | from `product.details` |
| `{companyName}` `{address}` `{vatNumber}` `{enterpriseNumber}` `{responseTime}` | from `company` |

Links inside texts: `[link text](shipping.html)`.

> **Note:** page titles and descriptions support only `{productName}`, `{brand}` and `{wishlistDiscount}` when the sync tool copies them into the static HTML (section 9).

---

## 7. Photos & image sizes

Put your photos in `/images`, then update the file names in `config.js` (for example change `images/product-1.svg` to `images/product-1.jpg`). The SVG placeholders are clearly labelled; delete them when you are done.

| Image | Size (px) | Ratio | Where in config.js |
|---|---|---|---|
| Product photos (5 or more) | **1600 × 1600** | 1:1 square | `product.images` |
| Lifestyle / worn photos (4–8, one swipeable row) | **1200 × 1500** | 4:5 portrait | `product.lifestyle.photos` |
| Customer review photos (optional) | **800 × 800** | 1:1 | `reviews[].photo` (put them in `images/reviews/`) |
| Social share image | **1200 × 630** | 1.91:1 | `site.ogImage` (a branded one is included: `images/og-image.jpg`) |

- Use **JPG or WebP**, under **300 KB** each. <https://squoosh.app> compresses them for free.
- Product photos: a dark or neutral background suits the site best.

### Logo files (already made)

| File | What |
|---|---|
| `Logo2.png` | your original, untouched |
| `images/logo-light.svg` | feather vectorized from Logo2, off-white `#e8e6ee`, transparent. **Used on the site.** |
| `images/logo-light.png` | same, 1024 × 1024 PNG with transparency (for other uses) |
| `favicon.ico`, `favicon.svg` | browser tab icon (dark tile + silver feather) |
| `apple-touch-icon.png` | iPhone home-screen icon, 180 × 180 |
| `images/icons/icon-192.png`, `icon-512.png` | Android / web-app icons |
| `images/og-image.jpg` | social share image: logo + "RAVENS ACCESSORIES" |

`Logo.png` and the `RavensIcons/` folder are not used by the site. You can keep them, but you may want to move them out of this folder before deploying, so the roughly 6 MB of source images aren't uploaded.

---

## 8. Stripe Payment Links

**Why two links per variant?** Stripe charges the price stored *inside* the Payment Link, not the price shown on your site. The site therefore uses:

- `stripeLinkSale`: a link that charges **€29.95** (used while the shop sale runs)
- `stripeLinkRegular`: a link that charges **€59.90** (used when there is no sale, e.g. at launch with `sale.enabled: false`)

### Step by step (do it in **Test mode** first)

1. Sign up at <https://dashboard.stripe.com> and activate your account (company details, bank account).
2. **Product catalogue → Add product**, for example "Feather necklace (Silver)". Add **two prices**: €29.95 and €59.90 (one-off, EUR).
   - If you are VAT-registered: set the price to **tax inclusive**, or use Stripe Tax. Ask your accountant which applies to you.
3. **Payment Links → New**, choose the product with the **€29.95** price, then set:
   - **Collect customers' addresses**: *Shipping address*, allowed countries: all the countries you ship to.
   - Optional: collect phone number (handy for carriers).
   - **Require customers to accept your terms of service**: first add your Terms URL under *Settings → Business → Public details*.
   - **After payment → Don't show confirmation page → Redirect customers to your website:**
     `https://YOURDOMAIN/success.html?session_id={CHECKOUT_SESSION_ID}`
   - Create the link and copy it (`https://buy.stripe.com/...`) into `stripeLinkSale`.
4. Repeat with the **€59.90** price and paste that link into `stripeLinkRegular`. Enable **Allow promotion codes** on it for the wishlist code (section 4).
5. Repeat steps 2–4 for each variant.
6. **Settings → Emails**: turn on *Successful payments* so customers get a receipt (the thank-you page promises one).
7. **Settings → Payment methods**: enable **Bancontact** (very popular in Belgium), iDEAL (Netherlands), Apple Pay and Google Pay.
8. Test: open your site in shop mode, click Buy now and pay with test card `4242 4242 4242 4242` (any future date, any CVC). You should land on `success.html`.
9. Switch Stripe to **Live mode**, recreate the products and links there (test links don't work live) and paste the live links into `config.js`.

**After a sale ends:** deactivate the sale Payment Links in Stripe, so nobody can still pay the sale price through a bookmarked or shared checkout page.

Until a valid `https://` link is filled in, clicking Buy now shows "Checkout isn't set up yet" instead of a broken page.

---

## 9. Deploy

Upload **this whole folder**. There is no build command and no output directory to configure.

### Netlify (easiest)

1. Go to <https://app.netlify.com/drop> and drag this folder onto the page. Done: you get a `*.netlify.app` URL.
2. **Domain management → Add a domain** to connect your own domain. HTTPS is automatic.
3. To update the site later, drag the folder again (or connect a Git repository for automatic deploys).

### Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Upload assets**.
2. Give it a name and upload this folder. Build settings: *none*.
3. **Custom domains → Set up a custom domain**.

### Vercel

1. Install the CLI (`npm i -g vercel`), then run `vercel` in this folder, or import a Git repository on vercel.com.
2. Framework preset: **Other**; no build command; output directory: `.` (root).

`404.html` is used automatically by all three hosts. Security headers are included (`_headers` for Netlify/Cloudflare, `vercel.json` for Vercel); they allow the wishlist form to reach Brevo and block everything else from outside.

### After the first deploy: run the sync tool (recommended)

Google reads what `config.js` sets. **WhatsApp, Instagram, Facebook, X and Discord link previews do not run JavaScript**, so they only see the static HTML. After setting `site.url` (and whenever you change the mode, titles, descriptions or the OG image), run:

```bash
node tools/sync-head.mjs
```

This writes the right title and description for the current mode into `index.html` and regenerates `robots.txt` and `sitemap.xml` with your domain. It needs Node.js 18+ and installs nothing. Then deploy again. The site works without it; it is not a build step.

If you don't have Node.js, edit the block between `<!-- SEO:START` and `<!-- SEO:END -->` in `index.html` by hand, and replace `https://TODO_DOMAIN` in `robots.txt` and `sitemap.xml`.

---

## 10. Before you go live

### Wishlist mode

- [ ] `wishlist.launchAt` = your real launch date, with the correct timezone
- [ ] `wishlist.offer.terms` filled in (`TODO_OFFER_VALIDITY`) and matching what you will set up in Stripe
- [ ] Brevo form connected (`wishlist.brevo.formUrl`), double opt-in on, a test sign-up with your own email works end to end
- [ ] Every `TODO_` in `config.js` that is shown on the page is filled in (product name, description, photos and alt texts, details, company details, support email)
- [ ] Privacy policy reviewed (it now includes a wishlist section) and `site.url` set, then `node tools/sync-head.mjs` run and redeployed
- [ ] Checked on a real phone

### Shop mode (launch day)

- [ ] Steps of section 4 done (promotion code, "Allow promotion codes", `sale.enabled` decision, mode switched)
- [ ] `price.regular` / `price.sale` are your real prices
- [ ] Delivery times in `shipping` match what your carrier actually delivers
- [ ] Draft copy (story, feature titles, FAQ, care tips) reviewed, and it says nothing that isn't true
- [ ] Stripe **live** links filled in; a real test purchase made and refunded; receipt email arrives; redirect to `success.html` works
- [ ] Legal pages reviewed by a lawyer or accountant; then **delete the yellow "TEMPLATE" box** from each legal page (the `<p class="template-note">…</p>` element in `legal-notice.html`, `privacy.html`, `terms.html`, `returns.html`, `shipping.html`)
- [ ] Sitemap submitted in Google Search Console; product checked with Google's Rich Results Test

### Points to raise with your accountant or lawyer

- **The 50% wishlist offer and price-reduction rules:** how the launch discount is announced and applied (Belgian CEL art. VI.18 and following).
- **Marketing emails:** consent (the form's checkbox + double opt-in) and the unsubscribe link in every email.
- **VAT on EU sales:** above €10,000/year of cross-border B2C sales in the EU, you charge the customer's country's VAT (via the OSS one-stop shop).
- **UK:** for parcels ≤ £135, the *seller* must charge UK VAT and register for it. The default customs note ("recipient pays") doesn't fit UK orders unless you handle this. Norway (VOEC), Switzerland and Australia have similar rules.
- **Jewelry rules:** REACH limits for nickel, lead and cadmium; only claim "hypoallergenic" or "nickel-free" if you can prove it.
- **GPSR:** fill in `product.safety` (manufacturer details); the product page must show them.
- **Language:** Belgian consumers may expect Dutch and/or French versions of the legal pages.

---

## 11. Full TODO list

### In `config.js` (17 placeholders)

The product is filled in (**Snowbloom Earrings**). What's left:

**Wishlist mode**

| Placeholder | What to fill in |
|---|---|
| `TODO_BREVO_FORM_URL` | the form URL from Brevo's embed code (section 3) |

**Your details (before the site goes live and collects emails, see the note below)**

| Placeholder | What to fill in |
|---|---|
| `TODO_DOMAIN` | your live domain in `site.url`, e.g. `https://ravensaccessories.com` |
| `TODO_COMPANY_LEGAL_NAME` | registered company name (or your own name for a sole proprietorship) |
| `TODO_LEGAL_FORM` | BV / SRL / sole proprietorship… |
| `TODO_STREET_AND_NUMBER`, `TODO_POSTAL_CODE`, `TODO_CITY` | registered address |
| `TODO_KBO_BCE_NUMBER` | enterprise number, `0123.456.789` |
| `TODO_VAT_NUMBER` | `BE0123.456.789`, or the small-enterprise exemption text (see the comment in config.js) |
| `TODO_RPR_RPM` | register of legal entities + court (companies only; `""` for a sole proprietor) |
| `TODO_SUPPORT_EMAIL` | support email address |
| `TODO_EMAIL_PROVIDER` | your mailbox provider, e.g. Google Workspace (privacy policy) |
| `TODO_HOSTING_PROVIDER` | where the site is hosted, e.g. Netlify / Cloudflare (privacy policy) |
| `TODO_RETENTION_PERIOD` | how long you keep order data (ask your accountant) |

> The wishlist form collects email addresses, so the privacy policy must say **who** collects them and how to reach you (GDPR art. 13), and a Belgian business website needs its identity in the legal notice. Fill these in before the site goes live, even in wishlist mode.

**Hidden until filled** (in the comment next to the setting, so nothing shows on the page)

| Placeholder | What to fill in |
|---|---|
| `TODO_DIMENSIONS` | flower diameter in mm: measure your sample, then put it in `details.dimensions` |

**Shop mode only (launch day)**

| Placeholder | What to fill in |
|---|---|
| `TODO_STRIPE_LINK_SALE` / `TODO_STRIPE_LINK_REGULAR` | Stripe Payment Links (sale price / regular price) |
| `TODO_CARRIER` | shipping carrier, and check all shipping texts match how you really ship |
| `TODO_MANUFACTURER` (in the comment next to `safety.manufacturer`) | your company name, address and email (selling under your own brand makes you the manufacturer under EU product-safety rules) |

### Working values that you must check (they need to be valid numbers or dates, so the `TODO_` marker is in the comment next to them)

| Setting | Default | Check |
|---|---|---|
| `wishlist.launchAt` | `2026-11-10T20:00:00+01:00` | set: 10 November 2026, 20:00 |
| `wishlist.offer.discount` | 50 | the discount you will really give |
| `sale.endsAt` (`TODO_SALE_END`) | `2026-10-24T23:59:59+02:00` | only matters if you run a shop sale |
| `price.regular` / `price.sale` (`TODO_REGULAR_PRICE` / `TODO_SALE_PRICE`) | 59.90 / 29.95 | your real prices (Omnibus rule) |
| `shipping.deliveryTimes`, `processingTime`, `deliverySummary` | realistic estimates for shipping from Belgium | your carrier's real times |
| `returns.returnCostText` | customer pays the return | your choice |
| `company.responseTime` | 1–2 business days | your promise |
| Draft copy: `story`, `features`, both FAQs, `care`, `brand.tagline` | written for Snowbloom | must be true for your product |
| `details.weight`, "Sold as: A pair" | from the supplier listing | weigh your sample; confirm 1 piece = 1 pair |

### In the HTML files

The HTML files also contain fallback texts such as `TODO_ADDRESS`, `TODO_RETURN_ADDRESS` or `TODO_SUPPORT_EMAIL`. You **don't** edit those: they are replaced automatically with your values from `config.js` when the page loads. Only these need manual attention:

| File | What |
|---|---|
| `returns.html` | paragraph containing `TODO_CHECK_EXCEPTIONS` (personalised or sealed items): keep, adapt or delete |
| All 5 legal pages | yellow "TEMPLATE: must be reviewed before going live" box: delete after legal review |
| `site.webmanifest` | brand name is hard-coded (only change it if the brand name changes) |

### In `/images`

Product photos are done (`images/product-1.jpg` … `product-6.jpg`, made from the originals in `ProductPhotos/`). Lifestyle photos are done too (`images/lifestyle-1.jpg` … `lifestyle-9.jpg`, made from the originals in `ProductReviewPhotos/`).

---

## 12. Files

```
index.html            product page (wishlist mode or shop mode)
legal-notice.html     legal notice (company details)
privacy.html          privacy policy (GDPR, incl. wishlist and Brevo)
terms.html            terms & conditions
returns.html          returns + 14-day right of withdrawal + model withdrawal form
shipping.html         shipping & customs
success.html          thank-you page after Stripe payment (noindex)
404.html              "page not found"
config.js             ← ALL your content, incl. the mode switch
css/styles.css        design (colours are variables at the top: near-black + snowy white)
js/site.js            shared logic: mode, countdowns, marquee, bindings (no need to edit)
js/product.js         product page logic: gallery, wishlist form, shop (no need to edit)
js/snow-banner.js     snow banner: falling snow + sparkle (no need to edit)
images/               logo, icons, placeholders, your photos
fonts/                Inter + Cormorant Garamond, self-hosted (no Google requests)
tools/sync-head.mjs   optional: writes SEO tags, robots.txt and sitemap.xml from config.js
_headers, vercel.json security headers for Netlify/Cloudflare and Vercel
robots.txt, sitemap.xml, site.webmanifest, favicon.*, apple-touch-icon.png
```

**Privacy by design:** no cookies, no localStorage, no analytics, fonts self-hosted, so no cookie banner is needed. The only external services are Brevo (only when someone submits the wishlist form) and Stripe (only after a visitor clicks "Buy now" in shop mode).

---

## 13. Troubleshooting

| Problem | Fix |
|---|---|
| Red box "config.js could not be loaded" | Syntax error in `config.js`. Press F12 → Console for the line number. Usually a missing comma between entries or a missing quote. |
| "The wishlist isn't connected yet" | `wishlist.brevo.formUrl` is empty or still `TODO_BREVO_FORM_URL` (section 3). |
| Sign-up shows "Something went wrong" | Wrong form URL, or Brevo is unreachable. Press F12 → Console: the site logs what Brevo answered. Check the URL against Brevo's embed code. |
| Brevo says a field is invalid | The field names in `brevo.fields` don't match your Brevo form. Compare them with the `name="…"` values in the embed code. |
| No launch countdown | `launchAt` is empty, in the past, or not a valid date. The console says which. |
| Shop countdown bar not showing | Mode isn't `"shop"`, `sale.enabled` is `false`, `endsAt` is in the past or invalid, or `price.sale` is not lower than `price.regular`. |
| "Checkout isn't set up yet" | The Stripe link for that variant (sale or regular, depending on whether the sale is running) is missing or doesn't start with `https://`. |
| Changes don't show online | Redeploy the folder, then hard-refresh (Ctrl+F5 / Cmd+Shift+R). |
| Link preview on WhatsApp shows TODO text or the wrong mode | Run `node tools/sync-head.mjs` and redeploy. WhatsApp caches previews for a while. |
| Review photo from another website doesn't load | The security policy only allows images from your own site. Download the photo into `images/reviews/`, or add the domain to `img-src` in `_headers` / `vercel.json`. |
