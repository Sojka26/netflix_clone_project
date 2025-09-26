"use strict";
// script.ts - main application script
const normalizeHttps = (url) => url ? url.replace(/^http:\/\//, 'https://') : undefined;
const LOCAL_PLACEHOLDER = 'images/movies-bg.jpeg';
const localPosters = {
    'avengers': 'avengers.jpg',
    'batman': 'batman.webp',
    'coco': 'coco.jpeg',
    'extraction': 'extraction.jpeg',
    'flash': 'flash.jpeg',
    'inside out': 'inside-out.jpeg',
    'kung fu panda': 'kungfu-panda.jpg',
    'mission impossible': 'mission-impossible.jpeg',
    'moana': 'moana.jpeg',
    "a bug's life": 'bugs-life.jpeg',
    'ratatouille': 'ratatouille.jpeg',
    'the incredibles': 'the-incredibles.jpeg',
    'thor': 'thor.jpeg'
};
const offlineCatalog = Object.entries(localPosters)
    .map(([k, f]) => ({ title: k, file: f }));
const toKey = (name) => name.toLowerCase().replace(/[:!.,']/g, '').replace(/\s+/g, ' ').trim();
const findLocalPoster = (title) => {
    const key = toKey(title);
    if (localPosters[key])
        return `images/${localPosters[key]}`;
    for (const k of Object.keys(localPosters))
        if (key.includes(k))
            return `images/${localPosters[k]}`;
    return undefined;
};
class App {
    constructor() {
        this.sections = { home: null, movies: null, register: null };
        this.currentFetchController = null;
        this.sections.home = document.getElementById('home');
        this.sections.movies = document.getElementById('movies');
        this.sections.register = document.getElementById('register');
        this.init();
    }
    init() {
        this.setupRouting();
        this.setupScrollTop();
        this.initMoviesFeatures();
        this.initRegisterFeatures();
        const initial = location.hash.replace('#', '') || 'home';
        this.showSection(initial);
    }
    showSection(id) {
        Object.keys(this.sections).forEach(key => {
            const el = this.sections[key];
            if (!el)
                return;
            el.hidden = key !== id;
        });
        if (id === 'home')
            history.replaceState({}, '', location.pathname);
        else
            location.hash = id;
    }
    setupRouting() {
        document.querySelectorAll('[data-target]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.currentTarget.getAttribute('data-target');
                if (target)
                    this.showSection(target);
            });
        });
        window.addEventListener('hashchange', () => {
            const id = location.hash.replace('#', '') || 'home';
            this.showSection(id);
        });
    }
    setupScrollTop() {
        const btn = document.getElementById('scrollTopBtn');
        if (!btn)
            return;
        window.addEventListener('scroll', () => {
            btn.style.display = (document.documentElement.scrollTop > 200 || document.body.scrollTop > 200) ? 'block' : 'none';
        });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    initMoviesFeatures() {
        const grid = document.getElementById('moviesGrid');
        const featured = document.getElementById('featuredRow');
        const searchBtn = document.getElementById('searchBtn');
        const moreBtn = document.getElementById('moreBtn');
        const genreSelect = document.getElementById('genreSelect');
        const searchInput = document.getElementById('searchInput');
        if (!grid)
            return;
        this.moviesGrid = grid;
        const renderOffline = () => {
            if (featured && !featured.hidden)
                featured.hidden = true;
            this.moviesGrid.hidden = false;
            this.moviesGrid.innerHTML = '';
            offlineCatalog.forEach(({ title, file }) => {
                const img = document.createElement('img');
                img.src = `images/${file}`;
                img.alt = title;
                img.loading = 'lazy';
                this.moviesGrid.appendChild(img);
            });
        };
        const runSearch = async (q) => {
            if (!q) {
                renderOffline();
                return;
            }
            if (featured && !featured.hidden)
                featured.hidden = true;
            this.moviesGrid.hidden = false;
            this.moviesGrid.innerHTML = '';
            this.moviesGrid.setAttribute('aria-busy', 'true');
            try {
                this.currentFetchController?.abort();
            }
            catch { }
            const controller = new AbortController();
            this.currentFetchController = controller;
            try {
                const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`, { signal: controller.signal });
                if (!res.ok)
                    throw new Error('HTTP ' + res.status);
                const data = await res.json();
                if (!Array.isArray(data) || data.length === 0) {
                    renderOffline();
                    return;
                }
                this.renderShows(data);
            }
            catch (err) {
                if (err?.name === 'AbortError')
                    return;
                console.warn('API nedostupné, zobrazím offline katalog:', err);
                renderOffline();
            }
            finally {
                this.moviesGrid.setAttribute('aria-busy', 'false');
            }
        };
        const resolveQuery = () => {
            const text = (searchInput?.value || '').trim();
            if (text)
                return text;
            return genreSelect?.value || 'girl';
        };
        const debounced = this.debounce((value) => {
            if (value.trim().length >= 3)
                runSearch(value.trim());
        }, 350);
        searchBtn?.addEventListener('click', () => runSearch(resolveQuery()));
        moreBtn?.addEventListener('click', () => runSearch(resolveQuery()));
        searchInput?.addEventListener('input', () => debounced(searchInput.value));
        searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                runSearch(resolveQuery());
            }
        });
    }
    renderShows(shows) {
        this.moviesGrid.innerHTML = '';
        shows.forEach(({ show }) => {
            const img = document.createElement('img');
            const apiUrl = normalizeHttps(show.image?.medium);
            const localUrl = findLocalPoster(show.name);
            img.src = apiUrl ?? localUrl ?? LOCAL_PLACEHOLDER;
            img.alt = show.name;
            img.loading = 'lazy';
            img.onerror = () => { img.src = localUrl ?? LOCAL_PLACEHOLDER; img.onerror = null; };
            this.moviesGrid.appendChild(img);
        });
    }
    debounce(fn, ms) {
        let timeoutId;
        return ((...args) => {
            if (timeoutId)
                clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => fn(...args), ms);
        });
    }
    initRegisterFeatures() {
        const form = document.getElementById('regForm');
        const first = document.getElementById('firstName');
        const last = document.getElementById('lastName');
        const email = document.getElementById('email');
        const pw = document.getElementById('password');
        const confirm = document.getElementById('confirm');
        if (!form || !first || !last || !email || !pw || !confirm)
            return;
        const clearState = (el) => el.classList.remove('error', 'valid', 'invalid');
        const setError = (el) => { el.classList.add('invalid'); el.classList.remove('valid'); };
        const setValid = (el) => { el.classList.add('valid'); el.classList.remove('invalid'); };
        const validatePasswords = () => {
            clearState(pw);
            clearState(confirm);
            if (pw.value && confirm.value) {
                if (pw.value === confirm.value) {
                    setValid(pw);
                    setValid(confirm);
                }
                else {
                    setError(pw);
                    setError(confirm);
                }
            }
        };
        form.addEventListener('input', (e) => {
            const t = e.target;
            clearState(t);
            if (t === pw || t === confirm)
                validatePasswords();
        });
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let valid = true;
            [first, last, email, pw, confirm].forEach((el) => {
                if (!el.value.trim()) {
                    setError(el);
                    valid = false;
                }
            });
            if (email.value && !email.checkValidity()) {
                setError(email);
                valid = false;
            }
            if (pw.value !== confirm.value) {
                setError(pw);
                setError(confirm);
                valid = false;
            }
            if (valid) {
                alert("Registrace úspěšná!");
                this.showSection("movies");
            }
        });
    }
}
window.addEventListener('DOMContentLoaded', () => new App());
