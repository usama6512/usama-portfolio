/* ============================================================
   UH ENGINE v1 — content store, themes, dynamic rendering.
   Load BEFORE main.js on every public page + admin.html.
   Content priority: localStorage edits > UH_PUBLISHED file > DEFAULTS.
   ============================================================ */
(function () {
"use strict";
const LS_KEY = "uh_store_v1";

/* ---------------- DEFAULTS (mirror the shipped site) ---------------- */
const DEFAULTS = {
  version: 1,
  theme: { preset: "charcoal-orange", primary: "#FF6B1A", secondary: "#3B82F6" },
  home: { tagline: "", images: "50+", categories: "8" },
  contact: {
    email: "hello@usamahabib.demo",
    whatsapp: "https://wa.me/920000000000",
    instagram: "https://instagram.com/usama.habib.demo",
    facebook: "https://facebook.com/usamahabib.demo",
    linkedin: "https://linkedin.com/in/usamahabib-demo",
    behance: "https://behance.net/usamahabibdemo"
  },
  portfolio: {
    categories: [
      { id: "ecommerce", label: "E-commerce & Amazon", short: "E-commerce", cover: "assets/images/ecom-headphones.jpg", desc: "Clean listing shots for Amazon, Shopify, and marketplaces." },
      { id: "perfume", label: "Perfume & Fragrance", short: "Perfume", cover: "assets/images/work-perfume-blue.jpg", desc: "Mood-driven bottle photography matched to the scent." },
      { id: "skincare", label: "Skincare & Beauty", short: "Skincare", cover: "assets/images/work-serum.jpg", desc: "Fresh beauty visuals with accurate color and detail." },
      { id: "jewelry", label: "Jewelry & Accessories", short: "Jewelry", cover: "assets/images/work-rings.jpg", desc: "Macro sparkle that shows fine craftsmanship." },
      { id: "watches", label: "Watches", short: "Watches", cover: "assets/images/work-watch-beige.jpg", desc: "Precision close-ups and dramatic light for timepieces." },
      { id: "food", label: "Food & Beverage", short: "Food & Drink", cover: "assets/images/work-juice.jpg", desc: "Rich, appetizing shots for packaging and promos." },
      { id: "lifestyle", label: "Lifestyle Products", short: "Lifestyle", cover: "assets/images/work-candle.jpg", desc: "Products in real-world settings buyers relate to." },
      { id: "creative", label: "Creative / Commercial", short: "Creative", cover: "assets/images/work-sneaker.jpg", desc: "Bold conceptual visuals for campaigns and ads." }
    ],
    items: [
      { src: "assets/images/ecom-headphones.jpg", cat: "ecommerce", title: "Headphones · Listing Shot", desc: "Clean front three-quarter angle on pure white — crisp edges, true color, marketplace-ready.", wide: false },
      { src: "assets/images/work-watch.jpg", cat: "watches", title: "Chronograph Detail", desc: "Macro watch study with cinematic orange and blue studio lighting.", wide: false },
      { src: "assets/images/work-serum.jpg", cat: "skincare", title: "Dewy Serum Macro", desc: "Fresh beauty macro — glass dropper with fine water droplets on a soft pastel backdrop.", wide: false },
      { src: "assets/images/work-coffee.jpg", cat: "food", title: "Roast & Pour", desc: "Moody coffee study — matte bag, roasted beans, and a warm ceramic pour.", wide: false },
      { src: "assets/images/work-sneaker.jpg", cat: "creative", title: "Motion Sneaker Study", desc: "Floating sneaker frozen mid-air with dramatic orange and blue light — built for campaigns.", wide: true },
      { src: "assets/images/work-jewelry.jpg", cat: "jewelry", title: "Gold Pendant Macro", desc: "Close-up jewelry study on dark silk — soft spotlight tracing the gold.", wide: false },
      { src: "assets/images/ecom-bottle.jpg", cat: "ecommerce", title: "Pump Bottle · Listing Shot", desc: "Minimal pump bottle centered on pure white with a soft natural shadow.", wide: false },
      { src: "assets/images/work-perfume-blue.jpg", cat: "perfume", title: "Blue Bottle Splash", desc: "Deep-blue fragrance bottle with a frozen water splash — fresh, premium, full of motion.", wide: false },
      { src: "assets/images/work-candle.jpg", cat: "lifestyle", title: "Amber Candle Scene", desc: "Cozy lifestyle scene — amber candle, eucalyptus, and warm window light.", wide: false },
      { src: "assets/images/work-rings.jpg", cat: "jewelry", title: "Gold Rings Macro", desc: "Twin gold bands on a dark reflective surface, sparkling under a soft spotlight.", wide: false },
      { src: "assets/images/work-skincare.jpg", cat: "ecommerce", title: "Clean Listing Shot", desc: "Skincare jar isolated on pure white — the listing-ready standard for online stores.", wide: true },
      { src: "assets/images/hero-perfume.jpg", cat: "perfume", title: "Cinematic Fragrance Hero", desc: "Matte black bottle with gold cap — orange glow against electric-blue rim light.", wide: true },
      { src: "assets/images/work-juice.jpg", cat: "food", title: "Citrus Splash", desc: "Juice bottle with fresh orange splash frozen mid-motion — bright and thirst-quenching.", wide: false },
      { src: "assets/images/work-watch-beige.jpg", cat: "watches", title: "Minimal Strap Study", desc: "Tan leather strap watch on a beige podium in soft warm daylight.", wide: false },
      { src: "assets/images/work-cream.jpg", cat: "skincare", title: "Cream Texture Study", desc: "Open cream jar with an elegant swirl — beauty editorial styling on soft pink.", wide: false },
      { src: "assets/images/work-perfume.jpg", cat: "perfume", title: "Amber Bottle Study", desc: "Amber glass bottle on a stone podium — quiet luxury with soft long shadows.", wide: false },
      { src: "assets/images/work-backpack.jpg", cat: "lifestyle", title: "Canvas Backpack Scene", desc: "Warm lifestyle styling — canvas backpack in soft golden sunlight with greenery.", wide: false }
    ]
  },
  featured: [
    "assets/images/work-sneaker.jpg",
    "assets/images/work-watch.jpg",
    "assets/images/work-skincare.jpg",
    "assets/images/work-perfume.jpg",
    "assets/images/work-jewelry.jpg"
  ],
  about: {
    story: "",
    portrait: "",
    skills: [
      { name: "Product Photography", level: 85, label: "Strong" },
      { name: "E-commerce Photography", level: 82, label: "Strong" },
      { name: "White-Background Images", level: 88, label: "Strong" },
      { name: "Lighting", level: 80, label: "Solid" },
      { name: "Composition", level: 84, label: "Strong" },
      { name: "Lifestyle Product Photography", level: 76, label: "Growing" },
      { name: "Creative Product Photography", level: 78, label: "Growing" },
      { name: "Retouching / Image Enhancement", level: 74, label: "Growing" }
    ]
  },
  services: [
    { title: "Product Photography", kicker: "Studio", img: "assets/images/work-perfume.jpg", desc: "Professional images designed to present your products clearly and attractively — sharp detail, true color, and clean styling.", includes: ["Studio lighting tailored to your product", "Multiple angles plus detail close-ups", "High-resolution edited files"], tags: ["Brands", "Makers", "Small Businesses"], price: "" },
    { title: "E-commerce Product Images", kicker: "Online Stores", img: "assets/images/ecom-headphones.jpg", desc: "Clean product images for online stores and marketplaces — consistent, professional, and ready for your catalog.", includes: ["Pure white & neutral backgrounds", "Consistent framing across products", "Web-ready + full-resolution files"], tags: ["Online Stores", "Marketplaces", "Catalogs"], price: "" },
    { title: "Amazon / Product Listing Images", kicker: "Marketplaces", img: "assets/images/ecom-bottle.jpg", desc: "Clean, listing-focused visuals with sharp detail — formatted to slot straight into your product listings.", includes: ["Clean white-background hero shots", "Detail crops that show quality", "Consistent gallery styling"], tags: ["Amazon Sellers", "Listings", "Resellers"], price: "" },
    { title: "Lifestyle Product Photography", kicker: "In Context", img: "assets/images/work-candle.jpg", desc: "Products photographed in contextual environments — styled scenes that help buyers picture your product in their life.", includes: ["Styled scenes with props", "Natural-light lifestyle looks", "Mood matched to your brand"], tags: ["Home Goods", "Beauty", "Food Brands"], price: "" },
    { title: "Creative / Commercial Photography", kicker: "Campaigns", img: "assets/images/work-sneaker.jpg", desc: "Visually distinctive images for brands and promotional use — concept-driven shots designed to stand out.", includes: ["Concept & mood direction", "Dramatic light and effects", "Social + ad-friendly crops"], tags: ["Campaigns", "Social Content", "Brand Launches"], price: "" },
    { title: "Retouching & Enhancement", kicker: "Finishing", img: "assets/images/work-rings.jpg", desc: "Professional finishing for product images — cleanup, background work, color correction, and detail refinement.", includes: ["Dust, scratch & imperfection cleanup", "Background cleanup & whitening", "Color correction & final polish"], tags: ["Listing Refreshes", "Catalog Consistency", "Final Polish"], price: "" }
  ],
  pricesEnabled: false,
  reels: [],
  testimonials: [],
  awards: [],
  auth: null
};

/* ---------------- store ---------------- */
const clone = (o) => JSON.parse(JSON.stringify(o));
function loadStore() {
  const s = clone(DEFAULTS);
  if (window.UH_PUBLISHED && typeof window.UH_PUBLISHED === "object") {
    Object.assign(s, clone(window.UH_PUBLISHED));
  }
  try {
    const o = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (o && typeof o === "object") Object.assign(s, o);
  } catch (e) { /* private mode etc. */ }
  Object.keys(DEFAULTS).forEach((k) => { if (s[k] === undefined) s[k] = clone(DEFAULTS[k]); });
  return s;
}
window.UH = {
  DEFAULTS: clone(DEFAULTS),
  store: loadStore(),
  LS_KEY: LS_KEY,
  save(patch) {
    Object.assign(window.UH.store, patch || {});
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(window.UH.store));
      return { ok: true };
    } catch (e) {
      return { error: "Browser storage is full — use smaller images or the Publish file instead." };
    }
  },
  reset() { try { localStorage.removeItem(LS_KEY); } catch (e) {} },
  hasOverride() { try { return !!localStorage.getItem(LS_KEY); } catch (e) { return false; } },
  catLabel(id) {
    if (id === "all") return "All Work";
    const c = (window.UH.store.portfolio.categories || []).find((x) => x.id === id);
    return c ? c.label : id;
  },
  catDesc(id) {
    if (id === "all") return "The complete collection — every product study across all categories.";
    const c = (window.UH.store.portfolio.categories || []).find((x) => x.id === id);
    return c ? c.desc : "";
  }
};
const store = window.UH.store;
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------------- themes ---------------- */
const THEMES = {
  "charcoal-orange": null, // = shipped defaults
  "midnight-blue":  { bg: "#060B16", bg2: "#0A1222", card: "#0D1526", card2: "#111B30", primary: "#FF8A3D", secondary: "#4D9FFF" },
  "slate-purple":   { bg: "#0E0B15", bg2: "#141021", card: "#171127", card2: "#1D1533", primary: "#B18CFF", secondary: "#6E8CFB" },
  "emerald-dark":   { bg: "#070E0C", bg2: "#0B1512", card: "#0E1A15", card2: "#12241D", primary: "#34D399", secondary: "#22D3EE" }
};
function hexRGB(hex) {
  let h = String(hex || "").replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (isNaN(n)) return [255, 107, 26];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const hexA = (hex, a) => { const c = hexRGB(hex); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
function lighten(hex, amt) {
  const c = hexRGB(hex).map((v) => Math.round(v + (255 - v) * amt));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
function applyTheme() {
  const t = store.theme || {};
  const preset = THEMES[t.preset] || null;
  const primary = t.primary || (preset && preset.primary) || "#FF6B1A";
  const secondary = t.secondary || (preset && preset.secondary) || "#3B82F6";
  const r = document.documentElement.style;
  if (preset) {
    r.setProperty("--bg", preset.bg); r.setProperty("--bg-2", preset.bg2);
    r.setProperty("--card", preset.card); r.setProperty("--card-2", preset.card2);
  }
  r.setProperty("--orange", primary); r.setProperty("--blue", secondary);
  r.setProperty("--orange-soft", hexA(primary, 0.14));
  r.setProperty("--blue-soft", hexA(secondary, 0.14));
  r.setProperty("--grad-main", `linear-gradient(135deg,${primary},${lighten(primary, 0.35)})`);
  r.setProperty("--grad-cool", `linear-gradient(135deg,${secondary},${lighten(secondary, 0.35)})`);
  r.setProperty("--grad-ring", `linear-gradient(135deg,${hexA(primary, 0.65)},${hexA(secondary, 0.65)})`);
}

/* ---------------- injected styles for dynamic sections ---------------- */
function injectStyles() {
  if (document.getElementById("uh-dyn-css")) return;
  const st = document.createElement("style");
  st.id = "uh-dyn-css";
  st.textContent = `
  .reels-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .reel-card{position:relative;display:block;background:var(--card);border:1px solid var(--line);
    border-radius:var(--radius);padding:30px 28px;overflow:hidden;
    transition:transform .35s var(--ease),border-color .35s,box-shadow .35s}
  .reel-card::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;
    background:linear-gradient(90deg,var(--orange),var(--blue));opacity:0;transition:opacity .35s}
  .reel-card:hover{transform:translateY(-7px);border-color:rgba(255,255,255,.18);
    box-shadow:var(--shadow-lg)}
  .reel-card:hover::before{opacity:1}
  .reel-plat{display:inline-block;font-size:.68rem;font-weight:700;letter-spacing:1.8px;
    text-transform:uppercase;color:#7FB0FF;background:var(--blue-soft);
    border:1px solid rgba(59,130,246,.4);padding:5px 13px;border-radius:999px;margin-bottom:16px}
  .reel-play{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;margin-bottom:18px;
    background:var(--grad-main);box-shadow:0 12px 28px -10px rgba(255,107,26,.6)}
  .reel-play svg{width:24px;height:24px;fill:#160800;margin-left:3px}
  .reel-card h3{font-family:var(--font-display);font-size:1.08rem;margin-bottom:6px}
  .reel-card p{color:var(--muted);font-size:.85rem;word-break:break-all}
  .reel-card .rl-go{display:inline-block;margin-top:14px;font-weight:700;font-size:.88rem;color:var(--orange)}
  .tm-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .tm-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);
    padding:32px 30px;transition:transform .35s var(--ease),border-color .35s}
  .tm-card:hover{transform:translateY(-6px);border-color:rgba(255,255,255,.18)}
  .tm-stars{color:#FFB25E;letter-spacing:3px;font-size:.95rem;margin-bottom:14px}
  .tm-card blockquote{font-size:.99rem;color:#dfe2ea;margin-bottom:18px}
  .tm-card h4{font-family:var(--font-display);font-size:.95rem}
  .tm-card small{color:var(--faint);font-size:.82rem}
  .aw-panel{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);
    padding:14px 34px}
  .aw-item{display:flex;gap:18px;align-items:baseline;padding:20px 0;border-bottom:1px solid var(--line-soft)}
  .aw-item:last-child{border-bottom:none}
  .aw-item::before{content:"◆";color:var(--orange);font-size:.8rem}
  .aw-item strong{font-family:var(--font-display);font-size:1.02rem;display:block}
  .aw-item span{color:var(--muted);font-size:.9rem}
  .svc-price{display:inline-block;font-family:var(--font-display);font-weight:700;font-size:1rem;
    color:#160800;background:var(--grad-main);border-radius:999px;padding:8px 22px;margin:6px 0 4px;
    box-shadow:0 10px 24px -10px rgba(255,107,26,.6)}
  @media(max-width:900px){.reels-grid,.tm-grid{grid-template-columns:1fr}}`;
  document.head.appendChild(st);
}

/* ---------------- renderers (feature-detected per page) ---------------- */
const ZOOM_SVG = '<span class="gal-zoom"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span>';
const ARROW_SVG = '<span class="work__arrow"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
const CHECK_SVG = '<span class="check"><svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>';

function renderPortfolio() {
  const grid = document.getElementById("galGrid");
  if (!grid) return;
  const pf = store.portfolio || window.UH.DEFAULTS.portfolio;
  const cats = pf.categories || [], items = pf.items || [];
  const labelOf = (id) => { const c = cats.find((x) => x.id === id); return c ? c.label : id; };
  const tabsBox = document.querySelector(".tabs");
  if (tabsBox) {
    tabsBox.innerHTML = `<button class="tab active" data-filter="all" role="tab">All Work <span class="tab__n"></span></button>` +
      cats.map((c) => `<button class="tab" data-filter="${esc(c.id)}" role="tab">${esc(c.short || c.label)} <span class="tab__n"></span></button>`).join("");
  }
  const cc = document.querySelector(".catcards");
  if (cc) {
    cc.innerHTML = cats.map((c, i) =>
      `<a class="catcard reveal" data-delay="${(i % 4) * 70}" href="#gallery" data-goto="${esc(c.id)}">` +
      `<div class="catcard__img"><img src="${esc(c.cover)}" alt="${esc(c.label)}" loading="lazy"><span class="catcard__n" data-countfor="${esc(c.id)}"></span></div>` +
      `<div class="catcard__body"><h3>${esc(c.label)}</h3><p>${esc(c.desc)}</p><span class="catcard__go">View category →</span></div></a>`
    ).join("");
  }
  grid.innerHTML = items.map((it) =>
    `<figure class="gal-item${it.wide ? " gal-item--wide" : ""}" data-cat="${esc(it.cat)}" data-title="${esc(it.title)}" data-desc="${esc(it.desc)}">` +
    `<img src="${esc(it.src)}" alt="${esc(it.title)}" loading="lazy">` +
    `<figcaption><span class="work__pill">${esc(labelOf(it.cat))}</span><h3>${esc(it.title)}</h3></figcaption>${ZOOM_SVG}</figure>`
  ).join("");
  const heroCats = document.querySelectorAll(".hero-count b");
  if (heroCats[1]) heroCats[1].textContent = cats.length;
}

function renderFeatured() {
  const grid = document.querySelector(".work-grid");
  if (!grid || document.getElementById("galGrid")) return; // home only
  const pf = store.portfolio || window.UH.DEFAULTS.portfolio;
  const bySrc = {};
  (pf.items || []).forEach((it) => { bySrc[it.src] = it; });
  const list = (store.featured || []).map((s) => bySrc[s]).filter(Boolean);
  if (!list.length) return;
  const labelOf = (id) => window.UH.catLabel(id);
  grid.innerHTML = list.map((it, i) =>
    `<article class="work${i === 0 ? " work--wide" : ""} reveal" data-delay="${i * 90}">` +
    `<img src="${esc(it.src)}" alt="${esc(it.title)}" loading="lazy">` +
    `<div class="work__meta"><div><span class="work__pill">${esc(labelOf(it.cat))}</span><h3>${esc(it.title)}</h3></div>${ARROW_SVG}</div></article>`
  ).join("");
}

function renderHomeMeta() {
  if (store.home.tagline) {
    const t = document.querySelector('[data-config="tagline"]');
    if (t) t.textContent = store.home.tagline;
  }
  const bars = document.querySelectorAll(".stats__bar .stat b");
  if (bars.length >= 3) {
    const setNum = (el, val) => {
      const m = String(val == null ? "" : val).match(/^([\d,.]+)(.*)$/);
      if (m) el.innerHTML = `${esc(m[1])}<em>${esc(m[2])}</em>`;
      else el.textContent = val;
    };
    setNum(bars[1], store.home.images);
    setNum(bars[2], store.home.categories);
  }
}

function renderAbout() {
  const sg = document.querySelector(".skills-grid");
  if (!sg) return;
  const ab = store.about || {};
  const skills = ab.skills || [];
  sg.innerHTML = skills.map((s, i) =>
    `<div class="skill reveal" data-delay="${i * 60}" style="--level:${Math.max(0, Math.min(100, +s.level || 0))}%">` +
    `<div class="skill__top"><h3>${esc(s.name)}</h3><span>${esc(s.label || "")}</span></div>` +
    `<div class="skill__bar"><i></i></div></div>`
  ).join("");
  if (ab.story && ab.story.trim()) {
    const box = document.querySelector(".story-box");
    if (box) {
      const paras = ab.story.split(/\n{2,}|\r?\n\r?\n/).map((p) => p.trim()).filter(Boolean);
      box.innerHTML = `<span class="story-box__tag">In His Own Words</span><h2>Usama's Story</h2>` +
        paras.map((p) => `<p>${esc(p)}</p>`).join("");
    }
  }
  if (ab.portrait) {
    const inner = document.querySelector(".portrait__inner");
    if (inner) {
      inner.style.padding = "0";
      inner.innerHTML = `<img src="${esc(ab.portrait)}" alt="Portrait of Usama Habib" style="width:100%;height:100%;object-fit:cover;border-radius:24px">`;
    }
  }
}

function renderServices() {
  const rows = document.querySelector(".svc-rows");
  if (!rows) return;
  const list = store.services || [];
  rows.innerHTML = list.map((s, i) => {
    const num = String(i + 1).padStart(2, "0");
    const inc = (s.includes || []).map((x) => `<li>${CHECK_SVG}${esc(x)}</li>`).join("");
    const tags = (s.tags || []).map((x) => `<span>${esc(x)}</span>`).join("");
    const price = (store.pricesEnabled && s.price) ? `<p class="svc-price">${esc(s.price)}</p>` : "";
    return `<article class="svc-row${i % 2 ? " svc-row--flip" : ""} reveal">` +
      `<div class="svc-row__img"><span class="svc-row__num">${num}</span><img src="${esc(s.img)}" alt="${esc(s.title)}" loading="lazy"></div>` +
      `<div class="svc-row__body"><span class="eyebrow eyebrow--blue"><span class="dot"></span>${esc(s.kicker || "Service")}</span>` +
      `<h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p>${price}` +
      `<ul class="check-list">${inc}</ul><div class="tags">${tags}</div>` +
      `<div class="svc-row__cta"><a href="contact.html" class="btn btn--primary btn--sm">Request This Service</a>` +
      `<a href="portfolio.html" class="link-arrow">See examples <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div></div></article>`;
  }).join("");
  const note = document.querySelector(".price-note");
  if (note && store.pricesEnabled) note.textContent = "Starting prices shown above · final quote depends on scope";
}

function platformOf(url) {
  const u = String(url || "").toLowerCase();
  if (u.includes("instagram")) return "Instagram";
  if (u.includes("tiktok")) return "TikTok";
  if (u.includes("youtube") || u.includes("youtu.be")) return "YouTube";
  if (u.includes("facebook") || u.includes("fb.watch")) return "Facebook";
  return "Video";
}
function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return String(url).slice(0, 42); }
}
function insertAfter(ref, node) { ref.parentNode.insertBefore(node, ref.nextSibling); }

function renderReels() {
  const work = document.getElementById("work");
  if (!work || !(store.reels || []).length) return;
  const sec = document.createElement("section");
  sec.id = "reels";
  sec.style.paddingTop = "0";
  sec.innerHTML = `<div class="wrap"><div class="sec-head reveal"><span class="eyebrow eyebrow--blue"><span class="dot"></span>Reels &amp; Motion</span>` +
    `<h2>Watch the Work <span class="grad-text">in Motion</span></h2>` +
    `<p>Short-form edits, behind-the-scenes clips, and product films — tap any card to watch.</p></div>` +
    `<div class="reels-grid">` + store.reels.map((r, i) =>
      `<a class="reel-card reveal" data-delay="${i * 80}" href="${esc(r.url)}" target="_blank" rel="noopener">` +
      `<span class="reel-plat">${esc(platformOf(r.url))}</span>` +
      `<span class="reel-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>` +
      `<h3>${esc(r.title || "Watch reel")}</h3><p>${esc(domainOf(r.url))}</p><span class="rl-go">Watch →</span></a>`
    ).join("") + `</div></div>`;
  insertAfter(work, sec);
}

function renderTestimonials() {
  const ap = document.getElementById("approach");
  if (!ap || !(store.testimonials || []).length) return;
  const sec = document.createElement("section");
  sec.id = "testimonials";
  sec.style.paddingTop = "0";
  sec.innerHTML = `<div class="wrap"><div class="sec-head center reveal"><span class="eyebrow"><span class="dot"></span>Client Words</span>` +
    `<h2>What Clients <span class="grad-text">Say</span></h2><p>Genuine feedback from real projects.</p></div><div class="tm-grid">` +
    store.testimonials.map((t, i) => {
      const stars = (+t.rating >= 1 && +t.rating <= 5)
        ? `<div class="tm-stars">${"★".repeat(+t.rating)}${"☆".repeat(5 - +t.rating)}</div>` : "";
      return `<div class="tm-card reveal" data-delay="${i * 80}">${stars}<blockquote>“${esc(t.text)}”</blockquote>` +
        `<h4>${esc(t.name)}</h4><small>${esc(t.role || "")}</small></div>`;
    }).join("") + `</div></div>`;
  insertAfter(ap, sec);
}

function renderAwards() {
  const sk = document.getElementById("skills");
  if (!sk || !(store.awards || []).length) return;
  const sec = document.createElement("section");
  sec.id = "experience";
  sec.style.paddingTop = "0";
  sec.innerHTML = `<div class="wrap"><div class="sec-head reveal"><span class="eyebrow eyebrow--blue"><span class="dot"></span>Experience &amp; Practice</span>` +
    `<h2>Milestones &amp; <span class="grad-text">Recognition</span></h2><p>Verified highlights from Usama's photography journey.</p></div>` +
    `<div class="aw-panel reveal">` + store.awards.map((a) =>
      `<div class="aw-item"><div><strong>${esc(a.title)}</strong><span>${esc(a.detail || "")}</span></div></div>`
    ).join("") + `</div></div>`;
  insertAfter(sk, sec);
}

/* ---------------- boot (runs before main.js / portfolio.js) ---------------- */
applyTheme();
renderHomeMeta();
renderPortfolio();
renderFeatured();
renderAbout();
renderServices();
if ((store.reels || []).length || (store.testimonials || []).length || (store.awards || []).length) {
  injectStyles();
  renderReels();
  renderTestimonials();
  renderAwards();
}
})();
