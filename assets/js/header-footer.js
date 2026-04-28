const COMPONENT_PATHS = {
  header: 'components/header.html',
  footer: 'components/footer.html'
};

const CONFIG = {
  MOBILE_BREAKPOINT: 992,
  SCROLL_THRESHOLD: 50,
  HEADER_HEIGHT: 67,
  HEADER_HEIGHT_SCROLLED: 60,
};

// Utilities
const throttle = (fn, delay) => { let last = 0; return (...args) => { const now = Date.now(); if (now - last >= delay) { last = now; fn(...args); } } };
const debounce = (fn, delay) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); } };

// Placeholders
function showPlaceholders() {
  const headerEl = document.getElementById('header-container');
  const footerEl = document.getElementById('footer-container');
  const pulseAnim = 'background:linear-gradient(90deg,#f0f0f0,#e0e0e0,#f0f0f0);background-size:200% 100%;animation:loadingPulse 1.5s infinite';
  if (headerEl) headerEl.innerHTML = `<div class="loading-placeholder" style="height:67px;${pulseAnim}"></div>`;
  if (footerEl) footerEl.innerHTML = `<div class="loading-placeholder" style="height:400px;${pulseAnim};margin-top:40px"></div>`;
}

// Load component with retry
async function loadComponent(id, path, retries = 3) {
  const container = document.getElementById(id);
  if (!container) return false;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      container.innerHTML = await res.text();
      return true;
    } catch (err) {
      console.warn(`Failed to load ${id} (attempt ${i + 1}): ${err.message}`);
      if (i === retries - 1) {
        container.innerHTML = fallbackComponent(id);
        return false;
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

function fallbackComponent(id) {
  const year = new Date().getFullYear();
  if (id === 'header-container') {
    return `<header class="main-header"><div class="container"><nav class="navbar"><a href="index.html" class="logo">Consulting Crew</a><div class="nav-menu"><ul class="nav-list"><li><a href="index.html" class="nav-link active">Home</a></li><li><a href="about.html">About</a></li><li><a href="services.html">Services</a></li><li><a href="portfolio.html">Portfolio</a></li><li><a href="insights.html">Insights</a></li><li><a href="contact.html" class="btn-primary">Contact</a></li></ul></div></nav></div></header>`;
  }
  return `<footer class="main-footer"><div class="container text-center"><p>© ${year} Consulting Crew</p><nav><a href="legal_privacy.html">Privacy</a> | <a href="legal_terms.html">Terms</a> | <a href="legal_cookies.html">Cookies</a></nav></div></footer>`;
}

// Ensure FontAwesome
function ensureFA() {
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    link.integrity = 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
}

// Header interactions (after component injection)
let mobileCleanup = null;
let dropdownCleanup = null;

function initMobileMenu() {
  mobileCleanup?.();
  const toggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;

  let open = false;

  const setMenu = (state) => {
    open = state;
    toggle.classList.toggle('active', open);
    menu.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  const toggleMenu = () => setMenu(!open);
  const closeMenu = () => open && setMenu(false);

  toggle.addEventListener('click', toggleMenu);
  menu.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) closeMenu();
  });

  const mediaQuery = window.matchMedia(`(min-width: ${CONFIG.MOBILE_BREAKPOINT}px)`);
  const handleBreakpoint = () => { if (mediaQuery.matches && open) closeMenu(); };
  mediaQuery.addEventListener('change', handleBreakpoint);

  mobileCleanup = () => {
    toggle.removeEventListener('click', toggleMenu);
    menu.querySelectorAll('.nav-link').forEach(link => link.removeEventListener('click', closeMenu));
    mediaQuery.removeEventListener('change', handleBreakpoint);
    document.body.style.overflow = '';
  };
}

function initDropdowns() {
  dropdownCleanup?.();
  const dropdowns = document.querySelectorAll('.dropdown');
  if (!dropdowns.length) return;

  const cleanups = [];
  const mediaQuery = window.matchMedia(`(min-width: ${CONFIG.MOBILE_BREAKPOINT}px)`);

  dropdowns.forEach(dd => {
    const toggle = dd.querySelector('.dropdown-toggle');
    const menu = dd.querySelector('.dropdown-menu');
    if (!toggle || !menu) return;

    let open = false;
    let timer = null;

    const show = () => {
      if (!open) {
        open = true;
        dd.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        // Close other dropdowns at same level
        dropdowns.forEach(other => {
          if (other !== dd && other.classList.contains('open')) {
            other.classList.remove('open');
            other.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
          }
        });
      }
    };

    const hide = () => {
      if (open) {
        open = false;
        dd.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    };

    const mouseEnter = () => mediaQuery.matches && (clearTimeout(timer), show());
    const mouseLeave = () => mediaQuery.matches && (timer = setTimeout(hide, 150));

    const clickHandler = (e) => {
      if (!mediaQuery.matches) {
        e.preventDefault();
        open ? hide() : show();
      }
    };

    const keyHandler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        mediaQuery.matches ? show() : (open ? hide() : show());
      } else if (e.key === 'Escape' && open) {
        hide();
        toggle.focus();
      }
    };

    dd.addEventListener('mouseenter', mouseEnter);
    dd.addEventListener('mouseleave', mouseLeave);
    toggle.addEventListener('click', clickHandler);
    toggle.addEventListener('keydown', keyHandler);

    cleanups.push(() => {
      dd.removeEventListener('mouseenter', mouseEnter);
      dd.removeEventListener('mouseleave', mouseLeave);
      toggle.removeEventListener('click', clickHandler);
      toggle.removeEventListener('keydown', keyHandler);
    });
  });

  // Close all on outside click
  const closeAll = (e) => {
    if (!e.target.closest('.dropdown')) {
      dropdowns.forEach(dd => {
        dd.classList.remove('open');
        dd.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  };
  document.addEventListener('click', closeAll);
  cleanups.push(() => document.removeEventListener('click', closeAll));

  dropdownCleanup = () => cleanups.forEach(fn => fn());
}

function initStickyHeader() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  let lastScroll = 0;
  const scrollHandler = throttle(() => {
    const currentScroll = window.scrollY;
    const scrolled = currentScroll > CONFIG.SCROLL_THRESHOLD;
    header.classList.toggle('scrolled', scrolled);

    if (currentScroll > 200 && currentScroll > lastScroll && currentScroll > header.offsetHeight) {
      header.classList.add('header-hidden');
    } else {
      header.classList.remove('header-hidden');
    }
    lastScroll = currentScroll;
  }, 16);

  window.addEventListener('scroll', scrollHandler, { passive: true });

  // Adjust body padding
  const ro = new ResizeObserver(debounce(() => {
    document.body.style.paddingTop = header.offsetHeight + 'px';
  }, 100));
  ro.observe(header);
}

function markActiveLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function setCurrentYear() {
  const el = document.getElementById('current-year');
  if (el && !el.textContent) el.textContent = new Date().getFullYear();
}

// Main initialisation
(async function init() {
  showPlaceholders();
  const [headerOk, footerOk] = await Promise.all([
    loadComponent('header-container', COMPONENT_PATHS.header),
    loadComponent('footer-container', COMPONENT_PATHS.footer)
  ]);
  ensureFA();

  // Small timeout to allow DOM to settle after injection
  setTimeout(() => {
    initMobileMenu();
    initDropdowns();
    initStickyHeader();
    markActiveLink();
    setCurrentYear();
  }, 100);

  window.dispatchEvent(new CustomEvent('componentsLoaded', {
    detail: { headerOk, footerOk }
  }));
})();