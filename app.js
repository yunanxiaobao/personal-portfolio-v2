// ===== MOBILE NAVIGATION =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', isOpen.toString());
    });

    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
            navLinks.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.focus();
        }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// ===== THEME MANAGEMENT =====
const THEME_KEY = 'portfolio-theme';
const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';

function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) || THEME_LIGHT;
}

function setTheme(theme) {
    if (theme === THEME_DARK) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
    const current = getStoredTheme();
    const next = current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
    setTheme(next);
    return next;
}

// Apply stored theme on load
setTheme(getStoredTheme());

// Theme toggle button
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        toggleTheme();
    });
}

// ===== COMMAND PALETTE =====
const cmdOverlay = document.getElementById('cmd-overlay');
const cmdInput = document.getElementById('cmd-input');
const cmdResults = document.getElementById('cmd-results');
const cmdClose = document.getElementById('cmd-close');
const openCmdBtn = document.getElementById('open-cmd');

const PAGES = [
    { title: 'Home', desc: 'Personal index', url: 'index.html', icon: 'home' },
    { title: 'Projects', desc: 'Selected work', url: 'projects.html', icon: 'folder' },
    { title: 'Notes', desc: 'Field notes', url: 'notes.html', icon: 'file' },
    { title: 'About', desc: 'Profile information', url: 'about.html', icon: 'user' },
    { title: 'Contact', desc: 'Contact methods', url: 'contact.html', icon: 'mail' }
];

const ACTIONS = [
    { title: 'Light appearance', desc: 'Set light theme', action: 'theme-light', icon: 'sun' },
    { title: 'Dark appearance', desc: 'Set dark theme', action: 'theme-dark', icon: 'moon' },
];

let selectedIndex = 0;
let filteredItems = [];
let isOpen = false;
let lastFocusedElement = null;

function getIcon(type) {
    const icons = {
        home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
        folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>',
        file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>',
        user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
        mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
        sun: '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>',
        moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'
    };
    return `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">${icons[type] || icons.file}</svg>`;
}

function renderResults(query) {
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
        filteredItems = [...PAGES, ...ACTIONS];
    } else {
        filteredItems = [...PAGES, ...ACTIONS].filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.desc.toLowerCase().includes(lowerQuery)
        );
    }

    selectedIndex = 0;

    if (filteredItems.length === 0) {
        cmdResults.innerHTML = '<div class="cmd-empty">No results found</div>';
        return;
    }

    const pageItems = filteredItems.filter(item => item.url);
    const actionItems = filteredItems.filter(item => item.action);

    let html = '';

    if (pageItems.length > 0) {
        html += '<div class="cmd-section"><div class="cmd-section-title">Pages</div>';
        pageItems.forEach((item, index) => {
            const globalIndex = filteredItems.indexOf(item);
            html += `
                <a href="${item.url}" class="cmd-item ${globalIndex === selectedIndex ? 'is-selected' : ''}" data-index="${globalIndex}" role="option" aria-selected="${globalIndex === selectedIndex}">
                    <div class="cmd-item-icon">${getIcon(item.icon)}</div>
                    <div class="cmd-item-content">
                        <div class="cmd-item-title">${item.title}</div>
                        <div class="cmd-item-desc">${item.desc}</div>
                    </div>
                    <kbd class="cmd-item-kbd">↵</kbd>
                </a>
            `;
        });
        html += '</div>';
    }

    if (actionItems.length > 0) {
        html += '<div class="cmd-section"><div class="cmd-section-title">Actions</div>';
        actionItems.forEach((item, index) => {
            const globalIndex = filteredItems.indexOf(item);
            html += `
                <div class="cmd-item ${globalIndex === selectedIndex ? 'is-selected' : ''}" data-index="${globalIndex}" data-action="${item.action}" role="option" aria-selected="${globalIndex === selectedIndex}" tabindex="0">
                    <div class="cmd-item-icon">${getIcon(item.icon)}</div>
                    <div class="cmd-item-content">
                        <div class="cmd-item-title">${item.title}</div>
                        <div class="cmd-item-desc">${item.desc}</div>
                    </div>
                    <kbd class="cmd-item-kbd">↵</kbd>
                </div>
            `;
        });
        html += '</div>';
    }

    cmdResults.innerHTML = html;

    // Add click handlers
    cmdResults.querySelectorAll('.cmd-item[data-action]').forEach(el => {
        el.addEventListener('click', () => {
            const action = el.dataset.action;
            handleAction(action);
        });
    });
}

function handleAction(action) {
    if (action === 'theme-light') {
        setTheme(THEME_LIGHT);
        closeCommandPalette();
    } else if (action === 'theme-dark') {
        setTheme(THEME_DARK);
        closeCommandPalette();
    }
}

function openCommandPalette() {
    if (!cmdOverlay) return;
    lastFocusedElement = document.activeElement;
    isOpen = true;
    cmdOverlay.classList.add('is-open');
    cmdInput.value = '';
    renderResults('');
    setTimeout(() => cmdInput.focus(), 50);
}

function closeCommandPalette() {
    if (!cmdOverlay) return;
    isOpen = false;
    cmdOverlay.classList.remove('is-open');
    cmdInput.value = '';
    if (lastFocusedElement && lastFocusedElement !== document.body) {
        lastFocusedElement.focus();
    }
}

function navigateSelection(direction) {
    if (filteredItems.length === 0) return;

    selectedIndex += direction;
    if (selectedIndex < 0) selectedIndex = filteredItems.length - 1;
    if (selectedIndex >= filteredItems.length) selectedIndex = 0;

    // Update UI
    cmdResults.querySelectorAll('.cmd-item').forEach((el, index) => {
        const isSelected = parseInt(el.dataset.index) === selectedIndex;
        el.classList.toggle('is-selected', isSelected);
        el.setAttribute('aria-selected', isSelected.toString());
    });

    // Scroll into view
    const selected = cmdResults.querySelector('.cmd-item.is-selected');
    if (selected) {
        selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

function selectCurrent() {
    if (filteredItems.length === 0) return;

    const item = filteredItems[selectedIndex];
    if (item.url) {
        window.location.href = item.url;
    } else if (item.action) {
        handleAction(item.action);
    }
}

// Event listeners
if (openCmdBtn) {
    openCmdBtn.addEventListener('click', openCommandPalette);
}

if (cmdClose) {
    cmdClose.addEventListener('click', closeCommandPalette);
}

if (cmdOverlay) {
    cmdOverlay.addEventListener('click', (e) => {
        if (e.target === cmdOverlay) {
            closeCommandPalette();
        }
    });
}

if (cmdInput) {
    cmdInput.addEventListener('input', (e) => {
        renderResults(e.target.value);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K to open
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
            openCommandPalette();
        }
    }

    // / to focus search when not typing
    if (e.key === '/' && !isOpen && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openCommandPalette();
    }

    // Escape to close
    if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closeCommandPalette();
    }

    // Arrow navigation
    if (isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        navigateSelection(e.key === 'ArrowDown' ? 1 : -1);
    }

    // Enter to select
    if (isOpen && e.key === 'Enter') {
        e.preventDefault();
        selectCurrent();
    }
});

// ===== PROJECT ACTIONS =====
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === 'toggle-details') {
        const targetId = btn.dataset.target;
        const target = document.getElementById(targetId);
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';

        if (target) {
            target.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', !isExpanded);

            const span = btn.querySelector('span');
            if (span) {
                const collapsedText = span.dataset.textCollapsed;
                const expandedText = span.dataset.textExpanded;
                span.textContent = !isExpanded ? expandedText : collapsedText;
            }
        }
    }

    if (action === 'copy-link') {
        const project = btn.dataset.project;
        const url = `${window.location.origin}${window.location.pathname}#${project}`;
        const statusEl = document.getElementById('clipboard-status');

        // Try modern Clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                const originalText = btn.textContent;
                btn.classList.add('is-success');
                btn.textContent = 'Copied!';
                if (statusEl) statusEl.textContent = 'Link copied to clipboard';

                setTimeout(() => {
                    btn.classList.remove('is-success');
                    btn.textContent = originalText.trim();
                    if (statusEl) statusEl.textContent = '';
                }, 2000);
            }).catch((err) => {
                console.error('Clipboard write failed:', err);
                fallbackCopyLink(url, btn, statusEl);
            });
        } else {
            // Fallback for older browsers or non-secure contexts
            fallbackCopyLink(url, btn, statusEl);
        }
    }
});

function fallbackCopyLink(text, btn, statusEl) {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    try {
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile
        const success = document.execCommand('copy');

        if (success) {
            const originalText = btn.textContent;
            btn.classList.add('is-success');
            btn.textContent = 'Copied!';
            if (statusEl) statusEl.textContent = 'Link copied to clipboard';

            setTimeout(() => {
                btn.classList.remove('is-success');
                btn.textContent = originalText.trim();
                if (statusEl) statusEl.textContent = '';
            }, 2000);
        } else {
            btn.textContent = 'Copy failed';
            if (statusEl) statusEl.textContent = 'Failed to copy link';
            setTimeout(() => {
                btn.textContent = 'Copy link';
                if (statusEl) statusEl.textContent = '';
            }, 2000);
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        btn.textContent = 'Copy failed';
        if (statusEl) statusEl.textContent = 'Failed to copy link';
        setTimeout(() => {
            btn.textContent = 'Copy link';
            if (statusEl) statusEl.textContent = '';
        }, 2000);
    } finally {
        document.body.removeChild(textarea);
    }
}
