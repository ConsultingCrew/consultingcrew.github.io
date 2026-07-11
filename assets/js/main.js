/**
 * MAIN.JS – Optimised & consolidated
 * Handles UI interactions, animations, and third‑party integrations.
 * (Header/footer injection is now managed exclusively by header-footer.js)
 */

'use strict';

/* ===============================
   UTILITIES
================================= */
const Utils = {
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

  debounce(fn, delay = 200) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },
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

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

/* ===============================
   FILTERS (Portfolio / Services)
================================= */
function initFilters() {
  document.addEventListener('click', (e) => {
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

    wrapper.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

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

    setTimeout(() => {
      screen.style.display = 'none';
    }, 600);
  };

  window.addEventListener('load', () => {
    setTimeout(hide, 600);
  });

  // fallback in case load event is slow
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

    if (field.hasAttribute('required') && !value) {
      valid = false;
      message = 'This field is required';
    }

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
    form.querySelectorAll('input, textarea, select').forEach((field) => {
      field.addEventListener('input', () => validateField(field));
      field.addEventListener('blur', () => validateField(field));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let valid = true;
      form.querySelectorAll('input, textarea, select').forEach((field) => {
        if (!validateField(field)) valid = false;
      });

      if (!valid) return;

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      // Simulate async submission
      await new Promise((resolve) => setTimeout(resolve, 1200));

      form.reset();

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
   LAZY LOADING (with blur‑up effect)
================================= */
function initLazyLoad() {
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

/* ===============================
   RIPPLE EFFECT ON BUTTONS
================================= */
function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

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

    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });
}

/* ===============================
   ENHANCEMENTS
================================= */

// 1. Scroll Progress Bar
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

// 2. Staggered Reveals
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

// 3. Orb Parallax (mouse‑driven)
function initOrbParallax() {
  const orbs = document.querySelectorAll('.orb');
  if (!orbs.length) return;

  const handleMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    orbs.forEach((orb, index) => {
      const speed = 0.03 + index * 0.01;
      const offsetX = x * 60 * speed;
      const offsetY = y * 60 * speed;
      orb.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
  };

  document.addEventListener('mousemove', handleMove, { passive: true });
}

// 4. Cursor Glow (desktop only)
function initCursorGlow() {
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

// 5. 3D Tilt Effect on Cards (desktop)
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
      const rotateX = ((y - centerY) / centerY) * -6;
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

// 6. Smooth Page Entrance (fade‑in)
function initPageEntrance() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s cubic-bezier(0.2, 0.9, 0.3, 1)';

  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  setTimeout(() => {
    document.body.style.opacity = '';
    document.body.style.transition = '';
  }, 700);
}

/* ===============================
   INITIALISE EVERYTHING
================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Core UI interactions
  initLoadingScreen();
  initFilters();
  initBackToTop();
  initFAQ();
  initSmoothScroll();
  initForms();
  initLazyLoad();

  // Enhancements (non‑critical, can be deferred)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initScrollProgress();
    initStaggeredReveals();
    initOrbParallax();
    initCursorGlow();
    initTilt3D();
    initPageEntrance();
  }
});

window.addEventListener('load', () => {
  initRipple();
});