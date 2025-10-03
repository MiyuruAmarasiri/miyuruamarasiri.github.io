// Main Application Entry Point
import '../css/style.css';

(function enforceHttps() {
    if (typeof window === 'undefined') {
        return;
    }

    const { protocol, hostname } = window.location;
    if (protocol === 'http:' && hostname && !['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)) {
        const secureUrl = `https://${hostname}${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.replace(secureUrl);
    }
})();

const state = {
    motionEnabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

const cleanupTasks = [];

function registerCleanup(fn) {
    if (typeof fn === 'function') {
        cleanupTasks.push(fn);
    }
}

function runIdle(task) {
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(task, { timeout: 500 });
    } else {
        window.setTimeout(task, 1);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js-enabled');
    init();
});

function init() {
    updateYear();
    registerCleanup(setupMobileNav());
    registerCleanup(setupBackToTop());

    runIdle(() => {
        registerCleanup(setupScrollEffects());
        registerCleanup(setupCounterAnimations());
        registerCleanup(setupNavHighlighting());
        registerCleanup(setupSmoothAnchorScroll());
        registerCleanup(setupMotionToggle());
    });

    window.addEventListener('pagehide', () => {
        cleanupTasks.forEach((fn) => {
            try {
                fn();
            } catch (error) {
                console.error('Cleanup task failed', error);
            }
        });
        cleanupTasks.length = 0;
    }, { once: true });
}

function updateYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear().toString();
    }
}

function setupBackToTop() {
    const triggerOffset = 320;
    const backToTop = document.querySelector('[data-back-to-top]');

    if (!backToTop) return;

    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleScroll = () => {
        if (window.scrollY > triggerOffset) {
            backToTop.classList.add('is-visible');
        } else {
            backToTop.classList.remove('is-visible');
        }
    };

    backToTop.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
        backToTop.removeEventListener('click', handleClick, { passive: true });
        window.removeEventListener('scroll', handleScroll, { passive: true });
    };
}

function setupScrollEffects() {
    const sections = document.querySelectorAll('[data-scroll-section]');
    const reveals = document.querySelectorAll('[data-scroll-reveal]');

    if (!state.motionEnabled) {
        sections.forEach((el) => el.classList.add('is-visible'));
        reveals.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        },
        { threshold: 0.2 }
    );

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.3 }
    );

    sections.forEach((el) => sectionObserver.observe(el));
    reveals.forEach((el) => revealObserver.observe(el));

    return () => {
        sectionObserver.disconnect();
        revealObserver.disconnect();
    };
}

function setupCounterAnimations() {
    const counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) return;

    const animateCount = (el) => {
        const target = Number.parseInt(el.dataset.countTo ?? '0', 10);
        if (Number.isNaN(target)) return;

        const duration = 1400;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased).toString();
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    };

    if (!state.motionEnabled) {
        counters.forEach((el) => {
            el.textContent = el.dataset.countTo ?? '0';
        });
        return;
    }

    const counterObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.6 }
    );

    counters.forEach((el) => counterObserver.observe(el));

    return () => counterObserver.disconnect();
}

function setupNavHighlighting() {
    const header = document.querySelector('[data-floating-header]');
    const navLinks = document.querySelectorAll('[data-nav-link]');
    const sections = Array.from(document.querySelectorAll('main section[id]'));

    const sectionMap = new Map(
        sections.map((section) => [section.id, section])
    );

    const activateLink = (id) => {
        navLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('is-active');
            } else {
                link.classList.remove('is-active');
            }
        });
    };

    let headerScrollHandler;
    if (header) {
        headerScrollHandler = () => {
            header.classList.toggle('is-scrolled', window.scrollY > 10);
        };
        window.addEventListener('scroll', headerScrollHandler, { passive: true });
        headerScrollHandler();
    }

    const observer = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            if (visible.length > 0) {
                activateLink(visible[0].target.id);
            }
        },
        {
            rootMargin: '-45% 0px -45% 0px',
            threshold: [0.2, 0.5, 0.8],
        }
    );

    sectionMap.forEach((section) => observer.observe(section));

    return () => {
        observer.disconnect();
        if (header && headerScrollHandler) {
            window.removeEventListener('scroll', headerScrollHandler, { passive: true });
        }
    };
}

function setupSmoothAnchorScroll() {
    const header = document.querySelector('[data-floating-header]');
    const triggers = Array.from(document.querySelectorAll('a[href^="#"]')).filter((link) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return false;
        const id = href.slice(1);
        return Boolean(document.getElementById(id));
    });

    if (!triggers.length) return;

    const getHeaderOffset = () => {
        if (!header) return 0;
        const rect = header.getBoundingClientRect();
        const extra = window.innerWidth < 1024 ? 16 : 24;
        return Math.max(rect.height + extra, 0);
    };

    const scrollToTarget = (target, hash, updateHistory) => {
        const headerOffset = getHeaderOffset();
        const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({
            top: Math.max(targetTop, 0),
            behavior: state.motionEnabled ? 'smooth' : 'auto',
        });

        if (updateHistory) {
            if (typeof window.history.pushState === 'function') {
                window.history.pushState(null, '', `#${hash}`);
            } else {
                window.location.hash = hash;
            }
        }
    };

    const handleClick = (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        const href = event.currentTarget.getAttribute('href');
        if (!href || href === '#') return;

        const targetId = href.slice(1);
        const target = document.getElementById(targetId);
        if (!target) return;

        event.preventDefault();
        scrollToTarget(target, targetId, true);
    };

    const handleHashChange = () => {
        const { hash } = window.location;
        if (!hash || hash.length <= 1) return;
        const targetId = decodeURIComponent(hash.slice(1));
        const target = document.getElementById(targetId);
        if (!target) return;
        scrollToTarget(target, targetId, false);
    };

    triggers.forEach((link) => link.addEventListener('click', handleClick));
    window.addEventListener('hashchange', handleHashChange);

    if (window.location.hash && window.location.hash.length > 1) {
        runIdle(() => handleHashChange());
    }

    return () => {
        triggers.forEach((link) => link.removeEventListener('click', handleClick));
        window.removeEventListener('hashchange', handleHashChange);
    };
}

function setupMobileNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const panel = document.querySelector('[data-nav-panel]');

    if (!toggle || !panel) return;

    const label = toggle.querySelector('.nav-toggle__label');
    const icon = toggle.querySelector('.nav-toggle__icon');

    const setState = (open) => {
        panel.classList.toggle('is-open', open);
        document.body.classList.toggle('nav-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.setAttribute('aria-hidden', open ? 'false' : 'true');

        if (label) {
            label.textContent = open ? 'Close' : 'Menu';
        }

        if (icon) {
            icon.classList.toggle('is-open', open);
            const path = icon.querySelector('path');
            if (path) {
                path.setAttribute('d', open ? 'M4 4l12 12M16 4L4 16' : 'M2 5h16M2 10h16M2 15h16');
            }
        }
    };

    const closePanel = () => setState(false);

    const handleToggle = () => {
        const isOpen = panel.classList.contains('is-open');
        setState(!isOpen);
    };

    const handleResize = () => {
        if (window.innerWidth >= 1024) {
            closePanel();
        }
    };

    toggle.addEventListener('click', handleToggle);

    panel.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closePanel, { passive: true });
    });

    window.addEventListener('resize', handleResize, { passive: true });

    setState(false);

    return () => {
        toggle.removeEventListener('click', handleToggle);
        window.removeEventListener('resize', handleResize, { passive: true });
        panel.querySelectorAll('a').forEach((link) => {
            link.removeEventListener('click', closePanel, { passive: true });
        });
        document.body.classList.remove('nav-open');
    };
}

function setupMotionToggle() {
    const toggleButton = document.querySelector('[data-toggle-motion]');
    if (!toggleButton) return;

    const handleClick = () => {
        state.motionEnabled = !state.motionEnabled;
        toggleButton.classList.toggle('is-disabled', !state.motionEnabled);
        toggleButton.querySelector('.theme-toggle__label').textContent = state.motionEnabled
            ? 'Motion'
            : 'Static';

        if (!state.motionEnabled) {
            document.querySelectorAll('[data-scroll-section], [data-scroll-reveal]').forEach((el) => {
                el.classList.add('is-visible');
            });
            document.querySelectorAll('[data-count-to]').forEach((el) => {
                el.textContent = el.dataset.countTo ?? '0';
            });
        } else {
            setupScrollEffects();
            setupCounterAnimations();
        }
    };

    toggleButton.addEventListener('click', handleClick);

    return () => toggleButton.removeEventListener('click', handleClick);
}

export { init };
