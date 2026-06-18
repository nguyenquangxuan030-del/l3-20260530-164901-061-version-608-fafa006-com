const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupNavigation() {
    const toggle = qs('[data-nav-toggle]');
    const nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function setupHero() {
    const root = qs('[data-hero]');
    if (!root) {
        return;
    }
    const slides = qsa('[data-hero-slide]', root);
    const dots = qsa('[data-hero-dot]', root);
    const prev = qs('[data-hero-prev]', root);
    const next = qs('[data-hero-next]', root);
    if (slides.length === 0) {
        return;
    }
    let index = 0;
    let timer = null;
    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, itemIndex) => {
            slide.classList.toggle('is-active', itemIndex === index);
        });
        dots.forEach((dot, itemIndex) => {
            dot.classList.toggle('is-active', itemIndex === index);
        });
    };
    const restart = () => {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = window.setInterval(() => show(index + 1), 5200);
    };
    prev?.addEventListener('click', () => {
        show(index - 1);
        restart();
    });
    next?.addEventListener('click', () => {
        show(index + 1);
        restart();
    });
    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            show(Number(dot.dataset.heroDot || 0));
            restart();
        });
    });
    show(0);
    restart();
}

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function currentQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
}

function setupSearchForms() {
    qsa('[data-search-form]').forEach((form) => {
        const input = qs('input[name="q"]', form);
        if (!input) {
            return;
        }
        if (!input.value && currentQuery()) {
            input.value = currentQuery();
        }
        form.addEventListener('submit', (event) => {
            const value = input.value.trim();
            if (!value) {
                event.preventDefault();
                window.location.href = 'search.html';
            }
        });
    });
}

function setupListingFilters() {
    const grid = qs('[data-listing-grid]');
    if (!grid) {
        return;
    }
    const items = qsa('[data-search-item]', grid);
    const liveForm = qs('[data-live-search]');
    const liveInput = liveForm ? qs('input', liveForm) : null;
    const buttons = qsa('[data-filter-value]');
    let selected = '';
    const apply = () => {
        const query = normalize(liveInput ? liveInput.value : currentQuery());
        const filter = normalize(selected);
        items.forEach((item) => {
            const text = normalize(item.dataset.searchText);
            const matchQuery = !query || text.includes(query);
            const matchFilter = !filter || text.includes(filter);
            item.classList.toggle('is-hidden-by-filter', !(matchQuery && matchFilter));
        });
    };
    if (liveInput) {
        liveInput.value = currentQuery();
        liveInput.addEventListener('input', apply);
        liveForm.addEventListener('submit', (event) => event.preventDefault());
    }
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            selected = button.dataset.filterValue || '';
            buttons.forEach((item) => item.classList.remove('is-active'));
            button.classList.add('is-active');
            apply();
        });
    });
    apply();
}

async function attachHls(video, url) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return;
    }
    const Hls = window.Hls;
    if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hlsPlayer = hls;
        return;
    }
    video.src = url;
}

function setupPlayer() {
    const video = qs('.player-video[data-video-src]');
    if (!video) {
        return;
    }
    const overlay = qs('.play-overlay');
    let loading = false;
    const start = async () => {
        if (loading) {
            return;
        }
        loading = true;
        if (!video.dataset.ready) {
            await attachHls(video, video.dataset.videoSrc);
            video.dataset.ready = 'true';
        }
        overlay?.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        try {
            await video.play();
        } catch (error) {
            overlay?.classList.remove('is-hidden');
        }
        loading = false;
    };
    overlay?.addEventListener('click', start);
    video.addEventListener('click', () => {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', () => overlay?.classList.add('is-hidden'));
    video.addEventListener('pause', () => {
        if (!video.ended) {
            overlay?.classList.remove('is-hidden');
        }
    });
}

setupNavigation();
setupHero();
setupSearchForms();
setupListingFilters();
setupPlayer();
