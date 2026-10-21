/* ==========================================================================
   RAVENS ACCESSORIES: SITE CONFIGURATION
   ==========================================================================
   This is the ONLY file you need to edit (plus the /images folder).

   How to edit safely
   • Change the text between the "quotes". Keep the quotes, commas and brackets.
   • Every value that still needs your input contains  TODO_  → search for it.
   • Words in {curly braces} are filled in automatically, e.g. {email} becomes
     your support email. The full list of tokens is in README.md.
   • Links inside texts: [link text](page.html)
   • Save, then reload the browser. If you see a red "config.js" error box,
     there is a typo in this file (usually a missing comma or quote).
   ========================================================================== */

window.RAVENS_CONFIG = {

  /* ========================================================================
     SITE MODE: the main switch
     ========================================================================
       "wishlist" → "coming soon" page: product photos + story + an email
                    sign-up form ("Add to wishlist"). No prices, no checkout.
       "shop"     → the full store: prices, sale countdown, options,
                    Stripe "Buy now", reviews.
     Nothing is deleted when you switch: all shop settings further down stay
     here, ready. Note: this file is public (anyone can view the page source),
     so don't add your Stripe links until you're ready to sell.            */
  mode: "wishlist",

  /* ------------------------------------------------------------------------
     WISHLIST MODE (only used when mode is "wishlist")
     ------------------------------------------------------------------------ */
  wishlist: {
    // Launch countdown in the top bar. ONE fixed moment, the same for everyone,
    // never resets. Belgium: +01:00 in winter time, +02:00 in summer time.
    // No date yet? Set launchAt: "" (the bar then just says "coming soon") and
    // rewrite the first FAQ answer below, which mentions {launchDate}.
    launchAt: "2026-11-10T20:00:00+01:00",   // 10 November 2026, 20:00 Belgian time (winter time = +01:00)
    showBar: true,                           // false = no top bar at all
    barTitle: "LAUNCHING IN ⏳",
    barSubtitle: "JOIN THE WISHLIST · GET {wishlistDiscount} OFF AT LAUNCH",
    barFallback: "COMING SOON ✦ JOIN THE WISHLIST FOR {wishlistDiscount} OFF",   // shown when there is no date or the date has passed

    // THE WISHLIST OFFER: everyone on the wishlist gets this discount at launch.
    // It is delivered as a discount code by email on launch day (a Stripe
    // promotion code, see README.md → "Launch day"). Only promise what you will
    // really give to everyone on the list.
    offer: {
      discount: 50,                          // percent. Becomes {wishlistDiscount} = "50%" in all texts
      terms: "One code per person, for one order. Valid for 7 days after launch."   // small print under the form and in the FAQ ({offerTerms})
    },

    // Scrolling bar. beforeLaunch: true → hidden once the launch date has passed.
    // {timeLeft} → "30 DAYS", "1 DAY", "5 HOURS"… until launchAt
    announcements: [
      { text: "WISHLIST MEMBERS GET {wishlistDiscount} OFF AT LAUNCH ✦" },
      { text: "LAUNCHING IN {timeLeft} ✦", beforeLaunch: true },
      { text: "FREE WORLDWIDE SHIPPING AT LAUNCH 🌍" }
    ],

    // Google / link previews while in wishlist mode
    seo: {
      title: "{productName} | Coming soon | Ravens Accessories",
      description: "Join the wishlist for {productName} by Ravens Accessories and get {wishlistDiscount} off at launch."
    },

    // Product block
    badge: "Coming soon",
    launchLine: "Launching {launchDate}",    // {launchDate} = the date above, e.g. "20 November 2026". "" hides it
    formBadge: "{wishlistDiscount} off at launch",   // highlighted label above the form. "" hides it
    formTitle: "Join the wishlist",
    formText: "Wishlist members get {wishlistDiscount} off at launch. On launch day we email you a personal discount code, before anyone else hears about it.",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    variantQuestion: "Which one do you like most? (optional)",   // only shown when brevo.fields.variant is set
    consentText: "Email me when {productName} launches, including my {wishlistDiscount} discount code, and send me occasional news from {brand}. I can unsubscribe at any time. [Privacy policy](privacy.html)",
    button: "Add to wishlist",
    sending: "Adding…",
    // Text after a successful sign-up. With Brevo's double opt-in (recommended) people must click a
    // confirmation link first, so keep this text. Without double opt-in, change it to e.g. "You're on the wishlist ✦".
    successTitle: "Almost there ✦",
    successText: "We've sent a confirmation link to your inbox. Click it to secure your spot and your {wishlistDiscount} launch discount.",
    invalidEmail: "Please enter a valid email address.",
    consentRequired: "Please tick the box so we're allowed to email you.",
    errorText: "Something went wrong. Please try again, or email us at {email}.",
    errorTextNoEmail: "Something went wrong. Please try again in a moment.",   // used while company.email is not filled in
    notReady: "The wishlist isn't connected yet. Add your Brevo form URL in config.js (wishlist.brevo.formUrl).",

    // Mobile sticky bar
    stickyText: "{wishlistDiscount} off at launch",
    stickyButton: "Join the wishlist",

    // Brevo (brevo.com): where the sign-ups are stored. Setup steps: README.md → "Brevo setup".
    brevo: {
      formUrl: "TODO_BREVO_FORM_URL",        // the action="…" address from Brevo's embed code, e.g. "https://a1b2c3d4.sibforms.com/serve/MUIFA…"
      locale: "en",
      fields: {
        email: "EMAIL",                      // field names exactly as in Brevo's embed code
        optIn: "OPT_IN",                     // Brevo's opt-in checkbox field ("" if your form has none)
        variant: ""                          // optional: a Brevo contact attribute (e.g. "FAVOURITE") to store which option they like; "" hides the question
      }
    },

    // Trust row under the product (icons: gem, feather, shield, sparkle, gift, moon, heart, globe, lock, truck, return, mail, check)
    trust: [
      { icon: "gift",    title: "{wishlistDiscount} off at launch", text: "Your personal code on launch day" },
      { icon: "sparkle", title: "First to know",           text: "An email the moment it launches" },
      { icon: "check",   title: "Unsubscribe anytime",     text: "No spam, one click in every email" },
      { icon: "globe",   title: "Free worldwide shipping", text: "From day one" }
    ],

    // FAQ while in wishlist mode
    faq: [
      { q: "When does it launch?", a: "We're launching on {launchDate}. Everyone on the wishlist gets an email the moment it's live." },
      { q: "How do I get {wishlistDiscount} off?", a: ["Join the wishlist and confirm your email address. On launch day you receive a personal {wishlistDiscount} discount code by email. Enter it at checkout.", "{offerTerms}"] },
      { q: "How much will it cost?", a: "We'll reveal the price at launch. Wishlist members pay {wishlistDiscount} less with their code." },
      { q: "Does joining cost anything?", a: "No. Joining the wishlist is free and doesn't commit you to buying anything." },
      { q: "What will you email me?", a: "An email when {productName} launches, with your discount code, and occasional news from {brand}. No spam, and every email has a one-click unsubscribe link." },
      { q: "Why do I need to confirm my email?", a: "To make sure it's really you, we send a short confirmation email. Your sign-up and your discount are confirmed once you click the link in it." },
      { q: "What do you do with my email address?", a: "We only use it for the emails described above. It's stored with our email service Brevo. Details in our [privacy policy](privacy.html)." },
      { q: "I have another question.", a: "Email us at {email}. We usually reply within {responseTime}." }
    ],

    footerNote: "We'll only email you about the launch, your discount code and our news. Unsubscribe anytime."
  },

  /* ========================================================================
     EVERYTHING BELOW IS SHARED BY BOTH MODES OR USED IN SHOP MODE
     ======================================================================== */

  /* ------------------------------------------------------------------------
     WEBSITE & SEO
     ------------------------------------------------------------------------ */
  site: {
    url: "https://ravensaccessories.com",    // your live address (no trailing slash)
    language: "en",
    locale: "en-IE",                         // number & date format. "en-IE" shows €29.95
    title: "{productName} | Ravens Accessories",   // browser tab + Google title (max. ~60 characters)
    description: "Snowbloom earrings: a snow-white flower of sparkling cubic zirconia on 925 silver posts. Free worldwide shipping from Ravens Accessories.",    // Google snippet, max. ~155 characters
    ogImage: "images/og-image.jpg",          // preview image when the link is shared (1200 × 630 px, JPG/PNG)
    ogImageAlt: "Ravens Accessories logo: a silver feather with a gemstone tip on a dark background",
    twitterHandle: "",                       // optional, e.g. "@ravensaccessories"
    themeColor: "#0b0b0f"
  },

  brand: {
    name: "Ravens Accessories",
    logo: "images/logo-light.svg",           // light logo for the dark background (PNG version: images/logo-light.png)
    tagline: "Dark elegance, worn close."
  },

  /* ------------------------------------------------------------------------
     SNOW BANNER (under the header, both modes)
     The photo with gently falling snow, plus sparkle on the earring that
     follows scrolling (and the mouse on computers). Visitors who switched on
     "reduce motion" on their device see the still photo instead.
     ------------------------------------------------------------------------ */
  banner: {
    show: true,                              // false = no banner
    image: "images/banner-snowbloom.jpg",    // wide photo (this one is 1536 × 688; 2400+ px wide looks sharper on big screens)
    alt: "The Snowbloom earring lying in fresh, sparkling snow",
    title: "Snowbloom",
    subtitle: "Launching {launchDateShort}", // wishlist mode. {launchDateShort} = e.g. "10 November"
    shopSubtitle: "Now available",           // shop mode
    snow: true,                              // falling snow on the banner
    // Where the earring sits in THIS photo (percent of width / height) and the points
    // on its stones that twinkle. Only change these if you change the photo.
    shineArea: { x: 49.5, y: 51.2, rx: 13.7, ry: 30.2 },
    sparkles: [
      [45.7, 24.9], [42.8, 30.1], [50.2, 32.6], [41.2, 38.4], [41.3, 53.9], [39.0, 62.2],
      [46.8, 71.4], [45.9, 34.2], [43.2, 66.4], [50.8, 23.5], [45.1, 44.5], [51.9, 46.8],
      [37.8, 42.6], [55.9, 46.5], [46.9, 56.5], [54.3, 30.5], [57.9, 56.7], [53.5, 56.2],
      [49.8, 50.1], [57.4, 34.6], [60.9, 43.6], [57.6, 66.6], [52.9, 75.0]
    ]
  },

  /* ------------------------------------------------------------------------
     COMPANY (used in the footer and on all legal pages)
     ------------------------------------------------------------------------ */
  company: {
    legalName: "TODO_COMPANY_LEGAL_NAME",    // e.g. "Ravens Accessories BV" or your own name for a sole proprietorship
    legalForm: "TODO_LEGAL_FORM",            // e.g. "BV (besloten vennootschap)" / "SRL" / "Sole proprietorship (eenmanszaak)"
    street: "TODO_STREET_AND_NUMBER",
    postalCode: "TODO_POSTAL_CODE",
    city: "TODO_CITY",
    country: "Belgium",
    enterpriseNumber: "TODO_KBO_BCE_NUMBER", // KBO/BCE enterprise number, format 0123.456.789
    vatNumber: "TODO_VAT_NUMBER",            // e.g. "BE0123.456.789". Small-enterprise exemption? Write: "Not subject to VAT (small enterprise exemption, art. 56bis Belgian VAT Code)"
    registerCourt: "TODO_RPR_RPM",           // companies only, e.g. "RPR Antwerpen, afdeling Antwerpen". Sole proprietor: leave ""
    email: "TODO_SUPPORT_EMAIL",             // shown everywhere as the support address
    phone: "",                               // optional, e.g. "+32 470 00 00 00" (leave "" to hide)
    responseTime: "1–2 business days",       // how fast you answer emails
    hostingProvider: "TODO_HOSTING_PROVIDER",// e.g. "Netlify, Inc. (USA)" or "Cloudflare, Inc. (USA)". Used in the privacy policy
    emailProvider: "TODO_EMAIL_PROVIDER"     // who hosts your mailbox, e.g. "Google Workspace" / "Microsoft 365" / "Proton". Used in the privacy policy
  },

  /* ------------------------------------------------------------------------
     SALE & COUNTDOWN  (shop mode only)
     ------------------------------------------------------------------------
     The countdown runs to ONE fixed moment that is the same for every visitor.
     It never restarts on reload. When the moment has passed, the countdown bar,
     sale price, "-50%" badge and sale announcements disappear automatically and
     the regular price is shown.
     Time format: "YYYY-MM-DDTHH:MM:SS+02:00"
       Belgium: +02:00 in summer time (end of March → end of October)
                +01:00 in winter time (end of October → end of March)        */
  sale: {
    enabled: true,                           // false = no sale at all, regular price only
    endsAt: "2026-10-24T23:59:59+02:00",     // TODO_SALE_END: set to your launch date + 4 days
    barTitle: "SALE ENDS IN ⏳",
    barSubtitle: "FREE SHIPPING WORLDWIDE"
  },

  /* ------------------------------------------------------------------------
     PRICE  (shop mode only)
     ------------------------------------------------------------------------
     ⚠ EU OMNIBUS DIRECTIVE (Directive 2019/2161, Belgian Code of Economic Law
     art. VI.18): the crossed-out "regular" price MUST be the LOWEST price you
     actually charged for this product during the 30 days before the sale
     started. Never show a "was" price you did not really charge.
     Prices are shown INCLUDING VAT (required for consumers in the EU).       */
  price: {
    currency: "EUR",
    regular: 59.90,                          // TODO_REGULAR_PRICE
    sale: 29.95,                             // TODO_SALE_PRICE: only shown while the sale is active
    taxNote: "VAT included · Free worldwide shipping",
    referenceNote: "Lowest price in the 30 days before the sale: {regularPrice}"   // small line under the sale price. "" hides it
  },

  /* ------------------------------------------------------------------------
     SCROLLING ANNOUNCEMENT BAR  (shop mode only; wishlist mode uses wishlist.announcements)
     ------------------------------------------------------------------------
     saleOnly: true  → hidden automatically when the sale is over.
     Tokens:  {discount} → e.g. "50%" (calculated from the prices)
              {timeLeft} → "4 DAYS", "1 DAY", "5 HOURS"… (calculated from sale.endsAt,
                           so the text is always true, never "4 days" on the last day) */
  announcements: [
    { text: "{discount} OFF · ENDS IN {timeLeft} ✦", saleOnly: true },
    { text: "FREE WORLDWIDE SHIPPING 🌍" }
  ],

  /* ------------------------------------------------------------------------
     PRODUCT
     ------------------------------------------------------------------------ */
  product: {
    name: "Snowbloom Earrings",
    sku: "RA-SNOWBLOOM-01",                  // your product code
    shortDescription: "A snow-white flower of sparkling cubic zirconia on 925 silver posts. Made to catch the light, day or night.",  // 1–2 sentences under the name

    // Product photos. First one = main image. Recommended: 1600 × 1600 px, square, JPG/WebP, < 300 KB.
    // Optional "zoom": a different file to show when the photo is tapped open (e.g. without room for highlights).
    // Replace the placeholder files in /images and update the file names here.
    images: [
      { src: "images/product-1.jpg", alt: "A pair of flower-shaped stud earrings set with clear sparkling stones, on a black background" },
      { src: "images/product-2.jpg", alt: "Woman with long blonde hair wearing the flower stud earring, seen from the side" },
      { src: "images/product-3.jpg", alt: "Woman with dark hair wearing the flower stud earring, seen from the side" },
      { src: "images/product-4.jpg", alt: "The flower stud earrings in an open black jewelry box" },
      { src: "images/product-5.jpg", alt: "The flower stud earrings held between two fingers, showing their size" },
      { src: "images/product-6.jpg", alt: "Close-up of the flower stud earrings on a white cloth, catching the light" }
    ],

    // Variants (e.g. colours or finishes). With only ONE variant the selector is hidden.
    // Each variant needs TWO Stripe Payment Links, because Stripe charges the price
    // stored in the link, not the price shown on this site:
    //   stripeLinkSale    → a Payment Link that charges price.sale    (used while the sale runs)
    //   stripeLinkRegular → a Payment Link that charges price.regular (used after the sale ends)
    // Highlights shown ON the first product photo (a row along the bottom: icon with text under it).
    // Icons: diameter, feather, hallmark, gem, sparkle, globe, gift, shield, lock, truck, return, mail, check.
    // Only state what is true. Leave the list empty [] to show the photo without highlights.
    photoHighlights: [
      { icon: "diameter", text: "16 mm wide" },
      { icon: "feather",  text: "Only 4.3 g a pair" },
      { icon: "hallmark", text: "925 silver posts" },
      { icon: "gem",      text: "Cubic zirconia" }
    ],

    // One option for now (all photos show the clear "silver" stones), so the selector is hidden.
    // To offer more colours later, copy the block, give it its own id/name and photos.
    variantLabel: "Stone colour",
    variants: [
      {
        id: "silver",                        // short unique id, no spaces
        name: "Silver",
        sku: "",                             // optional variant SKU
        image: 0,                            // photo to show when selected (0 = first photo)
        soldOut: false,                      // true = shown but cannot be bought
        stripeLinkSale: "TODO_STRIPE_LINK_SALE",         // launch day: e.g. "https://buy.stripe.com/abc123"
        stripeLinkRegular: "TODO_STRIPE_LINK_REGULAR"
      }
    ],

    // Story section (draft copy: rewrite freely, but only state things that are true)
    story: {
      eyebrow: "The story",
      title: "Chosen, not churned out",
      paragraphs: [
        "We didn’t want to make another piece of jewelry you forget in a drawer. So before Snowbloom, we threw out a lot of drafts: designs that looked good on screen but felt cheap in the hand, posts that irritated the ear, stones that lost their sparkle.",
        "Snowbloom is what survived. We shaped the flower so its cubic zirconia catches every bit of light. We chose 925 sterling silver posts because they’re gentle on the ear. And we kept the pair light, about 4.3 g, so you forget you’re wearing them."
      ],
      closing: "Ravens have always collected what glitters."   // shown as a closing line in the italic serif ("" hides it)
    },

    // 3–4 highlights. Icons: gem, feather, shield, sparkle, gift, moon, heart, globe, lock, truck, return, mail
    features: [
      { icon: "gem",     title: "A flower of light",    text: "Cubic zirconia stones set in a 16 mm flower that catches every bit of light." },
      { icon: "feather", title: "Light as a feather",   text: "About 4.3 g for the pair, so you can wear them all night." },
      { icon: "moon",    title: "Made for after dark",  text: "Gothic elegance that works with black lace as well as a plain tee, day or night." },
      { icon: "shield",  title: "925 silver posts",     text: "The part that goes through your ear is 925 sterling silver." }
    ],

    // Lifestyle photos (worn / model shots), shown as ONE row of photos without captions
    // that visitors swipe (phone) or scroll with arrows (desktop). 4–8 photos look best.
    // Size: 1200 × 1500 px (portrait 4:5). Tapping a photo opens it large.
    lifestyle: {
      title: "Worn in the dark",
      subtitle: "How it looks in real life.",
      photos: [
        { src: "images/lifestyle-1.jpg", alt: "Woman with dark hair wearing the flower stud earring, close-up of the ear" },
        { src: "images/lifestyle-2.jpg", alt: "The flower stud earrings in bright sunlight, throwing small sparkles of light" },
        { src: "images/lifestyle-3.jpg", alt: "Woman with blonde hair wearing the flower stud earring, close-up of the ear" },
        { src: "images/lifestyle-4.jpg", alt: "The pair of flower stud earrings resting on two fingers" },
        { src: "images/lifestyle-5.jpg", alt: "The flower stud earrings held between finger and thumb" },
        { src: "images/lifestyle-6.jpg", alt: "The pair of flower stud earrings in the palm of a hand" },
        { src: "images/lifestyle-7.jpg", alt: "The flower stud earrings on a jewelry tray" },
        { src: "images/lifestyle-8.jpg", alt: "The pair of flower stud earrings on a marble surface" },
        { src: "images/lifestyle-9.jpg", alt: "One flower stud earring held between two fingers, showing its size" }
      ]
    },

    // Details section. Leave a value "" to hide that row.
    details: {
      material: "925 sterling silver posts",  // the flower setting: add its metal once the supplier confirms it in writing
      stone: "Cubic zirconia (lab-created)",
      dimensions: "Flower 16 mm across",
      weight: "About 4.3 g per pair",        // from the supplier listing: weigh your own sample to confirm
      care: [
        "Take it off before showering, swimming or exercising.",
        "Put on perfume, lotion and hairspray before your jewelry.",
        "Store it dry, in its pouch, away from other pieces.",
        "Clean gently with a soft, dry cloth.",
        "Handle the posts gently: 925 silver is soft and can bend."
      ],
      allergyNote: "The posts (the part that goes through your ear) are 925 sterling silver.",   // only add "nickel-free" / "hypoallergenic" with a test report
      extra: [
        { label: "Closure", value: "Push-back" },
        { label: "Sold as", value: "A pair (2 earrings)" }   // confirm with the supplier that 1 piece = 1 pair
      ]
    },

    // Product safety information, required for online sales in the EU
    // (General Product Safety Regulation (EU) 2023/988, art. 19).
    safety: {
      manufacturer: "",                      // TODO_MANUFACTURER before shop mode: your company name, address and email (selling under your own brand makes you the manufacturer)
      euResponsiblePerson: "",               // only if the manufacturer is outside the EU: name + address of the EU responsible person
      identifier: "",                        // type / batch / model number (defaults to the SKU when empty)
      warnings: "Contains small parts. Keep away from children under 3. Not a toy."
    }
  },

  /* ------------------------------------------------------------------------
     TRUST ROW (under the product, shop mode only). Icons: see features above.
     ------------------------------------------------------------------------ */
  trust: [
    { icon: "lock",   title: "Secure checkout",                    text: "Encrypted payment via Stripe" },
    { icon: "globe",  title: "Free worldwide shipping",            text: "On every order, no minimum" },
    { icon: "truck",  title: "Delivery",                           text: "{deliverySummary}" },
    { icon: "return", title: "{withdrawalDays}-day right of withdrawal", text: "Changed your mind? [Returns](returns.html)" },
    { icon: "mail",   title: "Support",                            text: "{email}" }
  ],

  /* ------------------------------------------------------------------------
     SHIPPING (trust row, FAQ and shipping page)
     Adjust the times to what YOUR carrier really delivers.
     ------------------------------------------------------------------------ */
  shipping: {
    shipsFrom: "Belgium",
    processingTime: "1–2 business days",
    deliverySummary: "EU 3–8 · worldwide 7–20 business days",
    carrier: "TODO_CARRIER",                 // e.g. "bpost" / "PostNL" / "DHL"
    deliveryTimes: [
      { region: "Belgium",                                 time: "1–3 business days" },
      { region: "Netherlands, Luxembourg, France, Germany", time: "2–5 business days" },
      { region: "Rest of the European Union",              time: "3–8 business days" },
      { region: "United Kingdom, Switzerland, Norway",     time: "5–10 business days" },
      { region: "United States & Canada",                  time: "7–14 business days" },
      { region: "Rest of the world",                       time: "10–20 business days" }
    ],
    customsNote: "Orders shipped outside the European Union may be subject to import duties, taxes (such as VAT or GST) and customs handling fees charged by the destination country. These are not included in our price and are paid by the recipient. Please check your country's import rules before ordering."
  },

  /* ------------------------------------------------------------------------
     RETURNS / RIGHT OF WITHDRAWAL
     ------------------------------------------------------------------------ */
  returns: {
    withdrawalDays: 14,                      // legal minimum in the EU is 14 days
    refundDays: 14,
    returnAddress: "",                       // leave "" to use the company address above
    returnCostText: "You pay the direct cost of sending the item back."   // or "We cover the cost of the return."
  },

  /* ------------------------------------------------------------------------
     CUSTOMER REVIEWS  (shop mode only)
     ------------------------------------------------------------------------
     ⚠ ONLY real reviews from real customers. Fake or invented reviews are
     illegal in the EU (Unfair Commercial Practices Directive, Annex I, 23b–23c).
     While this list is empty the whole review section and the star rating are
     hidden automatically. Ratings and averages are calculated from this list.

     To add a review: copy the example block inside [ ] below, remove the //
     at the start of each line and fill it in. Separate reviews with a comma.
     ------------------------------------------------------------------------ */
  reviewsPerPage: 6,
  reviewsNote: "Reviews are sent to us by customers by email after delivery. Reviews marked “Verified purchase” have been checked against our order records.",
  reviews: [
    // {
    //   name: "Firstname L.",
    //   country: "Belgium",
    //   date: "2026-11-02",                    // YYYY-MM-DD
    //   rating: 5,                             // 1 to 5
    //   text: "What the customer wrote, unedited.",
    //   photo: "images/reviews/review-1.jpg",  // optional: delete this line if there is no photo
    //   verified: true                         // ONLY true if you checked that this person bought from you
    // },
  ],

  /* ------------------------------------------------------------------------
     FAQ  (shop mode only; wishlist mode uses wishlist.faq. Answers can be one text or a list)
     ------------------------------------------------------------------------ */
  faq: [
    {
      q: "How long does delivery take?",
      a: "Orders are shipped from {shipsFrom} within {processingTime}. Delivery then usually takes {deliverySummary}. You receive a tracking link by email as soon as your parcel is on its way. All details: [shipping information](shipping.html)."
    },
    {
      q: "Is shipping really free? Will I pay customs fees?",
      a: "Yes, shipping is free to every country. For orders outside the European Union, your country's customs may charge import duties or taxes, which are not included in our price."
    },
    {
      q: "Can I return my order?",
      a: "Yes. You can withdraw from your purchase within {withdrawalDays} days after you receive it, without giving a reason. Just email us at {email}. Read the full [returns & withdrawal policy](returns.html)."
    },
    {
      q: "What is it made of? Is it suitable for sensitive skin?",
      a: ["Material: {material}.", "{allergyNote}"]
    },
    {
      q: "How do I take care of my jewelry?",
      a: "Take it off before showering or swimming, keep perfume and lotions away from it, and store it dry in its pouch. A soft, dry cloth is all you need to clean it."
    },
    {
      q: "How can I contact you?",
      a: "Email us at {email}. We usually reply within {responseTime}."
    }
  ],

  /* ------------------------------------------------------------------------
     THANK-YOU PAGE (success.html, where Stripe sends customers after paying, shop mode)
     ------------------------------------------------------------------------ */
  success: {
    title: "Thank you for your order",
    message: "Your payment was successful. Stripe will email you a receipt within a few minutes.",
    steps: [
      "We prepare and ship your order within {processingTime}.",
      "As soon as it ships, you receive a tracking link by email.",
      "Questions about your order? Email us at {email}."
    ],
    button: "Back to the shop"
  },

  /* ------------------------------------------------------------------------
     LEGAL PAGES
     ------------------------------------------------------------------------ */
  legal: {
    lastUpdated: "21 October 2026",
    orderRetention: "TODO_RETENTION_PERIOD"  // how long you keep order/invoice data. Ask your accountant (Belgium: currently up to 10 years for accounting documents)
  },

  /* 404 page (shown for addresses that don't exist) */
  notFound: {
    title: "This page flew away",
    message: "The page you are looking for doesn't exist or has moved.",
    button: "Back to the shop"
  },

  footer: {
    note: "Payments are processed securely by Stripe. We never see or store your card details."
  },

  /* ------------------------------------------------------------------------
     BUTTONS, HEADINGS & SMALL TEXTS
     ------------------------------------------------------------------------ */
  labels: {
    buyNow: "Buy now",
    soldOut: "Sold out",
    price: "Price:",
    salePrice: "Sale price:",
    regularPrice: "Regular price:",
    secureCheckout: "Secure checkout with Stripe",
    checkoutNotReady: "Checkout isn't set up yet. Add the Stripe Payment Link for this option in config.js.",
    enlarge: "Enlarge photo",
    showPhoto: "Show photo {n}",
    tapToEnlarge: "Tap to enlarge",
    nav: { story: "Story", details: "Details", reviews: "Reviews", faq: "FAQ" },
    countdown: { days: "Days", hours: "Hours", mins: "Mins", secs: "Secs" },
    timeLeft: { day: "DAY", days: "DAYS", hour: "HOUR", hours: "HOURS", minute: "MINUTE", minutes: "MINUTES" },
    trustTitle: "Why shop with us",
    detailsTitle: "Details",
    detailsSubtitle: "Everything you want to know before you order.",
    details: { material: "Material", stone: "Stone", dimensions: "Dimensions", weight: "Weight", care: "Care", allergy: "Allergy note" },
    safetyTitle: "Product safety information",
    safety: { manufacturer: "Manufacturer", euResponsible: "EU responsible person", identifier: "Product identifier", warnings: "Warnings" },
    reviewsTitle: "Customer reviews",
    reviewCountOne: "1 review",
    reviewCountMany: "{count} reviews",
    basedOn: "Based on {count}",
    ratingAria: "Rated {rating} out of 5",
    verified: "Verified purchase",
    showMore: "Show more reviews",
    reviewPhotoAlt: "Photo from {name}",
    faqTitle: "Frequently asked questions",
    stickyBuy: "Buy now",
    backToShop: "Back to the shop"
  }
};
