(function () {
  function closestForm(element) {
    return element && element.closest ? element.closest('form') : null;
  }

  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
      toggle.textContent = panel.classList.contains('open') ? '×' : '☰';
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var target = './search.html';
      window.location.href = value ? target + '?q=' + encodeURIComponent(value) : target;
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        activate(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function filterCards(value) {
    var term = (value || '').toLowerCase().trim();
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      var matched = !term || haystack.indexOf(term) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    document.querySelectorAll('[data-empty-state]').forEach(function (empty) {
      empty.classList.toggle('show', visible === 0);
    });
  }

  document.querySelectorAll('[data-local-filter]').forEach(function (form) {
    var input = form.querySelector('input');
    if (!input) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards(input.value);
    });
    input.addEventListener('input', function () {
      filterCards(input.value);
    });
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  if (query) {
    var searchInput = document.querySelector('[data-local-filter] input');
    if (searchInput) {
      searchInput.value = query;
      filterCards(query);
      searchInput.focus();
    }
  }

  document.addEventListener('click', function (event) {
    var form = closestForm(event.target);
    if (!form || !form.hasAttribute('data-local-filter')) {
      return;
    }
  });
})();
