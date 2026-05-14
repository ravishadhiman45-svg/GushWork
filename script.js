/**
 * Mangalam / Meera — vanilla JS modules
 * - Sticky header (post first fold, hide on scroll up)
 * - Carousels + horizontal scroll regions
 * - Modals (backdrop / Esc / close)
 * - FAQ accordion + light form handling
 */

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* -----------------------------------------------------------------------------
   Utilities
   ----------------------------------------------------------------------------- */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function debounce(fn, ms) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* -----------------------------------------------------------------------------
   Sticky header
   ----------------------------------------------------------------------------- */

function initStickyHeader() {
  const sticky = qs("#stickyHeader");
  const page1 = qs("#page1");
  if (!sticky || !page1) return;

  let lastY = window.scrollY || 0;
  let foldY = 0;

  const measure = () => {
    const rect = page1.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    foldY = top + rect.height * 0.62;
  };

  const apply = () => {
    const y = window.scrollY || 0;

    if (y < 8) {
      sticky.classList.remove("is-active");
      sticky.setAttribute("aria-hidden", "true");
      lastY = y;
      return;
    }

    if (y <= foldY) {
      sticky.classList.remove("is-active");
      sticky.setAttribute("aria-hidden", "true");
    } else if (y > lastY) {
      sticky.classList.add("is-active");
      sticky.setAttribute("aria-hidden", "false");
    } else {
      sticky.classList.remove("is-active");
      sticky.setAttribute("aria-hidden", "true");
    }

    lastY = y;
  };

  const onScroll = () => {
    if (prefersReducedMotion()) {
      measure();
      const y = window.scrollY || 0;
      sticky.classList.toggle("is-active", y > foldY);
      sticky.setAttribute("aria-hidden", y > foldY ? "false" : "true");
      return;
    }
    apply();
  };

  measure();
  onScroll();

  window.addEventListener("resize", debounce(measure, 150));
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* -----------------------------------------------------------------------------
   Mobile navigation (main + sticky lists)
   ----------------------------------------------------------------------------- */

function initMobileNav() {
  const mainToggle = qs("#mainNavToggle");
  const stickyToggle = qs("#stickyNavToggle");
  const mainList = qs("#mainNavList");
  const stickyList = qs("#stickyNavList");

  const lists = [mainList, stickyList].filter(Boolean);

  const setOpen = (open) => {
    lists.forEach((ul) => ul && ul.classList.toggle("is-open", open));
    [mainToggle, stickyToggle].forEach((btn) => {
      if (!btn) return;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  };

  const wireToggle = (btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      const open = !lists.some((ul) => ul.classList.contains("is-open"));
      setOpen(open);
    });
  };

  wireToggle(mainToggle);
  wireToggle(stickyToggle);

  qsa('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });

  window.addEventListener(
    "resize",
    debounce(() => {
      if (window.innerWidth > 800) setOpen(false);
    }, 150)
  );
}

/* -----------------------------------------------------------------------------
   Hero carousel + thumbnails
   ----------------------------------------------------------------------------- */

function initHeroCarousel() {
  const track = qs("#heroTrack");
  const prev = qs("#heroPrev");
  const next = qs("#heroNext");
  const thumbsRoot = qs("#heroThumbs");
  if (!track || !thumbsRoot) return;

  const slides = qsa(".hero-gallery__slide", track);
  let index = 0;
  const THUMB_SLOTS = 6;

  const render = () => {
    track.style.transform = `translateX(${-index * 100}%)`;
    qsa(".hero-thumb", thumbsRoot).forEach((t) => {
      const si = t.dataset.slideIndex;
      if (si === undefined) {
        t.setAttribute("aria-selected", "false");
      } else {
        t.setAttribute("aria-selected", Number(si) === index ? "true" : "false");
      }
    });
  };

  const goTo = (i) => {
    index = clamp(i, 0, slides.length - 1);
    render();
  };

  slides.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hero-thumb";
    btn.dataset.slideIndex = String(i);
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
    btn.setAttribute("aria-label", `Show slide ${i + 1}`);
    const img = slides[i].querySelector("img");
    if (img) btn.appendChild(img.cloneNode(true));
    btn.addEventListener("click", () => goTo(i));
    thumbsRoot.appendChild(btn);
  });

  for (let i = slides.length; i < THUMB_SLOTS; i++) {
    const ph = document.createElement("span");
    ph.className = "hero-thumb hero-thumb--empty";
    ph.setAttribute("aria-hidden", "true");
    thumbsRoot.appendChild(ph);
  }

  prev?.addEventListener("click", () => goTo(index - 1));
  next?.addEventListener("click", () => goTo(index + 1));

  render();
}

/* -----------------------------------------------------------------------------
   Horizontal scroll regions (applications + testimonials)
   ----------------------------------------------------------------------------- */

function initHScroll(root, prevBtn, nextBtn, amountRatio = 0.86) {
  if (!root) return;

  const step = () => Math.max(240, Math.floor(root.clientWidth * amountRatio));

  prevBtn?.addEventListener("click", () => {
    root.scrollBy({ left: -step(), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  });

  nextBtn?.addEventListener("click", () => {
    root.scrollBy({ left: step(), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  });
}

/* -----------------------------------------------------------------------------
   Manufacturing tabs + mini carousel
   ----------------------------------------------------------------------------- */

const PROCESS_STEPS = [
  {
    key: "raw",
    label: "Raw Material",
    title: "High-Grade Raw Material Selection",
    body: "Vacuum sizing tanks ensure precise outer diameter while internal pressure maintains perfect roundness and wall thickness uniformity.",
    bullets: ["PE100 grade material", "Optimal molecular weight distribution"],
  },
  {
    key: "extrusion",
    label: "Extrusion",
    title: "Controlled Extrusion Parameters",
    body: "Temperature, pressure, and screw speed are continuously monitored to maintain melt homogeneity and consistent output rates.",
    bullets: ["Closed-loop monitoring", "Automated profile adjustments"],
  },
  {
    key: "cooling",
    label: "Cooling",
    title: "Gradual Cooling for Dimensional Stability",
    body: "Controlled cooling prevents warping and residual stresses while preserving long-term mechanical properties.",
    bullets: ["Calibrated spray zones", "Stable shrink compensation"],
  },
  {
    key: "sizing",
    label: "Sizing",
    title: "Precision Sizing & Calibration",
    body: "Sizing tooling and vacuum calibration keep OD/ID within tight tolerances across long production runs.",
    bullets: ["Laser OD checks", "Wall thickness sampling"],
  },
  {
    key: "qc",
    label: "Quality Control",
    title: "In-Line Quality Assurance",
    body: "Batch traceability, mechanical tests, and visual inspection checkpoints ensure every coil meets specification.",
    bullets: ["Traceability IDs", "Destructive & non-destructive tests"],
  },
  {
    key: "marking",
    label: "Marking",
    title: "Durable Marking & Coding",
    body: "Laser or inkjet marking applies standards-compliant identification for installation and audit trails.",
    bullets: ["Standard-compliant text", "Batch and date codes"],
  },
  {
    key: "cutting",
    label: "Cutting",
    title: "Accurate Cutting to Length",
    body: "Automated cutting stations deliver repeatable lengths for coils and straight sticks with clean edges.",
    bullets: ["Servo-controlled cutters", "Length verification"],
  },
  {
    key: "packaging",
    label: "Packaging",
    title: "Protective Packaging for Transit",
    body: "Finished goods are wrapped and palletized to prevent UV exposure and mechanical damage during logistics.",
    bullets: ["UV protective wrap", "Export-ready pallets"],
  },
];

function initProcess() {
  const tabsRoot = qs("#processTabs");
  const copyRoot = qs("#processCopy");
  const track = qs("#processTrack");
  const prev = qs("#processPrev");
  const next = qs("#processNext");
  if (!tabsRoot || !copyRoot || !track) return;

  let active = 0;

  const renderCopy = () => {
    const step = PROCESS_STEPS[active];
    copyRoot.textContent = "";

    const h = document.createElement("h3");
    h.textContent = step.title;
    const p = document.createElement("p");
    p.textContent = step.body;

    const ul = document.createElement("ul");
    ul.className = "checklist";
    step.bullets.forEach((txt) => {
      const li = document.createElement("li");
      const icon = document.createElement("span");
      icon.className = "check-ico";
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

  const slides = qsa(".hero-gallery__slide", track);
  let slideIdx = 0;

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

/* -----------------------------------------------------------------------------
   FAQ accordion
   ----------------------------------------------------------------------------- */

function initFaq() {
  const root = qs("#faqAccordion");
  if (!root) return;

  qsa(".accordion__item", root).forEach((item) => {
    const btn = qs(".accordion__trigger", item);
    const panel = qs(".accordion__panel", item);
    if (!btn || !panel) return;

    const setOpen = (open) => {
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
    };

    btn.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      qsa(".accordion__item", root).forEach((it) => {
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

/* -----------------------------------------------------------------------------
   Modals
   ----------------------------------------------------------------------------- */

function initModals() {
  /** @type {HTMLElement | null} */
  let lastFocus = null;

  const modalEmail = qs("#modalEmail");
  const modalCallback = qs("#modalCallback");

  const openModal = (el) => {
    if (!el) return;
    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    el.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open"); // ← add this line


    const focusable = qsa('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', el).filter(
      (n) => !n.hasAttribute("disabled")
    );
    (focusable[0] || el).focus?.();
  };

  const closeModal = (el) => {
    if (!el) return;
    el.setAttribute("hidden", "");
      document.body.classList.remove("modal-open"); // ← add this line

    document.body.style.overflow = "";

    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
  };

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const id = t.getAttribute("data-close");
    if (!id) return;
    const el = document.getElementById(id);
    if (el) closeModal(el);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modalEmail && !modalEmail.hasAttribute("hidden")) closeModal(modalEmail);
    if (modalCallback && !modalCallback.hasAttribute("hidden")) closeModal(modalCallback);
  });

  const wireOpeners = () => {
    qs("#btnDatasheet")?.addEventListener("click", () => openModal(modalEmail));
    qs("#btnHeroSpecs")?.addEventListener("click", () => openModal(modalEmail));

    qs("#btnHeroQuote")?.addEventListener("click", () => openModal(modalCallback));
    qs("#btnFeatureQuote")?.addEventListener("click", () => openModal(modalCallback));
    qs("#btnExpert")?.addEventListener("click", () => openModal(modalCallback));
  };

  const wireForms = () => {
    qs("#formEmailModal")?.addEventListener("submit", (e) => {
      e.preventDefault();
      closeModal(modalEmail);
    });

    qs("#formCallbackModal")?.addEventListener("submit", (e) => {
      e.preventDefault();
      closeModal(modalCallback);
    });
  };

  const wireEmailUi = () => {
    const email = qs("#modalEmailField");
    const btn = qs(".btn--brochure");
    if (!(email instanceof HTMLInputElement) || !btn) return;

    const sync = () => {
      const ok = email.value.trim().length > 3 && email.validity.valid;
      btn.disabled = !ok;
      btn.style.opacity = ok ? "1" : "0.65";
    };

    email.addEventListener("input", sync);
    sync();
  };

  wireOpeners();
  wireForms();
  wireEmailUi();
}

/* -----------------------------------------------------------------------------
   Forms (non-modal)
   ----------------------------------------------------------------------------- */

function initForms() {
  qs("#catalogForm")?.addEventListener("submit", (e) => e.preventDefault());
  qs("#catalogFormPage8")?.addEventListener("submit", (e) => e.preventDefault());
  qs("#leadForm")?.addEventListener("submit", (e) => e.preventDefault());
  qsa(".downloads-list__action").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
}

/* -----------------------------------------------------------------------------
   Boot
   ----------------------------------------------------------------------------- */

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
