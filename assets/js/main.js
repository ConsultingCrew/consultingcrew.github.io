
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

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @param {number} offset - Offset in pixels
 * @returns {boolean} True if element is in viewport
 */
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

/**
 * Initialize all components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Consulting Crew - Application initialized');
    
    // Initialize all components
    initMobileMenu();
    initDropdowns();
    initFilters();
    initForms();
    initAccordions();
    initSmoothScroll();
    initAnimations();
    initCounters();
    initCurrentYear();
    
    // Lazy load images
    initLazyLoading();
});

// ============================================
// COMPONENT: MOBILE MENU
// ============================================
const initMobileMenu = () => {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!toggle || !navMenu) return;
    
    const toggleMenu = () => {
        const isActive = toggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = isActive ? 'hidden' : '';
        toggle.setAttribute('aria-expanded', isActive);
    };
    
    // Toggle on button click
    toggle.addEventListener('click', toggleMenu);
    
    // Close on link click
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar') && navMenu.classList.contains('active')) {
            toggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            toggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
};

// ============================================
// COMPONENT: DROPDOWNS
// ============================================

const initDropdowns = () => {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    if (!dropdowns.length) return;
    
    // Handle desktop hover
    if (window.innerWidth > 992) {
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('mouseenter', () => {
                dropdown.classList.add('open');
            });
            
            dropdown.addEventListener('mouseleave', () => {
                dropdown.classList.remove('open');
            });
        });
    } 
    // Handle mobile click
    else {
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            
            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Close other dropdowns
                    dropdowns.forEach(other => {
                        if (other !== dropdown && other.classList.contains('open')) {
                            other.classList.remove('open');
                        }
                    });
                    
                    dropdown.classList.toggle('open');
                });
            }
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('open');
                });
            }
        });
    }
    
    // Handle resize
    window.addEventListener('resize', debounce(() => {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('open');
        });
        initDropdowns(); // Reinitialize with new window size
    }, 250));
};

// ============================================
// COMPONENT: FILTERING (Generic)
// ============================================

const initFilter = (filterSelector, itemSelector, categoryAttr = 'data-category') => {
    const filterButtons = document.querySelectorAll(filterSelector);
    const items = document.querySelectorAll(itemSelector);
    
    if (!filterButtons.length || !items.length) return;
    
    const filterItems = (filterValue) => {
        items.forEach(item => {
            const itemCategory = item.getAttribute(categoryAttr);
            
            if (filterValue === 'all' || itemCategory === filterValue) {
                // Show item with animation
                item.style.display = 'block';
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 10);
            } else {
                // Hide item with animation
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    };
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter') || 'all';
            filterItems(filterValue);
            
            // Announce filter change for screen readers
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
    
    // Initial animation setup
    items.forEach(item => {
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
};


const initFilters = () => {
    // Services filter
    if (document.querySelector('.services-filter')) {
        initFilter('.services-filter .filter-btn', '.service-card');
    }
    
    // Portfolio filter
    if (document.querySelector('.portfolio-filter')) {
        initFilter('.portfolio-filter .filter-btn', '.portfolio-item');
    }
    
    // Insights filter
    if (document.querySelector('.insights-filter')) {
        initFilter('.insights-filter .filter-btn', '.insight-card');
    }
};

// ============================================
// BACK TO TOP BUTTON
// ============================================

(function() {
    'use strict';
    
    const backToTopButton = document.getElementById('backToTop');
    
    if (!backToTopButton) return;
    
    // Show/hide button based on scroll position
    const toggleBackToTop = () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    };
    
    // Smooth scroll to top
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    // Throttle scroll event for performance
    let ticking = false;
    const handleScroll = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                toggleBackToTop();
                ticking = false;
            });
            ticking = true;
        }
    };
    
    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    backToTopButton.addEventListener('click', scrollToTop);
    
    // Initial check
    toggleBackToTop();
})();


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
        const requiredFields = ['name', 'email', 'service', 'message'];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    };
    
    // Real-time validation
    contactForm.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
        input.addEventListener('input', () => {
            const error = document.getElementById(input.id + 'Error');
            if (error) {
                error.textContent = '';
                input.classList.remove('error');
            }
        });
        
        input.addEventListener('blur', () => validateField(input));
    });
    
    // Form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const submitText = submitBtn.querySelector('.submit-text');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');
        
        // Show loading state
        if (submitText) submitText.style.display = 'none';
        if (loadingSpinner) loadingSpinner.style.display = 'inline-block';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call - Replace with actual fetch
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Success
            contactForm.style.display = 'none';
            if (successMessage) {
                successMessage.style.display = 'block';
                
                // Auto-hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                    contactForm.style.display = 'block';
                    contactForm.reset();
                }, 5000);
            }
            
            // Reset form
            contactForm.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            alert('There was an error submitting the form. Please try again.');
        } finally {
            // Reset button state
            if (submitText) submitText.style.display = 'inline';
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
};

/**
 * Initialize newsletter form
 */
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
            // Simulate API call - Replace with actual fetch
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

/**
 * Initialize all forms
 */
const initForms = () => {
    initContactForm();
    initNewsletterForm();
};

// ============================================
// COMPONENT: ACCORDIONS
// ============================================

/**
 * Initialize FAQ accordion
 */
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
                
                // Close other items
                accordion.querySelectorAll('.faq-item.active').forEach(item => {
                    if (item !== faqItem) {
                        item.classList.remove('active');
                        const otherAnswer = item.querySelector('.faq-answer');
                        const otherIcon = item.querySelector('.faq-icon');
                        if (otherAnswer) otherAnswer.style.maxHeight = null;
                        if (otherIcon) otherIcon.textContent = '+';
                    }
                });
                
                // Toggle current item
                faqItem.classList.toggle('active');
                
                if (!isActive) {
                    // Open
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    if (icon) icon.textContent = '−';
                    question.setAttribute('aria-expanded', 'true');
                } else {
                    // Close
                    answer.style.maxHeight = null;
                    if (icon) icon.textContent = '+';
                    question.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Set initial ARIA attributes
            question.setAttribute('aria-expanded', 'false');
        });
    });
};

// ============================================
// COMPONENT: SMOOTH SCROLL
// ============================================

/**
 * Initialize smooth scroll for anchor links
 */
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
// COMPONENT: ANIMATIONS
// ============================================

/**
 * Initialize scroll animations using Intersection Observer
 */
const initAnimations = () => {
    const animatedElements = document.querySelectorAll(
        '.animate-fade, .animate-left, .animate-right, .animate-up'
    );
    
    if (!animatedElements.length) return;
    
    // Set initial styles
    animatedElements.forEach(element => {
        if (element.classList.contains('animate-fade')) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
        }
        if (element.classList.contains('animate-left')) {
            element.style.opacity = '0';
            element.style.transform = 'translateX(-30px)';
        }
        if (element.classList.contains('animate-right')) {
            element.style.opacity = '0';
            element.style.transform = 'translateX(30px)';
        }
        if (element.classList.contains('animate-up')) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
        }
        
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });
    
    // Observer options
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    // Create observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.style.opacity = '1';
                element.style.transform = 'translate(0, 0)';
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observe elements
    animatedElements.forEach(element => {
        observer.observe(element);
    });
};

// ============================================
// COMPONENT: NUMBER COUNTERS
// ============================================

/**
 * Initialize number counters
 */
const initCounters = () => {
    const counters = document.querySelectorAll('.stat-number, .count-up');
    
    if (!counters.length) return;
    
    const observerOptions = {
        root: null,
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const finalValue = parseInt(element.getAttribute('data-count') || element.textContent);
                const suffix = element.textContent.replace(/[0-9]/g, '') || '';
                let current = 0;
                
                const increment = finalValue / 50; // Complete in ~1.5s (50 frames at 30ms)
                
                const timer = setInterval(() => {
                    current += increment;
                    
                    if (current >= finalValue) {
                        current = finalValue;
                        clearInterval(timer);
                    }
                    
                    element.textContent = Math.floor(current) + suffix;
                }, 30);
                
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
};

// ============================================
// COMPONENT: LAZY LOADING
// ============================================

/**
 * Initialize lazy loading for images
 */
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
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.getAttribute('data-src');
        });
    }
};

// ============================================
// COMPONENT: CURRENT YEAR
// ============================================

/**
 * Set current year in footer
 */
const initCurrentYear = () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
};

// ============================================
// COMPONENT: PARALLAX EFFECT
// ============================================

/**
 * Initialize parallax effect for hero sections
 */
const initParallax = () => {
    const heroSections = document.querySelectorAll('.hero-home, .hero');
    
    if (!heroSections.length) return;
    
    const handleParallax = throttle(() => {
        const scrolled = window.pageYOffset;
        
        heroSections.forEach(hero => {
            const shapes = hero.querySelector('.floating-shapes');
            if (shapes) {
                // Parallax speed factor
                const rate = scrolled * 0.2;
                shapes.style.transform = `translate3d(0, ${rate}px, 0)`;
                
                // Fade out as we scroll
                const opacity = Math.max(0.2, 1 - (scrolled / 800));
                shapes.style.opacity = opacity;
            }
        });
    }, 16); // ~60fps
    
    window.addEventListener('scroll', handleParallax);
};

// ============================================
// COMPONENT: STICKY HEADER
// ============================================

/**
 * Initialize sticky header behavior
 */
const initStickyHeader = () => {
    const header = document.querySelector('.main-header');
    
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', throttle(() => {
        const currentScroll = window.pageYOffset;
        
        // Add background on scroll
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide/show on scroll direction (optional)
        if (currentScroll > 200) {
            if (currentScroll > lastScroll) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    }, 100));
};

// ============================================
// COMPONENT: BUTTON RIPPLE EFFECT
// ============================================

/**
 * Initialize button ripple effects
 */
const initRippleEffect = () => {
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
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
};

// Add ripple styles
const addRippleStyles = () => {
    if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            .btn {
                position: relative;
                overflow: hidden;
            }
            
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// ============================================
// WINDOW LOAD INITIALIZATION
// ============================================

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Initialize additional components
    initParallax();
    initStickyHeader();
    initRippleEffect();
    addRippleStyles();
    
    console.log('Consulting Crew - All components initialized');
});

// ============================================
// EXPORTS (for module usage if needed)
// ============================================

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        throttle,
        isValidEmail,
        smoothScroll,
        initMobileMenu,
        initDropdowns,
        initFilters,
        initForms,
        initAccordions,
        initAnimations,
        initCounters,
        initLazyLoading,
        initCurrentYear
    };
}
