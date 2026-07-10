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
                setTimeout(() => {
                    wait = false;
                }, limit);
            }
        };
    },

    isMobileView() {
        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        const isSmallScreen = window.innerWidth <= CONFIG.breakpoint;
        return isTouch || isSmallScreen;
    },

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown.open').forEach((dropdown) => {
            dropdown.classList.remove('open');
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
};

/* ===============================
   FETCH WITH RETRY & CACHE
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
    throw new Error('Failed to fetch HTML after retries');
}

/* ===============================
   LOAD COMPONENT INTO CONTAINER
================================= */
async function loadComponent(containerId, path) {
    const container = document.getElementById(containerId);
    if (!container) return false;

    try {
        const html = await fetchHTML(path);
        container.innerHTML = html;
        return true;
    } catch (err) {
        console.warn(`[header-footer] Failed to load ${containerId}:`, err.message);
        container.innerHTML = getFallbackHTML(containerId);
        return false;
    }
}

/* ===============================
   FALLBACK HTML (Enhanced with dropdowns)
================================= */
function getFallbackHTML(id) {
    const year = new Date().getFullYear();

    if (id === 'header-container') {
        return `
            <header class="main-header">
                <div class="container">
                    <nav class="navbar" aria-label="Main navigation">
                        <a href="/" class="logo">
                            <span class="logo-text">Consulting Crew</span>
                            <span class="logo-tagline">Empowering Smarter Decisions</span>
                        </a>
                        <button class="mobile-menu-toggle" aria-label="Toggle menu" aria-expanded="false">
                            <span></span><span></span><span></span>
                        </button>
                        <div class="nav-menu">
                            <ul class="nav-list">
                                <li><a href="/" class="nav-link"><i class="fas fa-home"></i> Home</a></li>
                                <li class="dropdown">
                                    <button class="nav-link dropdown-toggle">
                                        <i class="fas fa-building"></i> About
                                        <i class="fas fa-chevron-down dropdown-icon"></i>
                                    </button>
                                    <div class="dropdown-menu">
                                        <div class="dropdown-column">
                                            <a href="/team.html"><i class="fas fa-user-tie"></i> Our Team</a>
                                            <a href="/process.html"><i class="fas fa-sitemap"></i> Our EDGE Process</a>
                                            <a href="/ethics.html"><i class="fas fa-balance-scale"></i> Business Ethics</a>
                                            <a href="/csr.html"><i class="fas fa-handshake"></i> Corporate Responsibility</a>
                                        </div>
                                    </div>
                                </li>
                                <li class="dropdown">
                                    <button class="nav-link dropdown-toggle">
                                        <i class="fas fa-cogs"></i> Services
                                        <i class="fas fa-chevron-down dropdown-icon"></i>
                                    </button>
                                    <div class="dropdown-menu">
                                        <div class="dropdown-columns">
                                            <div class="dropdown-column">
                                                <h4>Strategic Solutions</h4>
                                                <a href="/service-data-intelligence.html"><i class="fas fa-chart-line"></i> Data & Intelligence</a>
                                                <a href="/service-digital-transformation.html"><i class="fas fa-sync-alt"></i> Digital Marketing</a>
                                                <a href="/service-branding-identity.html"><i class="fas fa-palette"></i> Branding & Identity</a>
                                            </div>
                                            <div class="dropdown-column">
                                                <h4>Web & HR Solutions</h4>
                                                <a href="/service-web-services.html"><i class="fas fa-globe"></i> Web Services</a>
                                                <a href="/service-hr-consulting.html"><i class="fas fa-users"></i> HR Audits</a>
                                                <a href="/services.html" class="view-all"><i class="fas fa-th-large"></i> All Services</a>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li><a href="/portfolio.html" class="nav-link"><i class="fas fa-chart-pie"></i> Portfolio</a></li>
                                <li><a href="/insights.html" class="nav-link"><i class="fas fa-blog"></i> Insights</a></li>
                                <li><a href="/contact.html" class="nav-link cta-link"><i class="fas fa-paper-plane"></i> Contact</a></li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </header>
        `;
    }

    // Footer fallback
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
   MOBILE MENU TOGGLE (Event Delegation)
================================= */
function initMobileMenu() {
    document.addEventListener('click', function(e) {
        const toggle = e.target.closest('.mobile-menu-toggle');
        if (!toggle) return;

        const menu = document.querySelector('.nav-menu');
        if (!menu) return;

        const isOpen = menu.classList.toggle('active');
        toggle.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen);

        if (!isOpen) {
            Helpers.closeAllDropdowns();
        }
    });

    document.addEventListener('click', function(e) {
        const menu = document.querySelector('.nav-menu');
        const toggle = document.querySelector('.mobile-menu-toggle');
        if (!menu || !toggle) return;

        const isInside = e.target.closest('.main-header');
        if (!isInside && menu.classList.contains('active')) {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            document.body.classList.remove('menu-open');
            toggle.setAttribute('aria-expanded', 'false');
            Helpers.closeAllDropdowns();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        const menu = document.querySelector('.nav-menu');
        const toggle = document.querySelector('.mobile-menu-toggle');
        if (!menu || !toggle) return;

        if (menu.classList.contains('active')) {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            document.body.classList.remove('menu-open');
            toggle.setAttribute('aria-expanded', 'false');
            Helpers.closeAllDropdowns();
            toggle.focus();
        }
    });
}

/* ===============================
   DROPDOWNS (Mobile + Desktop Delegated)
================================= */
function initDropdowns() {
    document.addEventListener('click', function(e) {
        const toggle = e.target.closest('.dropdown-toggle');
        if (!toggle) return;

        const dropdown = toggle.closest('.dropdown');
        if (!dropdown) return;

        if (Helpers.isMobileView()) {
            e.preventDefault();
            const isOpen = dropdown.classList.toggle('open');
            toggle.setAttribute('aria-expanded', isOpen);
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const toggle = e.target.closest('.dropdown-toggle');
        if (!toggle) return;

        const dropdown = toggle.closest('.dropdown');
        if (!dropdown) return;

        if (Helpers.isMobileView()) {
            e.preventDefault();
            const isOpen = dropdown.classList.toggle('open');
            toggle.setAttribute('aria-expanded', isOpen);
        }
    });

    document.addEventListener('click', function(e) {
        if (!Helpers.isMobileView()) return;
        const dropdown = e.target.closest('.dropdown');
        if (dropdown) return;

        document.querySelectorAll('.dropdown.open').forEach(function(d) {
            d.classList.remove('open');
            const toggle = d.querySelector('.dropdown-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ===============================
   STICKY / SCROLL HEADER
================================= */
function initStickyHeader() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    const scrollHandler = Helpers.throttle(() => {
        const scrolled = window.scrollY > 50;
        header.classList.toggle('scrolled', scrolled);
        document.body.classList.toggle('header-scrolled', scrolled);
    });

    window.addEventListener('scroll', scrollHandler, { passive: true });
}

/* ===============================
   ACTIVE NAV LINK
================================= */
function markActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-link').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;

        const linkPage = href.split('/').pop();
        const isActive = linkPage === currentPage ||
                         (currentPage === '' && href === '/');

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
   INIT (Async)
================================= */
(async function init() {
    await Promise.all([
        loadComponent('header-container', COMPONENTS.header),
        loadComponent('footer-container', COMPONENTS.footer)
    ]);

    initMobileMenu();
    initDropdowns();
    initStickyHeader();
    markActiveLink();
    updateYear();
})();