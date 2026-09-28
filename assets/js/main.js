/* ============================================================
   USAMA HABIB PORTFOLIO — main.js (Step 1: Home Page)
   - Mobile nav, sticky header, scroll-reveal, genuine counters
   - SITE_CONFIG: single place for editable text (Admin Panel
     will read/write these same fields in Step 7).
   ============================================================ */

/* EDITABLE: site content config — future Admin Panel manages these */
const SITE_CONFIG = {
  tagline: "",            // empty = keep the default tagline in index.html
  monthsExperience: 6,    // genuine number
  productImages: "50+",   // PLACEHOLDER — confirm final number
  categories: 8,          // PLACEHOLDER — confirm final number
  socials: {              // DEMO links — replace with Usama's real links before launch
    email: "hello@usamahabib.demo",
    whatsapp: "https://wa.me/920000000000",
    instagram: "https://instagram.com/usama.habib.demo",
    facebook: "https://facebook.com/usamahabib.demo",
    linkedin: "https://linkedin.com/in/usamahabib-demo",
    behance: "https://behance.net/usamahabibdemo"
  }
};

(function () {
  "use strict";

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- sticky header ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  const toggle = document.getElementById("navToggle");
  const linksBox = document.getElementById("navLinks");
  if (toggle && linksBox) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    linksBox.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => document.body.classList.remove("nav-open"))
    );
  }

  /* ---------- scroll reveal (subtle, staggered via data-delay) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || "0", 10);
        setTimeout(() => el.classList.add("in"), delay);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- animated counters — ONLY for genuine numbers ----------
     Rule: elements animate only when data-genuine="true". Placeholders
     stay static so they are never mistaken for verified figures. */
  const counters = document.querySelectorAll("[data-count][data-genuine='true']");
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const dur = 1200, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window && counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        animateCount(e.target);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- social / contact links from config ----------
     Empty values stay as dashed "add link" placeholders. */
  const lastSeg = (u) => { try { const p = new URL(u).pathname.split("/").filter(Boolean); return p[p.length - 1] || u; } catch (e) { return u; } };
  const socialDisplay = (key, url) => {
    if (key === "email") return url;
    if (key === "whatsapp") { const d = String(url).replace(/\D/g, ""); return d ? "+" + d : url; }
    if (key === "linkedin") return "in/" + lastSeg(url);
    if (key === "behance") return lastSeg(url);
    return "@" + lastSeg(url);
  };
  document.querySelectorAll("[data-social]").forEach((a) => {
    const key = a.dataset.social;
    const src = (window.UH && UH.store && UH.store.contact) ? UH.store.contact : SITE_CONFIG.socials;
    const url = src[key] || "";
    if (url) {
      a.href = key === "email" ? "mailto:" + url : url;
      a.removeAttribute("data-empty");
      a.title = "";
      const disp = a.querySelector("[data-social-text]");
      if (disp) disp.textContent = socialDisplay(key, url);
      if (/add link/i.test(a.textContent)) {
        // email shows the address; others keep their label (e.g. "WhatsApp")
        a.textContent = key === "email" ? url : a.textContent.replace(/\s*[\u2014\u2013-]\s*add link/i, "");
      }
      if (key !== "email") { a.target = "_blank"; a.rel = "noopener"; }
    } else {
      a.setAttribute("data-empty", "true");
      a.addEventListener("click", (ev) => {
        if (a.getAttribute("href") === "#") ev.preventDefault();
      });
    }
  });

  /* ---------- config tagline override (Admin Panel later) ---------- */
  if (SITE_CONFIG.tagline) {
    const t = document.querySelector("[data-config='tagline']");
    if (t) t.textContent = SITE_CONFIG.tagline;
  }
})();
