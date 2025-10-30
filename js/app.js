// Main Application Entry Point
import '@fontsource/space-grotesk/300.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/dm-serif-display/400-italic.css';
import '../css/style.css';

const MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)';
const MOTION_EVENT = 'motion-preference-change';

function computeMotionPreference() {
    if (typeof window === 'undefined') {
        return true;
    }

    const media = typeof window.matchMedia === 'function'
        ? window.matchMedia(MOTION_MEDIA_QUERY)
        : { matches: false };
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    const saveData = Boolean(nav && nav.connection && nav.connection.saveData);
    const lowConcurrency = Boolean(nav && typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4);
    const lowMemory = Boolean(nav && typeof nav.deviceMemory === 'number' && nav.deviceMemory > 0 && nav.deviceMemory <= 4);

    return !(media.matches || saveData || lowConcurrency || lowMemory);
}

function applyMotionState(enabled) {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('motion-disabled', !enabled);
}

function broadcastMotionState(enabled) {
    if (typeof document === 'undefined') return;
    document.dispatchEvent(new CustomEvent(MOTION_EVENT, { detail: enabled }));
}

function registerSecurityObservers() {
    if (typeof document === 'undefined') return () => {};

    const handleViolation = (event) => {
        const payload = {
            blockedURI: event.blockedURI || 'inline',
            violatedDirective: event.violatedDirective,
            lineNumber: event.lineNumber,
            columnNumber: event.columnNumber,
            sourceFile: event.sourceFile,
            timestamp: Date.now(),
        };

        try {
            const previous = JSON.parse(sessionStorage.getItem('csp-violations') ?? '[]');
            previous.push(payload);
            sessionStorage.setItem('csp-violations', JSON.stringify(previous.slice(-10)));
        } catch (storageError) {
            console.warn('Security policy violation detected', payload, storageError);
        }
    };

    document.addEventListener('securitypolicyviolation', handleViolation);

    return () => document.removeEventListener('securitypolicyviolation', handleViolation);
}

function createTrustedTypesPolicy() {
    if (typeof window === 'undefined' || !window.trustedTypes) {
        return;
    }

    try {
        window.trustedTypes.createPolicy('default', {
            createHTML: (input) => input,
            createScript: () => {
                throw new TypeError('Dynamic script creation blocked by Trusted Types policy.');
            },
            createScriptURL: () => {
                throw new TypeError('Dynamic script URL creation blocked by Trusted Types policy.');
            },
        });
    } catch (error) {
        if (!(error instanceof DOMException)) {
            console.warn('Unable to establish Trusted Types policy', error);
        }
    }
}

function syncMotionState(nextState) {
    const resolvedState = typeof nextState === 'boolean' ? nextState : computeMotionPreference();
    if (resolvedState === state.motionEnabled) {
        return state.motionEnabled;
    }

    state.motionEnabled = resolvedState;
    applyMotionState(state.motionEnabled);
    broadcastMotionState(state.motionEnabled);

    return state.motionEnabled;
}

function registerMotionPreferenceWatchers() {
    if (typeof window === 'undefined') return () => {};

    const media = typeof window.matchMedia === 'function'
        ? window.matchMedia(MOTION_MEDIA_QUERY)
        : null;
    const connection = typeof navigator !== 'undefined' ? navigator.connection : undefined;
    const previousConnectionOnChange = connection && connection.onchange;

    const handleChange = () => {
        syncMotionState();
    };

    if (media) {
        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', handleChange);
        } else if (typeof media.addListener === 'function') {
            media.addListener(handleChange);
        }
    }

    if (connection) {
        if (typeof connection.addEventListener === 'function') {
            connection.addEventListener('change', handleChange);
        } else {
            connection.onchange = handleChange;
        }
    }

    return () => {
        if (media) {
            if (typeof media.removeEventListener === 'function') {
                media.removeEventListener('change', handleChange);
            } else if (typeof media.removeListener === 'function') {
                media.removeListener(handleChange);
            }
        }

        if (connection) {
            if (typeof connection.removeEventListener === 'function') {
                connection.removeEventListener('change', handleChange);
            } else {
                connection.onchange = typeof previousConnectionOnChange === 'undefined' ? null : previousConnectionOnChange;
            }
        }
    };
}

createTrustedTypesPolicy();

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

function enforceFrameIntegrity() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return () => {};
    }

    const root = document.documentElement;
    let overlay = null;
    let breakoutAttempted = false;

    const teardownOverlay = () => {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        overlay = null;
        root.classList.remove('is-frame-blocked');
        breakoutAttempted = false;
    };

    const ensureOverlay = () => {
        if (overlay) {
            return;
        }

        overlay = document.createElement('div');
        overlay.id = 'frame-block-notice';
        overlay.className = 'frame-block-notice';
        overlay.setAttribute('role', 'alert');

        const panel = document.createElement('div');
        panel.className = 'frame-block-notice__panel';

        const title = document.createElement('h1');
        title.className = 'frame-block-notice__title';
        title.textContent = 'Embedding Disabled';

        const message = document.createElement('p');
        message.className = 'frame-block-notice__message';
        message.textContent = 'This portfolio cannot be embedded in other sites. Please open it directly to continue.';

        panel.appendChild(title);
        panel.appendChild(message);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
    };

    const guard = () => {
        const isFramed = (() => {
            try {
                return window.top !== window.self;
            } catch (error) {
                return true;
            }
        })();

        if (!isFramed) {
            teardownOverlay();
            return;
        }

        root.classList.add('is-frame-blocked');
        ensureOverlay();

        if (!breakoutAttempted) {
            breakoutAttempted = true;
            try {
                if (window.top && typeof window.top.location !== 'undefined') {
                    window.top.location = window.location.href;
                }
            } catch (error) {
                console.warn('Clickjacking attempt detected; staying in stand-alone mode.', error);
            }
        }
    };

    const handleVisibilityChange = () => guard();
    const handleFocusChange = () => guard();

    guard();
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleFocusChange);
    window.addEventListener('focus', handleFocusChange);

    return () => {
        window.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleFocusChange);
        window.removeEventListener('focus', handleFocusChange);
        teardownOverlay();
    };
}

const state = {
    motionEnabled: computeMotionPreference(),
};

applyMotionState(state.motionEnabled);

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
    registerCleanup(registerSecurityObservers());
    registerCleanup(enforceFrameIntegrity());
    registerCleanup(registerMotionPreferenceWatchers());
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

    if (!sections.length && !reveals.length) {
        return () => {};
    }

    const revealImmediately = (elements) => {
        elements.forEach((el) => el.classList.add('is-visible'));
    };

    if (!state.motionEnabled || typeof IntersectionObserver !== 'function') {
        revealImmediately(sections);
        revealImmediately(reveals);
        return () => {};
    }

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: '-18% 0px -10% 0px',
        }
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
        {
            threshold: 0.18,
            rootMargin: '-12% 0px -8% 0px',
        }
    );

    const preloadVisible = () => {
        sections.forEach((el) => {
            if (el.getBoundingClientRect().top <= window.innerHeight * 0.9) {
                el.classList.add('is-visible');
            }
        });
        reveals.forEach((el) => {
            if (el.getBoundingClientRect().top <= window.innerHeight * 0.9) {
                el.classList.add('is-visible');
            }
        });
    };

    sections.forEach((el) => sectionObserver.observe(el));
    reveals.forEach((el) => revealObserver.observe(el));

    preloadVisible();
    window.addEventListener('load', preloadVisible, { once: true });

    const handleMotionEvent = (event) => {
        if (typeof event.detail !== 'boolean') return;
        if (!event.detail) {
            revealImmediately(sections);
            revealImmediately(reveals);
            sectionObserver.disconnect();
            revealObserver.disconnect();
        } else {
            sections.forEach((el) => sectionObserver.observe(el));
            reveals.forEach((el) => revealObserver.observe(el));
            preloadVisible();
        }
    };

    document.addEventListener(MOTION_EVENT, handleMotionEvent);

    return () => {
        document.removeEventListener(MOTION_EVENT, handleMotionEvent);
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
        return () => {};
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

    const updateUi = () => {
        toggleButton.classList.toggle('is-disabled', !state.motionEnabled);
        const label = toggleButton.querySelector('.theme-toggle__label');
        if (label) {
            label.textContent = state.motionEnabled ? 'Motion' : 'Static';
        }

        if (!state.motionEnabled) {
            document.querySelectorAll('[data-scroll-section], [data-scroll-reveal]').forEach((el) => {
                el.classList.add('is-visible');
            });
            document.querySelectorAll('[data-count-to]').forEach((el) => {
                el.textContent = el.dataset.countTo ?? '0';
            });
        }
    };

    updateUi();

    const handleClick = () => {
        const enabled = !state.motionEnabled;
        syncMotionState(enabled);

        if (enabled) {
            setupScrollEffects();
            setupCounterAnimations();
        }

        updateUi();
    };

    const handleExternalChange = (event) => {
        if (typeof event.detail !== 'boolean') return;
        state.motionEnabled = event.detail;
        updateUi();
    };

    toggleButton.addEventListener('click', handleClick);
    document.addEventListener(MOTION_EVENT, handleExternalChange);

    return () => {
        toggleButton.removeEventListener('click', handleClick);
        document.removeEventListener(MOTION_EVENT, handleExternalChange);
    };
}

export { init };
