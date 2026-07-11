'use strict';

/* ===============================
   UTILITIES
================================= */
const Utils = {
  /**
   * Throttles a function using requestAnimationFrame.
   * Ideal for scroll/resize events.
   */
  rafThrottle(fn) {
    let ticking = false;
    return (...args) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          fn(...args);
          ticking = false;
        });
        ticking = true;
      }
    };
  },

  /**
   * Debounces a function.
   * Useful for input/typing events.
   */
  debounce(fn, delay = 200) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
};

/* ===============================
   TOAST NOTIFICATIONS
================================= */
function showToast(message, type = 'success', duration = 3000) {
  let container = document.querySelector('.toast-container');

  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');

  container.appendChild(toast);

  // Trigger entrance animation
  requestAnimationFrame(() => toast.classList.add('show'));

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

/* ===============================
   FILTERS (Optimized)
================================= */
function initFilters() {
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    const wrapper = btn.closest('[data-filter-wrapper]');
    if (!wrapper) {
      console.warn('Filter button outside data-filter-wrapper');
      return;
    }

    const filter = btn.dataset.filter;
    const itemsSelector = wrapper.dataset.items || '.filter-item';
    const items = wrapper.querySelectorAll(itemsSelector);

    // Update active button
    wrapper.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter items – using only CSS class (no redundant inline styles)
    items.forEach((item) => {
      const category = item.dataset.category;
      const visible = filter === 'all' || category === filter;
      item.classList.toggle('filtered-out', !visible);
      item.setAttribute('aria-hidden', !visible);
    });
  });
}

/* ===============================
   LOADING SCREEN
================================= */
function initLoadingScreen() {
  const screen = document.getElementById('loadingScreen');
  if (!screen) return;

  let hidden = false;

  const hide = () => {
    if (hidden) return;
    hidden = true;
    screen.classList.add('hidden');

    // Remove from DOM after transition
    setTimeout(() => {
      screen.style.display = 'none';
    }, 600);
  };

  // Hide on page load (with a small delay to show the animation)
  window.addEventListener('load', () => {
    setTimeout(hide, 600);
  });

  // Safety fallback: hide after 4 seconds even if load fails
  setTimeout(hide, 4000);
}

/* ===============================
   BACK TO TOP
================================= */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const scrollHandler = Utils.rafThrottle(() => {
    btn.classList.toggle('visible', window.scrollY > 300);
  });

  window.addEventListener('scroll', scrollHandler, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ===============================
   FAQ ACCORDION
================================= */
function initFAQ() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.faq-question');
    if (!trigger) return;

    const item = trigger.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('active');

    // Close other open items in the same accordion
    const parent = item.parentElement;
    if (parent) {
      parent.querySelectorAll('.faq-item.active').forEach((el) => {
        if (el !== item) {
          el.classList.remove('active');
          const otherAnswer = el.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
          el.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Toggle current item
    if (isOpen) {
      item.classList.remove('active');
      answer.style.maxHeight = null;
      trigger.setAttribute('aria-expanded', 'false');
    } else {
      item.classList.add('active');
      answer.style.maxHeight = answer.scrollHeight + 'px';
      trigger.setAttribute('aria-expanded', 'true');
    }
  });
}

/* ===============================
   SMOOTH SCROLL FOR ANCHOR LINKS
================================= */
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ===============================
   FORMS (Validation & Submission)
================================= */
function initForms() {
  const validateField = (field) => {
    const errorEl = document.getElementById(field.id + 'Error');
    if (!errorEl) return true;

    let valid = true;
    let message = '';
    const value = field.value.trim();

    // Required check
    if (field.hasAttribute('required') && !value) {
      valid = false;
      message = 'This field is required';
    }

    // Email format check
    if (valid && field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        valid = false;
        message = 'Please enter a valid email address';
      }
    }

    field.classList.toggle('error', !valid);
    errorEl.textContent = message;
    return valid;
  };

  document.querySelectorAll('form').forEach((form) => {
    // Real‑time validation on input
    form.querySelectorAll('input, textarea, select').forEach((field) => {
      field.addEventListener('input', () => validateField(field));
      field.addEventListener('blur', () => validateField(field));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate all fields
      let valid = true;
      form.querySelectorAll('input, textarea, select').forEach((field) => {
        if (!validateField(field)) valid = false;
      });

      if (!valid) return;

      // Disable submit button to prevent double submission
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      // Simulate async submission (replace with actual fetch/axios call)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Reset form
      form.reset();

      // Show success message
      const successDiv = form.parentElement?.querySelector('.form-success');
      if (successDiv) {
        successDiv.style.display = 'block';
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        showToast('Form submitted successfully!', 'success');
      }

      if (btn) btn.disabled = false;
    });
  });
}

/* ===============================
   LAZY LOADING (IntersectionObserver)
================================= */
function initLazyLoad() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const src = img.dataset.src;

        if (src) {
          img.src = src;
          img.onload = () => img.classList.add('loaded');
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      });
    },
    { rootMargin: '100px' }
  );

  document.querySelectorAll('img[data-src]').forEach((img) => observer.observe(img));
}

/* ===============================
   RIPPLE EFFECT ON BUTTONS
================================= */
function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    // Remove any existing ripples
    btn.querySelectorAll('.ripple').forEach((r) => r.remove());

    const ripple = document.createElement('span');
    ripple.className = 'ripple';

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    btn.appendChild(ripple);

    // Clean up after animation
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

/* ============================================
   ENHANCEMENTS – Polish & Interactive Flair
   ============================================ */

/* ----- 1. Scroll Progress Bar ----- */
function initScrollProgress() {
  let progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);
  }

  const updateProgress = Utils.rafThrottle(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  });

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
}

/* ----- 2. Staggered Reveals (Enhanced) ----- */
function initStaggeredReveals() {
  const containers = document.querySelectorAll('.stagger-children');
  if (!containers.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  containers.forEach((container) => observer.observe(container));
}

/* ----- 3. Mouse‑Driven Parallax Orbs (Floating Background) ----- */
function initOrbParallax() {
  const orbs = document.querySelectorAll('.orb');
  if (!orbs.length) return;

  const handleMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    orbs.forEach((orb, index) => {
      const speed = 0.03 + (index * 0.01);
      const offsetX = x * 60 * speed;
      const offsetY = y * 60 * speed;
      orb.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
  };

  document.addEventListener('mousemove', handleMove, { passive: true });
}

/* ----- 4. Cursor Glow Follower (Desktop Only) ----- */
function initCursorGlow() {
  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let glow = document.querySelector('.cursor-glow');
  if (!glow) {
    glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
  }

  const onMove = (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  };

  // Detect hoverable interactive elements
  const onHover = (e) => {
    const target = e.target.closest('a, .btn, .card, .service-card, .filter-btn');
    glow.classList.toggle('is-hovering', !!target);
  };

  document.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseover', onHover, { passive: true });
  document.addEventListener('mouseout', () => {
    glow.classList.remove('is-hovering');
  }, { passive: true });
}

/* ----- 5. 3D Tilt Effect on Cards (Desktop) ----- */
function initTilt3D() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.tilt-3d');
  if (!cards.length) return;

  cards.forEach((card) => {
    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6; // max ±6deg
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    };

    const handleLeave = () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    };

    card.addEventListener('mousemove', handleMove, { passive: true });
    card.addEventListener('mouseleave', handleLeave, { passive: true });
  });
}

/* ----- 6. Smooth Entrance on Page Load (Body Fade) ----- */
function initPageEntrance() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s cubic-bezier(0.2, 0.9, 0.3, 1)';

  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  // Remove inline styles after transition to not interfere
  setTimeout(() => {
    document.body.style.opacity = '';
    document.body.style.transition = '';
  }, 700);
}

/* ----- 7. Lazy Load with Blur-up Effect (Adds class) ----- */
function initBlurLazy() {
  if (!('IntersectionObserver' in window)) return;

  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const src = img.dataset.src;

        img.classList.add('lazy-loading');

        if (src) {
          img.src = src;
          img.onload = () => {
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');
          };
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      });
    },
    { rootMargin: '100px' }
  );

  images.forEach((img) => observer.observe(img));
}

/* ============================================
   NEW: HEADER/FOOTER INJECTION
   ============================================ */

/**
 * Injects header and footer from the components folder
 * Uses absolute paths from root to work on any page.
 */
async function injectHeaderFooter() {
  try {
    const [headerRes, footerRes] = await Promise.all([
      fetch('/components/header.html'),
      fetch('/components/footer.html')
    ]);

    if (!headerRes.ok) throw new Error(`Header not found (${headerRes.status})`);
    if (!footerRes.ok) throw new Error(`Footer not found (${footerRes.status})`);

    const [headerHTML, footerHTML] = await Promise.all([
      headerRes.text(),
      footerRes.text()
    ]);

    // Insert header right after <body> opens
    const headerWrapper = document.createElement('div');
    headerWrapper.innerHTML = headerHTML;
    while (headerWrapper.firstChild) {
      document.body.prepend(headerWrapper.firstChild);
    }

    // Insert footer before </body>
    const footerWrapper = document.createElement('div');
    footerWrapper.innerHTML = footerHTML;
    while (footerWrapper.firstChild) {
      document.body.appendChild(footerWrapper.firstChild);
    }

    console.log('✅ Header & Footer injected successfully.');
    return true;
  } catch (error) {
    console.error('❌ Header/Footer injection failed:', error.message);
    return false;
  }
}

/**
 * Initialises header/footer interactions (dropdowns, mobile menu, scroll effects)
 * Must be called AFTER injection.
 */
function initHeaderFooterInteractions() {
  console.log('🔷 Initialising header/footer interactions...');

  const header = document.querySelector('.main-header');
  const navMenu = document.querySelector('.nav-menu');
  const navList = document.querySelector('.nav-list');
  const dropdowns = document.querySelectorAll('.dropdown');
  const yearSpan = document.getElementById('current-year');

  // ---- Set year ----
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ---- Sticky header ----
  if (header) {
    window.addEventListener('scroll', Utils.rafThrottle(() => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }), { passive: true });
  }

  // ---- Mobile menu toggle (using event delegation) ----
  // Ensure the toggle function is defined once
  const toggleMobileMenu = (forceState) => {
    if (!navMenu) {
      console.warn('Nav menu not found');
      return;
    }
    const isOpen = typeof forceState === 'boolean' ? forceState : !navMenu.classList.contains('open');
    navMenu.classList.toggle('open', isOpen);
    // Update the toggle button's aria-expanded
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', isOpen);
      toggleBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    }
    document.body.style.overflow = isOpen ? 'hidden' : '';
    console.log(`Menu ${isOpen ? 'opened' : 'closed'}`);
  };

  // Listen for clicks on the toggle button (event delegation)
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.mobile-menu-toggle');
    if (toggleBtn) {
      e.preventDefault();
      toggleMobileMenu();
    }
  });

  // Also try to attach directly if the button already exists (for safety)
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  if (mobileToggle) {
    // Remove any previous listener to avoid duplicates
    mobileToggle.removeEventListener('click', toggleMobileMenu);
    mobileToggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMobileMenu();
    });
    console.log('✅ Direct click listener added to mobile toggle');
  } else {
    console.warn('⚠️ Mobile toggle button not found – using delegation only');
  }

  // Close menu on link click (inside nav)
  if (navList) {
    navList.addEventListener('click', (e) => {
      const link = e.target.closest('a.nav-link');
      if (link && !link.closest('.dropdown')) {
        toggleMobileMenu(false);
      }
    });
  }

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('open')) {
      toggleMobileMenu(false);
      const toggleBtn = document.querySelector('.mobile-menu-toggle');
      if (toggleBtn) toggleBtn.focus();
    }
  });

  // ---- Dropdowns (unchanged, but we keep them) ----
  if (dropdowns.length > 0) {
    const toggleDropdown = (dropdown, forceState) => {
      const isOpen = typeof forceState === 'boolean' ? forceState : !dropdown.classList.contains('open');
      dropdown.classList.toggle('open', isOpen);
      const toggleBtn = dropdown.querySelector('.dropdown-toggle');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', isOpen);
    };

    dropdowns.forEach((dropdown) => {
      const toggleBtn = dropdown.querySelector('.dropdown-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.innerWidth > 992) {
            dropdowns.forEach((d) => {
              if (d !== dropdown && d.classList.contains('open')) {
                toggleDropdown(d, false);
              }
            });
          }
          toggleDropdown(dropdown);
        });
      }

      if (window.innerWidth > 992) {
        dropdown.addEventListener('mouseenter', () => {
          dropdowns.forEach((d) => {
            if (d !== dropdown && d.classList.contains('open')) toggleDropdown(d, false);
          });
          toggleDropdown(dropdown, true);
        });
        dropdown.addEventListener('mouseleave', () => {
          const menu = dropdown.querySelector('.dropdown-menu');
          if (!menu || !menu.matches(':hover')) {
            toggleDropdown(dropdown, false);
          }
        });
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
          menu.addEventListener('mouseenter', () => toggleDropdown(dropdown, true));
          menu.addEventListener('mouseleave', () => toggleDropdown(dropdown, false));
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        dropdowns.forEach((d) => toggleDropdown(d, false));
      }
    });
  }

  // ---- Active link highlighting ----
  if (navList) {
    const currentPath = window.location.pathname;
    navList.querySelectorAll('.nav-link:not(.cta-link)').forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        const linkPath = href.replace(/^\.\.\//, '/').replace(/^\.\//, '/');
        const currentPathNormalized = currentPath.replace(/^\/$/, '/index.html');
        if (currentPathNormalized === linkPath ||
            currentPathNormalized.endsWith(linkPath) ||
            (linkPath === '/index.html' && currentPathNormalized === '/')) {
          link.classList.add('active');
        }
      }
    });
  }

  console.log('✅ Header/Footer interactions fully initialised.');
}

/* ============================================
   INITIALISE EVERYTHING
   ============================================ */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Inject header and footer
  await injectHeaderFooter();

  // 2. Initialize header/footer interactions
  initHeaderFooterInteractions();

  // 3. All your original initialisations (unchanged)
  initLoadingScreen();
  initFilters();
  initBackToTop();
  initFAQ();
  initSmoothScroll();
  initForms();
  initLazyLoad();
});

window.addEventListener('load', () => {
  initRipple();
});

/* ---------------------------------------------------
   Enhancements that can run after DOM ready (they don't depend on header/footer)
   --------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initStaggeredReveals();
  initOrbParallax();
  initCursorGlow();
  initTilt3D();
  initPageEntrance();
  initBlurLazy();
});