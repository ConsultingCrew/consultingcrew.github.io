// ===== UTILITY: throttle with requestAnimationFrame =====
function rafThrottle(fn) {
  let ticking = false;
  return function (...args) {
    if (!ticking) {
      requestAnimationFrame(() => {
        fn.apply(this, args);
        ticking = false;
      });
      ticking = true;
    }
  };
}

// ===== FILTER SYSTEM (delegated + CSS‑only) =====
function initFilters() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    // Look for a shared wrapper with [data-filter-group] FIRST,
    // then fall back to the nearest filter bar (legacy support)
    const container = btn.closest(
      '[data-filter-group], .filter-section, .insights-filter, .services-filter, .portfolio-filter'
    );
    if (!container) return;

    const filter = btn.dataset.filter;
    const itemsSelector =
      container.dataset.items ||
      '.insight-card, .service-card, .portfolio-item, .filter-item';
    const items = container.querySelectorAll(itemsSelector);

    // Update active button
    container
      .querySelectorAll('.filter-btn')
      .forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    // Toggle visibility using a CSS class
    items.forEach((item) => {
      const cat = item.dataset.category;
      const match = filter === 'all' || cat === filter;
      item.classList.toggle('filtered-out', !match);
    });
  });
}

// ===== LOADING SCREEN  =====
function initLoadingScreen() {
  const screen = document.getElementById('loadingScreen');
  if (!screen) return;

  const hide = () => {
    if (!screen.classList.contains('hidden')) {
      screen.classList.add('hidden');
      setTimeout(() => {
        screen.style.display = 'none';
      }, 500);
    }
  };

  window.addEventListener('load', () => setTimeout(hide, 1000));
   setTimeout(hide, 3000);
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const toggleVisibility = rafThrottle(() => {
    btn.classList.toggle('visible', window.scrollY > 300);
  });

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  btn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
}

// ===== FAQ ACCORDION =====
function initAccordions() {
  document.addEventListener('click', (e) => {
    const question = e.target.closest('.faq-question');
    if (!question) return;

    const item = question.closest('.faq-item');
    if (!item) return;

    const isActive = item.classList.contains('active');

    // Close others in the same accordion group
    const container =
      item.closest('.faq-accordion, .faq-list') || document;
    container.querySelectorAll('.faq-item.active').forEach((other) => {
      if (other !== item) {
        other.classList.remove('active');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
        const otherIcon = other.querySelector('.faq-icon');
        if (otherIcon) otherIcon.textContent = '+';
        other
          .querySelector('.faq-question')
          ?.setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle current
    if (!isActive) {
      item.classList.add('active');
      const answer = item.querySelector('.faq-answer');
      if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      const icon = item.querySelector('.faq-icon');
      if (icon) icon.textContent = '−';
      question.setAttribute('aria-expanded', 'true');
    } else {
      item.classList.remove('active');
      const answer = item.querySelector('.faq-answer');
      if (answer) answer.style.maxHeight = null;
      const icon = item.querySelector('.faq-icon');
      if (icon) icon.textContent = '+';
      question.setAttribute('aria-expanded', 'false');
    }
  });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ===== FORM VALIDATION =====
function initForms() {
  const validateField = (field) => {
    const err = document.getElementById(field.id + 'Error');
    if (!err) return true;
    if (!field.value.trim()) {
      err.textContent = 'This field is required';
      field.classList.add('error');
      return false;
    }
    if (
      field.type === 'email' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)
    ) {
      err.textContent = 'Invalid email';
      field.classList.add('error');
      return false;
    }
    err.textContent = '';
    field.classList.remove('error');
    return true;
  };

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm
      .querySelectorAll('input, select, textarea')
      .forEach((input) => {
        input.addEventListener('input', () => validateField(input));
      });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;
      ['name', 'email', 'service', 'message'].forEach((id) => {
        const f = document.getElementById(id);
        if (f && !validateField(f)) valid = false;
      });
      if (!valid) return;

      const btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      // simulate async submission
      await new Promise((r) => setTimeout(r, 1500));
      contactForm.style.display = 'none';
      document.getElementById('successMessage').style.display = 'block';
      setTimeout(() => {
        document.getElementById('successMessage').style.display = 'none';
        contactForm.style.display = '';
        contactForm.reset();
      }, 5000);
      btn.disabled = false;
    });
  }

  // Newsletter forms
  document.querySelectorAll('.newsletter-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (
        !emailInput ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)
      ) {
        alert('Enter a valid email');
        return;
      }
      const btn = form.querySelector('button');
      btn.disabled = true;
      await new Promise((r) => setTimeout(r, 1000));
      emailInput.value = '';
      alert('Subscribed!');
      btn.disabled = false;
    });
  });
}

// ===== LAZY LOADING =====
function initLazyLoad() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });
  document
    .querySelectorAll('img[data-src]')
    .forEach((img) => observer.observe(img));
}

// ===== RIPPLE EFFECT =====
function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.classList.add('ripple');
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

// ===== INITIALISE EVERYTHING =====
document.addEventListener('DOMContentLoaded', () => {
  // Loading screen must be initialised here so that it can properly listen for the 'load' event
  initLoadingScreen();
  initFilters();
  initBackToTop();
  initAccordions();
  initSmoothScroll();
  initForms();
  initLazyLoad();
});

window.addEventListener('load', () => {
  initRipple();
  document.body.classList.add('loaded');
});