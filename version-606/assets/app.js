(() => {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');

  const syncHeader = () => {
    if (!header || header.classList.contains('site-header-solid')) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  };

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (navToggle && header) {
    navToggle.addEventListener('click', () => {
      const opened = header.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const hero = document.querySelector('.hero-carousel');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const next = hero.querySelector('.hero-next');
    const prev = hero.querySelector('.hero-prev');
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle('active', idx === current));
      dots.forEach((dot, idx) => dot.classList.toggle('active', idx === current));
    };

    const startAuto = () => {
      clearInterval(timer);
      timer = setInterval(() => showSlide(current + 1), 5000);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.heroIndex || 0));
        startAuto();
      });
    });

    if (next) {
      next.addEventListener('click', () => {
        showSlide(current + 1);
        startAuto();
      });
    }

    if (prev) {
      prev.addEventListener('click', () => {
        showSlide(current - 1);
        startAuto();
      });
    }

    startAuto();
  }

  const applyCardFilter = (scope, input, select) => {
    const query = (input?.value || '').trim().toLowerCase();
    const year = select?.value || '';
    const cards = Array.from(scope.querySelectorAll('.movie-card, .ranking-item'));
    cards.forEach((card) => {
      const haystack = [
        card.dataset.title || '',
        card.dataset.region || '',
        card.dataset.genre || '',
        card.dataset.type || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      const matchedQuery = !query || haystack.includes(query);
      const matchedYear = !year || (card.dataset.year || '') === year;
      card.classList.toggle('is-hidden', !(matchedQuery && matchedYear));
    });
  };

  document.querySelectorAll('.list-section').forEach((section) => {
    const input = section.querySelector('.card-filter-input');
    const select = section.querySelector('.card-filter-select');
    if (!input && !select) {
      return;
    }
    const handler = () => applyCardFilter(section, input, select);
    input?.addEventListener('input', handler);
    select?.addEventListener('change', handler);
  });

  const initPlayer = (area) => {
    const video = area.querySelector('video');
    const button = area.querySelector('.player-start');
    const stream = area.dataset.stream;
    let hls = null;
    let loaded = false;

    const markError = () => {
      area.classList.add('has-error');
    };

    const load = () => {
      if (!video || !stream || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            markError();
          }
        });
      } else {
        video.src = stream;
      }
    };

    const play = () => {
      load();
      area.classList.add('is-playing');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          area.classList.remove('is-playing');
        });
      }
    };

    button?.addEventListener('click', play);
    video?.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });
    video?.addEventListener('play', () => area.classList.add('is-playing'));
    video?.addEventListener('pause', () => area.classList.remove('is-playing'));
    video?.addEventListener('error', markError);
    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.querySelectorAll('.player-area').forEach(initPlayer);

  const renderSearchResults = () => {
    const results = document.getElementById('search-results');
    const input = document.getElementById('search-page-input');
    if (!results || !Array.isArray(window.SEARCH_MOVIES)) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    const lower = query.toLowerCase();
    const matched = window.SEARCH_MOVIES.filter((movie) => {
      const haystack = [
        movie.title,
        movie.region,
        movie.year,
        movie.type,
        movie.genre,
        movie.oneLine,
        movie.summary,
        Array.isArray(movie.tags) ? movie.tags.join(' ') : ''
      ].join(' ').toLowerCase();
      return haystack.includes(lower);
    }).slice(0, 160);

    const title = document.getElementById('search-title');
    const desc = document.getElementById('search-desc');
    if (title) {
      title.textContent = `“${query}” 的搜索结果`;
    }
    if (desc) {
      desc.textContent = matched.length ? '以下内容与搜索关键词相关。' : '暂未找到完全匹配的内容，可尝试更换关键词。';
    }

    results.innerHTML = matched.map((movie) => {
      const tags = [movie.genre].concat(movie.tags || []).filter(Boolean).slice(0, 4);
      return `
    <article class="movie-card movie-card-small" data-title="${escapeHtml(movie.title)}" data-year="${escapeHtml(movie.year)}" data-region="${escapeHtml(movie.region)}" data-genre="${escapeHtml(movie.genre)}" data-type="${escapeHtml(movie.type)}">
      <a class="poster-link" href="${escapeHtml(movie.url)}">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="type-badge">${escapeHtml(movie.type)}</span>
      </a>
      <div class="movie-card-body">
        <div class="movie-card-meta">
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.score)}分</span>
        </div>
        <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine || movie.summary || '')}</p>
        <div class="tag-list">
          ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
    </article>`;
    }).join('');
  };

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  renderSearchResults();
})();
