/**
 * ============================================
 * ANIMATIONS.JS – Scroll, Hover, Page Transitions
 * ============================================
 */

// ============================================
// CONFIGURATION
// ============================================

const ANIMATION_CONFIG = {
    threshold: 0.1,
    rootMargin: '0px',
    fadeDistance: 20,
    slideDistance: 30,
    animationDuration: 800,
    staggerDelay: 100
};

// ============================================
// UTILITY (kept internally to avoid dependency on main.js)
// ============================================

const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ============================================
// SCROLL ANIMATIONS
// ============================================

const initScrollAnimations = () => {
    const animatedElements = document.querySelectorAll(
        '[data-animate], .animate-fade, .animate-left, .animate-right, .animate-up, .animate-down'
    );

    if (!animatedElements.length) return;

    animatedElements.forEach(element => {
        const animationType = element.dataset.animate || 
                              element.classList.contains('animate-fade') ? 'fade' :
                              element.classList.contains('animate-left') ? 'left' :
                              element.classList.contains('animate-right') ? 'right' :
                              element.classList.contains('animate-up') ? 'up' :
                              element.classList.contains('animate-down') ? 'down' : null;

        if (!animationType) return;

        element.dataset.animationType = animationType;

        switch (animationType) {
            case 'fade':
                element.style.opacity = '0';
                element.style.transform = `translateY(${ANIMATION_CONFIG.fadeDistance}px)`;
                break;
            case 'left':
                element.style.opacity = '0';
                element.style.transform = `translateX(-${ANIMATION_CONFIG.slideDistance}px)`;
                break;
            case 'right':
                element.style.opacity = '0';
                element.style.transform = `translateX(${ANIMATION_CONFIG.slideDistance}px)`;
                break;
            case 'up':
                element.style.opacity = '0';
                element.style.transform = `translateY(${ANIMATION_CONFIG.slideDistance}px)`;
                break;
            case 'down':
                element.style.opacity = '0';
                element.style.transform = `translateY(-${ANIMATION_CONFIG.slideDistance}px)`;
                break;
        }

        element.style.transition = `opacity ${ANIMATION_CONFIG.animationDuration}ms ease, transform ${ANIMATION_CONFIG.animationDuration}ms ease`;
        element.style.willChange = 'opacity, transform';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.style.opacity = '1';
                element.style.transform = 'translate(0, 0)';

                if (element.dataset.stagger) {
                    const children = element.children;
                    Array.from(children).forEach((child, index) => {
                        setTimeout(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translate(0, 0)';
                        }, index * ANIMATION_CONFIG.staggerDelay);
                    });
                }

                observer.unobserve(element);
            }
        });
    }, {
        threshold: ANIMATION_CONFIG.threshold,
        rootMargin: ANIMATION_CONFIG.rootMargin
    });

    animatedElements.forEach(element => observer.observe(element));
};

// ============================================
// SEQUENCE ANIMATIONS
// ============================================

const animateSequence = (container, selector, delay = 100) => {
    const containerEl = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
    if (!containerEl) return;

    const items = containerEl.querySelectorAll(selector);
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * delay);
    });
};

// ============================================
// NUMBER COUNTERS
// ============================================

const initNumberCounters = () => {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const targetValue = parseInt(element.dataset.count);
                const suffix = element.dataset.suffix || '';
                const prefix = element.dataset.prefix || '';
                const duration = parseInt(element.dataset.duration) || 2000;

                let startValue = 0;
                const increment = targetValue / (duration / 16);

                const updateCounter = () => {
                    startValue += increment;
                    if (startValue >= targetValue) {
                        element.textContent = prefix + targetValue + suffix;
                        return;
                    }
                    element.textContent = prefix + Math.floor(startValue) + suffix;
                    requestAnimationFrame(updateCounter);
                };

                requestAnimationFrame(updateCounter);
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
};

// ============================================
// PARALLAX EFFECTS
// ============================================

const initParallax = () => {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (!parallaxElements.length) return;

    let ticking = false;

    const updateParallax = () => {
        const scrolled = window.pageYOffset;
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.2;
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
};

// ============================================
// REVEAL ANIMATIONS (sections)
// ============================================

const initRevealAnimations = () => {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => observer.observe(section));
};

// ============================================
// HOVER ANIMATIONS
// ============================================

const initHoverAnimations = () => {
    const cards = document.querySelectorAll('.card, .service-card, .portfolio-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => card.classList.add('hover'));
        card.addEventListener('mouseleave', () => card.classList.remove('hover'));
    });
};

// ============================================
// PAGE TRANSITIONS
// ============================================

const initPageTransitions = () => {
    document.body.classList.add('page-transition');

    document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"])').forEach(link => {
        link.addEventListener('click', (e) => {
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
    });

    if (!document.getElementById('transition-styles')) {
        const style = document.createElement('style');
        style.id = 'transition-styles';
        style.textContent = `
            body {
                transition: opacity 0.3s ease, transform 0.3s ease;
                opacity: 1;
                transform: translateY(0);
            }
            .section-visible {
                animation: fadeInUp 0.8s ease forwards;
            }
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .card.hover {
                transform: translateY(-8px) scale(1.02);
            }
        `;
        document.head.appendChild(style);
    }
};

// ============================================
// LOADING ANIMATIONS
// ============================================

const initLoadingAnimations = () => {
    document.body.classList.add('loading');
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.body.classList.remove('loading');
        }, 100);
    });
};

// ============================================
// MAIN INITIALIZATION
// ============================================

const initAnimations = () => {
    console.log('Initializing animations...');
    initScrollAnimations();
    initNumberCounters();
    initParallax();
    initRevealAnimations();
    initHoverAnimations();
    initPageTransitions();
    initLoadingAnimations();

    document.querySelectorAll('[data-sequence]').forEach(container => {
        const selector = container.dataset.sequence || '*';
        const delay = parseInt(container.dataset.sequenceDelay) || 100;
        animateSequence(container, selector, delay);
    });
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
} else {
    initAnimations();
}

// ============================================
// EXPORTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initScrollAnimations,
        initNumberCounters,
        initParallax,
        animateSequence,
        initAnimations
    };
}