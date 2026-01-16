// Back to Top Button
class BackToTop {
    constructor() {
        this.button = document.getElementById('backToTop');
        this.scrollThreshold = 300;
        this.scrollPosition = 0;
        this.isVisible = false;
        
        this.init();
    }
    
    init() {
        if (!this.button) return;
        
        this.setupEventListeners();
        this.checkVisibility();
        
        // Smooth scroll to top
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollToTop();
        });
    }
    
    setupEventListeners() {
        // Scroll event with throttling
        let ticking = false;
        window.addEventListener('scroll', () => {
            this.scrollPosition = window.scrollY;
            
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.checkVisibility();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Keyboard shortcut (Shift + Space)
        document.addEventListener('keydown', (e) => {
            if (e.shiftKey && e.code === 'Space') {
                e.preventDefault();
                this.scrollToTop();
            }
        });
        
        // Focus management for accessibility
        this.button.addEventListener('focus', () => {
            this.button.classList.add('focused');
        });
        
        this.button.addEventListener('blur', () => {
            this.button.classList.remove('focused');
        });
    }
    
    checkVisibility() {
        const shouldBeVisible = this.scrollPosition > this.scrollThreshold;
        
        if (shouldBeVisible !== this.isVisible) {
            this.isVisible = shouldBeVisible;
            this.updateVisibility();
        }
        
        // Add/remove shadow based on scroll position
        if (this.scrollPosition > 50) {
            this.button.classList.add('scrolled');
        } else {
            this.button.classList.remove('scrolled');
        }
    }
    
    updateVisibility() {
        if (this.isVisible) {
            this.button.classList.add('active');
            this.button.setAttribute('aria-hidden', 'false');
            
            // Focus management for screen readers
            setTimeout(() => {
                if (document.activeElement === document.body) {
                    this.button.focus();
                }
            }, 100);
        } else {
            this.button.classList.remove('active');
            this.button.setAttribute('aria-hidden', 'true');
        }
    }
    
    scrollToTop() {
        // Get current scroll position
        const startPosition = window.scrollY;
        const startTime = performance.now();
        const duration = 600; // milliseconds
        
        // Easing function (easeInOutCubic)
        const easeInOutCubic = (t) => {
            return t < 0.5 
                ? 4 * t * t * t 
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };
        
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition * (1 - easeProgress));
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                // Scroll complete
                this.onScrollComplete();
            }
        };
        
        requestAnimationFrame(animateScroll);
        
        // Track analytics
        this.trackEvent('back_to_top_clicked');
    }
    
    onScrollComplete() {
        // Focus on main content for accessibility
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
            
            // Remove tabindex after focus
            setTimeout(() => {
                mainContent.removeAttribute('tabindex');
            }, 100);
        }
    }
    
    trackEvent(eventName) {
        // In production, send to analytics
        console.log('Back to Top event:', eventName);
        
        // Example: Google Analytics
        // if (window.gtag) {
        //     gtag('event', eventName, {
        //         event_category: 'engagement',
        //         event_label: 'back_to_top'
        //     });
        // }
    }
    
    // Public methods
    show() {
        this.isVisible = true;
        this.updateVisibility();
    }
    
    hide() {
        this.isVisible = false;
        this.updateVisibility();
    }
    
    setThreshold(threshold) {
        this.scrollThreshold = threshold;
        this.checkVisibility();
    }
}

// Initialize back to top button
let backToTop;

document.addEventListener('DOMContentLoaded', () => {
    backToTop = new BackToTop();
});

// Export for debugging
window.ConsultingCrewBackToTop = {
    getInstance: () => backToTop,
    show: () => backToTop?.show(),
    hide: () => backToTop?.hide(),
    setThreshold: (threshold) => backToTop?.setThreshold(threshold)
};