// ============================================
// UTILITY FUNCTIONS
// ============================================

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
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

const isInViewport = (element, offset = 0) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight - offset) &&
        rect.bottom >= offset
    );
};

const smoothScroll = (target, offset = 100) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
        window.scrollTo({
            top: element.offsetTop - offset,
            behavior: 'smooth'
        });
    }
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// ============================================
// CORE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Consulting Crew - Application initialized');

    // Initialise components (mobile menu, dropdowns, sticky header are handled by header-footer.js)
    initFilterScrolledEffect();
    initFilters();       // filter buttons on Services, Portfolio, Insights
    initForms();         // contact & newsletter forms
    initAccordions();    // FAQ
    initSmoothScroll();  // smooth anchor links
    initLazyLoading();
    initCurrentYear();
    initBackToTop();
    // Ripple & parallax are initialised on window.load
});

// ============================================
// FILTER BAR COMPRESS + BLUR (Scroll Effect)
// ============================================

const initFilterScrolledEffect = () => {
    const filterBars = document.querySelectorAll('.filter-section, .insights-filter');
    if (!filterBars.length) return;

    const handleFilterScroll = throttle(() => {
        const scrolled = window.pageYOffset > 20;
        filterBars.forEach(bar => {
            bar.classList.toggle('filter-section--scrolled', scrolled);
            bar.classList.toggle('insights-filter--scrolled', scrolled);
        });
    }, 16);

    window.addEventListener('scroll', handleFilterScroll, { passive: true });
    handleFilterScroll(); // run once on load
};

// ============================================
// COMPONENT: FILTERING (Generic – used by Services, Portfolio, Insights)
// ============================================

const initFilter = (filterSelector, itemSelector, categoryAttr = 'data-category') => {
    const filterButtons = document.querySelectorAll(filterSelector);
    const items = document.querySelectorAll(itemSelector);

    if (!filterButtons.length || !items.length) return;

    const filterItems = (filterValue) => {
        items.forEach(item => {
            const itemCategory = item.getAttribute(categoryAttr);
            const matches = filterValue === 'all' || itemCategory === filterValue;

            item.style.display = 'block';
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';

            setTimeout(() => {
                item.style.opacity = matches ? '1' : '0';
                item.style.transform = matches ? 'translateY(0)' : 'translateY(20px)';
                if (!matches) {
                    setTimeout(() => item.style.display = 'none', 300);
                }
            }, 10);
        });
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter') || 'all';
            filterItems(filterValue);

            // Accessibility announcement
            const count = Array.from(items).filter(
                item => filterValue === 'all' || item.getAttribute(categoryAttr) === filterValue
            ).length;
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.classList.add('sr-only');
            announcement.textContent = `Showing ${count} items`;
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        });
    });

    items.forEach(item => {
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
};

const initFilters = () => {
    if (document.querySelector('.services-filter')) {
        initFilter('.services-filter .filter-btn', '.service-card');
    }
    if (document.querySelector('.portfolio-filter')) {
        initFilter('.portfolio-filter .filter-btn', '.portfolio-item');
    }
    if (document.querySelector('.insights-filter')) {
        initFilter('.insights-filter .filter-btn', '.insight-card');
    }
};

// ============================================
// BACK TO TOP BUTTON
// ============================================

const initBackToTop = () => {
    const backToTopButton = document.getElementById('backToTop');
    if (!backToTopButton) return;

    let ticking = false;

    const toggleBackToTop = () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                toggleBackToTop();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    backToTopButton.addEventListener('click', scrollToTop);
    toggleBackToTop();
};

// ============================================
// COMPONENT: FORMS
// ============================================

const initContactForm = () => {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    if (!contactForm) return;

    const validateField = (field) => {
        const error = document.getElementById(field.id + 'Error');
        if (!error) return true;

        if (!field.value.trim()) {
            error.textContent = 'This field is required';
            field.classList.add('error');
            return false;
        }

        if (field.id === 'email' && !isValidEmail(field.value)) {
            error.textContent = 'Please enter a valid email address';
            field.classList.add('error');
            return false;
        }

        error.textContent = '';
        field.classList.remove('error');
        return true;
    };

    const validateForm = () => {
        let isValid = true;
        ['name', 'email', 'service', 'message'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !validateField(field)) isValid = false;
        });
        return isValid;
    };

    contactForm.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
        input.addEventListener('input', () => {
            const error = document.getElementById(input.id + 'Error');
            if (error) { error.textContent = ''; input.classList.remove('error'); }
        });
        input.addEventListener('blur', () => validateField(input));
    });

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const submitText = submitBtn.querySelector('.submit-text');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');

        if (submitText) submitText.style.display = 'none';
        if (loadingSpinner) loadingSpinner.style.display = 'inline-block';
        submitBtn.disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            contactForm.style.display = 'none';
            if (successMessage) {
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                    contactForm.style.display = 'block';
                    contactForm.reset();
                }, 5000);
            }
            contactForm.reset();
        } catch (error) {
            console.error('Form submission error:', error);
            alert('There was an error submitting the form. Please try again.');
        } finally {
            if (submitText) submitText.style.display = 'inline';
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
};

const initNewsletterForm = () => {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        if (!emailInput || !isValidEmail(emailInput.value)) {
            alert('Please enter a valid email address');
            return;
        }

        const submitBtn = newsletterForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            emailInput.value = '';
            alert('Thank you for subscribing!');
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            alert('There was an error. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
};

const initForms = () => {
    initContactForm();
    initNewsletterForm();
};

// ============================================
// COMPONENT: ACCORDIONS (FAQ)
// ============================================

const initAccordions = () => {
    const accordions = document.querySelectorAll('.faq-accordion');
    accordions.forEach(accordion => {
        const questions = accordion.querySelectorAll('.faq-question');
        questions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.closest('.faq-item');
                const answer = faqItem.querySelector('.faq-answer');
                const icon = question.querySelector('.faq-icon');
                const isActive = faqItem.classList.contains('active');

                accordion.querySelectorAll('.faq-item.active').forEach(item => {
                    if (item !== faqItem) {
                        item.classList.remove('active');
                        const otherAnswer = item.querySelector('.faq-answer');
                        const otherIcon = item.querySelector('.faq-icon');
                        if (otherAnswer) otherAnswer.style.maxHeight = null;
                        if (otherIcon) otherIcon.textContent = '+';
                    }
                });

                faqItem.classList.toggle('active');
                if (!isActive) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    if (icon) icon.textContent = '−';
                    question.setAttribute('aria-expanded', 'true');
                } else {
                    answer.style.maxHeight = null;
                    if (icon) icon.textContent = '+';
                    question.setAttribute('aria-expanded', 'false');
                }
            });
            question.setAttribute('aria-expanded', 'false');
        });
    });
};

// ============================================
// COMPONENT: SMOOTH SCROLL (anchor links)
// ============================================

const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href !== '#' && href.startsWith('#') && document.querySelector(href)) {
                e.preventDefault();
                smoothScroll(href, 100);
            }
        });
    });
};

// ============================================
// COMPONENT: LAZY LOADING
// ============================================

const initLazyLoading = () => {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });
        document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
    } else {
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.getAttribute('data-src');
        });
    }
};

// ============================================
// COMPONENT: CURRENT YEAR
// ============================================

const initCurrentYear = () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
};

// ============================================
// WINDOW LOAD: Parallax, Ripple, Sticky Header (already handled by header-footer.js)
// ============================================

window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Ripple effect on buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Parallax (optional, already in animations.js but can be kept minimal)
    console.log('Consulting Crew - All components initialized');
});

// ============================================
// EXPORTS (for module environments)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        throttle,
        isValidEmail,
        smoothScroll,
        initFilters,
        initForms,
        initAccordions,
        initLazyLoading,
        initCurrentYear,
        initBackToTop
    };
}