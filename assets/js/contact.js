/* ============================================================
   CONTACT PAGE (Step 6)
   Demo-mode form: validates, then opens the visitor's email app
   with the inquiry pre-filled (mailto). No silent fake "sent"
   state — the visitor always sees exactly what happens.
   PRODUCTION (Step 7+): point this at Formspree/Getform/custom
   backend for direct online sending instead of mailto.
   ============================================================ */
(function () {
  "use strict";
  const form = document.getElementById("contactForm");
  if (!form) return;
  const success = document.getElementById("formSuccess");

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const v = (id) => ((document.getElementById(id) || {}).value || "").trim();
    const name = v("fName"), email = v("fEmail"), biz = v("fBiz"),
          prod = v("fProduct"), budget = v("fBudget"), msg = v("fMsg");
    const svcEl = document.getElementById("fService");
    const svc = svcEl ? svcEl.value : "";

    // recipient = whatever email is configured (demo now, real one later)
    let to = "hello@usamahabib.demo";
    const emailLink = document.querySelector('a[data-social="email"]');
    if (emailLink) {
      const h = emailLink.getAttribute("href") || "";
      if (h.indexOf("mailto:") === 0) to = h.slice(7);
    }

    const subject = "Project inquiry from " + name + (prod ? " — " + prod : "");
    const lines = [
      "Name: " + name,
      "Email: " + email,
      "Business / Brand: " + (biz || "—"),
      "Product Type: " + (prod || "—"),
      "Service Needed: " + (svc || "—"),
      "Budget: " + (budget || "—"),
      "",
      "Message:",
      msg
    ];
    window.location.href =
      "mailto:" + to +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));

    if (success) {
      success.classList.add("show");
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
})();
