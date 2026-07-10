/**
 * ============================================
 * HEADER-FOOTER.JS
 * Best practices • ES6+ • Accessibility • Animations • Performance
 * ============================================
 */

(() => {
    'use strict';

    // ---------- DOM refs ----------
    const header = document.querySelector('.main-header');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navList = document.querySelector('.nav-list');
    const dropdowns = document.querySelectorAll('.dropdown');
    const yearSpan = document.getElementById('current-year');

    // ---------- 1. Set current year in footer ----------
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ---------- 2. Sticky header shadow on scroll ----------
    let ticking = false;

    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                if (scrollY > 20) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ---------- 3. Mobile menu toggle ----------
    const toggleMobileMenu = (forceState) => {
        const isOpen = typeof forceState === 'boolean' ? forceState : !navMenu.classList.contains('open');
        navMenu.classList.toggle('open', isOpen);
        mobileToggle.setAttribute('aria-expanded', isOpen);
        mobileToggle.setAttribute(
            'aria-label',
            isOpen ? 'Close navigation menu' : 'Open navigation menu'
        );
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    mobileToggle.addEventListener('click', () => toggleMobileMenu());

    // Close mobile menu on link click (for better UX)
    navList.addEventListener('click', (e) => {
        const link = e.target.closest('a.nav-link');
        if (link && !link.closest('.dropdown')) {
            // Only close if it's a direct nav link, not a dropdown item
            toggleMobileMenu(false);
        }
    });

    // Close mobile menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('open')) {
            toggleMobileMenu(false);
            mobileToggle.focus();
        }
    });

    // ---------- 4. Dropdown toggles (desktop + mobile) ----------
    const toggleDropdown = (dropdown, forceState) => {
        const isOpen = typeof forceState === 'boolean' ? forceState : !dropdown.classList.contains('open');
        dropdown.classList.toggle('open', isOpen);
        const toggleBtn = dropdown.querySelector('.dropdown-toggle');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', isOpen);
        }
        const link = dropdown.querySelector('.nav-link-wrapper > .nav-link');
        if (link) {
            link.setAttribute('aria-expanded', isOpen);
        }
    };

    const closeAllDropdowns = () => {
        dropdowns.forEach((d) => {
            if (d.classList.contains('open')) {
                toggleDropdown(d, false);
            }
        });
    };

    dropdowns.forEach((dropdown) => {
        const toggleBtn = dropdown.querySelector('.dropdown-toggle');
        const link = dropdown.querySelector('.nav-link-wrapper > .nav-link');

        // Click on toggle button (chevron)
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other dropdowns (on desktop)
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

        // Hover on desktop (for better UX)
        if (window.innerWidth > 992) {
            // Mouse enter dropdown
            dropdown.addEventListener('mouseenter', () => {
                // Close other dropdowns
                dropdowns.forEach((d) => {
                    if (d !== dropdown && d.classList.contains('open')) {
                        toggleDropdown(d, false);
                    }
                });
                toggleDropdown(dropdown, true);
            });

            // Mouse leave dropdown – with delay to allow moving into menu
            dropdown.addEventListener('mouseleave', (e) => {
                const relatedTarget = e.relatedTarget;
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu && menu.contains(relatedTarget)) {
                    return; // Don't close – we're entering the menu
                }
                setTimeout(() => {
                    if (!dropdown.matches(':hover') && !menu?.matches(':hover')) {
                        toggleDropdown(dropdown, false);
                    }
                }, 100);
            });

            // Keep open when hovering the menu itself
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
                menu.addEventListener('mouseenter', () => {
                    toggleDropdown(dropdown, true);
                });
                menu.addEventListener('mouseleave', () => {
                    toggleDropdown(dropdown, false);
                });
            }
        }

        // Click on the nav link inside dropdown – "first tap expands, second tap navigates"
        if (link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 992) {
                    // If dropdown is closed, open it instead of navigating
                    if (!dropdown.classList.contains('open')) {
                        e.preventDefault();
                        // Close other dropdowns first
                        dropdowns.forEach((d) => {
                            if (d !== dropdown && d.classList.contains('open')) {
                                toggleDropdown(d, false);
                            }
                        });
                        toggleDropdown(dropdown);
                    }
                    // If dropdown is open, allow navigation (second tap)
                }
            });
        }
    });

    // ---------- 5. Close dropdowns when clicking outside ----------
    document.addEventListener('click', (e) => {
        const isInsideDropdown = e.target.closest('.dropdown');
        if (!isInsideDropdown) {
            closeAllDropdowns();
        }
    });

    // ---------- 6. Close dropdowns on Escape key ----------
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllDropdowns();
        }
    });

    // ---------- 7. Handle window resize: reset mobile state ----------
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // If we're on desktop and menu is open, close it
            if (window.innerWidth > 992 && navMenu.classList.contains('open')) {
                toggleMobileMenu(false);
            }
            // Reset dropdown states on resize
            if (window.innerWidth > 992) {
                closeAllDropdowns();
            }
        }, 200);
    });

    // ---------- 8. Intersection Observer: fade-up animations ----------
    const fadeElements = document.querySelectorAll('.fade-up');
    if (fadeElements.length > 0) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -20px 0px',
            }
        );

        fadeElements.forEach((el) => observer.observe(el));
    }

    // ---------- 9. Active link highlighting ----------
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link:not(.cta-link)');

    navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
            // Normalize paths for comparison
            const linkPath = href.replace(/^\.\.\//, '/').replace(/^\.\//, '/');
            const currentPathNormalized = currentPath.replace(/^\/$/, '/index.html');

            if (
                currentPathNormalized === linkPath ||
                currentPathNormalized.endsWith(linkPath) ||
                (linkPath === '/index.html' && currentPathNormalized === '/')
            ) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });

    // ---------- 10. Keyboard navigation: dropdown toggle with Enter/Space ----------
    document.querySelectorAll('.dropdown-toggle').forEach((btn) => {
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const dropdown = btn.closest('.dropdown');
                if (dropdown) {
                    toggleDropdown(dropdown);
                }
            }
        });
    });

    // ---------- 11. Ensure ARIA attributes are correct on load ----------
    dropdowns.forEach((dropdown) => {
        const toggleBtn = dropdown.querySelector('.dropdown-toggle');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
        const link = dropdown.querySelector('.nav-link-wrapper > .nav-link');
        if (link) {
            link.setAttribute('aria-expanded', 'false');
        }
    });

    // ---------- 12. Console info (developer friendly) ----------
    console.log(
        '%c Consulting Crew %c Header & Footer initialized ',
        'background:#052874;color:#FF5500;font-weight:bold;padding:4px 8px;border-radius:4px 0 0 4px;',
        'background:#FF5500;color:#fff;padding:4px 8px;border-radius:0 4px 4px 0;'
    );
})();