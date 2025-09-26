// script.ts – netflix clone
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var normalizeHttps = function (url) { return url ? url.replace(/^http:\/\//, 'https://') : undefined; };
var LOCAL_PLACEHOLDER = 'images/movies-bg.jpeg';
var localPosters = {
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
var offlineCatalog = Object.entries(localPosters)
    .map(function (_a) {
    var k = _a[0], f = _a[1];
    return ({ title: k, file: f });
});
var toKey = function (name) { return name.toLowerCase().replace(/[:!.,']/g, '').replace(/\s+/g, ' ').trim(); };
var findLocalPoster = function (title) {
    var key = toKey(title);
    if (localPosters[key])
        return "images/".concat(localPosters[key]);
    for (var _i = 0, _a = Object.keys(localPosters); _i < _a.length; _i++) {
        var k = _a[_i];
        if (key.includes(k))
            return "images/".concat(localPosters[k]);
    }
    return undefined;
};
var App = /** @class */ (function () {
    function App() {
        this.sections = { home: null, movies: null, register: null };
        this.currentFetchController = null;
        this.sections.home = document.getElementById('home');
        this.sections.movies = document.getElementById('movies');
        this.sections.register = document.getElementById('register');
        this.init();
    }
    App.prototype.init = function () {
        this.setupRouting();
        this.setupScrollTop();
        this.initMoviesFeatures();
        this.initRegisterFeatures();
        var initial = location.hash.replace('#', '') || 'home';
        this.showSection(initial);
    };
    App.prototype.showSection = function (id) {
        var _this = this;
        Object.keys(this.sections).forEach(function (key) {
            var el = _this.sections[key];
            if (!el)
                return;
            el.hidden = key !== id;
        });
        if (id === 'home')
            history.replaceState({}, '', location.pathname);
        else
            location.hash = id;
    };
    App.prototype.setupRouting = function () {
        var _this = this;
        document.querySelectorAll('[data-target]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                var target = e.currentTarget.getAttribute('data-target');
                if (target)
                    _this.showSection(target);
            });
        });
        window.addEventListener('hashchange', function () {
            var id = location.hash.replace('#', '') || 'home';
            _this.showSection(id);
        });
    };
    App.prototype.setupScrollTop = function () {
        var btn = document.getElementById('scrollTopBtn');
        if (!btn)
            return;
        window.addEventListener('scroll', function () {
            btn.style.display = (document.documentElement.scrollTop > 200 || document.body.scrollTop > 200) ? 'block' : 'none';
        });
        btn.addEventListener('click', function () { return window.scrollTo({ top: 0, behavior: 'smooth' }); });
    };
    App.prototype.initMoviesFeatures = function () {
        var _this = this;
        var grid = document.getElementById('moviesGrid');
        var featured = document.getElementById('featuredRow');
        var searchBtn = document.getElementById('searchBtn');
        var moreBtn = document.getElementById('moreBtn');
        var genreSelect = document.getElementById('genreSelect');
        var searchInput = document.getElementById('searchInput');
        if (!grid)
            return;
        this.moviesGrid = grid;
        var renderOffline = function () {
            if (featured && !featured.hidden)
                featured.hidden = true;
            _this.moviesGrid.hidden = false;
            _this.moviesGrid.innerHTML = '';
            offlineCatalog.forEach(function (_a) {
                var title = _a.title, file = _a.file;
                var img = document.createElement('img');
                img.src = "images/".concat(file);
                img.alt = title;
                img.loading = 'lazy';
                _this.moviesGrid.appendChild(img);
            });
        };
        var runSearch = function (q) { return __awaiter(_this, void 0, void 0, function () {
            var controller, res, data, err_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!q) {
                            renderOffline();
                            return [2 /*return*/];
                        }
                        if (featured && !featured.hidden)
                            featured.hidden = true;
                        this.moviesGrid.hidden = false;
                        this.moviesGrid.innerHTML = '';
                        this.moviesGrid.setAttribute('aria-busy', 'true');
                        // Abort previous request
                        try {
                            (_a = this.currentFetchController) === null || _a === void 0 ? void 0 : _a.abort();
                        }
                        catch (_c) { }
                        controller = new AbortController();
                        this.currentFetchController = controller;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetch("https://api.tvmaze.com/search/shows?q=".concat(encodeURIComponent(q)), { signal: controller.signal })];
                    case 2:
                        res = _b.sent();
                        if (!res.ok)
                            throw new Error('HTTP ' + res.status);
                        return [4 /*yield*/, res.json()];
                    case 3:
                        data = _b.sent();
                        if (!Array.isArray(data) || data.length === 0) {
                            renderOffline();
                            return [2 /*return*/];
                        }
                        this.renderShows(data);
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _b.sent();
                        if ((err_1 === null || err_1 === void 0 ? void 0 : err_1.name) === 'AbortError')
                            return [2 /*return*/]; // superseded
                        console.warn('API nedostupné, zobrazím offline katalog:', err_1);
                        renderOffline();
                        return [3 /*break*/, 6];
                    case 5:
                        this.moviesGrid.setAttribute('aria-busy', 'false');
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        var resolveQuery = function () {
            var text = ((searchInput === null || searchInput === void 0 ? void 0 : searchInput.value) || '').trim();
            if (text)
                return text;
            return (genreSelect === null || genreSelect === void 0 ? void 0 : genreSelect.value) || 'girl';
        };
        // Debounced live search on typing (3+ chars)
        var debounced = this.debounce(function (value) {
            if (value.trim().length >= 3)
                runSearch(value.trim());
        }, 350);
        searchBtn === null || searchBtn === void 0 ? void 0 : searchBtn.addEventListener('click', function () { return runSearch(resolveQuery()); });
        moreBtn === null || moreBtn === void 0 ? void 0 : moreBtn.addEventListener('click', function () { return runSearch(resolveQuery()); });
        searchInput === null || searchInput === void 0 ? void 0 : searchInput.addEventListener('input', function () { return debounced(searchInput.value); });
        searchInput === null || searchInput === void 0 ? void 0 : searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                runSearch(resolveQuery());
            }
        });
    };
    App.prototype.renderShows = function (shows) {
        var _this = this;
        this.moviesGrid.innerHTML = '';
        shows.forEach(function (_a) {
            var _b, _c;
            var show = _a.show;
            var img = document.createElement('img');
            var apiUrl = normalizeHttps((_b = show.image) === null || _b === void 0 ? void 0 : _b.medium);
            var localUrl = findLocalPoster(show.name);
            img.src = (_c = apiUrl !== null && apiUrl !== void 0 ? apiUrl : localUrl) !== null && _c !== void 0 ? _c : LOCAL_PLACEHOLDER;
            img.alt = show.name;
            img.loading = 'lazy';
            img.onerror = function () { img.src = localUrl !== null && localUrl !== void 0 ? localUrl : LOCAL_PLACEHOLDER; img.onerror = null; };
            _this.moviesGrid.appendChild(img);
        });
    };
    App.prototype.debounce = function (fn, ms) {
        var timeoutId;
        return (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (timeoutId)
                clearTimeout(timeoutId);
            timeoutId = window.setTimeout(function () { return fn.apply(void 0, args); }, ms);
        });
    };
    App.prototype.initRegisterFeatures = function () {
        var form = document.getElementById('regForm');
        var first = document.getElementById('firstName');
        var last = document.getElementById('lastName');
        var email = document.getElementById('email');
        var pw = document.getElementById('password');
        var confirm = document.getElementById('confirm');
        if (!form || !first || !last || !email || !pw || !confirm)
            return;
        var clearError = function (el) { return el.classList.remove('error'); };
        var setError = function (el) { return el.classList.add('error'); };
        var validatePasswords = function () {
            clearError(pw);
            clearError(confirm);
            if (pw.value && confirm.value && pw.value !== confirm.value) {
                setError(pw);
                setError(confirm);
            }
        };
        form.addEventListener('input', function (e) {
            var t = e.target;
            clearError(t);
            if (t === pw || t === confirm)
                validatePasswords();
        });
        form.addEventListener('submit', function (e) {
            var valid = true;
            [first, last, email, pw, confirm].forEach(function (el) { if (!el.value.trim()) {
                setError(el);
                valid = false;
            } });
            if (email.value && !email.checkValidity()) {
                setError(email);
                valid = false;
            }
            if (pw.value !== confirm.value) {
                setError(pw);
                setError(confirm);
                valid = false;
            }
            if (!valid)
                e.preventDefault();
        });
    };
    return App;
}());
window.addEventListener('DOMContentLoaded', function () { return new App(); });
