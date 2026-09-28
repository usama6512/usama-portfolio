# 🚀 Deploy Guide — Usama Habib Portfolio (Plain Language)

Your website is **complete and ready to go live**. This guide explains how to put
it on the internet and manage it afterwards. No technical background needed.

## What you have

A folder called `usama-portfolio` containing 6 pages (Home, Portfolio, About,
Services, Contact + private Admin Panel), all styling, code, and 17 photos.
There is no database and nothing to install — any web hosting can run it.

## Option 1 — Netlify (easiest, free) ⭐ recommended

1. Go to **app.netlify.com/drop** (create a free account if asked).
2. Drag your **`usama-portfolio` folder** onto the page.
3. Wait ~30 seconds — you get a live link like `usama-portfolio.netlify.app`. Done!
4. Optional: Site settings → Change site name → pick something like
   `usamahabib-photography` for a nicer link.

## Option 2 — Vercel (also easy, free)

1. Go to **vercel.com**, sign up, click **Add New → Project**.
2. Upload the `usama-portfolio` folder (or drag-drop on the import screen).
3. Click Deploy — you get a live link. Done!

## Option 3 — cPanel / shared hosting (HosterPK, HostGator, etc.)

1. Log in to cPanel → **File Manager** → open `public_html`.
2. Upload the `usama-portfolio-step8-FINAL.zip` file there.
3. Right-click the ZIP → **Extract** → move the files so `index.html`
   sits directly inside `public_html` (not in a subfolder).
4. Open your domain — the site is live.

## Want your own domain? (like usamahabib.com)

1. Buy the domain from any registrar (Namecheap, GoDaddy, PKNIC for `.pk`).
2. Netlify/Vercel: Site settings → Domains → Add custom domain → follow the
   2 DNS records it shows you (about 10 minutes of waiting).
3. cPanel hosting: the domain usually connects automatically during purchase.

## 🔑 Before you launch — 7-step checklist

- [ ] **Real contact links** — Admin → Contact & Socials (replace the 6 demo links)
- [ ] **Real photos** — replace the 17 sample JPGs in `assets/images/`
      (same filenames = zero extra work), or upload via Admin → Portfolio
- [ ] **Your story** — Admin → About & Skills → Story (your own words)
- [ ] **Your portrait** — Admin → About & Skills → Portrait
- [ ] **Tagline** — keep it or change it in Admin → Home Page
- [ ] **Prices** — keep hidden (quote-based) or enable in Admin → Services
- [ ] **Admin login** — change `admin / usama2026` in Backup & Publish

## 🔄 How to update the site later (2 minutes)

1. Open `admin.html` (locally or on your live site) and sign in.
2. Make edits → check them in the **Live Preview** tab.
3. Backup & Publish → **Download site-config.js**.
4. Upload that ONE file to `assets/js/` on your hosting (overwrite).
   (First time only: also add the one `<script>` line from the panel's
   3-step guide to each of the 5 pages and re-upload them.)

## 🛡️ Important: the Admin Panel

- The Admin login is a **simple lock, not bank security**. Two safe choices:
  - **A (recommended):** don't upload `admin.html` — edit on your computer only.
  - **B:** upload everything, but add password protection in your hosting
    panel (cPanel → Directory Privacy, or Cloudflare Access).
- The contact form opens the visitor's email app (demo mode). For direct
  online sending later, connect **Formspree** (free): create a form at
  formspree.io, then replace the form's submit behavior — a 5-minute job
  for any developer, or ask me.

## 💰 What does it cost?

- Hosting on Netlify/Vercel: **free**. cPanel shared hosting: typically
  **₨3,000–8,000/year** in Pakistan. A `.com` domain: **~$10–15/year**.
  You can launch completely free and add a domain whenever ready.

## 📁 What's inside the final ZIP

`index, portfolio, about, services, contact, admin.html` · `assets/` (css, js,
images) · `README.md` (overview) · `DEPLOY.md` (this guide) · `QA-REPORT.md`
(85+ automated test results).

Questions? Open the site, press through every page on your phone, and note
anything you'd like changed — every text, photo, color, and link is editable.
