/* =============================================
   script.js — Jhakruthi Thumu Portfolio
   ============================================= */

// ── DOM REFERENCES ──────────────────────────────
const html          = document.documentElement;
const navbar        = document.getElementById('navbar');
const hamburger     = document.getElementById('hamburger');
const navLinks      = document.getElementById('nav-links');
const themeToggle   = document.getElementById('theme-toggle');
const allNavLinks   = document.querySelectorAll('.nav-link');
const revealEls     = document.querySelectorAll('.reveal-up');


// ── 1. THEME TOGGLE ─────────────────────────────
// Read saved preference or default to dark
const savedTheme = localStorage.getItem('jt-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('jt-theme', next);
});


// ── 2. HAMBURGER MENU ───────────────────────────
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// Close menu when a nav link is clicked (mobile)
allNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});


// ── 3. NAVBAR SCROLL SHADOW ─────────────────────
const handleNavScroll = () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
};

window.addEventListener('scroll', handleNavScroll, { passive: true });


// ── 4. ACTIVE NAV LINK ON SCROLL ────────────────
const sections = document.querySelectorAll('section[id]');

const activeLinkObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        allNavLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(sec => activeLinkObserver.observe(sec));


// ── 5. SCROLL-REVEAL WITH IntersectionObserver ──
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // fire once
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach(el => revealObserver.observe(el));


// ── 6. SMOOTH ANCHOR SCROLL (fallback for older browsers) ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offsetTop = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  });
});


// ── 7. DOCK HIDE/SHOW ON SCROLL DIRECTION ───────
let lastScrollY  = window.scrollY;
let dockHideTimer = null;
const dock = document.getElementById('dock');

const handleDockScroll = () => {
  const currentY = window.scrollY;
  // Hide dock while scrolling down fast, show when scrolled up or near top
  if (currentY > lastScrollY + 5) {
    dock.style.opacity = '0.4';
    dock.style.transform = 'translateX(-50%) translateY(6px)';
  } else {
    dock.style.opacity = '1';
    dock.style.transform = 'translateX(-50%) translateY(0)';
  }
  lastScrollY = currentY;
};

dock.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
window.addEventListener('scroll', handleDockScroll, { passive: true });


// ── 8. PROJECT CARD TILT MICRO-INTERACTION ──────
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const cx     = rect.width  / 2;
    const cy     = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -6;   // max ±6 deg
    const rotateY = ((x - cx) / cx) *  6;
    card.style.transform = `translateY(-4px) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease';
  });

  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease';
  });
});


// ── 9. HIGHLIGHT ACTIVE NAV LINK STYLE ──────────
// Add active class styling via JS (CSS handles the visual)
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .nav-link.active {
    color: var(--accent) !important;
  }
  .nav-link.active::after {
    width: 100% !important;
  }
`;
document.head.appendChild(styleSheet);


// ── 10. STAT NUMBER COUNTER ANIMATION ───────────
const statsSection = document.querySelector('.hero-stats');

const animateCounters = (entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);

    entry.target.querySelectorAll('.stat-num').forEach(el => {
      const rawText = el.textContent.trim();
      // Only animate purely numeric values
      const numMatch = rawText.match(/[\d.]+/);
      if (!numMatch) return;

      const end      = parseFloat(numMatch[0]);
      const prefix   = rawText.slice(0, rawText.indexOf(numMatch[0]));
      const suffix   = rawText.slice(rawText.indexOf(numMatch[0]) + numMatch[0].length);
      const duration = 1400;
      const start    = performance.now();

      const step = (now) => {
        const progress  = Math.min((now - start) / duration, 1);
        const eased     = 1 - Math.pow(1 - progress, 3);
        const value     = eased * end;
        const display   = end % 1 === 0 ? Math.floor(value) : value.toFixed(1);
        el.textContent  = `${prefix}${display}${suffix}`;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = rawText; // restore original on finish
      };

      requestAnimationFrame(step);
    });
  });
};

const counterObserver = new IntersectionObserver(animateCounters, { threshold: 0.5 });
if (statsSection) counterObserver.observe(statsSection);


// ── INIT ─────────────────────────────────────────
handleNavScroll(); // run on load in case page is already scrolled
