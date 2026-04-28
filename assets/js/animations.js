const ANIM = {
  threshold: 0.1,
  rootMargin: '0px',
  staggerDelay: 100,
};

/* ============ REVEAL ON SCROLL (class‑based) ============ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.animate-fade, .animate-left, .animate-right, .animate-up, [data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: ANIM.threshold, rootMargin: ANIM.rootMargin });

  elements.forEach(el => {
    // Add base class to hide element until reveal
    el.classList.add('reveal-hidden');
    observer.observe(el);
  });
}

/* ============ COUNTERS ============ */
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(counter => {
    const target = +counter.dataset.count;
    const duration = +counter.dataset.duration || 2000;
    const prefix = counter.dataset.prefix || '';
    const suffix = counter.dataset.suffix || '';

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let count = 0;
        const startTime = performance.now();

        const step = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          count = Math.floor(progress * target);
          counter.textContent = prefix + count + suffix;
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            counter.textContent = prefix + target + suffix;
          }
        };
        requestAnimationFrame(step);
        observer.unobserve(counter);
      }
    }, { threshold: 0.4 });
    observer.observe(counter);
  });
}

/* ============ PARALLAX ============ */
function initParallax() {
  const elems = document.querySelectorAll('[data-parallax]');
  if (!elems.length) return;

  let ticking = false;
  const update = () => {
    const scrollY = window.pageYOffset;
    elems.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      el.style.transform = `translate3d(0, ${-scrollY * speed}px, 0)`;
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}

/* ============ STAGGERED SEQUENCES (viewport aware) ============ */
function initSequences() {
  document.querySelectorAll('[data-sequence]').forEach(container => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const selector = container.dataset.sequence || '*';
          const delay = container.dataset.sequenceDelay || ANIM.staggerDelay;
          const items = container.querySelectorAll(selector);
          items.forEach((item, i) => {
            item.style.animationDelay = `${i * delay}ms`;
            item.classList.add('sequence-visible');
          });
          observer.unobserve(container);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(container);
  });
}

/* ============ PAGE TRANSITIONS ============ */
function initPageTransitions() {
  document.body.classList.add('page-transition');
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"])');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('//')) {
      e.preventDefault();
      document.body.style.opacity = '0';
      document.body.style.transform = 'translateY(20px)';
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    }
  });

  // Restore state when user navigates back (back button)
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      document.body.style.opacity = '1';
      document.body.style.transform = 'none';
    }
  });
}

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCounters();
  initParallax();
  initSequences();
  initPageTransitions();
});

window.addEventListener('load', () => document.body.classList.remove('loading'));