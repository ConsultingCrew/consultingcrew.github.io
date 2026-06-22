'use strict';

const COMPONENTS = {
  header: '/components/header.html',   // absolute path from root
  footer: '/components/footer.html'
};

const CONFIG = {
  breakpoint: 992,
  retries: 3
};

/* ===============================
   HELPERS
================================= */
const Helpers = {
  throttle(fn, limit = 16) {
    let wait = false;
    return (...args) => {
      if (!wait) {
        fn(...args);
        wait = true;
        setTimeout(() => { wait = false; }, limit);
      }
    };
  }
};

/* ===============================
   FETCH COMPONENT
================================= */
async function fetchHTML(path) {
  const response = await fetch(path, { cache: 'force-cache' });
  if (!response.ok) throw new Error('Failed fetch');
  return response.text();
}

/* ===============================
   LOAD COMPONENT
================================= */
async function loadComponent(id, path) {
  const container = document.getElementById(id);
  if (!container) return false;

  for (let i = 1; i <= CONFIG.retries; i++) {
    try {
      const html = await fetchHTML(path);
      container.innerHTML = html;
      return true;
    } catch (err) {
      if (i === CONFIG.retries) {
        container.innerHTML = fallback(id);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return false;
}

/* ===============================
   FALLBACK (Enhanced)
================================= */
function fallback(id) {
  const year = new Date().getFullYear();
  if (id === 'header-container') {
    // Provide a more complete fallback (full nav) if possible
    return `
      <header class="main-header">
        <div class="container">
          <nav class="navbar">
            <a href="/" class="logo">Consulting Crew</a>
            <button class="mobile-menu-toggle" aria-label="Toggle menu">
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
  return `
    <footer class="main-footer">
      <div class="container">
        <p>&copy; ${year} Consulting Crew. All rights reserved.</p>
      </div>
    </footer>
  `;
}

/* ===============================
   MOBILE MENU
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
}

/* ===============================
   DROPDOWNS
================================= */
function initDropdowns() {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  document.querySelectorAll('.dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (!toggle) return;

    // On touch devices or small screens, use click to toggle
    if (isTouch || window.innerWidth <= CONFIG.breakpoint) {
      toggle.addEventListener('click', e => {
        e.preventDefault();
        const isOpen = dropdown.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen);
      });
    }

    // For keyboard users, allow Enter/Space
    toggle.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dropdown.classList.toggle('open');
      }
    });
  });
}

/* ===============================
   STICKY HEADER
================================= */
function initStickyHeader() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  const scrollHandler = Helpers.throttle(() => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });

  window.addEventListener('scroll', scrollHandler, { passive: true });
}

/* ===============================
   ACTIVE LINK
================================= */
function markActiveLink() {
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === '/')) {
      link.classList.add('active');
    }
  });
}

/* ===============================
   YEAR
================================= */
function updateYear() {
  const year = document.getElementById('current-year');
  if (year) year.textContent = new Date().getFullYear();
}

/* ===============================
   INIT
================================= */
(async function init() {
  await Promise.all([
    loadComponent('header-container', COMPONENTS.header),
    loadComponent('footer-container', COMPONENTS.footer)
  ]);

  // Re-initialize after components are loaded
  initMobileMenu();
  initDropdowns();
  initStickyHeader();
  markActiveLink();
  updateYear();
})();