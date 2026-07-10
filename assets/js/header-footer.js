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

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown.open').forEach((dropdown) => {
            dropdown.classList.remove('open');
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
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
   COMPLETE FALLBACK HTML (With New Structure)
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
                                    <div class="nav-link-wrapper">
                                        <a href="/about.html" class="nav-link"><i class="fas fa-building"></i> About</a>
                                        <button class="dropdown-toggle" aria-label="Toggle submenu" aria-expanded="false">
                                            <i class="fas fa-chevron-down dropdown-icon"></i>
                                        </button>
                                    </div>
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
                                    <div class="nav-link-wrapper">
                                        <a href="/services.html" class="nav-link"><i class="fas fa-cogs"></i> Services</a>
                                        <button class="dropdown-toggle" aria-label="Toggle submenu" aria-expanded="false">
                                            <i class="fas fa-chevron-down dropdown-icon"></i>
                                        </button>
                                    </div>
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
   ✅ CORE EVENT HANDLERS
================================= */
function setupEventListeners() {
    document.addEventListener('click', (e) => {
        const target = e.target;

        // 1️⃣ Mobile Menu Toggle
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

        // 2️⃣ Dropdown Toggle (Chevron Button) ✅ NEW LOGIC
        const dropToggle = target.closest('.dropdown-toggle');
        if (dropToggle) {
            // Always prevent default on the toggle button
            e.preventDefault();
            e.stopPropagation();

            const dropdown = dropToggle.closest('.dropdown');
            if (!dropdown) return;

            // Close other open dropdowns
            document.querySelectorAll('.dropdown.open').forEach((el) => {
                if (el !== dropdown) {
                    el.classList.remove('open');
                    const toggle = el.querySelector('.dropdown-toggle');
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current
            const isOpen = dropdown.classList.toggle('open');
            dropToggle.setAttribute('aria-expanded', isOpen);

            // ✅ Debug log
            console.log('[Dropdown] Toggled:', isOpen ? 'open' : 'closed');
            return;
        }

        // 3️⃣ Close menu & dropdowns when clicking outside
        if (!target.closest('.main-header')) {
            // If clicking a sub-link inside dropdown, do nothing
            if (target.closest('.dropdown-menu a')) return;

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
        }
    });

    // Escape Key
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