// main.js - Complete Optimized JavaScript
'use strict';

(function() {
    // Configuration
    const CONFIG = {
        loadingDelay: 800,
        scrollOffset: 100,
        animationOffset: 150,
        cookieExpiry: 365,
        chatMessages: [
            "Hi! I'm Consulting Crew AI. How can I help you today?",
            "Looking for strategic advisory services?",
            "Need help with data analytics or digital transformation?",
            "Let me connect you with our expert team."
        ]
    };

    // Cache DOM elements
    const DOM = {
        body: document.body,
        header: document.getElementById('main-header'),
        mobileMenuToggle: document.getElementById('mobileMenuToggle'),
        mainNav: document.getElementById('mainNav'),
        backToTop: document.getElementById('backToTop'),
        cookieConsent: document.getElementById('cookieConsent'),
        acceptCookies: document.getElementById('acceptCookies'),
        rejectCookies: document.getElementById('rejectCookies'),
        customizeCookies: document.getElementById('customizeCookies'),
        contactForm: document.getElementById('contactForm'),
        loadingScreen: document.querySelector('.loading-screen'),
        dropdowns: document.querySelectorAll('.dropdown'),
        forms: document.querySelectorAll('form'),
        images: document.querySelectorAll('img[data-src]'),
        themeToggle: document.getElementById('themeToggle'),
        chatToggle: document.getElementById('chatToggle'),
        chatContainer: document.getElementById('chatContainer'),
        chatClose: document.getElementById('chatClose'),
        chatMessages: document.getElementById('chatMessages'),
        chatInput: document.getElementById('chatInput'),
        chatSend: document.getElementById('chatSend')
    };

    // Initialize everything
    function init() {
        console.log('Initializing Consulting Crew website...');
        
        // Set current year in footer
        setCurrentYear();
        
        // Initialize components
        initLoading();
        initMobileMenu();
        initScrollEffects();
        initCookieConsent();
        initForms();
        initLazyLoading();
        initThemeToggle();
        initAnimations();
        initChatWidget();
        initServiceWorker();
        
        // Set up event listeners
        setupEventListeners();
        
        // Mark page as loaded
        setTimeout(() => {
            DOM.body.classList.add('loaded');
            console.log('Page loaded and initialized successfully');
        }, CONFIG.loadingDelay);
    }

    // ===== LOADING MANAGEMENT =====
    function initLoading() {
        if (!DOM.loadingScreen) return;
        
        const minLoadTime = 1000;
        const startTime = Date.now();
        
        function hideLoading() {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minLoadTime - elapsed);
            
            setTimeout(() => {
                DOM.loadingScreen.classList.add('hidden');
                
                setTimeout(() => {
                    if (DOM.loadingScreen.parentNode) {
                        DOM.loadingScreen.remove();
                    }
                }, 500);
            }, remaining);
        }
        
        // Check if all critical assets are loaded
        Promise.all([
            document.readyState === 'complete' ? 
                Promise.resolve() : 
                new Promise(resolve => {
                    window.addEventListener('load', resolve);
                }),
            new Promise(resolve => {
                const images = document.images;
                let loaded = 0;
                
                if (images.length === 0) {
                    resolve();
                    return;
                }
                
                const checkLoaded = () => {
                    loaded++;
                    if (loaded === images.length) resolve();
                };
                
                Array.from(images).forEach(img => {
                    if (img.complete) {
                        checkLoaded();
                    } else {
                        img.addEventListener('load', checkLoaded);
                        img.addEventListener('error', checkLoaded);
                    }
                });
            })
        ]).then(hideLoading).catch(hideLoading);
        
        // Fallback timeout
        setTimeout(hideLoading, 3000);
    }

    // ===== MOBILE MENU =====
    function initMobileMenu() {
        if (!DOM.mobileMenuToggle || !DOM.mainNav) return;
        
        DOM.mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    closeMobileMenu();
                }
            });
        });
        
        // Handle dropdowns on mobile
        DOM.dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Toggle current dropdown
                        const isActive = dropdown.classList.contains('active');
                        
                        // Close all dropdowns first
                        DOM.dropdowns.forEach(other => {
                            other.classList.remove('active');
                        });
                        
                        // Toggle current dropdown
                        if (!isActive) {
                            dropdown.classList.add('active');
                        }
                    }
                });
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                DOM.mainNav.classList.contains('active') &&
                !DOM.mainNav.contains(e.target) &&
                !DOM.mobileMenuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.mainNav.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    function toggleMobileMenu() {
        const isActive = DOM.mainNav.classList.contains('active');
        DOM.mainNav.classList.toggle('active');
        
        // Update icon
        const icon = DOM.mobileMenuToggle.querySelector('i');
        if (icon) {
            icon.className = isActive ? 'fas fa-bars' : 'fas fa-times';
        }
        
        // Prevent body scroll when menu is open
        DOM.body.style.overflow = isActive ? '' : 'hidden';
        
        // Update aria-expanded attribute
        DOM.mobileMenuToggle.setAttribute('aria-expanded', !isActive);
    }

    function closeMobileMenu() {
        DOM.mainNav.classList.remove('active');
        const icon = DOM.mobileMenuToggle.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-bars';
        }
        DOM.body.style.overflow = '';
        DOM.dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        DOM.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }

    // ===== SCROLL EFFECTS =====
    function initScrollEffects() {
        let scrollTimeout;
        
        // Handle scroll events with throttling
        function handleScroll() {
            // Header scroll effect
            if (window.pageYOffset > 50) {
                DOM.header?.classList.add('scrolled');
            } else {
                DOM.header?.classList.remove('scrolled');
            }
            
            // Back to top button
            if (DOM.backToTop) {
                if (window.pageYOffset > 300) {
                    DOM.backToTop.classList.add('visible');
                } else {
                    DOM.backToTop.classList.remove('visible');
                }
            }
            
            // Trigger animations on scroll
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    scrollTimeout = null;
                    triggerScrollAnimations();
                }, 100);
            }
        }
        
        window.addEventListener('scroll', handleScroll);
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || !href.startsWith('#')) return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = DOM.header?.offsetHeight || 80;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without page jump
                    history.pushState(null, null, href);
                    
                    // Close mobile menu if open
                    if (window.innerWidth <= 768) {
                        closeMobileMenu();
                    }
                }
            });
        });
        
        // Back to top
        if (DOM.backToTop) {
            DOM.backToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
        
        // Initial check
        handleScroll();
    }
    
    function triggerScrollAnimations() {
        const elements = document.querySelectorAll(
            '.service-card, .process-step-card, .values-card, ' +
            '.team-member, .testimonial-card, .faq-item, .card, ' +
            '.article-card, .benefit, .edge-step'
        );
        
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - CONFIG.animationOffset;
            
            if (isVisible) {
                element.classList.add('animate-slide-up');
            }
        });
    }

    // ===== COOKIE CONSENT =====
    function initCookieConsent() {
        if (!DOM.cookieConsent) return;
        
        // Check if user has already made a choice
        const consent = getCookie('cookieConsent');
        if (!consent) {
            setTimeout(() => {
                DOM.cookieConsent.classList.add('active');
            }, 2000);
        }
        
        // Handle cookie consent buttons
        if (DOM.acceptCookies) {
            DOM.acceptCookies.addEventListener('click', () => {
                setCookie('cookieConsent', 'accepted', CONFIG.cookieExpiry);
                hideCookieConsent();
                initAnalytics();
            });
        }
        
        if (DOM.rejectCookies) {
            DOM.rejectCookies.addEventListener('click', () => {
                setCookie('cookieConsent', 'rejected', CONFIG.cookieExpiry);
                hideCookieConsent();
            });
        }
        
        if (DOM.customizeCookies) {
            DOM.customizeCookies.addEventListener('click', showCookieSettings);
        }
    }

    function hideCookieConsent() {
        DOM.cookieConsent.classList.remove('active');
        setTimeout(() => {
            DOM.cookieConsent.style.display = 'none';
        }, 300);
    }

    function showCookieSettings() {
        const settingsHTML = `
            <div class="cookie-settings-modal">
                <h3>Cookie Settings</h3>
                <p>Customize your cookie preferences:</p>
                <div class="cookie-options">
                    <label class="cookie-option">
                        <input type="checkbox" name="essential" checked disabled>
                        <span>Essential Cookies (Required)</span>
                        <small>Required for the website to function</small>
                    </label>
                    <label class="cookie-option">
                        <input type="checkbox" name="analytics">
                        <span>Analytics Cookies</span>
                        <small>Help us improve our website</small>
                    </label>
                    <label class="cookie-option">
                        <input type="checkbox" name="marketing">
                        <span>Marketing Cookies</span>
                        <small>Personalize your experience</small>
                    </label>
                </div>
                <div class="cookie-buttons">
                    <button class="btn btn-primary" id="saveCookieSettings">Save Preferences</button>
                    <button class="btn btn-outline" id="cancelCookieSettings">Cancel</button>
                </div>
            </div>
        `;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = settingsHTML;
        document.body.appendChild(modal);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 3000;
            }
            .cookie-settings-modal {
                background: white;
                border-radius: var(--border-radius);
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            .cookie-options {
                margin: 20px 0;
            }
            .cookie-option {
                display: block;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                margin-bottom: 10px;
                cursor: pointer;
            }
            .cookie-option input {
                margin-right: 10px;
            }
            .cookie-option span {
                font-weight: 600;
                display: block;
            }
            .cookie-option small {
                color: #666;
                font-size: 0.9em;
            }
        `;
        document.head.appendChild(style);
        
        // Handle modal interactions
        modal.querySelector('#saveCookieSettings').addEventListener('click', () => {
            const analytics = modal.querySelector('input[name="analytics"]').checked;
            const marketing = modal.querySelector('input[name="marketing"]').checked;
            
            setCookie('cookieConsent', 'custom', CONFIG.cookieExpiry);
            setCookie('cookieAnalytics', analytics.toString(), CONFIG.cookieExpiry);
            setCookie('cookieMarketing', marketing.toString(), CONFIG.cookieExpiry);
            
            modal.remove();
            style.remove();
            hideCookieConsent();
            
            if (analytics) initAnalytics();
        });
        
        modal.querySelector('#cancelCookieSettings').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                style.remove();
            }
        });
    }

    // ===== FORM HANDLING =====
    function initForms() {
        DOM.forms.forEach(form => {
            // Remove any existing listeners to prevent duplicates
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            newForm.addEventListener('submit', handleFormSubmit);
            
            // Add real-time validation
            const inputs = newForm.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', validateField);
                input.addEventListener('input', clearFieldError);
            });
        });
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        // Validate all fields
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!validateField({ target: field })) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            showFormError(form, 'Please fill in all required fields correctly.');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        const originalWidth = submitBtn.offsetWidth;
        
        submitBtn.style.width = originalWidth + 'px';
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        // Simulate API call (replace with actual fetch in production)
        setTimeout(() => {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.width = '';
            
            // Show success message
            showFormSuccess(form, 'Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.');
            
            // Reset form
            form.reset();
            
            // Track form submission if analytics enabled
            if (getCookie('cookieConsent') === 'accepted') {
                console.log('Form submitted:', new FormData(form));
            }
        }, 1500);
    }

    function validateField(e) {
        const field = e.target || e;
        const value = field.value.trim();
        let isValid = true;
        
        // Clear previous error
        clearFieldError({ target: field });
        
        // Skip validation for disabled or readonly fields
        if (field.disabled || field.readOnly) return true;
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            showFieldError(field, 'This field is required');
            isValid = false;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
            const cleanPhone = value.replace(/[\s\-\+\(\)]/g, '');
            if (!phoneRegex.test(value) || cleanPhone.length < 10) {
                showFieldError(field, 'Please enter a valid phone number (at least 10 digits)');
                isValid = false;
            }
        }
        
        // URL validation
        if (field.type === 'url' && value) {
            try {
                new URL(value);
            } catch {
                showFieldError(field, 'Please enter a valid URL');
                isValid = false;
            }
        }
        
        // Minimum length validation
        const minLength = field.getAttribute('minlength');
        if (minLength && value.length < parseInt(minLength)) {
            showFieldError(field, `Minimum ${minLength} characters required`);
            isValid = false;
        }
        
        // Maximum length validation
        const maxLength = field.getAttribute('maxlength');
        if (maxLength && value.length > parseInt(maxLength)) {
            showFieldError(field, `Maximum ${maxLength} characters allowed`);
            isValid = false;
        }
        
        if (isValid) {
            field.classList.add('valid');
        }
        
        return isValid;
    }

    function showFieldError(field, message) {
        field.classList.add('error');
        field.classList.remove('valid');
        
        // Create or update error message element
        let errorEl = field.parentNode.querySelector('.field-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'field-error';
            field.parentNode.appendChild(errorEl);
        }
        
        errorEl.textContent = message;
        errorEl.setAttribute('role', 'alert');
        errorEl.setAttribute('aria-live', 'polite');
    }

    function clearFieldError(e) {
        const field = e.target;
        field.classList.remove('error');
        
        const errorEl = field.parentNode.querySelector('.field-error');
        if (errorEl) {
            errorEl.remove();
        }
    }

    function showFormSuccess(form, message) {
        // Remove any existing messages
        const existingMsg = form.querySelector('.form-message');
        if (existingMsg) existingMsg.remove();
        
        // Create success message
        const successMsg = document.createElement('div');
        successMsg.className = 'form-message success';
        successMsg.setAttribute('role', 'alert');
        successMsg.innerHTML = `
            <div style="background-color: #d4edda; color: #155724; padding: 1rem; 
                        border-radius: var(--border-radius); margin-top: 1rem; 
                        border: 1px solid #c3e6cb; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        form.appendChild(successMsg);
        
        // Scroll to success message
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove message after 8 seconds
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.remove();
            }
        }, 8000);
    }

    function showFormError(form, message) {
        // Remove any existing messages
        const existingMsg = form.querySelector('.form-message');
        if (existingMsg) existingMsg.remove();
        
        // Create error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'form-message error';
        errorMsg.setAttribute('role', 'alert');
        errorMsg.innerHTML = `
            <div style="background-color: #f8d7da; color: #721c24; padding: 1rem; 
                        border-radius: var(--border-radius); margin-top: 1rem; 
                        border: 1px solid #f5c6cb; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        form.appendChild(errorMsg);
        
        // Scroll to error message
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove message after 8 seconds
        setTimeout(() => {
            if (errorMsg.parentNode) {
                errorMsg.remove();
            }
        }, 8000);
    }

    // ===== LAZY LOADING =====
    function initLazyLoading() {
        if (!DOM.images.length) return;
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px 0px',
                threshold: 0.1
            });
            
            // Observe all lazy images
            DOM.images.forEach(img => {
                // Add loading class
                img.classList.add('img-loading');
                
                // Set placeholder
                if (!img.getAttribute('src')) {
                    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
                    img.style.backgroundColor = 'var(--lighter-gray)';
                }
                
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            loadAllImages();
        }
    }

    function loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;
        
        const image = new Image();
        image.src = src;
        
        image.onload = () => {
            img.src = src;
            img.classList.remove('img-loading');
            img.classList.add('loaded');
            
            // Add fade-in animation
            img.style.animation = 'fadeIn 0.5s ease';
        };
        
        image.onerror = () => {
            console.warn('Failed to load image:', src);
            img.classList.remove('img-loading');
            img.classList.add('error');
            img.alt = 'Image failed to load';
        };
    }

    function loadAllImages() {
        DOM.images.forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
            }
        });
    }

    // ===== THEME TOGGLE =====
    function initThemeToggle() {
        if (!DOM.themeToggle) return;
        
        // Check for saved theme preference or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
        
        DOM.themeToggle.addEventListener('click', toggleTheme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    enableDarkMode();
                } else {
                    disableDarkMode();
                }
            }
        });
    }

    function toggleTheme() {
        if (DOM.body.classList.contains('dark-mode')) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
        
        // Add transition animation
        DOM.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            DOM.body.style.transition = '';
        }, 300);
    }

    function enableDarkMode() {
        DOM.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        
        const icon = DOM.themeToggle?.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-sun';
            DOM.themeToggle.setAttribute('aria-label', 'Switch to light mode');
        }
    }

    function disableDarkMode() {
        DOM.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        
        const icon = DOM.themeToggle?.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-moon';
            DOM.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    }

    // ===== CHAT WIDGET =====
    function initChatWidget() {
        if (!DOM.chatToggle || !DOM.chatContainer) return;
        
        DOM.chatToggle.addEventListener('click', toggleChat);
        DOM.chatClose.addEventListener('click', closeChat);
        
        // Send message on button click
        if (DOM.chatSend) {
            DOM.chatSend.addEventListener('click', sendChatMessage);
        }
        
        // Send message on Enter key
        if (DOM.chatInput) {
            DOM.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
        }
        
        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (DOM.chatContainer.classList.contains('active') &&
                !DOM.chatContainer.contains(e.target) &&
                !DOM.chatToggle.contains(e.target)) {
                closeChat();
            }
        });
        
        // Initialize with welcome message
        setTimeout(() => {
            addChatMessage(CONFIG.chatMessages[0], 'bot');
        }, 3000);
    }

    function toggleChat() {
        const isActive = DOM.chatContainer.classList.contains('active');
        if (isActive) {
            closeChat();
        } else {
            openChat();
        }
    }

    function openChat() {
        DOM.chatContainer.classList.add('active');
        DOM.chatToggle.setAttribute('aria-expanded', 'true');
        
        // Focus on input
        setTimeout(() => {
            if (DOM.chatInput) {
                DOM.chatInput.focus();
            }
        }, 100);
    }

    function closeChat() {
        DOM.chatContainer.classList.remove('active');
        DOM.chatToggle.setAttribute('aria-expanded', 'false');
    }

    function sendChatMessage() {
        if (!DOM.chatInput || !DOM.chatMessages) return;
        
        const message = DOM.chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        addChatMessage(message, 'user');
        DOM.chatInput.value = '';
        
        // Simulate bot response after delay
        setTimeout(() => {
            const randomResponse = CONFIG.chatMessages[Math.floor(Math.random() * CONFIG.chatMessages.length)];
            addChatMessage(randomResponse, 'bot');
        }, 1000);
    }

    function addChatMessage(text, sender) {
        if (!DOM.chatMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${sender}`;
        messageEl.innerHTML = `
            <div class="chat-bubble">
                ${text}
                <span class="chat-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        `;
        
        DOM.chatMessages.appendChild(messageEl);
        DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
        
        // Add some basic styles for chat
        if (!document.querySelector('#chat-styles')) {
            const style = document.createElement('style');
            style.id = 'chat-styles';
            style.textContent = `
                .chat-message {
                    margin-bottom: 15px;
                    display: flex;
                }
                .chat-message.user {
                    justify-content: flex-end;
                }
                .chat-message.bot {
                    justify-content: flex-start;
                }
                .chat-bubble {
                    max-width: 80%;
                    padding: 10px 15px;
                    border-radius: 18px;
                    position: relative;
                }
                .chat-message.user .chat-bubble {
                    background: var(--blue);
                    color: white;
                    border-bottom-right-radius: 5px;
                }
                .chat-message.bot .chat-bubble {
                    background: var(--lighter-gray);
                    color: var(--dark-color);
                    border-bottom-left-radius: 5px;
                }
                .chat-time {
                    display: block;
                    font-size: 0.7rem;
                    opacity: 0.7;
                    margin-top: 5px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ===== ANIMATIONS =====
    function initAnimations() {
        // Animate elements on scroll
        const animateOnScroll = () => {
            const elements = document.querySelectorAll(
                '.service-card, .process-step-card, .values-card, ' +
                '.team-member, .testimonial-card, .faq-item, .card, ' +
                '.article-card, .benefit, .edge-step, .contact-info-card'
            );
            
            elements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight - CONFIG.animationOffset;
                
                if (isVisible) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                }
            });
        };
        
        // Set initial state for animation
        const animatedElements = document.querySelectorAll(
            '.service-card, .process-step-card, .values-card, ' +
            '.team-member, .testimonial-card, .faq-item, .card, ' +
            '.article-card, .benefit, .edge-step, .contact-info-card'
        );
        
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
        });
        
        window.addEventListener('scroll', animateOnScroll);
        window.addEventListener('resize', animateOnScroll);
        
        // Trigger once on load
        setTimeout(animateOnScroll, 300);
    }

    // ===== SERVICE WORKER =====
    function initServiceWorker() {
        if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    registration => {
                        console.log('ServiceWorker registered:', registration.scope);
                    },
                    error => {
                        console.log('ServiceWorker registration failed:', error);
                    }
                );
            });
        }
    }

    // ===== ANALYTICS =====
    function initAnalytics() {
        // Only initialize if cookies are accepted
        const consent = getCookie('cookieConsent');
        if (consent !== 'accepted' && consent !== 'custom') return;
        
        // Check custom settings
        if (consent === 'custom') {
            const analytics = getCookie('cookieAnalytics');
            if (analytics !== 'true') return;
        }
        
        // Initialize analytics here (Google Analytics, etc.)
        console.log('Analytics initialized');
        
        // Example: Google Analytics (replace with your tracking ID)
        /*
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'YOUR_GA_TRACKING_ID');
        */
    }

    // ===== UTILITY FUNCTIONS =====
    function setCurrentYear() {
        const yearElements = document.querySelectorAll('#currentYear, .current-year');
        yearElements.forEach(el => {
            if (el) {
                el.textContent = new Date().getFullYear();
            }
        });
    }

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        const secure = window.location.protocol === 'https:' ? ';Secure' : '';
        document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Strict${secure}`;
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    }

    function setupEventListeners() {
        // Handle dropdown hover on desktop
        function handleDropdownHover() {
            DOM.dropdowns.forEach(dropdown => {
                // Remove existing listeners
                const newDropdown = dropdown.cloneNode(true);
                dropdown.parentNode.replaceChild(newDropdown, dropdown);
                
                if (window.innerWidth > 768) {
                    newDropdown.addEventListener('mouseenter', () => {
                        newDropdown.classList.add('active');
                    });
                    
                    newDropdown.addEventListener('mouseleave', () => {
                        newDropdown.classList.remove('active');
                    });
                }
            });
        }
        
        handleDropdownHover();
        window.addEventListener('resize', handleDropdownHover);
        
        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                const originalTitle = document.querySelector('title')?.textContent || 'Consulting Crew';
                document.title = '👋 Come back! | ' + originalTitle;
            } else {
                document.title = document.querySelector('title')?.textContent || 'Consulting Crew';
            }
        });
        
        // Tab functionality for service pages
        const tabBtns = document.querySelectorAll('.tab-btn');
        if (tabBtns.length > 0) {
            tabBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    
                    // Remove active class from all buttons and contents
                    tabBtns.forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked button and corresponding content
                    this.classList.add('active');
                    const content = document.getElementById(tabId);
                    if (content) {
                        content.classList.add('active');
                    }
                });
            });
        }
        
        // Filter functionality for blog page
        const filterBtns = document.querySelectorAll('.filter-btn');
        if (filterBtns.length > 0) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const filter = this.getAttribute('data-filter');
                    
                    // Update active button
                    filterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Filter articles
                    const articles = document.querySelectorAll('.article-card');
                    articles.forEach(article => {
                        if (filter === 'all' || article.getAttribute('data-category') === filter) {
                            article.style.display = 'block';
                            setTimeout(() => {
                                article.style.opacity = '1';
                                article.style.transform = 'translateY(0)';
                            }, 10);
                        } else {
                            article.style.opacity = '0';
                            article.style.transform = 'translateY(20px)';
                            setTimeout(() => {
                                article.style.display = 'none';
                            }, 300);
                        }
                    });
                });
            });
        }
        
        // Schedule call button
        const scheduleBtn = document.getElementById('scheduleCallBtn');
        if (scheduleBtn) {
            scheduleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Scheduling functionality would be integrated with a calendar service like Calendly. For now, please use the contact form or call us directly.');
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export public API
    window.ConsultingCrew = {
        init,
        toggleTheme,
        setCookie,
        getCookie,
        openChat,
        closeChat
    };
})();