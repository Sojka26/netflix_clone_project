// script.ts – SPA s rozšířeným vyhledáváním a offline fallbackem na lokální postery

interface ShowImage { medium: string; }
interface ShowData { show: { name: string; image: ShowImage | null } }
type SectionId = 'home' | 'movies' | 'register';

const normalizeHttps = (url?: string) => url ? url.replace(/^http:\/\//, 'https://') : undefined;
const LOCAL_PLACEHOLDER = 'images/movies-bg.jpeg';

const localPosters: Record<string, string> = {
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

const offlineCatalog: Array<{ title: string; file: string }> = Object.entries(localPosters)
  .map(([k, f]) => ({ title: k, file: f }));

const toKey = (name: string) => name.toLowerCase().replace(/[:!.,']/g, '').replace(/\s+/g, ' ').trim();
const findLocalPoster = (title: string): string | undefined => {
  const key = toKey(title);
  if (localPosters[key]) return `images/${localPosters[key]}`;
  for (const k of Object.keys(localPosters)) if (key.includes(k)) return `images/${localPosters[k]}`;
  return undefined;
};

class App {
  private sections: Record<SectionId, HTMLElement | null> = { home: null, movies: null, register: null };
  private moviesGrid!: HTMLElement;
  private currentFetchController: AbortController | null = null;

  constructor() {
    this.sections.home = document.getElementById('home');
    this.sections.movies = document.getElementById('movies');
    this.sections.register = document.getElementById('register');
    this.init();
  }

  private init(): void {
    this.setupRouting();
    this.setupScrollTop();
    this.initMoviesFeatures();
    this.initRegisterFeatures();
    const initial = (location.hash.replace('#', '') as SectionId) || 'home';
    this.showSection(initial);
  }

  private showSection(id: SectionId): void {
    (Object.keys(this.sections) as SectionId[]).forEach(key => {
      const el = this.sections[key];
      if (!el) return;
      el.hidden = key !== id;
    });
    if (id === 'home') history.replaceState({}, '', location.pathname);
    else location.hash = id;
  }

  private setupRouting(): void {
    document.querySelectorAll('[data-target]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = (e.currentTarget as HTMLElement).getAttribute('data-target') as SectionId | null;
        if (target) this.showSection(target);
      });
    });
    window.addEventListener('hashchange', () => {
      const id = (location.hash.replace('#', '') as SectionId) || 'home';
      this.showSection(id);
    });
  }

  private setupScrollTop(): void {
    const btn = document.getElementById('scrollTopBtn') as HTMLButtonElement | null;
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.style.display = (document.documentElement.scrollTop > 200 || document.body.scrollTop > 200) ? 'block' : 'none';
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  private initMoviesFeatures(): void {
    const grid = document.getElementById('moviesGrid') as HTMLElement | null;
    const featured = document.getElementById('featuredRow') as HTMLElement | null;
    const searchBtn = document.getElementById('searchBtn') as HTMLButtonElement | null;
    const moreBtn = document.getElementById('moreBtn') as HTMLButtonElement | null;
    const genreSelect = document.getElementById('genreSelect') as HTMLSelectElement | null;
    const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
    if (!grid) return;
    this.moviesGrid = grid;

    const renderOffline = () => {
      if (featured && !featured.hidden) featured.hidden = true;
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

    const runSearch = async (q: string) => {
      if (!q) { renderOffline(); return; }
      if (featured && !featured.hidden) featured.hidden = true;
      this.moviesGrid.hidden = false;
      this.moviesGrid.innerHTML = '';
      this.moviesGrid.setAttribute('aria-busy', 'true');
      // Abort previous request
      try {
        this.currentFetchController?.abort();
      } catch {}
      const controller = new AbortController();
      this.currentFetchController = controller;
      try {
        const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}` , { signal: controller.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data: ShowData[] = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          renderOffline();
          return;
        }
        this.renderShows(data);
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return; // superseded
        console.warn('API nedostupné, zobrazím offline katalog:', err);
        renderOffline();
      } finally {
        this.moviesGrid.setAttribute('aria-busy', 'false');
      }
    };

    const resolveQuery = () => {
      const text = (searchInput?.value || '').trim();
      if (text) return text;
      return genreSelect?.value || 'girl';
    };

    // Debounced live search on typing (3+ chars)
    const debounced = this.debounce((value: string) => {
      if (value.trim().length >= 3) runSearch(value.trim());
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

  private renderShows(shows: ShowData[]): void {
    this.moviesGrid.innerHTML = '';
    shows.forEach(({ show }) => {
      const img = document.createElement('img');
      const apiUrl = normalizeHttps(show.image?.medium);
      const localUrl = findLocalPoster(show.name);
      img.src = apiUrl ?? localUrl ?? LOCAL_PLACEHOLDER;
      img.alt = show.name;
      img.loading = 'lazy';
      img.onerror = () => { img.src = localUrl ?? LOCAL_PLACEHOLDER; (img as any).onerror = null; };
      this.moviesGrid.appendChild(img);
    });
  }

  private debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
    let timeoutId: number | undefined;
    return ((...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => fn(...args), ms);
    }) as T;
  }

  private initRegisterFeatures(): void {
    const form = document.getElementById('regForm') as HTMLFormElement | null;
    const first = document.getElementById('firstName') as HTMLInputElement | null;
    const last = document.getElementById('lastName') as HTMLInputElement | null;
    const email = document.getElementById('email') as HTMLInputElement | null;
    const pw = document.getElementById('password') as HTMLInputElement | null;
    const confirm = document.getElementById('confirm') as HTMLInputElement | null;
    if (!form || !first || !last || !email || !pw || !confirm) return;

    const clearError = (el: HTMLInputElement) => el.classList.remove('error');
    const setError = (el: HTMLInputElement) => el.classList.add('error');

    const validatePasswords = () => {
      clearError(pw); clearError(confirm);
      if (pw.value && confirm.value && pw.value !== confirm.value) { setError(pw); setError(confirm); }
    };

    form.addEventListener('input', (e) => {
      const t = e.target as HTMLInputElement;
      clearError(t);
      if (t === pw || t === confirm) validatePasswords();
    });

    form.addEventListener('submit', (e) => {
      let valid = true;
      [first, last, email, pw, confirm].forEach((el) => { if (!el.value.trim()) { setError(el); valid = false; } });
      if (email.value && !email.checkValidity()) { setError(email); valid = false; }
      if (pw.value !== confirm.value) { setError(pw); setError(confirm); valid = false; }
      if (!valid) e.preventDefault();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => new App());
