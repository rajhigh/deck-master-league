/**
 * ANIMATIONS.JS — Deck Master League
 * Scroll reveal, counter animation, ripple buttons
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initRippleButtons();
  initCounterObserver();
  initGlitchText();
});

/* ----------------------------------------
   SCROLL REVEAL
   ---------------------------------------- */
function initScrollReveal() {
  // Mark elements for reveal
  const targets = [
    '.liga-card',
    '.mini-klasemen',
    '.recent-card',
    '.riwayat-card',
    '.pemain-card',
    '.info-box',
    '.section-title',
    '.stat-card',
  ];

  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
        // stagger siblings
        if (i > 0) {
          const delay = Math.min(i * 0.08, 0.4);
          el.style.transitionDelay = delay + 's';
        }
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* re-run after dynamic content added (e.g. after JS renders cards) */
window.triggerReveal = function () {
  const newEls = document.querySelectorAll('.reveal:not(.revealed)');
  newEls.forEach(el => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    io.observe(el);
  });
};

/* ----------------------------------------
   RIPPLE BUTTONS
   ---------------------------------------- */
function initRippleButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 1.5;
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
}

/* ----------------------------------------
   ANIMATED NUMBER COUNTER
   ---------------------------------------- */
function animateCount(el, target, duration = 1200) {
  const start = performance.now();
  const startVal = 0;

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (target - startVal) * eased);
    el.textContent = current;

    el.classList.remove('counting');
    void el.offsetWidth; // reflow
    el.classList.add('counting');

    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }

  requestAnimationFrame(update);
}

function initCounterObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const val = parseInt(el.dataset.count, 10);
      if (!isNaN(val)) animateCount(el, val);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  // Observe all .stat-num elements that have data-count
  document.querySelectorAll('.stat-num[data-count]').forEach(el => observer.observe(el));
}

/* expose so home.js can set data-count and trigger */
window.setupCounters = function () {
  document.querySelectorAll('.stat-num').forEach(el => {
    const val = parseInt(el.textContent, 10);
    if (!isNaN(val)) {
      el.dataset.count = val;
      el.textContent = '0';
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const val = parseInt(el.dataset.count, 10);
      if (!isNaN(val)) animateCount(el, val);
      observer.unobserve(el);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stat-num[data-count]').forEach(el => observer.observe(el));
};

/* ----------------------------------------
   GLITCH TEXT SETUP
   ---------------------------------------- */
function initGlitchText() {
  const line2 = document.querySelector('.hero-line2');
  if (!line2) return;
  line2.setAttribute('data-text', line2.textContent);
}

/* ----------------------------------------
   CARD HOVER TILT (pemain cards, liga cards)
   ---------------------------------------- */
document.addEventListener('mousemove', (e) => {
  const card = e.target.closest('.pemain-card, .liga-card');
  if (!card) return;

  const rect  = card.getBoundingClientRect();
  const cx    = rect.left + rect.width  / 2;
  const cy    = rect.top  + rect.height / 2;
  const dx    = (e.clientX - cx) / (rect.width  / 2);
  const dy    = (e.clientY - cy) / (rect.height / 2);
  const rotX  = -dy * 6;
  const rotY  =  dx * 6;

  card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
});

document.addEventListener('mouseleave', (e) => {
  const card = e.target.closest('.pemain-card, .liga-card');
  if (!card) return;
  card.style.transform = '';
}, true);

/* ----------------------------------------
   TYPING EFFECT for page-header subtitles
   ---------------------------------------- */
function typeText(el, text, speed = 35) {
  el.textContent = '';
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(timer);
  }, speed);
}

const subtitle = document.querySelector('.page-header p');
if (subtitle) {
  const original = subtitle.textContent;
  subtitle.textContent = '';
  setTimeout(() => typeText(subtitle, original, 30), 400);
}
