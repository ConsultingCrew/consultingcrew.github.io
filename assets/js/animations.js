'use strict';

/* ===============================
   PREFERS-REDUCED-MOTION CHECK
================================= */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  /* ===============================
     SCROLL REVEAL (IntersectionObserver)
  =============================== */
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal], .reveal');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    items.forEach((item) => {
      // Add base hidden state if not already present
      if (!item.classList.contains('reveal-hidden') &&
          !item.classList.contains('animate-fade') &&
          !item.classList.contains('animate-left') &&
          !item.classList.contains('animate-right')) {
        item.classList.add('reveal-hidden');
      }
      observer.observe(item);
    });
  }

  /* ===============================
     ANIMATED COUNTERS
  =============================== */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const counter = entry.target;
          const target = parseFloat(counter.dataset.count) || 0;
          const duration = parseFloat(counter.dataset.duration) || 2000;
          const shouldFormat = counter.dataset.format !== 'false';

          let startTime = null;

          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(eased * target);

            counter.textContent = shouldFormat
              ? new Intl.NumberFormat().format(currentValue)
              : currentValue;

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              counter.textContent = shouldFormat
                ? new Intl.NumberFormat().format(target)
                : target;
            }
          };

          requestAnimationFrame(animate);
          observer.unobserve(counter);
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  /* ===============================
     PARALLAX (on data-parallax)
  =============================== */
  function initParallax() {
    const elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length) return;

    let ticking = false;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      elements.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        el.style.transform = `translate3d(0, ${-scrollY * speed}px, 0)`;
      });
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ===============================
     SMOOTH PAGE TRANSITIONS
  =============================== */
  function initPageTransitions() {
    // No selector check needed – if .page-exit exists in CSS, it works.
    // If not, adding the class does nothing.
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      // Ignore anchor links, mailto, tel, external, or target="_blank"
      if (!href ||
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:') ||
          link.target === '_blank' ||
          link.hasAttribute('download')) {
        return;
      }

      // Ensure it's a same-origin navigation
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      e.preventDefault();
      document.body.classList.add('page-exit');

      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  }

  /* ===============================
     INIT ALL
  =============================== */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initCounters();
    initParallax();
    initPageTransitions();
  });
}