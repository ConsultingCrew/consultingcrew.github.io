// consulting-crew

'use strict';

(function() {
    // ===== CONFIGURATION =====
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
        ],
        performanceMetrics: {
            lcpThreshold: 2500,
            fidThreshold: 100,
            clsThreshold: 0.1
        }
    };

    // ===== DOM CACHE =====
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

    // ===== UTILITY FUNCTIONS =====
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
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

    function generateCSRFToken() {
        return 'csrf_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    function setCurrentYear() {
        const yearElements = document.querySelectorAll('#currentYear, .current-year');
        yearElements.forEach(el => {
            if (el) el.textContent = new Date().getFullYear();
        });
    }

    // ===== PERFORMANCE MONITORING =====
    class PerformanceMonitor {
        constructor() {
            this.metrics = {
                lcp: null,
                fid: null,
                cls: 0,
                tbt: 0
            };
            this.init();
        }

        init() {
            this.captureLCP();
            this.captureFID();
            this.captureCLS();
            this.captureTBT();
            
            window.addEventListener('load', () => {
                setTimeout(() => this.reportMetrics(), 1000);
            });
        }

        captureLCP() {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.lcp = lastEntry.startTime;
                });
                observer.observe({ type: 'largest-contentful-paint', buffered: true });
            }
        }

        captureFID() {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        this.metrics.fid = entry.startTime;
                    });
                });
                observer.observe({ type: 'first-input', buffered: true });
            }
        }

        captureCLS() {
            if ('PerformanceObserver' in window) {
                let clsValue = 0;
                const observer = new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    this.metrics.cls = clsValue;
                });
                observer.observe({ type: 'layout-shift', buffered: true });
            }
        }

        captureTBT() {
            // Total Blocking Time approximation
            let totalBlockingTime = 0;
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        totalBlockingTime += entry.duration - 50;
                    }
                }
                this.metrics.tbt = totalBlockingTime;
            });
            observer.observe({ entryTypes: ['longtask'] });
        }

        reportMetrics() {
            const data = {
                url: window.location.href,
                metrics: this.metrics,
                userAgent: navigator.userAgent,
                connection: navigator.connection ? {
                    effectiveType: navigator.connection.effectiveType,
                    rtt: navigator.connection.rtt,
                    downlink: navigator.connection.downlink
                } : null,
                timestamp: Date.now()
            };

            // Check if metrics are poor
            const isPoorPerformance = 
                (this.metrics.lcp && this.metrics.lcp > CONFIG.performanceMetrics.lcpThreshold) ||
                (this.metrics.fid && this.metrics.fid > CONFIG.performanceMetrics.fidThreshold) ||
                (this.metrics.cls > CONFIG.performanceMetrics.clsThreshold);

            if (isPoorPerformance) {
                console.warn('Poor performance detected:', this.metrics);
                this.triggerPerformanceOptimizations();
            }

            // Send to analytics endpoint
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/performance', JSON.stringify(data));
            }
        }

        triggerPerformanceOptimizations() {
            // Lazy load images more aggressively
            document.querySelectorAll('img:not([data-src])').forEach(img => {
                if (!img.complete && !img.hasAttribute('data-src')) {
                    img.loading = 'lazy';
                }
            });

            // Reduce animations
            document.body.classList.add('reduce-motion');
        }
    }

    // ===== ACCESSIBILITY ENHANCER =====
    class AccessibilityEnhancer {
        constructor() {
            this.fontSize = 100; // percentage
            this.init();
        }

        init() {
            this.addSkipLink();
            this.addAccessibilityControls();
            this.enhanceKeyboardNav();
            this.addAriaLabels();
        }

        addSkipLink() {
            if (document.querySelector('.skip-to-content')) return;

            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-to-content';
            skipLink.textContent = 'Skip to main content';
            document.body.insertBefore(skipLink, document.body.firstChild);

            if (!document.getElementById('main-content')) {
                const main = document.querySelector('main') || document.querySelector('.container');
                if (main) main.id = 'main-content';
            }
        }

        addAccessibilityControls() {
            if (document.querySelector('.accessibility-controls')) return;

            const controls = document.createElement('div');
            controls.className = 'accessibility-controls';
            controls.innerHTML = `
                <button class="font-smaller" aria-label="Decrease font size">A-</button>
                <button class="font-reset" aria-label="Reset font size">A</button>
                <button class="font-larger" aria-label="Increase font size">A+</button>
            `;

            document.body.appendChild(controls);

            controls.querySelector('.font-smaller').addEventListener('click', () => this.adjustFontSize(-10));
            controls.querySelector('.font-reset').addEventListener('click', () => this.resetFontSize());
            controls.querySelector('.font-larger').addEventListener('click', () => this.adjustFontSize(10));
        }

        adjustFontSize(change) {
            this.fontSize += change;
            this.fontSize = Math.max(80, Math.min(150, this.fontSize));
            document.documentElement.style.fontSize = `${this.fontSize}%`;
            localStorage.setItem('fontSize', this.fontSize);
        }

        resetFontSize() {
            this.fontSize = 100;
            document.documentElement.style.fontSize = '100%';
            localStorage.removeItem('fontSize');
        }

        addAriaLabels() {
            // Add aria-labels to icons without text
            document.querySelectorAll('i[aria-hidden="true"]').forEach(icon => {
                if (!icon.parentElement.getAttribute('aria-label')) {
                    const role = icon.className.match(/fa-(.+?)(\s|$)/);
                    if (role) {
                        icon.parentElement.setAttribute('aria-label', role[1].replace('-', ' '));
                    }
                }
            });
        }

        enhanceKeyboardNav() {
            // Trap focus in modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && document.querySelector('.modal-overlay')) {
                    this.trapFocus(e);
                }
            });
        }

        trapFocus(e) {
            const modal = document.querySelector('.modal-overlay');
            const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstFocusable = focusable[0];
            const lastFocusable = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    }

    // ===== SMART CTA OPTIMIZER =====
    class SmartCTA {
        constructor() {
            this.scrollDepth = 0;
            this.timeOnPage = 0;
            this.interactions = 0;
            this.init();
        }

        init() {
            this.trackScrollDepth();
            this.trackTimeOnPage();
            this.trackInteractions();
            
            setInterval(() => this.updateCTAs(), 5000);
            setTimeout(() => this.addUrgency(), 30000); // Add urgency after 30 seconds
        }

        trackScrollDepth() {
            window.addEventListener('scroll', throttle(() => {
                const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
                this.scrollDepth = Math.max(this.scrollDepth, scrollPercent);
            }, 100));
        }

        trackTimeOnPage() {
            setInterval(() => this.timeOnPage++, 1000);
        }

        trackInteractions() {
            document.addEventListener('click', () => this.interactions++);
            document.addEventListener('keydown', () => this.interactions++);
        }

        updateCTAs() {
            const ctas = document.querySelectorAll('.btn-primary, .btn-secondary');
            
            ctas.forEach(btn => {
                // Update text based on scroll depth
                if (this.scrollDepth > 50 && !btn.classList.contains('scrolled-cta')) {
                    btn.classList.add('scrolled-cta');
                    const originalText = btn.textContent;
                    if (originalText.includes('Learn More') || originalText.includes('Explore')) {
                        btn.innerHTML = btn.innerHTML.replace('Learn More', 'Ready to Start?')
                                                   .replace('Explore', 'Get Started');
                    }
                }

                // Add urgency after time
                if (this.timeOnPage > 30 && !btn.querySelector('.urgency-badge')) {
                    const urgencyText = ['Limited Availability', 'Schedule Today', 'Book Now'];
                    const randomText = urgencyText[Math.floor(Math.random() * urgencyText.length)];
                    
                    if (btn.classList.contains('btn-secondary')) {
                        const badge = document.createElement('span');
                        badge.className = 'urgency-badge';
                        badge.textContent = randomText;
                        btn.appendChild(badge);
                    }
                }
            });
        }

        addUrgency() {
            const mainCTA = document.querySelector('.hero-actions .btn-primary, .cta-section .btn-primary');
            if (mainCTA && !mainCTA.querySelector('.urgency-badge')) {
                const badge = document.createElement('span');
                badge.className = 'urgency-badge';
                badge.textContent = 'Limited Slots';
                mainCTA.appendChild(badge);
            }
        }
    }

    // ===== EXIT INTENT DETECTION =====
    class ExitIntent {
        constructor() {
            this.shown = false;
            this.init();
        }

        init() {
            // Only show once per session
            if (sessionStorage.getItem('exitIntentShown')) return;

            document.addEventListener('mouseleave', (e) => {
                if (e.clientY < 0 && !this.shown && this.shouldShowPopup()) {
                    this.showPopup();
                }
            });

            // Also show on scroll up (mobile exit intent)
            let lastScrollTop = 0;
            window.addEventListener('scroll', () => {
                const st = window.pageYOffset || document.documentElement.scrollTop;
                if (st < lastScrollTop && st < 100 && !this.shown && this.shouldShowPopup()) {
                    this.showPopup();
                }
                lastScrollTop = st <= 0 ? 0 : st;
            }, { passive: true });
        }

        shouldShowPopup() {
            // Don't show if user has submitted a form
            if (localStorage.getItem('formSubmitted')) return false;
            
            // Only show if user has been on page for at least 10 seconds
            return performance.now() > 10000;
        }

        showPopup() {
            this.shown = true;
            sessionStorage.setItem('exitIntentShown', 'true');

            const popup = document.createElement('div');
            popup.className = 'exit-popup';
            popup.innerHTML = `
                <div class="exit-popup-content">
                    <button class="exit-close" aria-label="Close">&times;</button>
                    <h3>Wait! Get Our Free Strategy Guide</h3>
                    <p>Download our 10-page guide on "Scaling Your Business in 2024"</p>
                    <form class="exit-form">
                        <input type="email" placeholder="Your email" required>
                        <button type="submit">Download Free Guide</button>
                        <p class="privacy-note">We respect your privacy. Unsubscribe at any time.</p>
                    </form>
                </div>
            `;

            document.body.appendChild(popup);
            document.body.style.overflow = 'hidden';

            // Close button
            popup.querySelector('.exit-close').addEventListener('click', () => {
                popup.remove();
                document.body.style.overflow = '';
            });

            // Close on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && document.querySelector('.exit-popup')) {
                    popup.remove();
                    document.body.style.overflow = '';
                }
            });

            // Form submission
            popup.querySelector('.exit-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const email = popup.querySelector('input[type="email"]').value;
                
                if (this.validateEmail(email)) {
                    // Submit to your API
                    this.subscribeEmail(email);
                    
                    // Show success message
                    popup.querySelector('.exit-form').innerHTML = `
                        <div class="success-message">
                            <i class="fas fa-check-circle"></i>
                            <h4>Thank You!</h4>
                            <p>Your guide has been sent to ${email}</p>
                        </div>
                    `;
                    
                    setTimeout(() => {
                        popup.remove();
                        document.body.style.overflow = '';
                    }, 3000);
                }
            });

            // Close on outside click
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    popup.remove();
                    document.body.style.overflow = '';
                }
            });
        }

        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        subscribeEmail(email) {
            // Send to your email service
            const data = { email, source: 'exit-intent', page: window.location.pathname };
            
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/subscribe', JSON.stringify(data));
            } else {
                fetch('/api/subscribe', {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
    }

    // ===== IMAGE OPTIMIZATION =====
    class ImageOptimizer {
        constructor() {
            this.supportsWebP = null;
            this.init();
        }

        async init() {
            await this.checkWebPSupport();
            this.optimizeImages();
            this.lazyLoadImages();
        }

        async checkWebPSupport() {
            if (this.supportsWebP !== null) return this.supportsWebP;
            
            const canvas = document.createElement('canvas');
            this.supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            return this.supportsWebP;
        }

        optimizeImages() {
            const images = document.querySelectorAll('img:not(.no-optimize)');
            
            images.forEach(img => {
                const src = img.src || img.getAttribute('data-src');
                if (!src) return;

                // Skip if already WebP or SVG
                if (src.includes('.webp') || src.includes('.svg')) return;

                // Check if image is above the fold
                const rect = img.getBoundingClientRect();
                const isAboveFold = rect.top < window.innerHeight;

                // Convert to WebP if supported and not already loaded
                if (this.supportsWebP && !img.complete) {
                    const webpSrc = src.replace(/\.(jpg|jpeg|png)(\?.*)?$/, '.webp$2');
                    
                    // Load WebP in background
                    const webpImage = new Image();
                    webpImage.src = webpSrc;
                    
                    webpImage.onload = () => {
                        // Only replace if WebP loaded successfully
                        img.src = webpSrc;
                        img.classList.add('webp-loaded');
                    };
                    
                    webpImage.onerror = () => {
                        console.warn('WebP failed to load:', webpSrc);
                    };
                }

                // Add blurhash placeholder for large images
                if (img.width > 500 && img.height > 500 && !img.hasAttribute('data-blurhash')) {
                    this.addBlurhashPlaceholder(img);
                }
            });
        }

        addBlurhashPlaceholder(img) {
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder-blur';
            placeholder.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
                filter: blur(10px);
                opacity: 0.7;
            `;
            
            img.parentElement.style.position = 'relative';
            img.parentElement.appendChild(placeholder);
            
            img.onload = () => {
                placeholder.style.opacity = '0';
                setTimeout(() => placeholder.remove(), 300);
            };
        }

        lazyLoadImages() {
            if (!('IntersectionObserver' in window)) {
                this.loadAllImages();
                return;
            }

            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px 0px',
                threshold: 0.1
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                img.classList.add('lazy-loading');
                imageObserver.observe(img);
            });
        }

        loadImage(img) {
            const src = img.getAttribute('data-src');
            if (!src) return;

            img.src = src;
            img.removeAttribute('data-src');
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');

            img.onload = () => {
                img.classList.add('loaded');
            };
        }

        loadAllImages() {
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            });
        }
    }

    // ===== PAGE LOAD PROGRESS =====
    class PageLoadProgress {
        constructor() {
            this.progressBar = null;
            this.init();
        }

        init() {
            this.createProgressBar();
            this.simulateProgress();
            this.hideOnComplete();
        }

        createProgressBar() {
            this.progressBar = document.createElement('div');
            this.progressBar.className = 'page-load-progress';
            document.body.appendChild(this.progressBar);
        }

        simulateProgress() {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 90) {
                    clearInterval(interval);
                }
                this.progressBar.style.transform = `translateX(${progress - 100}%)`;
            }, 100);
        }

        hideOnComplete() {
            window.addEventListener('load', () => {
                this.progressBar.style.transform = 'translateX(0%)';
                setTimeout(() => {
                    this.progressBar.classList.add('loading');
                    setTimeout(() => {
                        this.progressBar.remove();
                    }, 2000);
                }, 300);
            });
        }
    }

    // ===== INTERACTIVE FRAMEWORK VISUALIZATION =====
    class InteractiveFramework {
        constructor() {
            this.steps = document.querySelectorAll('.edge-step, .process-step-card');
            this.init();
        }

        init() {
            if (this.steps.length === 0) return;

            this.addStepInteractions();
            this.createConnections();
            this.addStepProgress();
        }

        addStepInteractions() {
            this.steps.forEach((step, index) => {
                step.style.cursor = 'pointer';
                
                step.addEventListener('click', () => {
                    this.expandStep(step, index);
                });

                step.addEventListener('mouseenter', () => {
                    this.highlightStep(step, index);
                });

                step.addEventListener('mouseleave', () => {
                    this.resetHighlight();
                });
            });
        }

        expandStep(step, index) {
            // Collapse all steps first
            this.steps.forEach(s => {
                s.classList.remove('expanded');
                const details = s.querySelector('.step-details');
                if (details) details.style.maxHeight = null;
            });

            // Expand clicked step
            step.classList.add('expanded');
            const details = step.querySelector('.step-details');
            if (details) {
                details.style.maxHeight = details.scrollHeight + 'px';
            }

            // Scroll to step if needed
            if (!this.isElementInViewport(step)) {
                step.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        highlightStep(step, index) {
            this.steps.forEach(s => s.classList.remove('highlighted'));
            step.classList.add('highlighted');
            
            // Highlight connections
            const connections = document.querySelectorAll('.framework-connection');
            connections.forEach(conn => conn.classList.remove('active'));
            if (connections[index - 1]) connections[index - 1].classList.add('active');
        }

        resetHighlight() {
            this.steps.forEach(s => s.classList.remove('highlighted'));
            document.querySelectorAll('.framework-connection').forEach(conn => {
                conn.classList.remove('active');
            });
        }

        createConnections() {
            const container = document.querySelector('.framework-cycle, .process-steps');
            if (!container) return;

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.className = 'framework-connections';
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.pointerEvents = 'none';
            svg.style.zIndex = '1';

            // Create connection lines
            const steps = Array.from(this.steps);
            for (let i = 0; i < steps.length - 1; i++) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.className = 'framework-connection';
                line.setAttribute('stroke', 'var(--light-gray)');
                line.setAttribute('stroke-width', '2');
                line.setAttribute('stroke-dasharray', '5,5');
                line.setAttribute('marker-end', 'url(#arrowhead)');
                svg.appendChild(line);
            }

            // Add arrowhead marker
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', 'arrowhead');
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '7');
            marker.setAttribute('refX', '9');
            marker.setAttribute('refY', '3.5');
            marker.setAttribute('orient', 'auto');
            
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
            polygon.setAttribute('fill', 'var(--light-gray)');
            
            marker.appendChild(polygon);
            defs.appendChild(marker);
            svg.appendChild(defs);

            container.style.position = 'relative';
            container.appendChild(svg);

            // Update connection positions
            this.updateConnectionPositions();
            window.addEventListener('resize', debounce(() => this.updateConnectionPositions(), 250));
        }

        updateConnectionPositions() {
            const steps = Array.from(this.steps);
            const connections = document.querySelectorAll('.framework-connection');
            
            steps.forEach((step, index) => {
                if (index < steps.length - 1) {
                    const rect1 = step.getBoundingClientRect();
                    const rect2 = steps[index + 1].getBoundingClientRect();
                    const containerRect = step.parentElement.getBoundingClientRect();
                    
                    const x1 = rect1.right - containerRect.left;
                    const y1 = rect1.top + rect1.height / 2 - containerRect.top;
                    const x2 = rect2.left - containerRect.left;
                    const y2 = rect2.top + rect2.height / 2 - containerRect.top;
                    
                    const connection = connections[index];
                    connection.setAttribute('x1', x1);
                    connection.setAttribute('y1', y1);
                    connection.setAttribute('x2', x2);
                    connection.setAttribute('y2', y2);
                }
            });
        }

        addStepProgress() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const step = entry.target;
                        step.classList.add('animated');
                        
                        // Animate progress bar if exists
                        const progressBar = step.querySelector('.step-progress');
                        if (progressBar) {
                            progressBar.style.width = '100%';
                        }
                    }
                });
            }, { threshold: 0.5 });

            this.steps.forEach(step => observer.observe(step));
        }

        isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
    }

    // ===== ROI CALCULATOR =====
    class ROICalculator {
        constructor() {
            this.init();
        }

        init() {
            const calculatorSection = document.querySelector('.case-results');
            if (!calculatorSection) return;

            const calculatorHTML = `
                <div class="roi-calculator">
                    <h3>Calculate Your Potential ROI</h3>
                    <div class="calculator-inputs">
                        <label>
                            Monthly Revenue: 
                            <div class="input-group">
                                <span class="currency">$</span>
                                <input type="number" id="revenue" value="10000" min="1000" step="1000">
                            </div>
                        </label>
                        <label>
                            Expected Growth (%):
                            <div class="range-container">
                                <input type="range" id="growth" min="10" max="100" value="30">
                                <span id="growthValue">30%</span>
                            </div>
                        </label>
                        <label>
                            Implementation Time (months):
                            <input type="number" id="time" value="3" min="1" max="12">
                        </label>
                    </div>
                    <div class="calculator-results">
                        <h4>Projected Results:</h4>
                        <div class="result-item">
                            <span>Additional Monthly Revenue:</span>
                            <strong id="additionalRevenue">$3,000</strong>
                        </div>
                        <div class="result-item">
                            <span>ROI Timeline:</span>
                            <strong id="roiTimeline">6 months</strong>
                        </div>
                        <div class="result-item">
                            <span>Total 1-Year Impact:</span>
                            <strong id="totalImpact">$36,000</strong>
                        </div>
                    </div>
                    <button class="btn btn-primary" id="calculateROI">Calculate ROI</button>
                </div>
            `;

            calculatorSection.insertAdjacentHTML('afterend', calculatorHTML);
            this.bindEvents();
            this.calculate(); // Initial calculation
        }

        bindEvents() {
            document.getElementById('calculateROI')?.addEventListener('click', () => this.calculate());
            document.getElementById('revenue')?.addEventListener('input', () => this.calculate());
            document.getElementById('growth')?.addEventListener('input', (e) => {
                document.getElementById('growthValue').textContent = e.target.value + '%';
                this.calculate();
            });
            document.getElementById('time')?.addEventListener('input', () => this.calculate());
        }

        calculate() {
            const revenue = parseFloat(document.getElementById('revenue')?.value) || 10000;
            const growth = parseFloat(document.getElementById('growth')?.value) || 30;
            const time = parseFloat(document.getElementById('time')?.value) || 3;

            // ROI calculation formula
            const additionalMonthly = revenue * (growth / 100);
            const implementationCost = additionalMonthly * time * 0.5; // Simplified cost estimation
            const roiMonths = Math.ceil(implementationCost / additionalMonthly);
            const yearlyImpact = additionalMonthly * 12;

            // Update display
            document.getElementById('additionalRevenue').textContent = `$${additionalMonthly.toLocaleString()}`;
            document.getElementById('roiTimeline').textContent = `${roiMonths} months`;
            document.getElementById('totalImpact').textContent = `$${yearlyImpact.toLocaleString()}`;

            // Animate numbers
            this.animateValue('additionalRevenue', additionalMonthly, 1000);
        }

        animateValue(elementId, finalValue, duration) {
            const element = document.getElementById(elementId);
            if (!element) return;

            const startValue = parseFloat(element.textContent.replace(/[^0-9.-]+/g, '')) || 0;
            const startTime = performance.now();
            const prefix = element.textContent.match(/^[^0-9]*/)[0];
            const suffix = element.textContent.match(/[^0-9]*$/)[0];

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentValue = startValue + (finalValue - startValue) * progress;
                
                element.textContent = `${prefix}$${Math.round(currentValue).toLocaleString()}${suffix}`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }
    }

    // ===== MAIN INITIALIZATION =====
    class ConsultingCrewApp {
        constructor() {
            this.performanceMonitor = null;
            this.accessibilityEnhancer = null;
            this.smartCTA = null;
            this.exitIntent = null;
            this.imageOptimizer = null;
            this.pageLoadProgress = null;
            this.interactiveFramework = null;
            this.roiCalculator = null;
            this.init();
        }

        init() {
            console.log('🚀 Initializing Consulting Crew Enhanced Website...');
            
            // Core functionality
            this.initializeCore();
            
            // Enhanced features
            this.initializeEnhancedFeatures();
            
            // Event listeners
            this.setupEventListeners();
            
            // Mark as loaded
            this.finalizeLoading();
        }

        initializeCore() {
            // Set current year in footer
            setCurrentYear();
            
            // Initialize loading screen
            this.initLoadingScreen();
            
            // Initialize mobile menu
            this.initMobileMenu();
            
            // Initialize scroll effects
            this.initOptimizedScrollEffects();
            
            // Initialize cookie consent
            this.initCookieConsent();
            
            // Initialize forms
            this.initForms();
            
            // Initialize theme toggle
            this.initThemeToggle();
            
            // Initialize chat widget
            this.initChatWidget();
            
            // Initialize service worker
            this.initServiceWorker();
        }

        initializeEnhancedFeatures() {
            // Performance monitoring
            this.performanceMonitor = new PerformanceMonitor();
            
            // Accessibility enhancements
            this.accessibilityEnhancer = new AccessibilityEnhancer();
            
            // Smart CTA optimization
            this.smartCTA = new SmartCTA();
            
            // Exit intent detection
            this.exitIntent = new ExitIntent();
            
            // Image optimization
            this.imageOptimizer = new ImageOptimizer();
            
            // Page load progress
            this.pageLoadProgress = new PageLoadProgress();
            
            // Interactive framework
            this.interactiveFramework = new InteractiveFramework();
            
            // ROI calculator
            this.roiCalculator = new ROICalculator();
            
            // Structured data for SEO
            this.addStructuredData();
            
            // PWA installation
            this.initPWA();
            
            // Analytics
            this.initAnalytics();
        }

        initLoadingScreen() {
            if (!DOM.loadingScreen) return;

            const minLoadTime = 1000;
            const startTime = Date.now();

            const hideLoading = () => {
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
            };

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

        initOptimizedScrollEffects() {
            const handleScroll = throttle(() => {
                // Header scroll effect
                if (window.pageYOffset > 50) {
                    DOM.header?.classList.add('scrolled');
                } else {
                    DOM.header?.classList.remove('scrolled');
                }
                
                // Back to top button
                if (DOM.backToTop) {
                    DOM.backToTop.classList.toggle('visible', window.pageYOffset > 300);
                }
                
                // Update TOC progress
                this.updateTOCProgress();
                
                // Trigger animations
                this.triggerScrollAnimations();
            }, 100);
            
            window.addEventListener('scroll', handleScroll, { passive: true });
            
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
                            this.closeMobileMenu();
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

        updateTOCProgress() {
            const progressBar = document.querySelector('.toc-progress');
            if (!progressBar) return;
            
            const totalHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (window.pageYOffset / totalHeight) * 100;
            progressBar.style.width = `${progress}%`;
            
            // Update active TOC link
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.table-of-contents a');
            
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }

        triggerScrollAnimations() {
            const elements = document.querySelectorAll(
                '.service-card, .process-step-card, .values-card, ' +
                '.team-member, .testimonial-card, .faq-item, .card, ' +
                '.article-card, .benefit, .edge-step, .contact-info-card'
            );
            
            elements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight - CONFIG.animationOffset;
                
                if (isVisible) {
                    element.classList.add('animate-visible');
                }
            });
        }

        initMobileMenu() {
            if (!DOM.mobileMenuToggle || !DOM.mainNav) return;
            
            DOM.mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
            
            // Close mobile menu when clicking on a link
            document.querySelectorAll('.main-nav a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        this.closeMobileMenu();
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
                    this.closeMobileMenu();
                }
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && DOM.mainNav.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });
        }

        toggleMobileMenu() {
            const isActive = DOM.mainNav.classList.contains('active');
            DOM.mainNav.classList.toggle('active');
            
            // Update icon
            const icon = DOM.mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.className = isActive ? 'fas fa-bars' : 'fas fa-times';
            }
            
            // Prevent body scroll when menu is open
            DOM.body.style.overflow = isActive ? '' : 'hidden';
            DOM.mobileMenuToggle.setAttribute('aria-expanded', !isActive);
        }

        closeMobileMenu() {
            DOM.mainNav.classList.remove('active');
            const icon = DOM.mobileMenuToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
            DOM.body.style.overflow = '';
            DOM.dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
            DOM.mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }

        initCookieConsent() {
            if (!DOM.cookieConsent) return;
            
            const consent = getCookie('cookieConsent');
            if (!consent) {
                setTimeout(() => {
                    DOM.cookieConsent.classList.add('active');
                }, 2000);
            }
            
            if (DOM.acceptCookies) {
                DOM.acceptCookies.addEventListener('click', () => {
                    setCookie('cookieConsent', 'accepted', CONFIG.cookieExpiry);
                    this.hideCookieConsent();
                    this.initAnalytics();
                });
            }
            
            if (DOM.rejectCookies) {
                DOM.rejectCookies.addEventListener('click', () => {
                    setCookie('cookieConsent', 'rejected', CONFIG.cookieExpiry);
                    this.hideCookieConsent();
                });
            }
            
            if (DOM.customizeCookies) {
                DOM.customizeCookies.addEventListener('click', () => this.showCookieSettings());
            }
        }

        hideCookieConsent() {
            DOM.cookieConsent.classList.remove('active');
            setTimeout(() => {
                DOM.cookieConsent.style.display = 'none';
            }, 300);
        }

        showCookieSettings() {
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
                            <input type="checkbox" name="analytics" checked>
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
            
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = settingsHTML;
            document.body.appendChild(modal);
            
            // Close handlers
            modal.querySelector('#saveCookieSettings').addEventListener('click', () => {
                const analytics = modal.querySelector('input[name="analytics"]').checked;
                const marketing = modal.querySelector('input[name="marketing"]').checked;
                
                setCookie('cookieConsent', 'custom', CONFIG.cookieExpiry);
                setCookie('cookieAnalytics', analytics.toString(), CONFIG.cookieExpiry);
                setCookie('cookieMarketing', marketing.toString(), CONFIG.cookieExpiry);
                
                modal.remove();
                this.hideCookieConsent();
                
                if (analytics) this.initAnalytics();
            });
            
            modal.querySelector('#cancelCookieSettings').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }

        initForms() {
            DOM.forms.forEach(form => {
                form.addEventListener('submit', (e) => this.handleFormSubmit(e));
                
                // Add real-time validation
                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    input.addEventListener('blur', (e) => this.validateField(e));
                    input.addEventListener('input', (e) => this.clearFieldError(e));
                });
                
                // Add CSRF token
                this.addCSRFToken(form);
                
                // Add honeypot field
                this.addHoneypotField(form);
            });
        }

        handleFormSubmit(e) {
            e.preventDefault();
            const form = e.target;
            
            // Validate honeypot
            if (this.checkHoneypot(form)) {
                console.log('Bot detected');
                return;
            }
            
            // Validate all fields
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!this.validateField({ target: field })) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                this.showFormError(form, 'Please fill in all required fields correctly.');
                return;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Show success message
                this.showFormSuccess(form, 'Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.');
                
                // Reset form
                form.reset();
                
                // Track form submission
                localStorage.setItem('formSubmitted', 'true');
                
                // Send to analytics
                this.trackFormSubmission(form);
            }, 1500);
        }

        validateField(e) {
            const field = e.target || e;
            const value = field.value.trim();
            let isValid = true;
            
            this.clearFieldError({ target: field });
            
            if (field.disabled || field.readOnly) return true;
            
            // Required field validation
            if (field.hasAttribute('required') && !value) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            }
            
            // Email validation
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    isValid = false;
                }
            }
            
            // Phone validation
            if (field.type === 'tel' && value) {
                const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
                const cleanPhone = value.replace(/[\s\-\+\(\)]/g, '');
                if (!phoneRegex.test(value) || cleanPhone.length < 10) {
                    this.showFieldError(field, 'Please enter a valid phone number (at least 10 digits)');
                    isValid = false;
                }
            }
            
            if (isValid) {
                field.classList.add('valid');
            }
            
            return isValid;
        }

        showFieldError(field, message) {
            field.classList.add('error');
            field.classList.remove('valid');
            
            let errorEl = field.parentNode.querySelector('.field-error');
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.className = 'field-error';
                field.parentNode.appendChild(errorEl);
            }
            
            errorEl.textContent = message;
            errorEl.setAttribute('role', 'alert');
        }

        clearFieldError(e) {
            const field = e.target;
            field.classList.remove('error');
            
            const errorEl = field.parentNode.querySelector('.field-error');
            if (errorEl) errorEl.remove();
        }

        showFormSuccess(form, message) {
            const existingMsg = form.querySelector('.form-message');
            if (existingMsg) existingMsg.remove();
            
            const successMsg = document.createElement('div');
            successMsg.className = 'form-message success';
            successMsg.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-check-circle"></i>
                    <span>${message}</span>
                </div>
            `;
            
            form.appendChild(successMsg);
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            setTimeout(() => successMsg.remove(), 8000);
        }

        showFormError(form, message) {
            const existingMsg = form.querySelector('.form-message');
            if (existingMsg) existingMsg.remove();
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'form-message error';
            errorMsg.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>${message}</span>
                </div>
            `;
            
            form.appendChild(errorMsg);
            errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            setTimeout(() => errorMsg.remove(), 8000);
        }

        addCSRFToken(form) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            csrfInput.value = generateCSRFToken();
            form.appendChild(csrfInput);
        }

        addHoneypotField(form) {
            const honeypot = document.createElement('input');
            honeypot.type = 'text';
            honeypot.name = 'website';
            honeypot.style.cssText = 'position: absolute; left: -9999px;';
            honeypot.tabIndex = -1;
            honeypot.autocomplete = 'off';
            form.appendChild(honeypot);
        }

        checkHoneypot(form) {
            const honeypot = form.querySelector('input[name="website"]');
            return honeypot && honeypot.value !== '';
        }

        trackFormSubmission(form) {
            const formData = new FormData(form);
            const data = {
                formId: form.id || form.className,
                fields: {},
                timestamp: Date.now()
            };
            
            formData.forEach((value, key) => {
                if (key !== 'website' && key !== 'csrf_token') {
                    data.fields[key] = value;
                }
            });
            
            // Send to analytics
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/form-submission', JSON.stringify(data));
            }
        }

        initThemeToggle() {
            if (!DOM.themeToggle) return;
            
            const savedTheme = localStorage.getItem('theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
                this.enableDarkMode();
            } else {
                this.disableDarkMode();
            }
            
            DOM.themeToggle.addEventListener('click', () => this.toggleTheme());
            
            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    e.matches ? this.enableDarkMode() : this.disableDarkMode();
                }
            });
        }

        toggleTheme() {
            if (DOM.body.classList.contains('dark-mode')) {
                this.disableDarkMode();
            } else {
                this.enableDarkMode();
            }
            
            DOM.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
            setTimeout(() => {
                DOM.body.style.transition = '';
            }, 300);
        }

        enableDarkMode() {
            DOM.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            
            const icon = DOM.themeToggle?.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-sun';
                DOM.themeToggle.setAttribute('aria-label', 'Switch to light mode');
            }
        }

        disableDarkMode() {
            DOM.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            
            const icon = DOM.themeToggle?.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-moon';
                DOM.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
            }
        }

        initChatWidget() {
            if (!DOM.chatToggle || !DOM.chatContainer) return;
            
            DOM.chatToggle.addEventListener('click', () => this.toggleChat());
            DOM.chatClose.addEventListener('click', () => this.closeChat());
            
            if (DOM.chatSend) {
                DOM.chatSend.addEventListener('click', () => this.sendChatMessage());
            }
            
            if (DOM.chatInput) {
                DOM.chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.sendChatMessage();
                });
            }
            
            // Close chat when clicking outside
            document.addEventListener('click', (e) => {
                if (DOM.chatContainer.classList.contains('active') &&
                    !DOM.chatContainer.contains(e.target) &&
                    !DOM.chatToggle.contains(e.target)) {
                    this.closeChat();
                }
            });
            
            // Initialize with welcome message
            setTimeout(() => {
                this.addChatMessage(CONFIG.chatMessages[0], 'bot');
            }, 3000);
        }

        toggleChat() {
            const isActive = DOM.chatContainer.classList.contains('active');
            isActive ? this.closeChat() : this.openChat();
        }

        openChat() {
            DOM.chatContainer.classList.add('active');
            DOM.chatToggle.setAttribute('aria-expanded', 'true');
            setTimeout(() => DOM.chatInput?.focus(), 100);
        }

        closeChat() {
            DOM.chatContainer.classList.remove('active');
            DOM.chatToggle.setAttribute('aria-expanded', 'false');
        }

        sendChatMessage() {
            if (!DOM.chatInput || !DOM.chatMessages) return;
            
            const message = DOM.chatInput.value.trim();
            if (!message) return;
            
            this.addChatMessage(message, 'user');
            DOM.chatInput.value = '';
            
            setTimeout(() => {
                const response = this.getChatResponse(message);
                this.addChatMessage(response, 'bot');
            }, 500);
        }

        addChatMessage(text, sender) {
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
        }

        getChatResponse(message) {
            const msg = message.toLowerCase();
            const responses = {
                greeting: ["Hello! How can I help you today?", "Hi there! What can I assist you with?"],
                services: ["We offer Data & BI, Branding & Growth, and HR Systems services. Which one interests you?"],
                pricing: ["Our pricing depends on your specific needs. Would you like a free consultation?"],
                contact: ["You can contact us at consultingcrew.pk@gmail.com or call +92 332 345 0433"],
                default: ["I'm still learning! Please contact us directly for detailed questions."]
            };
            
            if (msg.includes('hello') || msg.includes('hi')) {
                return this.getRandomResponse(responses.greeting);
            }
            
            if (msg.includes('service') || msg.includes('offer')) {
                return this.getRandomResponse(responses.services);
            }
            
            if (msg.includes('price') || msg.includes('cost')) {
                return this.getRandomResponse(responses.pricing);
            }
            
            if (msg.includes('contact') || msg.includes('email') || msg.includes('call')) {
                return this.getRandomResponse(responses.contact);
            }
            
            return this.getRandomResponse(responses.default);
        }

        getRandomResponse(array) {
            return array[Math.floor(Math.random() * array.length)];
        }

        initServiceWorker() {
            if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                        .then(registration => {
                            console.log('ServiceWorker registered:', registration.scope);
                        })
                        .catch(error => {
                            console.log('ServiceWorker registration failed:', error);
                        });
                });
            }
        }

        addStructuredData() {
            const structuredData = {
                "@context": "https://schema.org",
                "@type": "ProfessionalService",
                "name": "Consulting Crew",
                "description": "Strategic consulting advisory firm specializing in data intelligence, digital transformation, and organizational excellence.",
                "url": window.location.origin,
                "logo": `${window.location.origin}/images/CC_logo.png`,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Karachi",
                    "addressCountry": "PK"
                },
                "serviceType": [
                    "Business Intelligence",
                    "Digital Marketing",
                    "HR Consulting",
                    "Strategic Planning"
                ],
                "offers": {
                    "@type": "AggregateOffer",
                    "offerCount": "3"
                }
            };
            
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(structuredData);
            document.head.appendChild(script);
        }

        initPWA() {
            let deferredPrompt;
            
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                // Show install button after 5 seconds
                setTimeout(() => {
                    if (!localStorage.getItem('pwaDismissed')) {
                        this.showInstallButton();
                    }
                }, 5000);
            });
        }

        showInstallButton() {
            const installBtn = document.createElement('button');
            installBtn.className = 'pwa-install-btn';
            installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
            installBtn.onclick = () => this.showInstallPrompt();
            
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                headerActions.appendChild(installBtn);
                
                // Add dismiss button
                const dismissBtn = document.createElement('button');
                dismissBtn.className = 'pwa-dismiss-btn';
                dismissBtn.innerHTML = '&times;';
                dismissBtn.onclick = () => {
                    installBtn.remove();
                    dismissBtn.remove();
                    localStorage.setItem('pwaDismissed', 'true');
                };
                headerActions.appendChild(dismissBtn);
            }
        }

        showInstallPrompt() {
            if (window.deferredPrompt) {
                window.deferredPrompt.prompt();
                window.deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User installed the app');
                    }
                    window.deferredPrompt = null;
                });
            }
        }

        initAnalytics() {
            const consent = getCookie('cookieConsent');
            if (consent !== 'accepted' && consent !== 'custom') return;
            
            if (consent === 'custom') {
                const analytics = getCookie('cookieAnalytics');
                if (analytics !== 'true') return;
            }
            
            // Initialize your analytics here (Google Analytics, etc.)
            console.log('Analytics initialized');
            
            // Track page view
            this.trackPageView();
            
            // Track events
            this.trackEvents();
        }

        trackPageView() {
            const data = {
                url: window.location.href,
                referrer: document.referrer,
                timestamp: Date.now(),
                screen: {
                    width: window.screen.width,
                    height: window.screen.height
                },
                language: navigator.language
            };
            
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/pageview', JSON.stringify(data));
            }
        }

        trackEvents() {
            // Track clicks on important elements
            document.addEventListener('click', (e) => {
                const target = e.target;
                const isCTA = target.closest('.btn, .nav-link, .service-link');
                
                if (isCTA) {
                    const eventData = {
                        type: 'click',
                        element: isCTA.textContent.trim(),
                        href: isCTA.href || isCTA.getAttribute('href'),
                        timestamp: Date.now()
                    };
                    
                    if (navigator.sendBeacon) {
                        navigator.sendBeacon('/api/event', JSON.stringify(eventData));
                    }
                }
            });
            
            // Track form submissions
            document.addEventListener('submit', (e) => {
                const form = e.target;
                const eventData = {
                    type: 'form_submit',
                    formId: form.id || form.className,
                    timestamp: Date.now()
                };
                
                if (navigator.sendBeacon) {
                    navigator.sendBeacon('/api/event', JSON.stringify(eventData));
                }
            });
        }

        setupEventListeners() {
            // Handle dropdown hover on desktop
            const handleDropdownHover = () => {
                DOM.dropdowns.forEach(dropdown => {
                    if (window.innerWidth > 768) {
                        dropdown.addEventListener('mouseenter', () => {
                            dropdown.classList.add('active');
                        });
                        
                        dropdown.addEventListener('mouseleave', () => {
                            dropdown.classList.remove('active');
                        });
                    }
                });
            };
            
            handleDropdownHover();
            window.addEventListener('resize', debounce(handleDropdownHover, 250));
            
            // Handle page visibility change
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    const originalTitle = document.title;
                    document.title = '👋 Come back! | Consulting Crew';
                    
                    // Restore title when page becomes visible again
                    document.addEventListener('visibilitychange', function restoreTitle() {
                        if (!document.hidden) {
                            document.title = originalTitle;
                            document.removeEventListener('visibilitychange', restoreTitle);
                        }
                    }, { once: true });
                }
            });
            
            // Tab functionality
            const tabBtns = document.querySelectorAll('.tab-btn');
            if (tabBtns.length > 0) {
                tabBtns.forEach(btn => {
                    btn.addEventListener('click', function() {
                        const tabId = this.getAttribute('data-tab');
                        
                        tabBtns.forEach(b => b.classList.remove('active'));
                        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                        
                        this.classList.add('active');
                        const content = document.getElementById(tabId);
                        if (content) content.classList.add('active');
                    });
                });
            }
            
            // Filter functionality for blog
            const filterBtns = document.querySelectorAll('.filter-btn');
            if (filterBtns.length > 0) {
                filterBtns.forEach(btn => {
                    btn.addEventListener('click', function() {
                        const filter = this.getAttribute('data-filter');
                        
                        filterBtns.forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        
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
        }

        finalizeLoading() {
            setTimeout(() => {
                DOM.body.classList.add('loaded');
                console.log('✅ Consulting Crew Enhanced Website fully loaded and initialized');
                
                // Send performance data
                if (window.performance && performance.timing) {
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    console.log(`Page load time: ${loadTime}ms`);
                }
            }, CONFIG.loadingDelay);
        }
    }

    // ===== INITIALIZE APPLICATION =====
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.ConsultingCrewApp = new ConsultingCrewApp();
        });
    } else {
        window.ConsultingCrewApp = new ConsultingCrewApp();
    }

    // ===== PUBLIC API =====
    window.ConsultingCrew = {
        // Core Functions
        toggleTheme: () => window.ConsultingCrewApp?.toggleTheme(),
        setCookie,
        getCookie,
        
        // Chat Functions
        openChat: () => window.ConsultingCrewApp?.openChat(),
        closeChat: () => window.ConsultingCrewApp?.closeChat(),
        sendChatMessage: (message) => {
            if (window.ConsultingCrewApp) {
                window.ConsultingCrewApp.addChatMessage(message, 'user');
                setTimeout(() => {
                    const response = window.ConsultingCrewApp.getChatResponse(message);
                    window.ConsultingCrewApp.addChatMessage(response, 'bot');
                }, 500);
            }
        },
        
        // Accessibility
        adjustFontSize: (change) => window.ConsultingCrewApp?.accessibilityEnhancer?.adjustFontSize(change),
        resetFontSize: () => window.ConsultingCrewApp?.accessibilityEnhancer?.resetFontSize(),
        
        // ROI Calculator
        calculateROI: () => window.ConsultingCrewApp?.roiCalculator?.calculate(),
        
        // Framework
        expandStep: (stepIndex) => {
            const steps = document.querySelectorAll('.edge-step, .process-step-card');
            if (steps[stepIndex]) {
                window.ConsultingCrewApp?.interactiveFramework?.expandStep(steps[stepIndex], stepIndex);
            }
        }
    };
})();
