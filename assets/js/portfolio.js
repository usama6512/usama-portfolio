/* ============================================================
   PORTFOLIO PAGE (Step 2)
   - Category cards -> filter + scroll
   - Filter tabs with live counts + staggered reveal
   - Lightbox with keyboard nav (Esc / arrows)
   NOTE: Before/after retouching pairs will be added here only
   when genuine retouching examples are supplied (content rule).
   ============================================================ */
(function () {
  "use strict";

  /* EDITABLE: category labels + client-aimed descriptions (Admin Panel later) */
  const CATS = {
    all:       { label: "All Work",              desc: "The complete collection — every product study across all eight categories." },
    ecommerce: { label: "E-commerce & Amazon",   desc: "Clean white-background shots that present products clearly on Amazon, Shopify, and marketplaces." },
    perfume:   { label: "Perfume & Fragrance",   desc: "Mood-driven bottle photography — light, texture, and atmosphere matched to the scent." },
    skincare:  { label: "Skincare & Beauty",     desc: "Fresh, clean beauty visuals with accurate color and delicate detail." },
    jewelry:   { label: "Jewelry & Accessories", desc: "Macro-level sparkle and shine, crafted to show fine craftsmanship." },
    watches:   { label: "Watches",               desc: "Precision close-ups and dramatic light for timepieces that deserve attention." },
    food:      { label: "Food & Beverage",       desc: "Rich, appetizing shots styled for packaging, menus, and promotions." },
    lifestyle: { label: "Lifestyle Products",    desc: "Products in real-world settings that help buyers picture them in their own life." },
    creative:  { label: "Creative / Commercial", desc: "Bold, conceptual visuals for campaigns, ads, and standout brand content." }
  };

  const tabs     = Array.from(document.querySelectorAll(".tab"));
  const items    = Array.from(document.querySelectorAll(".gal-item"));
  const grid     = document.getElementById("galGrid");
  const galCount = document.getElementById("galCount");
  const galDesc  = document.getElementById("galDesc");
  if (!tabs.length || !items.length || !grid) return;

  let currentFilter = "all";
  let timers = [];
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  /* ---------- live counts (single source of truth = the grid items) ---------- */
  const countFor = (f) => f === "all" ? items.length : items.filter(i => i.dataset.cat === f).length;
  tabs.forEach(t => {
    const n = t.querySelector(".tab__n");
    if (n) n.textContent = countFor(t.dataset.filter);
  });
  document.querySelectorAll("[data-countfor]").forEach(el => {
    const n = countFor(el.dataset.countfor);
    el.textContent = n + (n === 1 ? " work" : " works");
  });
  const heroTotal = document.getElementById("heroTotal");
  if (heroTotal) heroTotal.textContent = items.length;

  /* ---------- filtering with staggered reveal ---------- */
  function applyFilter(f) {
    currentFilter = f;
    clearTimers();
    tabs.forEach(t => t.classList.toggle("active", t.dataset.filter === f));
    const visible = items.filter(i => f === "all" || i.dataset.cat === f);
    items.forEach(i => {
      const show = f === "all" || i.dataset.cat === f;
      i.classList.remove("show");
      i.classList.toggle("hide", !show);
    });
    if (galCount) galCount.textContent = `Showing ${visible.length} of ${items.length} works`;
    if (galDesc)  galDesc.textContent = ((window.UH && UH.catDesc) ? UH.catDesc(f) : "") || (CATS[f] && CATS[f].desc) || "";
    // staggered entrance
    requestAnimationFrame(() => requestAnimationFrame(() => {
      visible.forEach((el, idx) => {
        timers.push(setTimeout(() => el.classList.add("show"), Math.min(idx, 11) * 70));
      });
    }));
  }

  tabs.forEach(t => t.addEventListener("click", () => applyFilter(t.dataset.filter)));

  /* category cards jump to a filtered gallery */
  document.querySelectorAll("[data-goto]").forEach(card => {
    card.addEventListener("click", (ev) => {
      ev.preventDefault();
      applyFilter(card.dataset.goto);
      document.getElementById("gallery").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* first reveal when the grid scrolls into view */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        applyFilter(currentFilter);
        io.disconnect();
      });
    }, { threshold: 0.08 });
    io.observe(grid);
  } else {
    applyFilter("all");
  }

  /* ---------- lightbox ---------- */
  const lb      = document.getElementById("lightbox");
  const lbImg   = document.getElementById("lbImg");
  const lbPill  = document.getElementById("lbPill");
  const lbTitle = document.getElementById("lbTitle");
  const lbDesc  = document.getElementById("lbDesc");
  const lbCount = document.getElementById("lbCount");
  const prevBtn = lb.querySelector(".lb__prev");
  const nextBtn = lb.querySelector(".lb__next");
  let lbList = [], lbIndex = 0;

  const visibleItems = () => items.filter(i => !i.classList.contains("hide"));

  function renderLb() {
    const item = lbList[lbIndex];
    if (!item) return;
    const img = item.querySelector("img");
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || item.dataset.title || "Portfolio image";
    const cat = CATS[item.dataset.cat];
    const liveLabel = (window.UH && UH.catLabel) ? UH.catLabel(item.dataset.cat) : null;
    lbPill.textContent = liveLabel || (cat ? cat.label : "");
    lbTitle.textContent = item.dataset.title || "Untitled study";
    lbDesc.textContent = item.dataset.desc || "";
    lbCount.textContent = `${lbIndex + 1} / ${lbList.length}`;
  }
  function openLb(item) {
    lbList = visibleItems();
    lbIndex = Math.max(lbList.indexOf(item), 0);
    renderLb();
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  const stepLb = (d) => {
    if (!lbList.length) return;
    lbIndex = (lbIndex + d + lbList.length) % lbList.length;
    renderLb();
  };

  items.forEach(item => {
    item.addEventListener("click", () => openLb(item));
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(item); }
    });
  });
  prevBtn.addEventListener("click", (e) => { e.stopPropagation(); stepLb(-1); });
  nextBtn.addEventListener("click", (e) => { e.stopPropagation(); stepLb(1); });
  lb.querySelectorAll("[data-lb-close]").forEach(el =>
    el.addEventListener("click", closeLb));
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") stepLb(-1);
    if (e.key === "ArrowRight") stepLb(1);
  });
})();
