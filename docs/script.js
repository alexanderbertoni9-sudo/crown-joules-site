// --------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// --------- Mobile menu ----------
const menuBtn = $("#menuBtn");
const navLinks = $("#navLinks");

menuBtn?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  document.body.classList.toggle("menu-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
});

// --------- Theme toggle (persisted) ----------
const themeToggle = $("#themeToggle");
const themeText = themeToggle?.querySelector(".toggle-text");

function setTheme(mode) {
  const isLight = mode === "light";
  document.body.classList.toggle("light", isLight);
  localStorage.setItem("cj_theme", mode);
  if (themeText) themeText.textContent = isLight ? "Light" : "Dark";
}

const savedTheme = localStorage.getItem("cj_theme");
setTheme(savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark");

themeToggle?.addEventListener("click", () => {
  const current = document.body.classList.contains("light") ? "light" : "dark";
  setTheme(current === "light" ? "dark" : "light");
});

// --------- Reveal on scroll ----------
const revealEls = $$(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { threshold: 0.14 }
);
revealEls.forEach((el) => io.observe(el));

// --------- Footer year ----------
$("#year").textContent = new Date().getFullYear();

// --------- Fake send button ----------
const fakeSendBtn = $("#fakeSendBtn");
const fakeSendText = $("#fakeSendText");

fakeSendBtn?.addEventListener("click", () => {
  fakeSendText.textContent = "This form is a placeholder — connect it to email later.";
  fakeSendBtn.blur();
});

// --------- Smooth scroll for logo + nav links ----------
function closeMobileMenu() {
  navLinks?.classList.remove("open");
  document.body.classList.remove("menu-open");
  menuBtn?.setAttribute("aria-expanded", "false");
}

function smoothScrollToHash(hash) {
  const el = document.querySelector(hash);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;

  const href = a.getAttribute("href") || "";
  if (!href.startsWith("#")) return;

  // Let external links behave normally
  e.preventDefault();
  smoothScrollToHash(href);
  closeMobileMenu();
});

// --------- Carousel ----------
(function initCarousel() {
  const root = document.querySelector("[data-carousel]");
  if (!root) return;

  const track = root.querySelector("[data-track]");
  const viewport = root.querySelector("[data-viewport]");
  const btnPrev = root.querySelector("[data-prev]");
  const btnNext = root.querySelector("[data-next]");
  const dotsWrap = root.querySelector("[data-dots]");

  const slides = Array.from(track.children);
  let index = 0;

  // Build dots
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dot" + (i === 0 ? " active" : "");
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
  });

  const dots = Array.from(dotsWrap.children);

  function update() {
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
  }

  btnPrev?.addEventListener("click", () => goTo(index - 1));
  btnNext?.addEventListener("click", () => goTo(index + 1));

  // Autoplay (pause on hover)
  let timer = null;
  function start() {
    stop();
    timer = setInterval(() => goTo(index + 1), 4200);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);

  // Swipe support
  let startX = 0;
  let dragging = false;

  viewport.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    viewport.setPointerCapture(e.pointerId);
    stop();
  });

  viewport.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;

    const dx = e.clientX - startX;
    const threshold = 40;
    if (dx > threshold) goTo(index - 1);
    else if (dx < -threshold) goTo(index + 1);

    start();
  });

  viewport.addEventListener("pointercancel", () => {
    dragging = false;
    start();
  });

  // Start autoplay
  update();
  start();
})();
