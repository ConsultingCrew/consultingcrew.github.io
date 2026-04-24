// ============================================
// CONFIGURATION
// ============================================

const COMPONENT_PATHS = {
    header: 'components/header.html',
    footer: 'components/footer.html'
};

const CONFIG = {
    SCROLL_THRESHOLD: 50,
    SCROLL_DEBOUNCE_MS: 10,
    RESIZE_DEBOUNCE_MS: 250,
    MOBILE_BREAKPOINT: 992,
    HEADER_HEIGHT: 67,
    HEADER_HEIGHT_SCROLLED: 60
};

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

/**
 * Throttle function for scroll events
 */
const throttle = (func, limit) => {
    let inThrottle;
    let lastResult;
    return function(...args) {
        if (!inThrottle) {
            lastResult = func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
        return lastResult;
    };
};


const safeRemoveElement = (element) => {
    if (!element) return;
    
    // Clone and replace to remove all event listeners
    const newElement = element.cloneNode(true);
    if (element.parentNode) {
        element.parentNode.replaceChild(newElement, element);
    }
    return newElement;
};


const showLoadingPlaceholders = () => {
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');
    
    if (headerContainer && !headerContainer.innerHTML.trim()) {
        headerContainer.innerHTML = `
            <div class="loading-placeholder" 
                 style="height: 67px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loadingPulse 1.5s infinite;"
                 role="status" 
                 aria-label="Loading header">
                <span class="sr-only">Loading header...</span>
            </div>
        `;
    }
    
    if (footerContainer && !footerContainer.innerHTML.trim()) {
        footerContainer.innerHTML = `
            <div class="loading-placeholder" 
                 style="height: 400px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loadingPulse 1.5s infinite; margin-top: 40px;"
                 role="status" 
                 aria-label="Loading footer">
                <span class="sr-only">Loading footer...</span>
            </div>
        `;
    }
};

// ============================================
// COMPONENT LOADING
// ============================================

const loadComponent = async (containerId, filePath, retries = 3) => {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.warn(`Container #${containerId} not found`);
        return false;
    }
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(filePath, {
                cache: 'default',
                headers: {
                    'Cache-Control': 'max-age=3600'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            container.innerHTML = html;
            
            // Dispatch event for component loaded
            window.dispatchEvent(new CustomEvent('componentLoaded', { 
                detail: { containerId, filePath, success: true }
            }));
            
            console.log(`✓ Component loaded: ${containerId}`);
            return true;
            
        } catch (error) {
            console.error(`Attempt ${attempt}/${retries} - Error loading ${filePath}:`, error);
            
            if (attempt === retries) {
                container.innerHTML = createFallbackComponent(containerId);
                window.dispatchEvent(new CustomEvent('componentLoaded', { 
                    detail: { containerId, filePath, success: false, error: error.message }
                }));
                return false;
            }
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
    
    return false;
};


const createFallbackComponent = (containerId) => {
    const currentYear = new Date().getFullYear();
    
    if (containerId === 'header-container') {
        return `
            <header class="main-header fallback-header" role="banner">
                <div class="container">
                    <nav class="navbar" role="navigation" aria-label="Main navigation">
                        <a href="index.html" class="logo" aria-label="Consulting Crew Home">
                            <div class="logo-content">
                                <span class="logo-text">Consulting Crew</span>
                                <span class="logo-tagline">Empowering Smarter Decisions</span>
                            </div>
                        </a>
                        <div class="nav-menu">
                            <ul class="nav-list">
                                <li><a href="index.html" class="nav-link active">Home</a></li>
                                <li><a href="about.html" class="nav-link">About</a></li>
                                <li><a href="services.html" class="nav-link">Services</a></li>
                                <li><a href="portfolio.html" class="nav-link">Portfolio</a></li>
                                <li><a href="insights.html" class="nav-link">Insights</a></li>
                                <li><a href="contact.html" class="nav-link btn-primary">Contact</a></li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </header>
        `;
    }
    
    if (containerId === 'footer-container') {
        return `
            <footer class="main-footer fallback-footer" role="contentinfo">
                <div class="container">
                    <div class="text-center">
                        <p>&copy; ${currentYear} Consulting Crew. All rights reserved.</p>
                        <nav aria-label="Footer navigation" class="footer-legal">
                            <a href="legal_privacy.html">Privacy Policy</a>
                            <a href="legal_terms.html">Terms of Service</a>
                            <a href="legal_cookies.html">Cookie Policy</a>
                        </nav>
                    </div>
                </div>
            </footer>
        `;
    }
    
    return '<div class="component-error">Component failed to load</div>';
};


const ensureFontAwesome = () => {
    if (document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"]')) {
        return; // Already loaded
    }
    
    // Check if already added to avoid duplicates
    if (window.__fontAwesomeLoaded) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    link.integrity = 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
    link.crossOrigin = 'anonymous';
    link.referrerPolicy = 'no-referrer';
    document.head.appendChild(link);
    window.__fontAwesomeLoaded = true;
    console.log('✓ Font Awesome loaded');
};

// ============================================
// HEADER FUNCTIONALITY
// ============================================

let mobileMenuCleanup = null;

const initMobileMenu = () => {
    // Clean up existing instance
    if (mobileMenuCleanup) {
        mobileMenuCleanup();
        mobileMenuCleanup = null;
    }
    
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!menuToggle || !navMenu) return;
    
    // Clean up old event listeners by cloning
    const newMenuToggle = safeRemoveElement(menuToggle);
    const newNavMenu = document.querySelector('.nav-menu');
    
    if (!newMenuToggle || !newNavMenu) return;
    
    // Track state
    let isMenuOpen = false;
    
    // Toggle function
    const toggleMenu = (shouldOpen = !isMenuOpen) => {
        isMenuOpen = shouldOpen;
        
        if (isMenuOpen) {
            newNavMenu.classList.add('active');
            newMenuToggle.classList.add('active');
            newMenuToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        } else {
            newNavMenu.classList.remove('active');
            newMenuToggle.classList.remove('active');
            newMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    };
    
    // Click handler
    const handleToggleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    };
    
    // Close menu when clicking on nav links
    const handleNavLinkClick = () => {
        if (isMenuOpen) {
            toggleMenu(false);
        }
    };
    
    // Close menu on escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu(false);
            newMenuToggle.focus();
        }
    };
    
    // Handle resize (close menu on desktop)
    const handleResize = debounce(() => {
        if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT && isMenuOpen) {
            toggleMenu(false);
        }
    }, CONFIG.RESIZE_DEBOUNCE_MS);
    
    // Add event listeners
    newMenuToggle.addEventListener('click', handleToggleClick);
    newNavMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavLinkClick);
    });
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    
    // Store cleanup function
    mobileMenuCleanup = () => {
        newMenuToggle.removeEventListener('click', handleToggleClick);
        newNavMenu.querySelectorAll('.nav-link').forEach(link => {
            link.removeEventListener('click', handleNavLinkClick);
        });
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('resize', handleResize);
        document.body.style.overflow = '';
    };
};


let dropdownCleanup = null;

const initDropdowns = () => {
    // Clean up existing instance
    if (dropdownCleanup) {
        dropdownCleanup();
        dropdownCleanup = null;
    }
    
    const dropdowns = document.querySelectorAll('.dropdown');
    if (!dropdowns.length) return;
    
    const cleanupFunctions = [];
    const isMobile = () => window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (!toggle || !menu) return;
        
        let isOpen = false;
        let hoverTimeout = null;
        
        const openDropdown = () => {
            if (isOpen) return;
            isOpen = true;
            dropdown.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
        };
        
        const closeDropdown = () => {
            if (!isOpen) return;
            isOpen = false;
            dropdown.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        };
        
        // Desktop hover handlers
        const handleMouseEnter = () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            if (!isMobile()) {
                openDropdown();
            }
        };
        
        const handleMouseLeave = () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            if (!isMobile()) {
                hoverTimeout = setTimeout(closeDropdown, 150);
            }
        };
        
        // Mobile click handler
        const handleToggleClick = (e) => {
            if (isMobile()) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(d => {
                    if (d !== dropdown && d.classList.contains('open')) {
                        const otherToggle = d.querySelector('.dropdown-toggle');
                        d.classList.remove('open');
                        if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
                    }
                });
                
                if (isOpen) {
                    closeDropdown();
                } else {
                    openDropdown();
                }
            }
        };
        
        // Keyboard navigation
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (isOpen) {
                    closeDropdown();
                } else {
                    openDropdown();
                }
            } else if (e.key === 'Escape' && isOpen) {
                closeDropdown();
                toggle.focus();
            }
        };
        
        // Add event listeners
        dropdown.addEventListener('mouseenter', handleMouseEnter);
        dropdown.addEventListener('mouseleave', handleMouseLeave);
        toggle.addEventListener('click', handleToggleClick);
        toggle.addEventListener('keydown', handleKeyDown);
        
        // Store cleanup
        cleanupFunctions.push(() => {
            dropdown.removeEventListener('mouseenter', handleMouseEnter);
            dropdown.removeEventListener('mouseleave', handleMouseLeave);
            toggle.removeEventListener('click', handleToggleClick);
            toggle.removeEventListener('keydown', handleKeyDown);
            if (hoverTimeout) clearTimeout(hoverTimeout);
        });
    });
    
    // Close dropdowns when clicking outside
    const handleOutsideClick = (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('open');
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            });
        }
    };
    
    document.addEventListener('click', handleOutsideClick);
    cleanupFunctions.push(() => {
        document.removeEventListener('click', handleOutsideClick);
    });
    
    // Handle resize (reinitialize for new screen size)
    const handleResize = debounce(() => {
        if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT) {
            // Close all dropdowns on desktop
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('open');
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            });
        }
    }, CONFIG.RESIZE_DEBOUNCE_MS);
    
    window.addEventListener('resize', handleResize);
    cleanupFunctions.push(() => {
        window.removeEventListener('resize', handleResize);
    });
    
    // Store master cleanup
    dropdownCleanup = () => {
        cleanupFunctions.forEach(cleanup => cleanup());
    };
};


let scrollCleanup = null;

const initStickyHeader = () => {
    // Clean up existing instance
    if (scrollCleanup) {
        scrollCleanup();
        scrollCleanup = null;
    }
    
    const header = document.querySelector('.main-header');
    if (!header) {
        console.warn('Header not found for sticky functionality');
        return;
    }
    
    // Ensure header is always visible
    header.classList.add('header-visible');
    header.classList.remove('header-hidden');
    
    let ticking = false;
    let lastScrollY = 0;
    let isVisible = true;
    
    // Handle scroll for background change and hide/show
    const handleScroll = () => {
        const currentScrollY = window.pageYOffset;
        
        // Update scrolled class for background (always active)
        if (currentScrollY > CONFIG.SCROLL_THRESHOLD) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide/show header on scroll (only below threshold)
        if (currentScrollY > 200) {
            const scrollingDown = currentScrollY > lastScrollY;
            
            if (scrollingDown && isVisible) {
                // Scrolling down - hide header
                header.style.transform = 'translateY(-100%)';
                isVisible = false;
                header.classList.add('header-hidden');
                header.classList.remove('header-visible');
            } else if (!scrollingDown && !isVisible) {
                // Scrolling up - show header
                header.style.transform = 'translateY(0)';
                isVisible = true;
                header.classList.remove('header-hidden');
                header.classList.add('header-visible');
            }
        } else if (!isVisible) {
            // Near top - ensure header is visible
            header.style.transform = 'translateY(0)';
            isVisible = true;
            header.classList.remove('header-hidden');
            header.classList.add('header-visible');
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    };
    
    const throttledScroll = throttle(() => {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, 16); // ~60fps
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    // Update body padding when header height changes
    const updateBodyPadding = () => {
        const headerHeight = header.offsetHeight;
        document.body.style.paddingTop = `${headerHeight}px`;
    };
    
    const resizeObserver = new ResizeObserver(debounce(updateBodyPadding, 100));
    resizeObserver.observe(header);
    
    // Store cleanup
    scrollCleanup = () => {
        window.removeEventListener('scroll', throttledScroll);
        resizeObserver.disconnect();
        header.style.transform = '';
        document.body.style.paddingTop = '';
    };
};


const initActiveLinks = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
};

/**
 * Set current year in footer
 */
const initCurrentYear = () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement && !yearElement.textContent) {
        yearElement.textContent = new Date().getFullYear();
    }
};

// ============================================
// MAIN INITIALIZATION
// ============================================

let isInitialized = false;
let componentsLoaded = false;

const loadComponents = async () => {
    try {
        showLoadingPlaceholders();
        
        // Load components in parallel with error handling
        const [headerLoaded, footerLoaded] = await Promise.all([
            loadComponent('header-container', COMPONENT_PATHS.header),
            loadComponent('footer-container', COMPONENT_PATHS.footer)
        ]);
        
        componentsLoaded = headerLoaded && footerLoaded;
        
        // Ensure Font Awesome is available
        ensureFontAwesome();
        
        // Initialize header functionality after components are loaded
        if (componentsLoaded) {
            setTimeout(() => {
                // Clean up existing before reinitializing
                if (isInitialized) {
                    if (mobileMenuCleanup) mobileMenuCleanup();
                    if (dropdownCleanup) dropdownCleanup();
                    if (scrollCleanup) scrollCleanup();
                }
                
                initMobileMenu();
                initDropdowns();
                initStickyHeader();
                initActiveLinks();
                initCurrentYear();
                
                isInitialized = true;
            }, 100);
        }
        
        // Dispatch event when all components are loaded
        window.dispatchEvent(new CustomEvent('componentsLoaded', {
            detail: { success: componentsLoaded, headerLoaded, footerLoaded }
        }));
        
        console.log(`✓ Components loaded: Header=${headerLoaded}, Footer=${footerLoaded}`);
        
    } catch (error) {
        console.error('✗ Error loading components:', error);
        
        window.dispatchEvent(new CustomEvent('componentsLoaded', {
            detail: { success: false, error: error.message }
        }));
    }
};

// ============================================
// CLEANUP ON PAGE UNLOAD
// ============================================

/**
 * Clean up all event listeners and observers
 */
const cleanupAll = () => {
    if (mobileMenuCleanup) mobileMenuCleanup();
    if (dropdownCleanup) dropdownCleanup();
    if (scrollCleanup) scrollCleanup();
    isInitialized = false;
};

// Listen for page unload to clean up
window.addEventListener('beforeunload', cleanupAll);

// Also clean up on page hide (for bfcache)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cleanupAll();
    }
});

// ============================================
// INITIALIZATION
// ============================================

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}

// Re-initialize on dynamic navigation (for SPA-like behavior)
window.addEventListener('popstate', () => {
    setTimeout(() => {
        if (componentsLoaded) {
            initActiveLinks();
            initCurrentYear();
        }
    }, 100);
});

// ============================================
// EXPORTS (for module environments)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadComponents,
        loadComponent,
        createFallbackComponent,
        initMobileMenu,
        initDropdowns,
        initStickyHeader,
        initActiveLinks,
        initCurrentYear,
        ensureFontAwesome,
        debounce,
        throttle,
        cleanupAll,
        CONFIG
    };
}

// ============================================
// GLOBAL API (for browser)
// ============================================

window.ConsultingCrew = window.ConsultingCrew || {};
window.ConsultingCrew.HeaderFooter = {
    loadComponents,
    reload: loadComponents,
    cleanup: cleanupAll,
    version: '3.0.0',
    isInitialized: () => isInitialized,
    getConfig: () => ({ ...CONFIG })
};

// Add loading animation styles if not present
if (!document.getElementById('header-footer-styles')) {
    const style = document.createElement('style');
    style.id = 'header-footer-styles';
    style.textContent = `
        @keyframes loadingPulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
        }
        
        .main-header {
            transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease, height 0.3s ease;
        }
        
        .main-header.header-hidden {
            transform: translateY(-100%);
        }
        
        .main-header.header-visible {
            transform: translateY(0);
        }
        
        .component-error {
            padding: 2rem;
            text-align: center;
            background: #f8f9fa;
            border-radius: 8px;
            color: #666;
            margin: 1rem 0;
            border: 2px dashed #ff5500;
        }
    `;
    document.head.appendChild(style);
}
