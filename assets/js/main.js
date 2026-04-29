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
  }
};

/* ===============================
   TOAST
================================= */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');

  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
}

/* ===============================
   FILTERS
================================= */
function initFilters() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    const container = btn.closest('[data-filter-group], .filter-section');
    if (!container) return;

    const filter = btn.dataset.filter;
    const itemsSelector = container.dataset.items || '.filter-item';
    const wrapper = container.closest('[data-filter-wrapper]') || document;

    const items = wrapper.querySelectorAll(itemsSelector);

    container.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
    });

    btn.classList.add('active');

    items.forEach(item => {
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
    }, 500);
  };

  window.addEventListener('load', () => setTimeout(hide, 800));
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
   FAQ
================================= */
function initFAQ() {
  document.addEventListener('click', e => {
    const trigger = e.target.closest('.faq-question');
    if (!trigger) return;

    const item = trigger.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');

    const open = item.classList.contains('active');

    item.parentElement.querySelectorAll('.faq-item.active').forEach(el => {
      if (el !== item) {
        el.classList.remove('active');
        el.querySelector('.faq-answer').style.maxHeight = null;
      }
    });

    if (open) {
      item.classList.remove('active');
      answer.style.maxHeight = null;
    } else {
      item.classList.add('active');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
}

/* ===============================
   SMOOTH SCROLL
================================= */
function initSmoothScroll() {
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
}

/* ===============================
   FORMS
================================= */
function initForms() {

  const validateField = field => {
    const error = document.getElementById(field.id + 'Error');
    if (!error) return true;

    let valid = true;
    let message = '';

    const value = field.value.trim();

    if (!value) {
      valid = false;
      message = 'Required field';
    }

    if (valid && field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        valid = false;
        message = 'Invalid email';
      }
    }

    field.classList.toggle('error', !valid);
    error.textContent = message;

    return valid;
  };

  document.querySelectorAll('form').forEach(form => {

    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('input', () => validateField(field));
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();

      let valid = true;

      form.querySelectorAll('input, textarea, select').forEach(field => {
        if (!validateField(field)) valid = false;
      });

      if (!valid) return;

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      await new Promise(r => setTimeout(r, 1200));

      form.reset();

      if (btn) btn.disabled = false;

      showToast('Form submitted successfully');
    });
  });
}

/* ===============================
   LAZY LOAD
================================= */
function initLazyLoad() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const img = entry.target;
      const src = img.dataset.src;

      if (src) {
        img.src = src;
        img.onload = () => img.classList.add('loaded');
      }

      observer.unobserve(img);
    });
  }, {
    rootMargin: '100px'
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    observer.observe(img);
  });
}

/* ===============================
   RIPPLE
================================= */
function initRipple() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    btn.querySelectorAll('.ripple').forEach(r => r.remove());

    const ripple = document.createElement('span');
    ripple.className = 'ripple';

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size/2}px`;
    ripple.style.top = `${e.clientY - rect.top - size/2}px`;

    btn.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

/* ===============================
   INIT
================================= */
document.addEventListener('DOMContentLoaded', () => {
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