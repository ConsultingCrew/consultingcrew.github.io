// ============================================
// CONFIGURATION
// ============================================

const COMPONENT_PATHS = {
    header: 'components/header.html',
    footer: 'components/footer.html'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
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
 * Show loading placeholders
 */
const showLoadingPlaceholders = () => {
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');
    
    if (headerContainer && !headerContainer.innerHTML.trim()) {
        headerContainer.innerHTML = `
            <div class="loading-placeholder" 
                 style="height: 80px; background: var(--light-gray);" 
                 role="status" 
                 aria-label="Loading header">
            </div>
        `;
    }
    
    if (footerContainer && !footerContainer.innerHTML.trim()) {
        footerContainer.innerHTML = `
            <div class="loading-placeholder" 
                 style="height: 400px; background: var(--light-gray); margin-top: 40px;" 
                 role="status" 
                 aria-label="Loading footer">
            </div>
        `;
    }
};

// ============================================
// COMPONENT LOADING
// ============================================

/**
 * Load a single component
 * @param {string} containerId - Container element ID
 * @param {string} filePath - Path to component HTML file
 * @returns {Promise<void>}
 */
const loadComponent = async (containerId, filePath) => {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.warn(`Container #${containerId} not found`);
        return;
    }
    
    try {
        const response = await fetch(filePath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        container.innerHTML = html;
        
        // Dispatch event for component loaded
        window.dispatchEvent(new CustomEvent('componentLoaded', { 
            detail: { containerId, filePath } 
        }));
        
        console.log(`Component loaded: ${containerId}`);
        
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        container.innerHTML = createFallbackComponent(containerId);
    }
};

/**
 * Create fallback component HTML
 * @param {string} containerId - Container ID
 * @returns {string} Fallback HTML
 */
const createFallbackComponent = (containerId) => {
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
                        <p>&copy; ${new Date().getFullYear()} Consulting Crew. All rights reserved.</p>
                        <nav aria-label="Footer navigation" class="footer-legal">
                            <a href="index.html">Home</a>
                            <a href="about.html">About</a>
                            <a href="services.html">Services</a>
                            <a href="contact.html">Contact</a>
                        </nav>
                    </div>
                </div>
            </footer>
        `;
    }
    
    return '<div class="component-error">Component failed to load</div>';
};

/**
 * Ensure Font Awesome is loaded
 */
const ensureFontAwesome = () => {
    if (!document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        link.integrity = 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
        link.crossOrigin = 'anonymous';
        link.referrerPolicy = 'no-referrer';
        document.head.appendChild(link);
        console.log('Font Awesome loaded');
    }
};

// ============================================
// HEADER FUNCTIONALITY
// ============================================

/**
 * Initialize mobile menu toggle
 */
const initMobileMenu = () => {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!menuToggle || !navMenu) return;
    
    // Remove any existing event listeners by cloning
    const newMenuToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
    const newNavMenu = document.querySelector('.nav-menu');
    
    newMenuToggle.addEventListener('click', () => {
        const isActive = newNavMenu.classList.contains('active');
        
        // Toggle classes
        newNavMenu.classList.toggle('active');
        newMenuToggle.classList.toggle('active');
        
        // Update ARIA attributes
        const isExpanded = newNavMenu.classList.contains('active');
        newMenuToggle.setAttribute('aria-expanded', isExpanded);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? 'hidden' : '';
    });
    
    // Close menu when clicking on nav links
    newNavMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (newNavMenu.classList.contains('active')) {
                newNavMenu.classList.remove('active');
                newMenuToggle.classList.remove('active');
                newMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && newNavMenu.classList.contains('active')) {
            newNavMenu.classList.remove('active');
            newMenuToggle.classList.remove('active');
            newMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu on resize if in desktop view
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 992 && newNavMenu.classList.contains('active')) {
            newNavMenu.classList.remove('active');
            newMenuToggle.classList.remove('active');
            newMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }, 250));
};

/**
 * Initialize dropdown menus
 */
const initDropdowns = () => {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (!toggle || !menu) return;
        
        // Handle hover for desktop
        if (window.innerWidth > 992) {
            dropdown.addEventListener('mouseenter', () => {
                dropdown.classList.add('open');
            });
            
            dropdown.addEventListener('mouseleave', () => {
                dropdown.classList.remove('open');
            });
        }
        
        // Handle click for mobile
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                e.stopPropagation();
                
                const isOpen = dropdown.classList.contains('open');
                
                // Close other dropdowns
                dropdowns.forEach(d => {
                    if (d !== dropdown) d.classList.remove('open');
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('open');
                
                // Update ARIA attributes
                const expanded = !isOpen;
                toggle.setAttribute('aria-expanded', expanded);
            }
        });
        
        // Handle keyboard navigation
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dropdown.classList.toggle('open');
                toggle.setAttribute('aria-expanded', dropdown.classList.contains('open'));
            } else if (e.key === 'Escape') {
                dropdown.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('open');
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            });
        }
    });
};

/**
 * Initialize sticky header with background change only (no hide/show)
 */
const initStickyHeader = () => {
    const header = document.querySelector('.main-header');
    
    if (!header) {
        console.warn('Header not found for sticky functionality');
        return;
    }
    
    // Ensure header is always visible
    header.classList.add('header-visible');
    header.classList.remove('header-hidden');
    
    // Add scrolled class based on scroll position (for background change only)
    const handleScroll = () => {
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
};

/**
 * Initialize active link highlighting
 */
const initActiveLinks = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
};

// ============================================
// MAIN INITIALIZATION
// ============================================

/**
 * Load all components
 */
const loadComponents = async () => {
    try {
        showLoadingPlaceholders();
        
        // Load components in parallel
        await Promise.all([
            loadComponent('header-container', COMPONENT_PATHS.header),
            loadComponent('footer-container', COMPONENT_PATHS.footer)
        ]);
        
        // Ensure Font Awesome is available
        ensureFontAwesome();
        
        // Initialize header functionality after components are loaded
        setTimeout(() => {
            initMobileMenu();
            initDropdowns();
            initStickyHeader(); // Replaced initScrollHide with initStickyHeader
            initActiveLinks();
        }, 100);
        
        // Dispatch event when all components are loaded
        window.dispatchEvent(new CustomEvent('componentsLoaded', {
            detail: { success: true }
        }));
        
        console.log('✓ All components loaded successfully');
        
    } catch (error) {
        console.error('✗ Error loading components:', error);
        
        window.dispatchEvent(new CustomEvent('componentsLoaded', {
            detail: { success: false, error: error.message }
        }));
    }
};

// ============================================
// INITIALIZATION
// ============================================

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}

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
        ensureFontAwesome,
        debounce
    };
}

// ============================================
// GLOBAL API (for browser)
// ============================================

window.ConsultingCrew = window.ConsultingCrew || {};
window.ConsultingCrew.HeaderFooter = {
    loadComponents,
    reload: loadComponents,
    version: '2.2.0'
};