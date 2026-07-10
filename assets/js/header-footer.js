'use strict';

/* ===============================
   CONFIGURATION
================================= */
const COMPONENTS = {
    header: 'components/header.html',
    footer: 'components/footer.html'
};

const CONFIG = {
    breakpoint: 992,
    retries: 3
};

/* ===============================
   HELPERS
================================= */
const Helpers = {
    throttle(fn, limit = 16) {
        let wait = false;
        return (...args) => {
            if (!wait) {
                fn(...args);
                wait = true;
                setTimeout(() => { wait = false; }, limit);
            }
        };
    },

    isMobileView() {
        return window.innerWidth <= CONFIG.breakpoint;
    },

    closeAllDropdowns(exception = null) {
        document.querySelectorAll('.dropdown.open').forEach((dropdown) => {
            if (dropdown === exception) return;
            dropdown.classList.remove('open');
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
            const link = dropdown.querySelector('.nav-link');
            if (link) link.setAttribute('aria-expanded', 'false');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) menu.style.maxHeight = '';
        });
    },

    openDropdown(dropdown) {
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.style.maxHeight = menu.scrollHeight + 50 + 'px';
        }
        dropdown.classList.add('open');
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
        const link = dropdown.querySelector('.nav-link');
        if (link) link.setAttribute('aria-expanded', 'true');
    },

    closeDropdown(dropdown) {
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) menu.style.maxHeight = '0';
        dropdown.classList.remove('open');
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        const link = dropdown.querySelector('.nav-link');
        if (link) link.setAttribute('aria-expanded', 'false');
    },

    toggleDropdown(dropdown) {
        if (dropdown.classList.contains('open')) {
            Helpers.closeDropdown(dropdown);
        } else {
            Helpers.closeAllDropdowns(dropdown);
            Helpers.openDropdown(dropdown);
        }
    }
};

/* ===============================
   FETCH & LOAD
================================= */
async function fetchHTML(path, retries = CONFIG.retries) {
    for (let i = 1; i <= retries; i++) {
        try {
            const response = await fetch(path, { cache: 'force-cache' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (err) {
            if (i === retries) throw err;
            await new Promise((r) => setTimeout(r, 1000 * i));
        }
    }
}

async function loadComponent(containerId, path) {
    const container = document.getElementById(containerId);
    if (!container) return false;
    try {
        const html = await fetchHTML(path);
        container.innerHTML = html;
        return true;
    } catch (err) {
        console.warn(`[header-footer] Fallback used for ${containerId}`);
        container.innerHTML = getFallbackHTML(containerId);
        return false;
    }
}

/* ===============================
   COMPLETE FALLBACK HTML
================================= */
function getFallbackHTML(id) {
    const year = new Date().getFullYear();

    if (id === 'header-container') {
        return `
            <header class="main-header">
                <div class="container">
                    <nav class="navbar" aria-label="Primary Navigation">
                        <a href="/" class="logo" aria-label="Consulting Crew Home">
                            <span class="logo-text">Consulting Crew</span>
                            <span class="logo-tagline">Empowering Smarter Decisions</span>
                        </a>
                        <button class="mobile-menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="primary-navigation">
                            <span></span><span></span><span></span>
                        </button>
                        <div class="nav-menu" id="primary-navigation">
                            <ul class="nav-list">
                                <li><a href="/" class="nav-link"><i class="fas fa-home" aria-hidden="true"></i> Home</a></li>
                                <li class="dropdown" data-dropdown="about">
                                    <div class="nav-link-wrapper">
                                        <a href="/about.html" class="nav-link" aria-haspopup="true" aria-expanded="false"><i class="fas fa-building" aria-hidden="true"></i> About</a>
                                        <button class="dropdown-toggle" type="button" aria-label="Expand About menu" aria-expanded="false" aria-controls="about-menu"><i class="fas fa-chevron-down dropdown-icon" aria-hidden="true"></i></button>
                                    </div>
                                    <div class="dropdown-menu" id="about-menu">
                                        <div class="dropdown-column">
                                            <a href="/team.html"><i class="fas fa-user-tie" aria-hidden="true"></i> Our Team</a>
                                            <a href="/process.html"><i class="fas fa-sitemap" aria-hidden="true"></i> Our EDGE Process</a>
                                            <a href="/ethics.html"><i class="fas fa-balance-scale" aria-hidden="true"></i> Business Ethics</a>
                                            <a href="/csr.html"><i class="fas fa-handshake" aria-hidden="true"></i> Corporate Responsibility</a>
                                        </div>
                                    </div>
                                </li>
                                <li class="dropdown" data-dropdown="services">
                                    <div class="nav-link-wrapper">
                                        <a href="/services.html" class="nav-link" aria-haspopup="true" aria-expanded="false"><i class="fas fa-cogs" aria-hidden="true"></i> Services</a>
                                        <button class="dropdown-toggle" type="button" aria-label="Expand Services menu" aria-expanded="false" aria-controls="services-menu"><i class="fas fa-chevron-down dropdown-icon" aria-hidden="true"></i></button>
                                    </div>
                                    <div class="dropdown-menu" id="services-menu">
                                        <div class="dropdown-columns">
                                            <div class="dropdown-column">
                                                <h4>Strategic Solutions</h4>
                                                <a href="/service-data-intelligence.html"><i class="fas fa-chart-line" aria-hidden="true"></i> Data &amp; Intelligence</a>
                                                <a href="/service-digital-transformation.html"><i class="fas fa-sync-alt" aria-hidden="true"></i> Digital Marketing</a>
                                                <a href="/service-branding-identity.html"><i class="fas fa-palette" aria-hidden="true"></i> Branding &amp; Identity</a>
                                            </div>
                                            <div class="dropdown-column">
                                                <h4>Web &amp; HR Solutions</h4>
                                                <a href="/service-web-services.html"><i class="fas fa-globe" aria-hidden="true"></i> Web Services</a>
                                                <a href="/service-hr-consulting.html"><i class="fas fa-users" aria-hidden="true"></i> HR Audits</a>
                                                <a href="/services.html" class="view-all"><i class="fas fa-th-large" aria-hidden="true"></i> All Services</a>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li><a href="/portfolio.html" class="nav-link"><i class="fas fa-chart-pie" aria-hidden="true"></i> Portfolio</a></li>
                                <li><a href="/insights.html" class="nav-link"><i class="fas fa-blog" aria-hidden="true"></i> Insights</a></li>
                                <li><a href="/contact.html" class="nav-link cta-link"><i class="fas fa-paper-plane" aria-hidden="true"></i> Contact</a></li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </header>
        `;
    }

    return `
        <footer class="main-footer">
            <div class="container">
                <div class="footer-col">
                    <p class="footer-logo">Consulting Crew</p>
                    <p class="footer-description">&copy; ${year} Consulting Crew. All rights reserved.</p>
                </div>
            </div>
        </footer>
    `;
}

/* ===============================
   ✅ UNIFIED EVENT HANDLERS
================================= */
function setupEventListeners() {
    // ----- 1. Unified Click Handler -----
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Mobile Menu Toggle
        const toggleBtn = target.closest('.mobile-menu-toggle');
        if (toggleBtn) {
            const menu = document.querySelector('.nav-menu');
            const isOpen = menu.classList.toggle('active');
            toggleBtn.classList.toggle('active', isOpen);
            document.body.classList.toggle('menu-open', isOpen);
            toggleBtn.setAttribute('aria-expanded', isOpen);
            if (!isOpen) Helpers.closeAllDropdowns();
            return;
        }

        // Ignore clicks on submenu links (they navigate normally)
        if (target.closest('.dropdown-menu a')) return;

        // Find the nav-link-wrapper
        const wrapper = target.closest('.nav-link-wrapper');
        if (!wrapper) return;

        // Only intercept on mobile
        if (!Helpers.isMobileView()) return;

        const dropdown = wrapper.closest('.dropdown');
        if (!dropdown) return;

        const link = wrapper.querySelector('.nav-link');
        const toggle = wrapper.querySelector('.dropdown-toggle');

        // If clicking the chevron button: toggle ONLY
        if (target.closest('.dropdown-toggle')) {
            e.preventDefault();
            e.stopPropagation();
            Helpers.toggleDropdown(dropdown);
            return;
        }

        // If clicking the link text or wrapper
        // First tap: dropdown is closed → expand it
        if (!dropdown.classList.contains('open')) {
            e.preventDefault();
            Helpers.closeAllDropdowns(dropdown);
            Helpers.openDropdown(dropdown);
            return;
        }

        // Second tap: dropdown is open → navigate (do nothing, link works)
    });

    // ----- 2. Close menu when clicking outside -----
    document.addEventListener('click', (e) => {
        if (e.target.closest('.main-header')) return;
        if (e.target.closest('.dropdown-menu a')) return;

        const menu = document.querySelector('.nav-menu.active');
        if (menu) {
            menu.classList.remove('active');
            const toggle = document.querySelector('.mobile-menu-toggle');
            if (toggle) {
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
            document.body.classList.remove('menu-open');
            Helpers.closeAllDropdowns();
        }
    });

    // ----- 3. Escape key -----
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const menu = document.querySelector('.nav-menu.active');
            if (menu) {
                menu.classList.remove('active');
                const toggle = document.querySelector('.mobile-menu-toggle');
                if (toggle) {
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                }
                document.body.classList.remove('menu-open');
                Helpers.closeAllDropdowns();
                toggle?.focus();
            }
        }
    });

    // ----- 4. Resize handler -----
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', Helpers.throttle(() => {
        const currentWidth = window.innerWidth;
        const crossedBreakpoint = (lastWidth > CONFIG.breakpoint && currentWidth <= CONFIG.breakpoint) ||
                                  (lastWidth <= CONFIG.breakpoint && currentWidth > CONFIG.breakpoint);
        if (crossedBreakpoint) {
            Helpers.closeAllDropdowns();
            const menu = document.querySelector('.nav-menu.active');
            if (menu) {
                menu.classList.remove('active');
                const toggle = document.querySelector('.mobile-menu-toggle');
                if (toggle) {
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                }
                document.body.classList.remove('menu-open');
            }
        }
        lastWidth = currentWidth;
    }, 200));
}

/* ===============================
   STICKY HEADER
================================= */
function initStickyHeader() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    const handler = Helpers.throttle(() => {
        const isScrolled = window.scrollY > 50;
        header.classList.toggle('scrolled', isScrolled);
    });

    window.addEventListener('scroll', handler, { passive: true });
}

/* ===============================
   ACTIVE NAV LINK
================================= */
function initActiveLink() {
    const currentPath = window.location.pathname;

    document.querySelectorAll('.nav-link').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;

        const isActive = currentPath === href ||
                         (currentPath === '/' && (href === 'index.html' || href === '/')) ||
                         (currentPath.endsWith(href.replace(/^\.\.\//, '')));

        if (isActive) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

/* ===============================
   UPDATE FOOTER YEAR
================================= */
function updateYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

/* ===============================
   ✅ INITIALIZE
================================= */
(async function init() {
    await Promise.all([
        loadComponent('header-container', COMPONENTS.header),
        loadComponent('footer-container', COMPONENTS.footer)
    ]);

    setupEventListeners();
    initStickyHeader();
    initActiveLink();
    updateYear();

    console.log('[header-footer] Initialized successfully.');
})();