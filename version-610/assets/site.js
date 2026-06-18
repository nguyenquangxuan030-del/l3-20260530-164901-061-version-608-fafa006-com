(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length > 1) {
        var current = 0;
        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    filterInputs.forEach(function (input) {
        var scope = document.querySelector(input.getAttribute('data-filter-input')) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var empty = scope.querySelector('[data-empty-state]');
        var apply = function () {
            var q = input.value.trim().toLowerCase();
            var shown = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                var matched = !q || text.indexOf(q) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.style.display = shown ? 'none' : 'block';
            }
        };
        input.addEventListener('input', apply);
        apply();
    });

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get('q') || '';
        var input = document.querySelector('[data-search-input]');
        if (input) {
            input.value = keyword;
            input.dispatchEvent(new Event('input'));
        }
    }
})();
