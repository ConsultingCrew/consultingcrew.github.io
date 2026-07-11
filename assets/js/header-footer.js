(() => {
  'use strict';

const CONFIG = {
  headerUrl: '/components/header.html',
  footerUrl: '/components/footer.html',
  cacheBust: true,
};

  const log = (msg, type = 'info') => {
    const prefix = '🔷 [HeaderFooter]';
    if (type === 'error') console.error(`${prefix} ${msg}`);
    else if (type === 'warn') console.warn(`${prefix} ${msg}`);
    else console.log(`${prefix} ${msg}`);
  };

  const getUrl = (url) => {
    if (CONFIG.cacheBust) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}_=${Date.now()}`;
    }
    return url;
  };

  const injectHTML = async () => {
    try {
      log('Fetching header and footer...');

      const [headerRes, footerRes] = await Promise.all([
        fetch(getUrl(CONFIG.headerUrl)),
        fetch(getUrl(CONFIG.footerUrl)),
      ]);

      if (!headerRes.ok) throw new Error(`Header not found (${headerRes.status}) – ${CONFIG.headerUrl}`);
      if (!footerRes.ok) throw new Error(`Footer not found (${footerRes.status}) – ${CONFIG.footerUrl}`);

      const [headerHTML, footerHTML] = await Promise.all([
        headerRes.text(),
        footerRes.text(),
      ]);

      // ----- Inject Header -----
      const headerContainer = document.getElementById('header-container');
      if (headerContainer) {
        headerContainer.innerHTML = headerHTML;
        log('Header injected into #header-container.');
      } else {
        // Fallback: prepend to body
        const wrapper = document.createElement('div');
        wrapper.innerHTML = headerHTML;
        while (wrapper.firstChild) {
          document.body.prepend(wrapper.firstChild);
        }
        log('Header injected into body (no #header-container found).');
      }

      // ----- Inject Footer -----
      const footerContainer = document.getElementById('footer-container');
      if (footerContainer) {
        footerContainer.innerHTML = footerHTML;
        log('Footer injected into #footer-container.');
      } else {
        // Fallback: append to body
        const wrapper = document.createElement('div');
        wrapper.innerHTML = footerHTML;
        while (wrapper.firstChild) {
          document.body.appendChild(wrapper.firstChild);
        }
        log('Footer injected into body (no #footer-container found).');
      }

      // Initialise interactions (sticky header, mobile menu, dropdowns, etc.)
      initHeaderFooter();

    } catch (error) {
      log(`Injection failed: ${error.message}`, 'error');
      // Optionally show a visible fallback message
      // document.body.insertAdjacentHTML('afterbegin', '<p style="color:red;">Header/Footer failed to load.</p>');
    }
  };

  // ----- All header/footer interaction logic (unchanged from previous version) -----
  const initHeaderFooter = () => {
    // ... (same code as before – sticky header, mobile toggle, dropdowns, active link, year)
    // I'll include a concise version here for completeness, but you can reuse your existing one.
    // For brevity, I'm pasting the essential parts – replace with your full init function.
    const header = document.querySelector('.main-header');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navList = document.querySelector('.nav-list');
    const dropdowns = document.querySelectorAll('.dropdown');
    const yearSpan = document.getElementById('current-year');

    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Sticky header
    if (header) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            header.classList.toggle('scrolled', window.scrollY > 20);
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }

    // Mobile menu
    if (mobileToggle && navMenu) {
      const toggleMenu = (forceState) => {
        const isOpen = typeof forceState === 'boolean' ? forceState : !navMenu.classList.contains('open');
        navMenu.classList.toggle('open', isOpen);
        mobileToggle.setAttribute('aria-expanded', isOpen);
        mobileToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      };
      mobileToggle.addEventListener('click', () => toggleMenu());
      if (navList) {
        navList.addEventListener('click', (e) => {
          const link = e.target.closest('a.nav-link');
          if (link && !link.closest('.dropdown')) toggleMenu(false);
        });
      }
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('open')) {
          toggleMenu(false);
          mobileToggle.focus();
        }
      });
    }

    // Dropdowns (desktop hover + click)
    if (dropdowns.length) {
      const toggleDropdown = (dropdown, forceState) => {
        const isOpen = typeof forceState === 'boolean' ? forceState : !dropdown.classList.contains('open');
        dropdown.classList.toggle('open', isOpen);
        const btn = dropdown.querySelector('.dropdown-toggle');
        if (btn) btn.setAttribute('aria-expanded', isOpen);
      };
      dropdowns.forEach((dropdown) => {
        const toggleBtn = dropdown.querySelector('.dropdown-toggle');
        if (toggleBtn) {
          toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.innerWidth > 992) {
              dropdowns.forEach((d) => {
                if (d !== dropdown && d.classList.contains('open')) toggleDropdown(d, false);
              });
            }
            toggleDropdown(dropdown);
          });
        }
        if (window.innerWidth > 992) {
          let timeoutId;
          dropdown.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
            dropdowns.forEach((d) => {
              if (d !== dropdown && d.classList.contains('open')) toggleDropdown(d, false);
            });
            toggleDropdown(dropdown, true);
          });
          dropdown.addEventListener('mouseleave', () => {
            timeoutId = setTimeout(() => toggleDropdown(dropdown, false), 150);
          });
          const menu = dropdown.querySelector('.dropdown-menu');
          if (menu) {
            menu.addEventListener('mouseenter', () => clearTimeout(timeoutId));
            menu.addEventListener('mouseleave', () => {
              timeoutId = setTimeout(() => toggleDropdown(dropdown, false), 150);
            });
          }
        }
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
          dropdowns.forEach((d) => toggleDropdown(d, false));
        }
      });
    }

    // Active link highlighting
    if (navList) {
      const currentPath = window.location.pathname;
      navList.querySelectorAll('.nav-link:not(.cta-link)').forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          const linkPath = href.replace(/^\.\.\//, '/').replace(/^\.\//, '/');
          const currentNormalized = currentPath.replace(/^\/$/, '/index.html');
          if (currentNormalized === linkPath ||
              currentNormalized.endsWith(linkPath) ||
              (linkPath === '/index.html' && currentNormalized === '/')) {
            link.classList.add('active');
          }
        }
      });
    }

    log('Header/Footer interactions initialised.');
  };

  // ----- Start injection once DOM is ready -----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHTML);
  } else {
    injectHTML();
  }

})();