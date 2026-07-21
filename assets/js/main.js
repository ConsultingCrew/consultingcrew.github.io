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

    // Check if element is in viewport
    isInViewport(el, offset = 0) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= -offset &&
            rect.left >= -offset &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
        );
    },

    getStickyTop() {
        const cssVar = getComputedStyle(document.documentElement)
            .getPropertyValue('--header-height').trim();
        return parseInt(cssVar) || 60;
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

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
}

/* ===============================
   FILTERS (Portfolio / Services / Insights)
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
   FORMS – EMAILJS INTEGRATION + SPAM PROTECTION
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

    // Target only contact forms (not all forms on the page)
    document.querySelectorAll('#contactForm, .contact-form').forEach((form) => {
        // Real-time validation
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

            // Get the submit button
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn?.querySelector('.submit-text')?.textContent || 'Send Message';

            // Show loading state
            if (btn) {
                btn.disabled = true;
                const textSpan = btn.querySelector('.submit-text');
                if (textSpan) textSpan.textContent = 'Sending...';
                const spinner = btn.querySelector('.loading-spinner');
                if (spinner) spinner.style.display = 'inline-block';
            }

            try {
                // ===== HONEYPOT CHECK (Anti-Spam) =====
                const honeypot = form.querySelector('#website');
                if (honeypot && honeypot.value.trim() !== '') {
                    console.log('[Honeypot] Bot detected – form rejected.');
                    showToast('We could not process your request. Please try again.', 'error');
                    if (btn) {
                        btn.disabled = false;
                        const textSpan = btn.querySelector('.submit-text');
                        if (textSpan) textSpan.textContent = originalText;
                        const spinner = btn.querySelector('.loading-spinner');
                        if (spinner) spinner.style.display = 'none';
                    }
                    return;
                }

                // ===== RATE LIMITING CHECK =====
                const timestampField = form.querySelector('#form_timestamp');
                if (timestampField) {
                    const submitTime = Date.now();
                    const formTime = parseInt(timestampField.value) || 0;
                    const timeDiff = submitTime - formTime;
                    // If form was submitted less than 2 seconds after load, it's likely a bot
                    if (timeDiff < 2000) {
                        console.log('[RateLimit] Bot detected – too fast:', timeDiff);
                        showToast('Please take a moment to fill out the form.', 'error');
                        if (btn) {
                            btn.disabled = false;
                            const textSpan = btn.querySelector('.submit-text');
                            if (textSpan) textSpan.textContent = originalText;
                            const spinner = btn.querySelector('.loading-spinner');
                            if (spinner) spinner.style.display = 'none';
                        }
                        return;
                    }
                    // If form was loaded more than 5 minutes ago, warn but allow
                    if (timeDiff > 300000) {
                        console.log('[RateLimit] Form may be stale:', timeDiff);
                    }
                }

                // --- Check if EmailJS is available ---
                if (typeof emailjs === 'undefined' || typeof emailjs.send !== 'function') {
                    throw new Error('EmailJS service is not available. Please email us directly.');
                }

                // --- Get form values ---
                const name = document.getElementById('name')?.value || '';
                const email = document.getElementById('email')?.value || '';
                const company = document.getElementById('company')?.value || 'Not provided';
                const phone = document.getElementById('phone')?.value || 'Not provided';
                const serviceSelect = document.getElementById('service');
                const service = serviceSelect?.options?.[serviceSelect.selectedIndex]?.text || 'Not specified';
                const message = document.getElementById('message')?.value || '';

                // Build subject from service interest or use default
                const subject = service !== 'Not specified'
                    ? `Service Inquiry: ${service}`
                    : 'New Contact Form Message';

                // --- Prepare EmailJS template parameters ---
                const templateParams = {
                    user_name: name,
                    user_email: email,
                    company: company,
                    phone: phone,
                    service: service,
                    subject: subject,
                    message: message,
                    year: new Date().getFullYear(),
                };

                console.log('[EmailJS] Sending email with params:', templateParams);

                // --- Send email using EmailJS ---
                const response = await emailjs.send(
                    'service_xbnw094',      // Your Service ID
                    'template_wr89m8j',     // Your Template ID
                    templateParams
                );

                console.log('[EmailJS] Success:', response.status, response.text);

                // --- Show success message ---
                const successDiv = form.parentElement?.querySelector('.form-success');
                if (successDiv) {
                    successDiv.style.display = 'block';
                    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
                }

                // Reset the form
                form.reset();

            } catch (error) {
                console.error('[EmailJS] Error:', error);

                // Show user-friendly error message
                let userMessage = 'Failed to send message. Please try again or email us directly.';
                if (error.message && error.message.includes('EmailJS')) {
                    userMessage = error.message;
                } else if (error.text) {
                    userMessage = error.text;
                }
                showToast(userMessage, 'error');
            } finally {
                // Re-enable submit button
                if (btn) {
                    btn.disabled = false;
                    const textSpan = btn.querySelector('.submit-text');
                    if (textSpan) textSpan.textContent = originalText;
                    const spinner = btn.querySelector('.loading-spinner');
                    if (spinner) spinner.style.display = 'none';
                }
            }
        });
    });
}

/* ===============================
   LAZY LOADING 
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

        // Limit active ripples to prevent memory churn
        const ripples = btn.querySelectorAll('.ripple');
        if (ripples.length >= 5) {
            ripples[0].remove();
        }

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
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        };

        const handleLeave = () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
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

// 7. Sticky Filter Bar Enhancement
function initStickyFilter() {
    const filterSections = document.querySelectorAll(
        '.portfolio-filter-section, .services-filter-section, .insights-filter-section'
    );
    if (!filterSections.length) return;

    const stickyTop = Utils.getStickyTop();
    const tolerance = 20;

    const checkSticky = Utils.rafThrottle(() => {
        filterSections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            const isStuck = rect.top <= stickyTop + tolerance;

            if (isStuck) {
                section.classList.add('is-stuck');
            } else {
                section.classList.remove('is-stuck');
            }
        });
    });

    window.addEventListener('scroll', checkSticky, { passive: true });
    window.addEventListener('resize', checkSticky, { passive: true });

    setTimeout(checkSticky, 50);
    setTimeout(checkSticky, 150);
    setTimeout(checkSticky, 350);

    const header = document.querySelector('.main-header');
    if (header) {
        const observer = new MutationObserver(() => {
            setTimeout(checkSticky, 50);
        });
        observer.observe(header, { attributes: true, attributeFilter: ['class'] });
        header._stickyObserver = observer;
    }

    window._stickyFilterCleanup = () => {
        window.removeEventListener('scroll', checkSticky);
        window.removeEventListener('resize', checkSticky);
        if (header) {
            const observer = header._stickyObserver;
            if (observer) observer.disconnect();
        }
    };
}

// 8. Active Navigation Link Highlighting
function initActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link:not(.cta-link)');
    if (!navLinks.length) return;

    const currentPath = window.location.pathname;
    const currentNormalized = currentPath.replace(/^\/$/, '/index.html');

    navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;

        let linkPath = href.replace(/^\.\.\//, '/').replace(/^\.\//, '');
        if (!linkPath.startsWith('/')) linkPath = '/' + linkPath;

        const isExactMatch =
            currentNormalized === linkPath ||
            currentNormalized === linkPath + '/' ||
            currentNormalized === linkPath.replace(/\/$/, '');

        if (isExactMatch) {
            link.classList.add('active');
            return;
        }

        if (linkPath !== '/' && linkPath !== '/index.html' && linkPath !== '') {
            if (currentNormalized.startsWith(linkPath + '/')) {
                link.classList.add('active');
                return;
            }
        }

        if ((linkPath === '/' || linkPath === '/index.html' || linkPath === '') &&
            (currentNormalized === '/' || currentNormalized === '/index.html')) {
            link.classList.add('active');
        }
    });
}

/* ===============================
   INITIALISE EVERYTHING
================================= */
document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initFilters();
    initBackToTop();
    initFAQ();
    initSmoothScroll();
    initForms();
    initLazyLoad();
    initActiveNavLink();
    initStickyFilter();

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

/* ===============================
   CURSOR GLOW STYLES (injected via JS)
================================= */
(function injectCursorStyles() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (document.querySelector('#cursor-glow-styles')) return;

    const style = document.createElement('style');
    style.id = 'cursor-glow-styles';
    style.textContent = `
        .cursor-glow {
            position: fixed;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(4,85,191,0.06) 0%, transparent 70%);
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 9998;
            transition: width 0.4s ease, height 0.4s ease, background 0.4s ease;
            will-change: transform;
        }
        .cursor-glow.is-hovering {
            width: 450px;
            height: 450px;
            background: radial-gradient(circle, rgba(255,85,0,0.08) 0%, transparent 70%);
        }
        @media (max-width: 768px) {
            .cursor-glow { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
            .cursor-glow { display: none; }
        }
    `;
    document.head.appendChild(style);
})();

// --- Dynamic Share Links ---
document.addEventListener('DOMContentLoaded', function() {
    const shareButtons = document.querySelectorAll('.share-button');
    if (!shareButtons.length) return;

    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);

    shareButtons.forEach(btn => {
        const platform = btn.classList.contains('twitter') ? 'twitter' :
                         btn.classList.contains('linkedin') ? 'linkedin' :
                         btn.classList.contains('facebook') ? 'facebook' :
                         btn.classList.contains('email') ? 'email' : null;

        if (!platform) return;

        let shareUrl = '#';
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${pageTitle}&body=${pageUrl}`;
                break;
        }
        btn.setAttribute('href', shareUrl);
    });
});