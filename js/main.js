// Main JavaScript for Consulting Crew Website

class ConsultingCrewApp {
    constructor() {
        this.init();
    }

    init() {
        // Wait for includes to load
        document.addEventListener('includes:all-loaded', () => {
            console.log('Includes loaded, initializing main app...');
            this.initializeComponents();
        });

        // If includes are already loaded
        if (document.body.classList.contains('includes-loaded')) {
            this.initializeComponents();
        }

        // Set up global event listeners
        this.setupGlobalListeners();
    }

    initializeComponents() {
        this.setupMobileNavigation();
        this.setupDropdowns();
        this.setupSmoothScrolling();
        this.setupForms();
        this.setupAnimations();
        this.setupAccessibility();
        this.setupPerformance();
    }

    setupGlobalListeners() {
        // Handle clicks on dropdown toggles
        document.addEventListener('click', (e) => {
            // Close dropdowns when clicking outside
            if (!e.target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
                this.closeMobileMenu();
            }
        });
    }

    setupMobileNavigation() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileCloseBtn = document.querySelector('.mobile-close');
        const mobileNav = document.querySelector('.mobile-nav');
        const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');

        // Mobile menu toggle
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu(true);
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
            });
        }

        // Mobile menu close
        if (mobileCloseBtn) {
            mobileCloseBtn.addEventListener('click', () => {
                this.toggleMobileMenu(false);
                mobileMenuBtn?.setAttribute('aria-expanded', 'false');
            });
        }

        // Mobile dropdown toggles
        mobileDropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const menu = toggle.nextElementSibling;
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                
                // Close other dropdowns
                mobileDropdownToggles.forEach(otherToggle => {
                    if (otherToggle !== toggle) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                        otherToggle.nextElementSibling.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                toggle.setAttribute('aria-expanded', !isExpanded);
                menu.classList.toggle('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileNav?.classList.contains('active') &&
                !mobileNav.contains(e.target) &&
                !mobileMenuBtn?.contains(e.target)) {
                this.toggleMobileMenu(false);
                mobileMenuBtn?.setAttribute('aria-expanded', 'false');
            }
        });
    }

    toggleMobileMenu(show) {
        const mobileNav = document.querySelector('.mobile-nav');
        const body = document.body;
        
        if (show) {
            mobileNav?.classList.add('active');
            body.style.overflow = 'hidden';
        } else {
            mobileNav?.classList.remove('active');
            body.style.overflow = '';
        }
    }

    closeMobileMenu() {
        this.toggleMobileMenu(false);
        document.querySelector('.mobile-menu-btn')?.setAttribute('aria-expanded', 'false');
    }

    setupDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (toggle && menu) {
                // Mouse events
                dropdown.addEventListener('mouseenter', () => {
                    this.openDropdown(dropdown);
                });
                
                dropdown.addEventListener('mouseleave', () => {
                    this.closeDropdown(dropdown);
                });
                
                // Keyboard navigation
                toggle.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleDropdown(dropdown);
                    } else if (e.key === 'Escape') {
                        this.closeDropdown(dropdown);
                    }
                });
            }
        });
    }

    openDropdown(dropdown) {
        const menu = dropdown.querySelector('.dropdown-menu');
        const toggle = dropdown.querySelector('.dropdown-toggle');
        
        if (menu) {
            menu.classList.add('active');
            toggle?.setAttribute('aria-expanded', 'true');
        }
    }

    closeDropdown(dropdown) {
        const menu = dropdown.querySelector('.dropdown-menu');
        const toggle = dropdown.querySelector('.dropdown-toggle');
        
        if (menu) {
            menu.classList.remove('active');
            toggle?.setAttribute('aria-expanded', 'false');
        }
    }

    toggleDropdown(dropdown) {
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu?.classList.contains('active')) {
            this.closeDropdown(dropdown);
        } else {
            this.openDropdown(dropdown);
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            this.closeDropdown(dropdown);
        });
    }

    setupSmoothScrolling() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                if (href === '#') return;
                
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    
                    // Close mobile menu if open
                    this.closeMobileMenu();
                    
                    // Smooth scroll to target
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without page jump
                    history.pushState(null, null, href);
                }
            });
        });
    }

    setupForms() {
        // Contact form validation
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                if (!this.validateForm(contactForm)) {
                    e.preventDefault();
                }
            });
        }
        
        // Newsletter forms
        document.querySelectorAll('.newsletter-form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmit(form);
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
                
                // Email validation
                if (field.type === 'email' && !this.isValidEmail(field.value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    isValid = false;
                }
                
                // Phone validation
                if (field.type === 'tel' && field.value && !this.isValidPhone(field.value)) {
                    this.showFieldError(field, 'Please enter a valid phone number');
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidPhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)\.]/g, ''));
    }

    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        // Remove existing error
        this.clearFieldError(field);
        
        // Add error class
        field.classList.add('error');
        
        // Create error message
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        `;
        
        formGroup.appendChild(errorElement);
    }

    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        field.classList.remove('error');
        
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    async handleNewsletterSubmit(form) {
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput?.value.trim();
        
        if (!email || !this.isValidEmail(email)) {
            this.showFieldError(emailInput, 'Please enter a valid email address');
            return;
        }
        
        // Show loading state
        const originalButtonText = form.querySelector('button[type="submit"]').textContent;
        form.querySelector('button[type="submit"]').textContent = 'Subscribing...';
        form.querySelector('button[type="submit"]').disabled = true;
        
        try {
            // In production, you would send this to your backend
            // const response = await fetch('/api/newsletter', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email })
            // });
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Show success message
            this.showNewsletterSuccess(form, email);
            
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showNewsletterError(form);
        } finally {
            // Reset form
            form.querySelector('button[type="submit"]').textContent = originalButtonText;
            form.querySelector('button[type="submit"]').disabled = false;
        }
    }

    showNewsletterSuccess(form, email) {
        const successHTML = `
            <div class="newsletter-success" style="
                text-align: center;
                padding: 1rem;
                background: #d4edda;
                color: #155724;
                border-radius: 4px;
                border: 1px solid #c3e6cb;
            ">
                <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                <h4 style="margin: 0.5rem 0;">Successfully Subscribed!</h4>
                <p style="margin: 0;">Thank you for subscribing to our newsletter.</p>
            </div>
        `;
        
        form.innerHTML = successHTML;
        
        // Reset form after 5 seconds
        setTimeout(() => {
            form.reset();
            form.innerHTML = `
                <input type="email" placeholder="Your email address" required>
                <button type="submit" class="btn btn-primary">Subscribe</button>
            `;
            
            // Re-attach event listener
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmit(form);
            });
        }, 5000);
    }

    showNewsletterError(form) {
        const errorHTML = `
            <div class="newsletter-error" style="
                text-align: center;
                padding: 1rem;
                background: #f8d7da;
                color: #721c24;
                border-radius: 4px;
                border: 1px solid #f5c6cb;
            ">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                <h4 style="margin: 0.5rem 0;">Subscription Failed</h4>
                <p style="margin: 0;">Please try again later.</p>
            </div>
        `;
        
        form.innerHTML = errorHTML;
        
        // Reset form after 5 seconds
        setTimeout(() => {
            form.reset();
            form.innerHTML = `
                <input type="email" placeholder="Your email address" required>
                <button type="submit" class="btn btn-primary">Subscribe</button>
            `;
        }, 5000);
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);
        
        // Observe elements with animation classes
        document.querySelectorAll('.animate-fade-up, .animate-fade-left, .animate-fade-right').forEach(el => {
            observer.observe(el);
        });
    }

    setupAccessibility() {
        // Add aria-current to current page in navigation
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (href === '/' && currentPath === '/index.html')) {
                link.setAttribute('aria-current', 'page');
            }
        });
        
        // Skip to content link functionality
        const skipLink = document.querySelector('.skip-to-content');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    target.removeAttribute('tabindex');
                }
            });
        }
    }

    setupPerformance() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
        
        // Preload critical resources
        this.preloadResources();
    }

    preloadResources() {
        const resources = [
            '/css/style.css',
            '/css/responsive.css',
            '/includes/header.html',
            '/includes/footer.html'
        ];
        
        resources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'fetch';
            document.head.appendChild(link);
        });
    }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ConsultingCrewApp();
    });
} else {
    new ConsultingCrewApp();
}

// Export for debugging
window.ConsultingCrewApp = ConsultingCrewApp;