'use strict';

const COMPONENTS = {
  header: 'components/header.html',
  footer: 'components/footer.html'
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

        setTimeout(() => {
          wait = false;
        }, limit);
      }
    };
  }
};

/* ===============================
   FETCH COMPONENT
================================= */
async function fetchHTML(path) {
  const response = await fetch(path, {
    cache: 'force-cache'
  });

  if (!response.ok) {
    throw new Error('Failed fetch');
  }

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
}

/* ===============================
   FALLBACK
================================= */
function fallback(id) {
  const year = new Date().getFullYear();

  if (id === 'header-container') {
    return `
      <header class="main-header">
        <div class="container">
          <a href="index.html" class="logo">Consulting Crew</a>
        </div>
      </header>
    `;
  }

  return `
    <footer class="main-footer">
      <div class="container">
        © ${year} Consulting Crew
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
    toggle.classList.toggle('active');
    menu.classList.toggle('active');

    document.body.classList.toggle('menu-open');
  });
}

/* ===============================
   DROPDOWNS
================================= */
function initDropdowns() {
  document.querySelectorAll('.dropdown').forEach(dropdown => {

    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', e => {

      if (window.innerWidth <= CONFIG.breakpoint) {
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

    if (href === page) {
      link.classList.add('active');
    }

  });
}

/* ===============================
   YEAR
================================= */
function updateYear() {
  const year = document.getElementById('current-year');

  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

/* ===============================
   INIT
================================= */
(async function init() {

  await Promise.all([
    loadComponent('header-container', COMPONENTS.header),
    loadComponent('footer-container', COMPONENTS.footer)
  ]);

  initMobileMenu();
  initDropdowns();
  initStickyHeader();
  markActiveLink();
  updateYear();

})();