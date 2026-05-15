/**
 * ============================================================================
 * MANGALAM HDPE PIPES — MAIN JAVASCRIPT
 * ============================================================================
 * 
 * This file handles all interactive functionality for the landing page:
 * 
 * FEATURES:
 * - Sticky header (shows/hides on scroll)
 * - Mobile navigation (hamburger menu)
 * - Hero image carousel with thumbnails
 * - Horizontal scroll carousels (applications, testimonials)
 * - Manufacturing process tabs
 * - FAQ accordion
 * - Modal dialogs (email request, callback form)
 * - Form handling
 * 
 * DEPENDENCIES: None (vanilla JavaScript)
 * BROWSER SUPPORT: Modern browsers (ES6+)
 * 
 * ============================================================================
 */

/* ============================================================================
   UTILITY FUNCTIONS
   Helper functions used throughout the application
   ============================================================================ */

// DOM query shortcuts
const qs  = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* -------------------------------------------------------------------------
   Math and UI Utilities
   ------------------------------------------------------------------------- */
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}
function debounce(fn, ms) {
  let t = null;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ============================================================================
   STICKY HEADER
   Slides in after scrolling past hero section
   Hides when scrolling down, shows when scrolling up
   ============================================================================ */
function initStickyHeader() {
  const sticky = qs("#stickyHeader");
  const page1  = qs("#page1");
  if (!sticky || !page1) return;

  let lastY = window.scrollY || 0;
  let foldY = 0;

  const measure = () => {
    const r = page1.getBoundingClientRect();
    foldY = r.top + window.scrollY + r.height * 0.62;
  };

  const apply = () => {
    const y = window.scrollY || 0;
    if (y < 8) {
      sticky.classList.remove("is-active");
      sticky.setAttribute("aria-hidden", "true");
      lastY = y; return;
    }
    if (y <= foldY) {
      sticky.classList.remove("is-active");
      sticky.setAttribute("aria-hidden", "true");
    } else if (y > lastY) {
      // scrolling down — show sticky
      sticky.classList.add("is-active");
      sticky.setAttribute("aria-hidden", "false");
    } else {
      // scrolling up — hide
      sticky.classList.remove("is-active");
      sticky.setAttribute("aria-hidden", "true");
    }
    lastY = y;
  };

  measure();
  apply();
  window.addEventListener("resize", debounce(measure, 150));
  window.addEventListener("scroll", apply, { passive: true });
}

/* ============================================================================
   MOBILE NAVIGATION
   Hamburger menu toggle for mobile devices
   Closes on link click, resize to desktop, or outside click
   ============================================================================ */
function initMobileNav() {
  const mainToggle   = qs("#mainNavToggle");
  const stickyToggle = qs("#stickyNavToggle");
  const mainList     = qs("#mainNavList");
  const stickyList   = qs("#stickyNavList");
  const lists        = [mainList, stickyList].filter(Boolean);

  const setOpen = (open) => {
    lists.forEach(ul => ul.classList.toggle("is-open", open));
    [mainToggle, stickyToggle].forEach(btn => {
      if (!btn) return;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  };

  [mainToggle, stickyToggle].forEach(btn => {
    btn?.addEventListener("click", () => {
      setOpen(!lists.some(ul => ul.classList.contains("is-open")));
    });
  });

  // Close on link click
  qsa('a[href^="#"]').forEach(a => a.addEventListener("click", () => setOpen(false)));

  // Close on resize to desktop
  window.addEventListener("resize", debounce(() => {
    if (window.innerWidth > 800) setOpen(false);
  }, 150));

  // Close on outside click
  document.addEventListener("click", e => {
    if (!e.target.closest(".site-header")) setOpen(false);
  });
}

/* ============================================================================
   HERO CAROUSEL
   Image gallery with thumbnail navigation
   Supports keyboard, mouse, and touch interactions
   ============================================================================ */
function initHeroCarousel() {
  const track     = qs("#heroTrack");
  const prev      = qs("#heroPrev");
  const next      = qs("#heroNext");
  const thumbsRoot = qs("#heroThumbs");
  if (!track || !thumbsRoot) return;

  const slides    = qsa(".hero-gallery__slide", track);
  let index       = 0;
  const THUMB_SLOTS = 6;

  const render = () => {
    track.style.transform = `translateX(${-index * 100}%)`;
    qsa(".hero-thumb", thumbsRoot).forEach(t => {
      const si = t.dataset.slideIndex;
      t.setAttribute("aria-selected",
        si !== undefined && Number(si) === index ? "true" : "false"
      );
    });
  };

  const goTo = (i) => { index = clamp(i, 0, slides.length - 1); render(); };

  // Build thumb buttons
  slides.forEach((slide, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hero-thumb";
    btn.dataset.slideIndex = String(i);
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
    btn.setAttribute("aria-label", `Show slide ${i + 1}`);
    const img = slide.querySelector("img");
    if (img) btn.appendChild(img.cloneNode(true));
    btn.addEventListener("click", () => goTo(i));
    thumbsRoot.appendChild(btn);
  });

  // Empty thumb placeholders (always 6 slots total)
  for (let i = slides.length; i < THUMB_SLOTS; i++) {
    const ph = document.createElement("span");
    ph.className = "hero-thumb hero-thumb--empty";
    ph.setAttribute("aria-hidden", "true");
    thumbsRoot.appendChild(ph);
  }

  prev?.addEventListener("click", () => goTo(index - 1));
  next?.addEventListener("click", () => goTo(index + 1));

  // Swipe
  let startX = 0;
  track.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend",   e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? index + 1 : index - 1);
  });

  render();
}

/* ============================================================================
   HORIZONTAL SCROLL CAROUSELS
   Reusable function for horizontal scrolling sections
   Used for: Applications carousel, Testimonials carousel
   ============================================================================ */
function initHScroll(root, prevBtn, nextBtn, amountRatio = 0.86) {
  if (!root) return;
  const step = () => Math.max(240, Math.floor(root.clientWidth * amountRatio));
  const beh  = () => prefersReducedMotion() ? "auto" : "smooth";
  prevBtn?.addEventListener("click", () => root.scrollBy({ left: -step(), behavior: beh() }));
  nextBtn?.addEventListener("click", () => root.scrollBy({ left:  step(), behavior: beh() }));
}

/* ============================================================================
   MANUFACTURING PROCESS TABS
   Interactive tab navigation showing production steps
   Content and tabs are dynamically generated from PROCESS_STEPS data
   ============================================================================ */

// Process steps data
const PROCESS_STEPS = [
  {
    key: "raw", label: "Raw Material",
    title: "High-Grade Raw Material Selection",
    body:  "Vacuum sizing tanks ensure precise outer diameter while internal pressure maintains perfect roundness and wall thickness uniformity.",
    bullets: ["PE100 grade material", "Optimal molecular weight distribution"],
  },
  {
    key: "extrusion", label: "Extrusion",
    title: "Controlled Extrusion Parameters",
    body:  "Temperature, pressure, and screw speed are continuously monitored to maintain melt homogeneity and consistent output rates.",
    bullets: ["Closed-loop monitoring", "Automated profile adjustments"],
  },
  {
    key: "cooling", label: "Cooling",
    title: "Gradual Cooling for Dimensional Stability",
    body:  "Controlled cooling prevents warping and residual stresses while preserving long-term mechanical properties.",
    bullets: ["Calibrated spray zones", "Stable shrink compensation"],
  },
  {
    key: "sizing", label: "Sizing",
    title: "Precision Sizing & Calibration",
    body:  "Sizing tooling and vacuum calibration keep OD/ID within tight tolerances across long production runs.",
    bullets: ["Laser OD checks", "Wall thickness sampling"],
  },
  {
    key: "qc", label: "Quality Control",
    title: "In-Line Quality Assurance",
    body:  "Batch traceability, mechanical tests, and visual inspection checkpoints ensure every coil meets specification.",
    bullets: ["Traceability IDs", "Destructive & non-destructive tests"],
  },
  {
    key: "marking", label: "Marking",
    title: "Durable Marking & Coding",
    body:  "Laser or inkjet marking applies standards-compliant identification for installation and audit trails.",
    bullets: ["Standard-compliant text", "Batch and date codes"],
  },
  {
    key: "cutting", label: "Cutting",
    title: "Accurate Cutting to Length",
    body:  "Automated cutting stations deliver repeatable lengths for coils and straight sticks with clean edges.",
    bullets: ["Servo-controlled cutters", "Length verification"],
  },
  {
    key: "packaging", label: "Packaging",
    title: "Protective Packaging for Transit",
    body:  "Finished goods are wrapped and palletized to prevent UV exposure and mechanical damage during logistics.",
    bullets: ["UV protective wrap", "Export-ready pallets"],
  },
];

// Initialize process tabs
function initProcess() {
  const tabsRoot = qs("#processTabs");
  const copyRoot = qs("#processCopy");
  const track    = qs("#processTrack");
  const prev     = qs("#processPrev");
  const next     = qs("#processNext");
  if (!tabsRoot || !copyRoot || !track) return;

  let active    = 0;
  let slideIdx  = 0;
  const slides  = qsa(".hero-gallery__slide", track);

  const renderCopy = () => {
    const step = PROCESS_STEPS[active];
    copyRoot.textContent = "";

    const h = document.createElement("h3");
    h.textContent = step.title;

    const p = document.createElement("p");
    p.textContent = step.body;

    const ul = document.createElement("ul");
    ul.className = "checklist";
    step.bullets.forEach(txt => {
      const li   = document.createElement("li");
      const icon = document.createElement("span");
      icon.className  = "check-ico";
      icon.textContent = "✓";
      const span = document.createElement("span");
      span.textContent = txt;
      li.appendChild(icon);
      li.appendChild(span);
      ul.appendChild(li);
    });

    copyRoot.appendChild(h);
    copyRoot.appendChild(p);
    copyRoot.appendChild(ul);
  };

  const renderTabs = () => {
    tabsRoot.textContent = "";
    PROCESS_STEPS.forEach((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "process-tab";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === active ? "true" : "false");
      b.textContent = s.label;
      b.addEventListener("click", () => {
        active = i;
        renderTabs();
        renderCopy();
      });
      tabsRoot.appendChild(b);
    });
  };

  const renderSlide = () => {
    track.style.transform = `translateX(${-slideIdx * 100}%)`;
  };

  prev?.addEventListener("click", () => {
    slideIdx = clamp(slideIdx - 1, 0, slides.length - 1);
    renderSlide();
  });
  next?.addEventListener("click", () => {
    slideIdx = clamp(slideIdx + 1, 0, slides.length - 1);
    renderSlide();
  });

  renderTabs();
  renderCopy();
  renderSlide();
}

/* ============================================================================
   FAQ ACCORDION
   Expandable/collapsible FAQ items
   Only one item can be open at a time
   ============================================================================ */
function initFaq() {
  const root = qs("#faqAccordion");
  if (!root) return;

  qsa(".accordion__item", root).forEach(item => {
    const btn   = qs(".accordion__trigger", item);
    const panel = qs(".accordion__panel", item);
    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      // Close all
      qsa(".accordion__item", root).forEach(it => {
        const b = qs(".accordion__trigger", it);
        const p = qs(".accordion__panel", it);
        if (!b || !p) return;
        const open = it === item ? willOpen : false;
        it.classList.toggle("is-open", open);
        b.setAttribute("aria-expanded", open ? "true" : "false");
        p.hidden = !open;
      });
    });
  });
}

/* ============================================================================
   MODAL DIALOGS
   Handles modal open/close with backdrop blur, Esc key, and focus management
   Two modals: Email request and Callback form
   ============================================================================ */
function initModals() {
  let lastFocus = null;

  const modalEmail    = qs("#modalEmail");
  const modalCallback = qs("#modalCallback");

  const openModal = (el) => {
    if (!el) return;
    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    el.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open"); // triggers backdrop blur

    // Focus first focusable
    const focusable = qsa(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', el
    ).filter(n => !n.hasAttribute("disabled"));
    (focusable[0] || el).focus?.();
  };

  const closeModal = (el) => {
    if (!el) return;
    el.setAttribute("hidden", "");
    document.body.style.overflow = "";
    document.body.classList.remove("modal-open");
    if (lastFocus?.focus) lastFocus.focus();
    lastFocus = null;
  };

  // Close via data-close attribute
  document.addEventListener("click", e => {
    const t  = e.target;
    if (!(t instanceof HTMLElement)) return;
    const id = t.getAttribute("data-close");
    if (!id) return;
    const el = document.getElementById(id);
    if (el) closeModal(el);
  });

  // Close via Esc
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (modalEmail    && !modalEmail.hasAttribute("hidden"))    closeModal(modalEmail);
    if (modalCallback && !modalCallback.hasAttribute("hidden")) closeModal(modalCallback);
  });

  // Openers
  qs("#btnDatasheet")?.addEventListener("click",     () => openModal(modalEmail));
  qs("#btnHeroSpecs")?.addEventListener("click",     () => openModal(modalEmail));
  qs("#btnHeroQuote")?.addEventListener("click",     () => openModal(modalCallback));
  qs("#btnFeatureQuote")?.addEventListener("click",  () => openModal(modalCallback));
  qs("#btnExpert")?.addEventListener("click",        () => openModal(modalCallback));

  // Form submissions — close on submit
  qs("#formEmailModal")?.addEventListener("submit",    e => { e.preventDefault(); closeModal(modalEmail); });
  qs("#formCallbackModal")?.addEventListener("submit", e => { e.preventDefault(); closeModal(modalCallback); });

  // Email modal: disable Brochure button until valid email
  const emailField = qs("#modalEmailField");
  const brochureBtn = qs(".btn--brochure");
  if (emailField && brochureBtn) {
    const sync = () => {
      const ok = emailField.value.trim().length > 3 && emailField.validity.valid;
      brochureBtn.disabled = !ok;
    };
    emailField.addEventListener("input", sync);
    sync();
  }
}

/* ============================================================================
   FORM HANDLING
   Basic form submission handlers (non-modal forms)
   Prevents default submission for demo purposes
   ============================================================================ */
function initForms() {
  qs("#catalogForm")?.addEventListener("submit", e => e.preventDefault());
  qs("#leadForm")?.addEventListener("submit",    e => e.preventDefault());
  qsa(".downloads-list__action").forEach(a =>
    a.addEventListener("click", e => e.preventDefault())
  );
}

/* -------------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initStickyHeader();
  initMobileNav();
  initHeroCarousel();
  initHScroll(qs("#appsCarousel"), qs("#appsPrev"), qs("#appsNext"));
  initHScroll(qs("#testiCarousel"), null, null);
  initProcess();
  initFaq();
  initModals();
  initForms();
});