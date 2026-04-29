'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {

  function initReveal() {
    const items = document.querySelectorAll('[data-animate], .animate-fade, .animate-up');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    items.forEach(item => {
      item.classList.add('reveal-hidden');
      observer.observe(item);
    });
  }

  function initCounters() {
    document.querySelectorAll('[data-count]').forEach(counter => {

      const observer = new IntersectionObserver(([entry]) => {

        if (!entry.isIntersecting) return;

        const target = +counter.dataset.count || 0;
        const duration = +counter.dataset.duration || 2000;

        let start;

        const animate = timestamp => {

          if (!start) start = timestamp;

          const progress = Math.min((timestamp - start) / duration, 1);
          const value = Math.floor(progress * target);

          counter.textContent = new Intl.NumberFormat().format(value);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
        observer.unobserve(counter);

      }, { threshold: 0.3 });

      observer.observe(counter);
    });
  }

  function initParallax() {
    const elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length) return;

    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY;

      elements.forEach(el => {
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

  function initPageTransitions() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');

      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank'
      ) return;

      e.preventDefault();

      document.body.classList.add('page-exit');

      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initCounters();
    initParallax();
    initPageTransitions();
  });

}