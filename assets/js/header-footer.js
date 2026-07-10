/**
 * HEADER-FOOTER.JS
 * Injects header and footer from external HTML files and initialises all interactions.
 * Uses fetch() with cache-busting to avoid stale content.
 */
(() => {
    'use strict';

    // ---------- CONFIGURATION ----------
    const CONFIG = {
        headerUrl: 'header.html',    // path to your header file
        footerUrl: 'footer.html',    // path to your footer file
        cacheBust: true,             // append timestamp to avoid caching
    };

    // ---------- HELPERS ----------
    const log = (msg, type = 'info') => {
        const prefix = '🔷 [HeaderFooter]';
        if (type === 'error') console.error(`${prefix} ${msg}`);
        else if (type === 'warn') console.warn(`${prefix} ${msg}`);
        else console.log(`${prefix} ${msg}`);
    };

    const getUrl = (url) => {
        if (CONFIG.cacheBust) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}_=${Date.now()}`;
        }
        return url;
    };

    // ---------- INJECTION ----------
    const injectHTML = async () => {
        try {
            // 1. Fetch both files in parallel
            const [headerRes, footerRes] = await Promise.all([
                fetch(getUrl(CONFIG.headerUrl)),
                fetch(getUrl(CONFIG.footerUrl))
            ]);

            // 2. Check responses
            if (!headerRes.ok) {
                throw new Error(`Header not found (${headerRes.status}) – check path: ${CONFIG.headerUrl}`);
            }
            if (!footerRes.ok) {
                throw new Error(`Footer not found (${footerRes.status}) – check path: ${CONFIG.footerUrl}`);
            }

            const [headerHTML, footerHTML] = await Promise.all([
                headerRes.text(),
                footerRes.text()
            ]);

            // 3. Insert header – right after <body> opening tag
            const body = document.body;
            if (body) {
                // Insert header as first child of body
                const headerWrapper = document.createElement('div');
                headerWrapper.innerHTML = headerHTML;
                while (headerWrapper.firstChild) {
                    body.prepend(headerWrapper.firstChild);
                }
                log('Header injected successfully.');
            } else {
                throw new Error('No <body> element found.');
            }

            // 4. Insert footer – before closing </body> (i.e., append to body)
            if (body) {
                const footerWrapper = document.createElement('div');
                footerWrapper.innerHTML = footerHTML;
                while (footerWrapper.firstChild) {
                    body.appendChild(footerWrapper.firstChild);
                }
                log('Footer injected successfully.');
            }

            // 5. Now that the DOM is updated, initialise all header/footer interactions
            initHeaderFooter();

        } catch (error) {
            log(`Injection failed: ${error.message}`, 'error');
            // Optionally display a fallback message to the user
            // document.body.insertAdjacentHTML('afterbegin', '<p style="color:red;">Header failed to load.</p>');
        }
    };

    // ---------- HEADER/FOOTER INTERACTIONS (same as before, but safe) ----------
    const initHeaderFooter = () => {
        // This is the same defensive code we wrote earlier, but now we know the elements exist.
        const header = document.querySelector('.main-header');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navList = document.querySelector('.nav-list');
        const dropdowns = document.querySelectorAll('.dropdown');
        const yearSpan = document.getElementById('current-year');

        // Set year
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }

        // Sticky header
        if (header) {
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        header.classList.toggle('scrolled', window.scrollY > 20);
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }

        // Mobile menu
        if (mobileToggle && navMenu) {
            const toggleMobileMenu = (forceState) => {
                const isOpen = typeof forceState === 'boolean' ? forceState : !navMenu.classList.contains('open');
                navMenu.classList.toggle('open', isOpen);
                mobileToggle.setAttribute('aria-expanded', isOpen);
                mobileToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
                document.body.style.overflow = isOpen ? 'hidden' : '';
            };

            mobileToggle.addEventListener('click', () => toggleMobileMenu());

            if (navList) {
                navList.addEventListener('click', (e) => {
                    const link = e.target.closest('a.nav-link');
                    if (link && !link.closest('.dropdown')) {
                        toggleMobileMenu(false);
                    }
                });
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navMenu.classList.contains('open')) {
                    toggleMobileMenu(false);
                    mobileToggle.focus();
                }
            });
        }

        // Dropdowns
        if (dropdowns.length > 0) {
            const toggleDropdown = (dropdown, forceState) => {
                const isOpen = typeof forceState === 'boolean' ? forceState : !dropdown.classList.contains('open');
                dropdown.classList.toggle('open', isOpen);
                const toggleBtn = dropdown.querySelector('.dropdown-toggle');
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-expanded', isOpen);
                }
            };

            dropdowns.forEach((dropdown) => {
                const toggleBtn = dropdown.querySelector('.dropdown-toggle');
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (window.innerWidth > 992) {
                            dropdowns.forEach((d) => {
                                if (d !== dropdown && d.classList.contains('open')) {
                                    toggleDropdown(d, false);
                                }
                            });
                        }
                        toggleDropdown(dropdown);
                    });
                }

                if (window.innerWidth > 992) {
                    dropdown.addEventListener('mouseenter', () => {
                        dropdowns.forEach((d) => {
                            if (d !== dropdown && d.classList.contains('open')) {
                                toggleDropdown(d, false);
                            }
                        });
                        toggleDropdown(dropdown, true);
                    });
                    dropdown.addEventListener('mouseleave', () => {
                        const menu = dropdown.querySelector('.dropdown-menu');
                        const isHoveringMenu = menu && menu.matches(':hover');
                        if (!isHoveringMenu) {
                            toggleDropdown(dropdown, false);
                        }
                    });
                }
            });

            document.addEventListener('click', (e) => {
                const isInsideDropdown = e.target.closest('.dropdown');
                if (!isInsideDropdown) {
                    dropdowns.forEach((d) => toggleDropdown(d, false));
                }
            });
        }

        // Active link highlighting
        if (navList) {
            const currentPath = window.location.pathname;
            navList.querySelectorAll('.nav-link:not(.cta-link)').forEach((link) => {
                const href = link.getAttribute('href');
                if (href) {
                    const linkPath = href.replace(/^\.\.\//, '/').replace(/^\.\//, '/');
                    const currentPathNormalized = currentPath.replace(/^\/$/, '/index.html');
                    if (currentPathNormalized === linkPath ||
                        currentPathNormalized.endsWith(linkPath) ||
                        (linkPath === '/index.html' && currentPathNormalized === '/')) {
                        link.classList.add('active');
                    }
                }
            });
        }

        log('Header/Footer interactions initialised.');
    };

    // ---------- START ----------
    // Wait for DOM to be ready before injecting
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectHTML);
    } else {
        injectHTML();
    }

})();