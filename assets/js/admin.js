/* ============================================================
   ADMIN PANEL (Step 7) — edits UH.store (engine.js), saves to
   browser localStorage, previews live, exports publish files.
   TEST credentials — see SECURITY note in Backup pane.
   ============================================================ */
(function () {
"use strict";
if (!window.UH) { document.body.innerHTML = "<p style='padding:60px;text-align:center'>Engine failed to load. Check assets/js/engine.js.</p>"; return; }

const TEST_USER = "admin", TEST_PASS = "usama2026";
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const store = () => window.UH.store;

/* ---------------- toast + meter ---------------- */
let toastT = null;
function toast(msg, isErr) {
  const t = $("#admToast");
  t.textContent = msg;
  t.classList.toggle("adm-toast--err", !!isErr);
  t.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("show"), 3200);
}
function save(patch, msg) {
  const r = window.UH.save(patch || {});
  if (r.error) { toast("⚠ " + r.error, true); return false; }
  meter();
  toast(msg || "✓ Saved — visible on the site in this browser.");
  refreshPreview();
  return true;
}
function meter() {
  let bytes = 0;
  try { bytes = (localStorage.getItem(window.UH.LS_KEY) || "").length; } catch (e) {}
  const kb = bytes / 1024, pct = Math.min(100, Math.round(bytes / (5 * 1024 * 1024) * 100));
  const bar = $("#admMeterBar"), txt = $("#admMeterTxt");
  if (bar) bar.style.width = Math.max(2, pct) + "%";
  if (txt) txt.textContent = bytes ? `${kb < 1024 ? kb.toFixed(1) + " KB" : (kb / 1024).toFixed(2) + " MB"} of ~5 MB` : "No edits saved yet";
}

/* ---------------- auth ---------------- */
function creds() {
  const a = store().auth;
  return (a && a.user) ? a : { user: TEST_USER, pass: TEST_PASS };
}
function authed() { try { return sessionStorage.getItem("uh_admin") === "1"; } catch (e) { return false; } }
function showApp() {
  $("#admAuth").classList.add("adm-hidden");
  $("#admApp").classList.remove("adm-hidden");
  $("#admLogout").classList.remove("adm-hidden");
  renderAll(); meter();
}
$("#admLoginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const u = $("#admUser").value.trim(), p = $("#admPass").value;
  const c = creds();
  if (u === c.user && p === c.pass) {
    try { sessionStorage.setItem("uh_admin", "1"); } catch (err) {}
    showApp(); toast("✓ Welcome back, Usama!");
  } else { $("#admErr").classList.add("show"); }
});
$("#admLogout").addEventListener("click", () => {
  try { sessionStorage.removeItem("uh_admin"); } catch (e) {}
  location.reload();
});
if (authed()) showApp();

/* ---------------- tabs ---------------- */
$("#admNav").addEventListener("click", (e) => {
  const btn = e.target.closest(".adm-tab");
  if (!btn) return;
  $$(".adm-tab").forEach((b) => b.classList.toggle("active", b === btn));
  $$(".adm-pane").forEach((p) => p.classList.toggle("active", p.id === "pane-" + btn.dataset.pane));
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------------- image helpers ---------------- */
function imgStatus(src) {
  if (!src) return '<span class="adm-pill adm-pill--amber">Empty</span>';
  if (String(src).startsWith("data:")) return '<span class="adm-pill adm-pill--green">Uploaded ✓</span>';
  if (/^https?:/.test(src)) return '<span class="adm-pill adm-pill--blue">URL link</span>';
  return '<span class="adm-pill adm-pill--amber">Site file</span>';
}
function readUpload(file, cb) {
  if (!file) return;
  if (!file.type.startsWith("image/")) { toast("⚠ Please choose an image file.", true); return; }
  if (file.size > 2 * 1024 * 1024) { toast("⚠ Image over 2 MB — resize it first, or replace the file in assets/images/ manually.", true); return; }
  const r = new FileReader();
  r.onload = () => cb(r.result);
  r.readAsDataURL(file);
}
function imgChoices(selected) {
  const items = (store().portfolio.items || []).map((it) => it.src).filter((s) => s && !String(s).startsWith("data:"));
  const uniq = ["", ...new Set(items)];
  return uniq.map((s) => `<option value="${esc(s)}"${s === selected ? " selected" : ""}>${s ? esc(s.split("/").pop()) : "— Choose a site image —"}</option>`).join("");
}

/* ================================================================
   PANE: DASHBOARD
================================================================ */
function renderDashboard() {
  const s = store(), pf = s.portfolio || { categories: [], items: [] };
  const usingTest = !s.auth;
  $("#pane-dashboard").innerHTML = `
    <h2>Dashboard</h2>
    <p class="sub">Everything about your website, managed from here. Edits save instantly in this browser — use <strong>Backup &amp; Publish</strong> to make them permanent for everyone.</p>
    ${usingTest ? `<div class="adm-warn"><h4>⚠ You are using TEST credentials (admin / usama2026)</h4>Change them before launch in Backup &amp; Publish → Change login. And remember: this login only guards the panel in a normal browser — read the Security notes in the Backup tab.</div>` : ``}
    <div class="adm-grid3">
      <div class="adm-card"><h3>🖼️ ${pf.items.length} Portfolio Images</h3><p class="hint">${pf.categories.length} categories · ${s.featured.length} featured on Home</p></div>
      <div class="adm-card"><h3>🎨 Theme: ${esc(themeName(s.theme.preset))}</h3><p class="hint">4 presets + custom colors available</p></div>
      <div class="adm-card"><h3>🎬 ${s.reels.length} Reels · ⭐ ${s.testimonials.length} Reviews</h3><p class="hint">${s.awards.length} awards · Prices ${s.pricesEnabled ? "ON" : "OFF"}</p></div>
    </div>
    <div class="adm-card"><h3>🚀 Quick start</h3><p class="hint">The 4 things most photographers do first:</p>
      <div class="abtn-row" style="margin-top:0">
        <button class="abtn abtn--primary" data-go="contact" type="button">1 · Add real contact links</button>
        <button class="abtn" data-go="about" type="button">2 · Write your story</button>
        <button class="abtn" data-go="portfolio" type="button">3 · Replace sample photos</button>
        <button class="abtn abtn--blue" data-go="backup" type="button">4 · Publish changes</button>
      </div>
    </div>
    <div class="adm-doc"><h4>How saving works</h4>
      <ul><li><strong>Save buttons</strong> store your edits in <strong>this browser</strong> — you see them instantly on the site + Live Preview tab.</li>
      <li>To publish for <strong>everyone</strong>: Backup &amp; Publish → <strong>Download site-config.js</strong> → upload it to <code>assets/js/</code> on your hosting.</li>
      <li>Uploaded photos live in the browser too — for launch, also copy real photo files into <code>assets/images/</code> with the same names.</li></ul>
    </div>`;
  $$("#pane-dashboard [data-go]").forEach((b) => b.addEventListener("click", () => {
    $(`.adm-tab[data-pane="${b.dataset.go}"]`).click();
  }));
}
function themeName(p) {
  return { "charcoal-orange": "Charcoal Orange", "midnight-blue": "Midnight Blue", "slate-purple": "Slate Purple", "emerald-dark": "Emerald Dark", "custom": "Custom" }[p] || p;
}

/* ================================================================
   PANE: HOME
================================================================ */
function renderHome() {
  const s = store();
  const items = s.portfolio.items || [];
  const feat = s.featured || [];
  const opts = (sel) => items.map((it, i) => `<option value="${esc(it.src)}"${it.src === sel ? " selected" : ""}>${i + 1}. ${esc(it.title)} (${esc(window.UH.catLabel(it.cat))})</option>`).join("");
  $("#pane-home").innerHTML = `
    <h2>Home Page</h2><p class="sub">Tagline, stat numbers, and which photos appear in the Featured Work grid.</p>
    <div class="adm-card"><h3>✍️ Tagline</h3><p class="hint">Leave empty to keep the current default tagline.</p>
      <div class="field"><label>Hero tagline</label><textarea id="hTag" style="min-height:70px">${esc(s.home.tagline || "")}</textarea></div>
      <div class="abtn-row"><button class="abtn abtn--primary" id="hSaveTag" type="button">Save Tagline</button></div>
    </div>
    <div class="adm-card"><h3>🔢 Stat numbers</h3><p class="hint">Only use numbers you can stand behind. "6+ Months" is fixed in the code as your confirmed experience.</p>
      <div class="adm-grid2">
        <div class="field"><label>Product images (e.g. 50+)</label><input type="text" id="hImgs" value="${esc(s.home.images)}"></div>
        <div class="field"><label>Categories (e.g. 8)</label><input type="text" id="hCats" value="${esc(s.home.categories)}"></div>
      </div>
      <div class="abtn-row"><button class="abtn abtn--primary" id="hSaveStats" type="button">Save Numbers</button></div>
    </div>
    <div class="adm-card"><h3>⭐ Featured Work (Home grid)</h3><p class="hint">Slot 1 shows large. Pick any ${items.length} portfolio photos.</p>
      ${[0, 1, 2, 3, 4].map((i) => `<div class="field"><label>Slot ${i + 1}${i === 0 ? " (large)" : ""}</label><select id="hFeat${i}">${opts(feat[i])}</select></div>`).join("")}
      <div class="abtn-row"><button class="abtn abtn--primary" id="hSaveFeat" type="button">Save Featured</button></div>
    </div>`;
  $("#hSaveTag").addEventListener("click", () => save({ home: Object.assign({}, s.home, { tagline: $("#hTag").value.trim() }) }, "✓ Tagline saved."));
  $("#hSaveStats").addEventListener("click", () => save({ home: Object.assign({}, s.home, { images: $("#hImgs").value.trim() || "50+", categories: $("#hCats").value.trim() || "8" }) }, "✓ Numbers saved."));
  $("#hSaveFeat").addEventListener("click", () => {
    const f = [0, 1, 2, 3, 4].map((i) => $("#hFeat" + i).value).filter(Boolean);
    save({ featured: f }, "✓ Featured photos saved.");
  });
}

/* ================================================================
   PANE: PORTFOLIO (categories + image manager)
================================================================ */
function renderPortfolio() {
  const pf = store().portfolio;
  const cats = pf.categories, items = pf.items;
  $("#pane-portfolio").innerHTML = `
    <h2>Portfolio &amp; Images</h2><p class="sub">Manage categories and every portfolio photo — upload replacements, reorder, edit captions, or add new work.</p>
    <div class="adm-card"><h3>📁 Categories (${cats.length})</h3><p class="hint">Covers, names &amp; descriptions. A category with photos can't be deleted — move its photos first.</p>
      <div id="pfCats">${cats.map((c, i) => `
        <div class="adm-row" data-cat="${i}">
          <img class="adm-thumb" src="${esc(c.cover)}" alt="">
          <div class="adm-row__main"><strong>${esc(c.label)}</strong>
            <small>id: ${esc(c.id)} · ${items.filter((x) => x.cat === c.id).length} photos</small>
            <div class="adm-row__ops">
              <button class="abtn abtn--sm" data-catedit="${i}" type="button">Edit</button>
              <button class="abtn abtn--sm" data-catup="${i}" type="button">↑</button>
              <button class="abtn abtn--sm" data-catdown="${i}" type="button">↓</button>
              <button class="abtn abtn--sm abtn--danger" data-catdel="${i}" type="button">Delete</button>
            </div></div><div></div>
          <div class="adm-edit" id="catEdit${i}">
            <div class="adm-grid2">
              <div class="field"><label>Name</label><input type="text" id="ceLabel${i}" value="${esc(c.label)}"></div>
              <div class="field"><label>Short tab label</label><input type="text" id="ceShort${i}" value="${esc(c.short || "")}"></div>
            </div>
            <div class="field"><label>Description</label><input type="text" id="ceDesc${i}" value="${esc(c.desc)}"></div>
            <div class="adm-grid2">
              <div class="field"><label>Cover image (site file)</label><select id="ceCover${i}">${imgChoices(c.cover)}</select></div>
              <div class="field"><label>…or upload new cover</label><input type="file" id="ceUp${i}" accept="image/*"></div>
            </div>
            <div class="abtn-row"><button class="abtn abtn--primary abtn--sm" data-catsave="${i}" type="button">Save Category</button></div>
          </div>
        </div>`).join("")}</div>
      <div class="adm-grid2" style="margin-top:18px">
        <div class="field"><label>New category name</label><input type="text" id="catNewName" placeholder="e.g., Watches &amp; Wearables"></div>
        <div class="field"><label>&nbsp;</label><button class="abtn abtn--blue" id="catAdd" type="button" style="width:100%;justify-content:center">+ Add Category</button></div>
      </div>
    </div>
    <div class="adm-card"><h3>🖼️ Photos (${items.length})</h3><p class="hint"><span class="adm-pill adm-pill--amber">Site file</span> = bundled sample (replace the file in assets/images/ for launch) · <span class="adm-pill adm-pill--green">Uploaded ✓</span> = your real photo, stored in browser.</p>
      <div id="pfItems">${items.map((it, i) => `
        <div class="adm-row" data-item="${i}">
          <img class="adm-thumb" src="${esc(it.src)}" alt="">
          <div class="adm-row__main"><strong>${esc(it.title)} ${imgStatus(it.src)} ${it.wide ? '<span class="adm-pill adm-pill--blue">Wide</span>' : ""}</strong>
            <small>${esc(window.UH.catLabel(it.cat))} · ${String(it.src).startsWith("data:") ? "uploaded image" : esc(String(it.src).split("/").pop())}</small>
            <div class="adm-row__ops">
              <button class="abtn abtn--sm" data-edit="${i}" type="button">Edit</button>
              <button class="abtn abtn--sm" data-up="${i}" type="button">↑</button>
              <button class="abtn abtn--sm" data-down="${i}" type="button">↓</button>
              <button class="abtn abtn--sm abtn--danger" data-del="${i}" type="button">Remove</button>
            </div></div><div></div>
          <div class="adm-edit" id="itemEdit${i}">
            <div class="adm-grid2">
              <div class="field"><label>Title</label><input type="text" id="ieTitle${i}" value="${esc(it.title)}"></div>
              <div class="field"><label>Category</label><select id="ieCat${i}">${cats.map((c) => `<option value="${esc(c.id)}"${c.id === it.cat ? " selected" : ""}>${esc(c.label)}</option>`).join("")}</select></div>
            </div>
            <div class="field"><label>Description</label><textarea id="ieDesc${i}" style="min-height:64px">${esc(it.desc)}</textarea></div>
            <div class="adm-grid2">
              <div class="field"><label>Image file / URL</label><input type="text" id="ieSrc${i}" value="${String(it.src).startsWith("data:") ? "" : esc(it.src)}" placeholder="assets/images/… or https://…"></div>
              <div class="field"><label>…or upload replacement</label><input type="file" id="ieUp${i}" accept="image/*"></div>
            </div>
            <label class="adm-check"><input type="checkbox" id="ieWide${i}"${it.wide ? " checked" : ""}><span>Wide feature slot<small>Takes double width in the gallery grid</small></span></label>
            <div class="abtn-row">
              <button class="abtn abtn--primary abtn--sm" data-itemsave="${i}" type="button">Save Photo</button>
              <button class="abtn abtn--sm" data-itemreset="${i}" type="button">↩ Reset to bundled file</button>
            </div>
          </div>
        </div>`).join("")}</div>
    </div>
    <div class="adm-card"><h3>➕ Add new photo</h3><p class="hint">Upload your real photo, pick its category, and it's live in the gallery.</p>
      <div class="adm-grid2">
        <div class="field"><label>Title</label><input type="text" id="niTitle" placeholder="e.g., Rose Gold Watch"></div>
        <div class="field"><label>Category</label><select id="niCat">${cats.map((c) => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join("")}</select></div>
      </div>
      <div class="field"><label>Description</label><input type="text" id="niDesc" placeholder="Short caption shown in the lightbox"></div>
      <div class="adm-grid2">
        <div class="field"><label>Upload photo</label><input type="file" id="niUp" accept="image/*"></div>
        <div class="field"><label>…or image path / URL</label><input type="text" id="niSrc" placeholder="assets/images/my-photo.jpg"></div>
      </div>
      <label class="adm-check"><input type="checkbox" id="niWide"><span>Wide feature slot</span></label>
      <div class="abtn-row"><button class="abtn abtn--primary" id="niAdd" type="button">+ Add Photo</button></div>
    </div>`;
  bindPortfolio();
}
function pfSave(cats, items, msg) {
  const pf = { categories: cats || store().portfolio.categories, items: items || store().portfolio.items };
  if (save({ portfolio: pf }, msg)) renderPortfolio();
}
function bindPortfolio() {
  const cats = () => store().portfolio.categories, items = () => store().portfolio.items;
  const swap = (arr, i, j) => { if (j < 0 || j >= arr.length) return arr; const a = arr.slice(); [a[i], a[j]] = [a[j], a[i]]; return a; };
  $$("#pane-portfolio [data-edit]").forEach((b) => b.addEventListener("click", () => b.closest(".adm-row").classList.toggle("open")));
  $$("#pane-portfolio [data-catedit]").forEach((b) => b.addEventListener("click", () => b.closest(".adm-row").classList.toggle("open")));
  $$("#pane-portfolio [data-up]").forEach((b) => b.addEventListener("click", () => pfSave(null, swap(items(), +b.dataset.up, +b.dataset.up - 1), "✓ Moved up.")));
  $$("#pane-portfolio [data-down]").forEach((b) => b.addEventListener("click", () => pfSave(null, swap(items(), +b.dataset.down, +b.dataset.down + 1), "✓ Moved down.")));
  $$("#pane-portfolio [data-catup]").forEach((b) => b.addEventListener("click", () => pfSave(swap(cats(), +b.dataset.catup, +b.dataset.catup - 1), null, "✓ Category moved.")));
  $$("#pane-portfolio [data-catdown]").forEach((b) => b.addEventListener("click", () => pfSave(swap(cats(), +b.dataset.catdown, +b.dataset.catdown + 1), null, "✓ Category moved.")));
  $$("#pane-portfolio [data-del]").forEach((b) => b.addEventListener("click", () => {
    const i = +b.dataset.del;
    if (!confirm(`Remove "${items()[i].title}" from the gallery?`)) return;
    const arr = items().slice(); arr.splice(i, 1);
    pfSave(null, arr, "✓ Photo removed.");
  }));
  $$("#pane-portfolio [data-catdel]").forEach((b) => b.addEventListener("click", () => {
    const i = +b.dataset.catdel, c = cats()[i];
    if (items().some((x) => x.cat === c.id)) { toast("⚠ Move this category's photos elsewhere first.", true); return; }
    if (!confirm(`Delete category "${c.label}"?`)) return;
    const arr = cats().slice(); arr.splice(i, 1);
    pfSave(arr, null, "✓ Category deleted.");
  }));
  $$("#pane-portfolio [data-itemsave]").forEach((b) => b.addEventListener("click", () => {
    const i = +b.dataset.itemsave, arr = items().slice(), it = Object.assign({}, arr[i]);
    it.title = $("#ieTitle" + i).value.trim() || it.title;
    it.cat = $("#ieCat" + i).value;
    it.desc = $("#ieDesc" + i).value.trim();
    it.wide = $("#ieWide" + i).checked;
    const typed = $("#ieSrc" + i).value.trim();
    const file = $("#ieUp" + i).files[0];
    const done = (src) => { if (src) it.src = src; arr[i] = it; pfSave(null, arr, "✓ Photo saved."); };
    if (file) readUpload(file, done); else if (typed) done(typed); else done(null);
  }));
  $$("#pane-portfolio [data-itemreset]").forEach((b) => b.addEventListener("click", () => {
    const i = +b.dataset.itemreset, arr = items().slice();
    const def = window.UH.DEFAULTS.portfolio.items[i];
    arr[i] = Object.assign({}, arr[i], { src: (def && !String(arr[i].src).startsWith("data:") ? arr[i].src : (def ? def.src : arr[i].src)) });
    // reset means: back to the shipped bundled file for this slot
    const orig = window.UH.DEFAULTS.portfolio.items.find((d) => d.title === arr[i].title);
    arr[i].src = orig ? orig.src : arr[i].src;
    pfSave(null, arr, "✓ Reset to bundled file.");
  }));
  $$("#pane-portfolio [data-catsave]").forEach((b) => b.addEventListener("click", () => {
    const i = +b.dataset.catsave, arr = cats().slice(), c = Object.assign({}, arr[i]);
    c.label = $("#ceLabel" + i).value.trim() || c.label;
    c.short = $("#ceShort" + i).value.trim() || c.short;
    c.desc = $("#ceDesc" + i).value.trim();
    const pick = $("#ceCover" + i).value, file = $("#ceUp" + i).files[0];
    const done = (cover) => { if (cover) c.cover = cover; arr[i] = c; pfSave(arr, null, "✓ Category saved."); };
    if (file) readUpload(file, done); else if (pick) done(pick); else done(null);
  }));
  $("#catAdd").addEventListener("click", () => {
    const name = $("#catNewName").value.trim();
    if (!name) { toast("⚠ Type a category name first.", true); return; }
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || ("cat-" + Date.now());
    if (cats().some((c) => c.id === id)) { toast("⚠ That category already exists.", true); return; }
    const arr = cats().slice();
    arr.push({ id, label: name, short: name.split(" ")[0], cover: items()[0] ? items()[0].src : "", desc: "New category — add a description." });
    pfSave(arr, null, "✓ Category added. Now add photos to it below.");
  });
  $("#niAdd").addEventListener("click", () => {
    const title = $("#niTitle").value.trim();
    if (!title) { toast("⚠ Give the photo a title first.", true); return; }
    const file = $("#niUp").files[0], typed = $("#niSrc").value.trim();
    const done = (src) => {
      if (!src) { toast("⚠ Upload a photo or paste a path/URL.", true); return; }
      const arr = items().slice();
      arr.unshift({ src, cat: $("#niCat").value, title, desc: $("#niDesc").value.trim(), wide: $("#niWide").checked });
      pfSave(null, arr, "✓ Photo added to the gallery.");
    };
    if (file) readUpload(file, done); else done(typed);
  });
}

/* ================================================================
   PANE: ABOUT
================================================================ */
function renderAbout() {
  const ab = store().about;
  $("#pane-about").innerHTML = `
    <h2>About &amp; Skills</h2><p class="sub">Your story (in your own words), your portrait photo, and skill levels.</p>
    <div class="adm-card"><h3>📖 Usama's Story</h3><p class="hint">Write 2–4 short paragraphs. Separate paragraphs with a blank line. Leave empty to keep the placeholder.</p>
      <div class="field"><label>Story text</label><textarea id="abStory" style="min-height:170px" placeholder="How you got into product photography, what drives your work…">${esc(ab.story || "")}</textarea></div>
      <div class="abtn-row"><button class="abtn abtn--primary" id="abSaveStory" type="button">Save Story</button></div>
    </div>
    <div class="adm-card"><h3>📷 Portrait photo</h3><p class="hint">Your photo on the About page. ${imgStatus(ab.portrait)}</p>
      <div class="adm-grid2">
        <div class="field"><label>Upload portrait</label><input type="file" id="abUp" accept="image/*"></div>
        <div class="field"><label>…or image path / URL</label><input type="text" id="abSrc" value="${String(ab.portrait || "").startsWith("data:") ? "" : esc(ab.portrait || "")}" placeholder="assets/images/portrait.jpg"></div>
      </div>
      <div class="abtn-row">
        <button class="abtn abtn--primary" id="abSavePic" type="button">Save Portrait</button>
        <button class="abtn" id="abResetPic" type="button">↩ Back to monogram placeholder</button>
      </div>
    </div>
    <div class="adm-card"><h3>💪 Skills (${ab.skills.length})</h3><p class="hint">Self-assessed working levels — shown as illustrative bars on the site, never certified scores.</p>
      <div id="abSkills">${ab.skills.map((s, i) => `
        <div class="adm-row" data-skill="${i}">
          <div class="adm-thumb" style="display:grid;place-items:center;background:rgba(255,107,26,.1);border:1px solid var(--line);border-radius:10px;font-family:var(--font-display);font-weight:800;color:var(--orange)">${+s.level || 0}%</div>
          <div class="adm-row__main"><strong>${esc(s.name)}</strong><small>${esc(s.label || "")}</small>
            <div class="adm-row__ops">
              <button class="abtn abtn--sm" data-skedit="${i}" type="button">Edit</button>
              <button class="abtn abtn--sm abtn--danger" data-skdel="${i}" type="button">Remove</button>
            </div></div><div></div>
          <div class="adm-edit" id="skEdit${i}">
            <div class="adm-grid3">
              <div class="field"><label>Skill</label><input type="text" id="skName${i}" value="${esc(s.name)}"></div>
              <div class="field"><label>Level: <span id="skVal${i}">${+s.level || 0}</span>%</label><input type="range" id="skLevel${i}" min="0" max="100" value="${+s.level || 0}"></div>
              <div class="field"><label>Label</label><select id="skLabel${i}">${["Strong", "Solid", "Growing", "Learning"].map((l) => `<option${l === s.label ? " selected" : ""}>${l}</option>`).join("")}</select></div>
            </div>
            <div class="abtn-row"><button class="abtn abtn--primary abtn--sm" data-sksave="${i}" type="button">Save Skill</button></div>
          </div>
        </div>`).join("")}</div>
      <div class="adm-grid2" style="margin-top:16px">
        <div class="field"><label>New skill name</label><input type="text" id="skNew" placeholder="e.g., Food Styling"></div>
        <div class="field"><label>&nbsp;</label><button class="abtn abtn--blue" id="skAdd" type="button" style="width:100%;justify-content:center">+ Add Skill</button></div>
      </div>
    </div>`;
  const abSave = (patch, msg) => { if (save({ about: Object.assign({}, store().about, patch) }, msg)) renderAbout(); };
  $("#abSaveStory").addEventListener("click", () => abSave({ story: $("#abStory").value.trim() }, "✓ Story saved."));
  $("#abSavePic").addEventListener("click", () => {
    const file = $("#abUp").files[0], typed = $("#abSrc").value.trim();
    if (file) readUpload(file, (src) => abSave({ portrait: src }, "✓ Portrait saved."));
    else if (typed) abSave({ portrait: typed }, "✓ Portrait saved.");
    else toast("⚠ Upload a photo or paste a path first.", true);
  });
  $("#abResetPic").addEventListener("click", () => abSave({ portrait: "" }, "✓ Back to placeholder."));
  $$("#pane-about [data-skedit]").forEach((b) => b.addEventListener("click", () => b.closest(".adm-row").classList.toggle("open")));
  $$("#pane-about [data-sksave]").forEach((b) => b.addEventListener("click", () => {
    const i = +b.dataset.sksave, arr = store().about.skills.slice();
    arr[i] = { name: $("#skName" + i).value.trim() || arr[i].name, level: +$("#skLevel" + i).value, label: $("#skLabel" + i).value };
    abSave({ skills: arr }, "✓ Skill saved.");
  }));
  $$("#pane-about [data-skdel]").forEach((b) => b.addEventListener("click", () => {
    const arr = store().about.skills.slice();
    if (!confirm(`Remove "${arr[+b.dataset.skdel].name}"?`)) return;
    arr.splice(+b.dataset.skdel, 1);
    abSave({ skills: arr }, "✓ Skill removed.");
  }));
  $$("#pane-about input[type=range]").forEach((r) => r.addEventListener("input", () => { $("#skVal" + r.id.replace("skLevel", "")).textContent = r.value; }));
  $("#skAdd").addEventListener("click", () => {
    const name = $("#skNew").value.trim();
    if (!name) { toast("⚠ Type a skill name first.", true); return; }
    const arr = store().about.skills.slice();
    arr.push({ name, level: 60, label: "Growing" });
    abSave({ skills: arr }, "✓ Skill added.");
  });
}

/* ================================================================
   PANE: SERVICES
================================================================ */
function renderServices() {
  const s = store();
  $("#pane-services").innerHTML = `
    <h2>Services &amp; Prices</h2><p class="sub">Edit every service, and enable the price list whenever you're ready.</p>
    <div class="adm-card"><h3>💰 Price list</h3><p class="hint">OFF = prices hidden, "request a quote" shown (current). ON = each service shows its price line.</p>
      <label class="adm-check"><input type="checkbox" id="svPrices"${s.pricesEnabled ? " checked" : ""}><span>Enable prices on the Services page<small>Make sure every service below has a price first</small></span></label>
      <div class="abtn-row"><button class="abtn abtn--primary" id="svSaveToggle" type="button">Save Setting</button></div>
    </div>
    <div id="svList">${s.services.map((sv, i) => `
      <div class="adm-card" data-svc="${i}">
        <h3>${i + 1}. ${esc(sv.title)} ${s.pricesEnabled && sv.price ? `<span class="adm-pill adm-pill--green">${esc(sv.price)}</span>` : ""}</h3>
        <p class="hint">${esc(sv.kicker || "")}</p>
        <div class="adm-grid2">
          <div class="field"><label>Title</label><input type="text" id="svTitle${i}" value="${esc(sv.title)}"></div>
          <div class="field"><label>Kicker (small tag)</label><input type="text" id="svKicker${i}" value="${esc(sv.kicker || "")}"></div>
        </div>
        <div class="field"><label>Description</label><textarea id="svDesc${i}" style="min-height:64px">${esc(sv.desc)}</textarea></div>
        <div class="adm-grid2">
          <div class="field"><label>Includes (one per line)</label><textarea id="svInc${i}" style="min-height:96px">${esc((sv.includes || []).join("\n"))}</textarea></div>
          <div class="field"><label>Best-for tags (comma separated)</label><textarea id="svTags${i}" style="min-height:96px">${esc((sv.tags || []).join(", "))}</textarea></div>
        </div>
        <div class="adm-grid3">
          <div class="field"><label>Image (site file)</label><select id="svImg${i}">${imgChoices(sv.img)}</select></div>
          <div class="field"><label>…or upload</label><input type="file" id="svUp${i}" accept="image/*"></div>
          <div class="field"><label>Price line (shown if enabled)</label><input type="text" id="svPrice${i}" value="${esc(sv.price || "")}" placeholder="e.g., From $49 / product"></div>
        </div>
        <div class="abtn-row"><button class="abtn abtn--primary abtn--sm" data-svsave="${i}" type="button">Save Service</button></div>
      </div>`).join("")}</div>`;
  $("#svSaveToggle").addEventListener("click", () => save({ pricesEnabled: $("#svPrices").checked }, "✓ Price setting saved."));
  $$("#pane-services [data-svsave]").forEach((b) => b.addEventListener("click", () => {
    const i = +b.dataset.svsave, arr = store().services.slice(), sv = Object.assign({}, arr[i]);
    sv.title = $("#svTitle" + i).value.trim() || sv.title;
    sv.kicker = $("#svKicker" + i).value.trim();
    sv.desc = $("#svDesc" + i).value.trim();
    sv.includes = $("#svInc" + i).value.split("\n").map((x) => x.trim()).filter(Boolean);
    sv.tags = $("#svTags" + i).value.split(",").map((x) => x.trim()).filter(Boolean);
    sv.price = $("#svPrice" + i).value.trim();
    const pick = $("#svImg" + i).value, file = $("#svUp" + i).files[0];
    const done = (img) => { if (img) sv.img = img; arr[i] = sv; if (save({ services: arr }, "✓ Service saved.")) renderServices(); };
    if (file) readUpload(file, done); else if (pick) done(pick); else done(null);
  }));
}

/* ================================================================
   PANE: REELS
================================================================ */
function renderReels() {
  const reels = store().reels || [];
  $("#pane-reels").innerHTML = `
    <h2>Reels &amp; Video</h2><p class="sub">Paste links to your Reels, TikToks, Shorts, or Story Highlights — a "Watch the Work in Motion" section appears on the Home page automatically. Empty = section stays hidden.</p>
    <div class="adm-card"><h3>🎬 Video links (${reels.length})</h3><p class="hint">Instagram, TikTok, YouTube &amp; Facebook links are detected automatically.</p>
      <div id="rlList">${reels.length ? reels.map((r, i) => `
        <div class="adm-row" data-reel="${i}">
          <div class="adm-thumb" style="display:grid;place-items:center;background:var(--grad-main);border-radius:10px;font-size:1.3rem">▶</div>
          <div class="adm-row__main"><strong>${esc(r.title || "Untitled")}</strong><small>${esc(r.url)}</small>
            <div class="adm-row__ops">
              <button class="abtn abtn--sm" data-rledit="${i}" type="button">Edit</button>
              <button class="abtn abtn--sm abtn--danger" data-rldel="${i}" type="button">Remove</button>
            </div></div><div></div>
          <div class="adm-edit">
            <div class="adm-grid2">
              <div class="field"><label>Title</label><input type="text" id="rlTitle${i}" value="${esc(r.title || "")}"></div>
              <div class="field"><label>URL</label><input type="url" id="rlUrl${i}" value="${esc(r.url)}"></div>
            </div>
            <div class="abtn-row"><button class="abtn abtn--primary abtn--sm" data-rlsave="${i}" type="button">Save Link</button></div>
          </div>
        </div>`).join("") : `<p class="hint">No video links yet — add your first one below. 👇</p>`}</div>
    </div>
    <div class="adm-card"><h3>➕ Add video link</h3>
      <div class="adm-grid2">
        <div class="field"><label>Title</label><input type="text" id="rlNewTitle" placeholder="e.g., Perfume shoot — behind the scenes"></div>
        <div class="field"><label>URL</label><input type="url" id="rlNewUrl" placeholder="https://instagram.com/reel/…"></div>
      </div>
      <div class="abtn-row"><button class="abtn abtn--primary" id="rlAdd" type="button">+ Add Link</button></div>
    </div>`;
  const rlSave = (arr, msg) => { if (save({ reels: arr }, msg)) renderReels(); };
  $$("#pane-reels [data-rledit]").forEach((b) => b.addEventListener("click", () => b.closest(".adm-row").classList.toggle("open")));
  $$("#pane-reels [data-rlsave]").forEach((b) => b.addEventListener("click", () => {
    const i = +b.dataset.rlsave, arr = store().reels.slice();
    arr[i] = { title: $("#rlTitle" + i).value.trim(), url: $("#rlUrl" + i).value.trim() };
    if (!arr[i].url) { toast("⚠ URL can't be empty.", true); return; }
    rlSave(arr, "✓ Link saved.");
  }));
  $$("#pane-reels [data-rldel]").forEach((b) => b.addEventListener("click", () => {
    const arr = store().reels.slice();
    if (!confirm("Remove this video link?")) return;
    arr.splice(+b.dataset.rldel, 1);
    rlSave(arr, "✓ Link removed.");
  }));
  $("#rlAdd").addEventListener("click", () => {
    const url = $("#rlNewUrl").value.trim();
    if (!url) { toast("⚠ Paste a video URL first.", true); return; }
    const arr = store().reels.slice();
    arr.push({ title: $("#rlNewTitle").value.trim() || "Watch reel", url });
    rlSave(arr, "✓ Video link added — check the Home page!");
  });
}

/* ================================================================
   PANE: CONTACT
================================================================ */
function renderContact() {
  const c = store().contact;
  const fields = [["email", "Email", "hello@yourdomain.com"], ["whatsapp", "WhatsApp link", "https://wa.me/92XXXXXXXXXX"], ["instagram", "Instagram URL", "https://instagram.com/yourhandle"], ["facebook", "Facebook URL", "https://facebook.com/yourpage"], ["linkedin", "LinkedIn URL", "https://linkedin.com/in/you"], ["behance", "Behance URL", "https://behance.net/you"]];
  $("#pane-contact").innerHTML = `
    <h2>Contact &amp; Socials</h2><p class="sub">One change here updates the Contact page, every footer, and the form recipient — site-wide. Empty a field to hide that link.</p>
    <div class="adm-card"><h3>✉️ Contact links</h3><p class="hint">Current values are DEMO links — replace with your real profiles.</p>
      ${fields.map(([k, label, ph]) => `<div class="field"><label>${label}</label><input type="text" id="ct_${k}" value="${esc(c[k] || "")}" placeholder="${esc(ph)}"></div>`).join("")}
      <div class="abtn-row"><button class="abtn abtn--primary" id="ctSave" type="button">Save Contact Links</button></div>
    </div>
    <div class="adm-doc"><h4>WhatsApp link format</h4>Use <code>https://wa.me/&lt;countrycode+number&gt;</code> with digits only — e.g. <code>https://wa.me/923001234567</code>. The Contact page shows the number; the link opens a chat.</div>`;
  $("#ctSave").addEventListener("click", () => {
    const patch = {};
    fields.forEach(([k]) => { patch[k] = $("#ct_" + k).value.trim(); });
    save({ contact: Object.assign({}, store().contact, patch) }, "✓ Contact links saved site-wide.");
  });
}

/* ================================================================
   PANE: PROOF (testimonials + awards)
================================================================ */
function renderProof() {
  const s = store(), tms = s.testimonials || [], aws = s.awards || [];
  $("#pane-proof").innerHTML = `
    <h2>Reviews &amp; Awards</h2><p class="sub">Add <strong>only genuine</strong> items. Sections stay hidden on the site until you add the first real one.</p>
    <div class="adm-card"><h3>⭐ Client reviews (${tms.length})</h3><p class="hint">Appear as "What Clients Say" on the Home page. Never add fake reviews.</p>
      <div>${tms.length ? tms.map((t, i) => `
        <div class="adm-row" data-tm="${i}">
          <div class="adm-thumb" style="display:grid;place-items:center;background:rgba(255,178,94,.12);border:1px solid var(--line);border-radius:10px;font-size:1.2rem">💬</div>
          <div class="adm-row__main"><strong>${esc(t.name)}</strong><small>${esc(t.role || "")} ${t.rating ? "· " + t.rating + "/5" : ""}</small>
            <div class="adm-row__ops">
              <button class="abtn abtn--sm" data-tmedit="${i}" type="button">Edit</button>
              <button class="abtn abtn--sm abtn--danger" data-tmdel="${i}" type="button">Remove</button>
            </div></div><div></div>
          <div class="adm-edit">
            <div class="adm-grid3">
              <div class="field"><label>Name</label><input type="text" id="tmName${i}" value="${esc(t.name)}"></div>
              <div class="field"><label>Business / role</label><input type="text" id="tmRole${i}" value="${esc(t.role || "")}"></div>
              <div class="field"><label>Rating (0 = hide)</label><select id="tmRating${i}">${[0, 1, 2, 3, 4, 5].map((n) => `<option value="${n}"${+t.rating === n ? " selected" : ""}>${n === 0 ? "Hidden" : n + " ★"}</option>`).join("")}</select></div>
            </div>
            <div class="field"><label>Review text</label><textarea id="tmText${i}" style="min-height:70px">${esc(t.text)}</textarea></div>
            <div class="abtn-row"><button class="abtn abtn--primary abtn--sm" data-tmsave="${i}" type="button">Save Review</button></div>
          </div>
        </div>`).join("") : `<p class="hint">No reviews yet — correct for now, since client work hasn't started. Add real ones here later. 👇</p>`}</div>
      <div class="adm-grid3" style="margin-top:16px">
        <div class="field"><label>Name</label><input type="text" id="tmNewName" placeholder="Client name"></div>
        <div class="field"><label>Business / role</label><input type="text" id="tmNewRole" placeholder="e.g., Owner, Glow Skincare"></div>
        <div class="field"><label>Rating</label><select id="tmNewRating"><option value="0">Hidden</option><option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option></select></div>
      </div>
      <div class="field"><label>Review text</label><input type="text" id="tmNewText" placeholder="Their genuine words…"></div>
      <div class="abtn-row"><button class="abtn abtn--blue" id="tmAdd" type="button">+ Add Review</button></div>
    </div>
    <div class="adm-card"><h3>🏆 Awards &amp; milestones (${aws.length})</h3><p class="hint">Appear as "Experience &amp; Practice" on the About page. Only verified items.</p>
      <div>${aws.length ? aws.map((a, i) => `
        <div class="adm-row" data-aw="${i}">
          <div class="adm-thumb" style="display:grid;place-items:center;background:rgba(59,130,246,.12);border:1px solid var(--line);border-radius:10px;font-size:1.2rem">🏆</div>
          <div class="adm-row__main"><strong>${esc(a.title)}</strong><small>${esc(a.detail || "")}</small>
            <div class="adm-row__ops">
              <button class="abtn abtn--sm" data-awedit="${i}" type="button">Edit</button>
              <button class="abtn abtn--sm abtn--danger" data-awdel="${i}" type="button">Remove</button>
            </div></div><div></div>
          <div class="adm-edit">
            <div class="adm-grid2">
              <div class="field"><label>Title</label><input type="text" id="awTitle${i}" value="${esc(a.title)}"></div>
              <div class="field"><label>Detail</label><input type="text" id="awDetail${i}" value="${esc(a.detail || "")}"></div>
            </div>
            <div class="abtn-row"><button class="abtn abtn--primary abtn--sm" data-awsave="${i}" type="button">Save Item</button></div>
          </div>
        </div>`).join("") : `<p class="hint">No awards yet — the section stays hidden until you add a genuine one. 👇</p>`}</div>
      <div class="adm-grid2" style="margin-top:16px">
        <div class="field"><label>Title</label><input type="text" id="awNewTitle" placeholder="e.g., Featured Seller Shoot — 2026"></div>
        <div class="field"><label>Detail</label><input type="text" id="awNewDetail" placeholder="One-line description"></div>
      </div>
      <div class="abtn-row"><button class="abtn abtn--blue" id="awAdd" type="button">+ Add Item</button></div>
    </div>`;
  const tmSave = (arr, msg) => { if (save({ testimonials: arr }, msg)) renderProof(); };
  const awSave = (arr, msg) => { if (save({ awards: arr }, msg)) renderProof(); };
  $$("#pane-proof [data-tmedit]").forEach((b) => b.addEventListener("click", () => b.closest(".adm-row").classList.toggle("open")));
  $$("#pane-proof [data-awedit]").forEach((b) => b.addEventListener("click", () => b.closest(".adm-row").classList.toggle("open")));
  $$("#pane-proof [data-tmsave]").forEach((b) => b.addEventListener("click", () => {
    const i = +b.dataset.tmsave, arr = store().testimonials.slice();
    arr[i] = { name: $("#tmName" + i).value.trim(), role: $("#tmRole" + i).value.trim(), rating: +$("#tmRating" + i).value, text: $("#tmText" + i).value.trim() };
    if (!arr[i].name || !arr[i].text) { toast("⚠ Name and review text are required.", true); return; }
    tmSave(arr, "✓ Review saved.");
  }));
  $$("#pane-proof [data-tmdel]").forEach((b) => b.addEventListener("click", () => {
    const arr = store().testimonials.slice();
    if (!confirm("Remove this review?")) return;
    arr.splice(+b.dataset.tmdel, 1); tmSave(arr, "✓ Review removed.");
  }));
  $("#tmAdd").addEventListener("click", () => {
    const name = $("#tmNewName").value.trim(), text = $("#tmNewText").value.trim();
    if (!name || !text) { toast("⚠ Name and review text are required.", true); return; }
    const arr = store().testimonials.slice();
    arr.push({ name, role: $("#tmNewRole").value.trim(), rating: +$("#tmNewRating").value, text });
    tmSave(arr, "✓ Review added.");
  });
  $$("#pane-proof [data-awsave]").forEach((b) => b.addEventListener("click", () => {
    const i = +b.dataset.awsave, arr = store().awards.slice();
    arr[i] = { title: $("#awTitle" + i).value.trim(), detail: $("#awDetail" + i).value.trim() };
    if (!arr[i].title) { toast("⚠ Title is required.", true); return; }
    awSave(arr, "✓ Item saved.");
  }));
  $$("#pane-proof [data-awdel]").forEach((b) => b.addEventListener("click", () => {
    const arr = store().awards.slice();
    if (!confirm("Remove this item?")) return;
    arr.splice(+b.dataset.awdel, 1); awSave(arr, "✓ Item removed.");
  }));
  $("#awAdd").addEventListener("click", () => {
    const title = $("#awNewTitle").value.trim();
    if (!title) { toast("⚠ Title is required.", true); return; }
    const arr = store().awards.slice();
    arr.push({ title, detail: $("#awNewDetail").value.trim() });
    awSave(arr, "✓ Item added.");
  });
}

/* ================================================================
   PANE: THEME
================================================================ */
function renderTheme() {
  const t = store().theme;
  const presets = [
    ["charcoal-orange", "Charcoal Orange", "linear-gradient(135deg,#0B0B0F 55%,#FF6B1A)"],
    ["midnight-blue", "Midnight Blue", "linear-gradient(135deg,#060B16 55%,#4D9FFF)"],
    ["slate-purple", "Slate Purple", "linear-gradient(135deg,#0E0B15 55%,#B18CFF)"],
    ["emerald-dark", "Emerald Dark", "linear-gradient(135deg,#070E0C 55%,#34D399)"]
  ];
  $("#pane-theme").innerHTML = `
    <h2>Theme</h2><p class="sub">Restyle the whole website in one click — the premium identity stays intact. Changes apply to this panel too, so you see them instantly.</p>
    <div class="adm-card"><h3>🎨 Presets</h3><p class="hint">Click to apply. Charcoal Orange is the original identity.</p>
      <div class="theme-pick">${presets.map(([id, name, sw]) =>
        `<button class="theme-card${t.preset === id ? " active" : ""}" data-theme="${id}" type="button"><span class="theme-card__sw" style="background:${sw}"></span><span>${name}</span></button>`
      ).join("")}</div>
    </div>
    <div class="adm-card"><h3>🖌️ Custom colors</h3><p class="hint">Pick your own accents — buttons, glows, pills and gradients follow automatically.</p>
      <div class="adm-grid2">
        <div class="field"><label>Primary accent</label><input type="color" id="thPrimary" value="${esc(t.primary || "#FF6B1A")}"></div>
        <div class="field"><label>Secondary accent</label><input type="color" id="thSecondary" value="${esc(t.secondary || "#3B82F6")}"></div>
      </div>
      <div class="abtn-row"><button class="abtn abtn--primary" id="thCustom" type="button">Apply Custom Colors</button></div>
    </div>
    <div class="adm-doc"><h4>Note</h4>The soft background glows stay orange/blue on every theme for brand consistency — everything else (buttons, headings, pills, cards, gradients) follows your theme.</div>`;
  $$("#pane-theme [data-theme]").forEach((b) => b.addEventListener("click", () => {
    const th = Object.assign({}, store().theme, { preset: b.dataset.theme });
    if (save({ theme: th }, "✓ Theme applied.")) location.reload();
  }));
  $("#thCustom").addEventListener("click", () => {
    const th = { preset: "custom", primary: $("#thPrimary").value, secondary: $("#thSecondary").value };
    if (save({ theme: th }, "✓ Custom colors applied.")) location.reload();
  });
}

/* ================================================================
   PANE: PREVIEW
================================================================ */
function currentPreviewUrl() {
  const sel = $("#pvPage");
  return (sel && sel.value) || "index.html";
}
function refreshPreview() {
  const f = $("#pvFrame");
  if (!f || !$("#pane-preview").classList.contains("active")) return;
  f.src = currentPreviewUrl() + "?v=" + Date.now();
}
function renderPreview() {
  $("#pane-preview").innerHTML = `
    <h2>Live Preview</h2><p class="sub">Your real website, with your edits applied. It refreshes automatically after every save.</p>
    <div class="adm-previewbar">
      <select id="pvPage">
        <option value="index.html">🏠 Home</option>
        <option value="portfolio.html">🖼️ Portfolio</option>
        <option value="about.html">👤 About</option>
        <option value="services.html">🛠️ Services</option>
        <option value="contact.html">✉️ Contact</option>
      </select>
      <button class="abtn abtn--sm" data-pvsize="" type="button">🖥️ Desktop</button>
      <button class="abtn abtn--sm" data-pvsize="adm-frame--tablet" type="button">📱 Tablet</button>
      <button class="abtn abtn--sm" data-pvsize="adm-frame--mobile" type="button">📲 Mobile</button>
      <button class="abtn abtn--sm abtn--blue" id="pvRefresh" type="button">↻ Refresh</button>
    </div>
    <iframe class="adm-frame" id="pvFrame" src="index.html" title="Site preview"></iframe>`;
  $("#pvPage").addEventListener("change", refreshPreview);
  $("#pvRefresh").addEventListener("click", refreshPreview);
  $$("#pane-preview [data-pvsize]").forEach((b) => b.addEventListener("click", () => {
    const f = $("#pvFrame");
    f.classList.remove("adm-frame--tablet", "adm-frame--mobile");
    if (b.dataset.pvsize) f.classList.add(b.dataset.pvsize);
  }));
}

/* ================================================================
   PANE: BACKUP
================================================================ */
function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: type || "application/json" }));
  a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function renderBackup() {
  const hasOver = window.UH.hasOverride(), hasPub = !!window.UH_PUBLISHED;
  $("#pane-backup").innerHTML = `
    <h2>Backup &amp; Publish</h2><p class="sub">Make your edits permanent, move them between devices, and understand the login security.</p>
    <div class="adm-card"><h3>📦 Status</h3><p class="hint">Browser edits: ${hasOver ? "<strong>YES — saved in this browser</strong>" : "none yet"} · Publish file loaded: ${hasPub ? "<strong>YES (site-config.js found)</strong>" : "no"}</p>
      <div class="abtn-row" style="margin-top:0">
        <button class="abtn abtn--primary" id="bkPublish" type="button">⬇ Download site-config.js (Publish)</button>
        <button class="abtn" id="bkExport" type="button">Export backup JSON</button>
        <button class="abtn" id="bkImportBtn" type="button">Import backup JSON</button>
        <input type="file" id="bkImport" accept="application/json" style="display:none">
        <button class="abtn abtn--danger" id="bkReset" type="button">Reset all edits</button>
      </div>
    </div>
    <div class="adm-doc"><h4>🚀 How to publish (3 steps)</h4>
      <ol><li>Click <strong>Download site-config.js</strong> — it contains every edit + uploaded photo.</li>
      <li>Upload it into your hosting's <code>assets/js/</code> folder (next to <code>engine.js</code>).</li>
      <li>Add this line to each page (<code>index, portfolio, about, services, contact.html</code>) <strong>right before</strong> the engine line:<br><code>&lt;script src="assets/js/site-config.js"&gt;&lt;/script&gt;</code></li></ol>
      <p style="margin-top:10px">Uploaded photos inside the file can make it large — for launch, prefer placing real photo files in <code>assets/images/</code> and keeping paths (not uploads) in the manager.</p></div>
    <div class="adm-card"><h3>🔑 Change login</h3><p class="hint">Replaces the test credentials on this browser.</p>
      <div class="adm-grid3">
        <div class="field"><label>New username</label><input type="text" id="auUser" placeholder="admin"></div>
        <div class="field"><label>New password</label><input type="password" id="auPass" placeholder="min. 8 characters"></div>
        <div class="field"><label>&nbsp;</label><button class="abtn abtn--primary" id="auSave" type="button" style="width:100%;justify-content:center">Update Login</button></div>
      </div>
    </div>
    <div class="adm-warn"><h4>🔒 Security — please read before launch</h4>
      <ul style="margin-left:20px;display:grid;gap:6px">
      <li><strong>What IS protected:</strong> casual visitors can't see this panel's editing UI without the password <em>in a normal browser session</em>.</li>
      <li><strong>What is NOT:</strong> this is a front-end-only login — the password check lives in JavaScript anyone can read. It <strong>must not</strong> be treated as real security on a public website.</li>
      <li><strong>Recommended for production:</strong> (a) don't upload <code>admin.html</code> at all — edit locally and publish via <code>site-config.js</code>; <strong>or</strong> (b) protect the page with real server security — hosting password-protection / Cloudflare Access / Netlify-Vercel password; <strong>or</strong> (c) move to a real backend later (Firebase/Supabase auth + database) — this panel's content structure is already shaped for that upgrade.</li>
      </ul></div>`;
  $("#bkPublish").addEventListener("click", () => {
    const js = "/* UH published config — generated " + new Date().toISOString().slice(0, 10) + " */\nwindow.UH_PUBLISHED = " + JSON.stringify(store(), null, 1) + ";\n";
    download("site-config.js", js, "text/javascript");
    toast("✓ site-config.js downloaded — follow the 3 publish steps.");
  });
  $("#bkExport").addEventListener("click", () => {
    download("uh-config-backup.json", JSON.stringify(store(), null, 1));
    toast("✓ Backup downloaded.");
  });
  $("#bkImportBtn").addEventListener("click", () => $("#bkImport").click());
  $("#bkImport").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const o = JSON.parse(r.result);
        if (!o || typeof o !== "object" || !o.portfolio) throw new Error("bad file");
        if (save(o, "✓ Backup imported.")) location.reload();
      } catch (err) { toast("⚠ That file isn't a valid backup.", true); }
    };
    r.readAsText(f);
  });
  $("#bkReset").addEventListener("click", () => {
    if (!confirm("Reset EVERYTHING to the shipped defaults? This clears all edits in this browser.")) return;
    window.UH.reset();
    toast("✓ Reset — reloading…");
    setTimeout(() => location.reload(), 700);
  });
  $("#auSave").addEventListener("click", () => {
    const u = $("#auUser").value.trim(), p = $("#auPass").value;
    if (u.length < 3 || p.length < 8) { toast("⚠ Username 3+ chars, password 8+ chars.", true); return; }
    if (save({ auth: { user: u, pass: p } }, "✓ Login updated. Use it next sign-in.")) renderDashboard();
  });
}

/* ---------------- boot ---------------- */
function renderAll() {
  renderDashboard(); renderHome(); renderPortfolio(); renderAbout();
  renderServices(); renderReels(); renderContact(); renderProof();
  renderTheme(); renderPreview(); renderBackup();
}
})();
