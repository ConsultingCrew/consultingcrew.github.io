'use strict';

/* ===============================
   CONFIGURATION
================================= */
const COMPONENTS = {
  // Use relative paths to support subdirectory deployments
  header: 'components/header.html',
  footer: 'components/footer.html'
};

const CONFIG = {
  breakpoint: 992,   // Matches CSS tablet breakpoint
  retries: 3
};

/* ===============================
   HELPERS
================================= */
const Helpers = {
  /**
   * Simple throttle for scroll events.
   * Limits execution to ~60fps.
   */
  throttle(fn, limit = 16) {
    let wait = false;
    return (...args) => {
      if (!wait) {
        fn(...args);
        wait = true;
        setTimeout(() => {
          wait = false;
        }, limit);
      }
    };
  },

  /**
   * Checks if the current device supports touch or is a mobile viewport.
   */
  isMobileView() {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const isSmallScreen = window.innerWidth <= CONFIG.breakpoint;
    return isTouch || isSmallScreen;
  }
};

/* ===============================
   FETCH WITH RETRY & CACHE
================================= */
async function fetchHTML(path, retries = CONFIG.retries) {
  for (let i = 1; i <= retries; i++) {
    try {
      const response = await fetch(path, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (err) {
      if (i === retries) throw err;
      // Exponential backoff
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
  throw new Error('Failed to fetch HTML after retries');
}

/* ===============================
   LOAD COMPONENT INTO CONTAINER
================================= */
async function loadComponent(containerId, path) {
  const container = document.getElementById(containerId);
  if (!container) return false;

  try {
    const html = await fetchHTML(path);
    container.innerHTML = html;
    return true;
  } catch (err) {
    console.warn(`[header-footer] Failed to load ${containerId}:`, err.message);
    // Use fallback HTML
    container.innerHTML = getFallbackHTML(containerId);
    return false;
  }
}

/* ===============================
   FALLBACK HTML (for offline / network failure)
================================= */
function getFallbackHTML(id) {
  const year = new Date().getFullYear();

  if (id === 'header-container') {
    return `
      <header class="main-header">
        <div class="container">
          <nav class="navbar" aria-label="Main navigation">
            <a href="/" class="logo">
              <span class="logo-text">Consulting Crew</span>
            </a>
            <button class="mobile-menu-toggle" aria-label="Toggle menu" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
            <div class="nav-menu">
              <ul class="nav-list">
                <li><a href="/" class="nav-link">Home</a></li>
                <li><a href="/about.html" class="nav-link">About</a></li>
                <li><a href="/services.html" class="nav-link">Services</a></li>
                <li><a href="/portfolio.html" class="nav-link">Portfolio</a></li>
                <li><a href="/insights.html" class="nav-link">Insights</a></li>
                <li><a href="/contact.html" class="nav-link cta-link">Contact</a></li>
              </ul>
            </div>
          </nav>
        </div>
      </header>
    `;
  }

  // Footer fallback
  return `
    <footer class="main-footer">
      <div class="container">
        <div class="footer-col">
          <p class="footer-logo">Consulting Crew</p>
          <p class="footer-description">&copy; ${year} Consulting Crew. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
}

/* ===============================
   MOBILE MENU TOGGLE
================================= */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.querySelector('.nav-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('active');
    toggle.classList.toggle('active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when clicking outside (optional but improves UX)
  document.addEventListener('click', (e) => {
    const isInside = e.target.closest('.main-header');
    if (!isInside && menu.classList.contains('active')) {
      menu.classList.remove('active');
      toggle.classList.remove('active');
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ===============================
   DROPDOWNS (Enhanced for Resize)
================================= */
function initDropdowns() {
  document.querySelectorAll('.dropdown').forEach((dropdown) => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (!toggle) return;

    // Always attach listener – condition checked inside to support window resizing
    toggle.addEventListener('click', (e) => {
      if (Helpers.isMobileView()) {
        e.preventDefault();
        const isOpen = dropdown.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen);
      }
      // On desktop, default hover behaviour takes over (do nothing)
    });

    // Keyboard support (Enter / Space)
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (Helpers.isMobileView()) {
          const isOpen = dropdown.classList.toggle('open');
          toggle.setAttribute('aria-expanded', isOpen);
        }
      }
    });
  });
}

/* ===============================
   STICKY / SCROLL HEADER
================================= */
function initStickyHeader() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  const scrollHandler = Helpers.throttle(() => {
    const scrolled = window.scrollY > 50;
    header.classList.toggle('scrolled', scrolled);
    // Also toggle body class for layout consistency
    document.body.classList.toggle('header-scrolled', scrolled);
  });

  window.addEventListener('scroll', scrollHandler, { passive: true });
}

/* ===============================
   ACTIVE NAV LINK
================================= */
function markActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Extract filename from href
    const linkPage = href.split('/').pop();
    const isActive = linkPage === currentPage ||
                     (currentPage === '' && href === '/');

    if (isActive) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ===============================
   UPDATE FOOTER YEAR
================================= */
function updateYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ===============================
   INIT (Async)
================================= */
(async function init() {
  // Load header and footer in parallel
  await Promise.all([
    loadComponent('header-container', COMPONENTS.header),
    loadComponent('footer-container', COMPONENTS.footer)
  ]);

  // Re-initialise DOM-dependent features after HTML injection
  initMobileMenu();
  initDropdowns();
  initStickyHeader();
  markActiveLink();
  updateYear();
})();