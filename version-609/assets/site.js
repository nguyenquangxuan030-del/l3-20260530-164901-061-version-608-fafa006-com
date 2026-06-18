(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function setActive(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        setActive(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        setActive(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setActive(index + 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setActive(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    setActive(0);
    play();
  }

  const localFilter = document.querySelector('[data-local-filter]');

  if (localFilter) {
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    localFilter.addEventListener('input', function () {
      const keyword = localFilter.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
        card.hidden = Boolean(keyword) && !text.includes(keyword);
      });
    });
  }

  const searchForm = document.querySelector('[data-search-form]');

  if (searchForm && window.SEARCH_MOVIES) {
    const input = document.querySelector('[data-search-input]');
    const results = document.querySelector('[data-search-results]');
    const section = document.querySelector('[data-search-section]');
    const title = document.querySelector('[data-search-title]');
    const empty = document.querySelector('[data-search-empty]');
    const defaults = document.querySelector('[data-search-default]');
    const params = new URLSearchParams(window.location.search);

    function cardTemplate(movie) {
      return [
        '<article class="movie-card compact-card">',
        '  <a class="poster-frame" href="' + movie.href + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + movie.rating + '</span></div>',
        '    <h2><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h2>',
        '    <p>' + escapeHtml(movie.description) + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function search(keyword) {
      const query = keyword.trim().toLowerCase();
      if (!query) {
        section.hidden = true;
        defaults.hidden = false;
        results.innerHTML = '';
        return;
      }
      const matches = window.SEARCH_MOVIES.filter(function (movie) {
        return movie.search.includes(query);
      }).slice(0, 120);
      defaults.hidden = true;
      section.hidden = false;
      title.textContent = '“' + keyword + '” 的相关影片';
      empty.hidden = matches.length > 0;
      results.innerHTML = matches.map(cardTemplate).join('');
    }

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const keyword = input.value.trim();
      const url = new URL(window.location.href);
      if (keyword) {
        url.searchParams.set('q', keyword);
      } else {
        url.searchParams.delete('q');
      }
      history.replaceState(null, '', url.toString());
      search(keyword);
    });

    const initial = params.get('q') || '';
    input.value = initial;
    search(initial);
  }
}());
