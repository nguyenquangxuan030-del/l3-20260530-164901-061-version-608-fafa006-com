(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
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

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                restart();
            });
        });
        restart();
    }

    function initScrollControls() {
        document.querySelectorAll('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
            button.addEventListener('click', function () {
                var id = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
                var strip = document.getElementById(id);
                if (!strip) {
                    return;
                }
                var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;
                strip.scrollBy({ left: direction * 420, behavior: 'smooth' });
            });
        });
    }

    function initFilters() {
        document.querySelectorAll('[data-filter-input]').forEach(function (input) {
            var scopeSelector = input.getAttribute('data-filter-scope');
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-text]'));
            var noResult = input.closest('section') ? input.closest('section').querySelector('[data-no-result]') : document.querySelector('[data-no-result]');

            function applyFilter() {
                var term = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search-text') || '').toLowerCase();
                    var match = !term || haystack.indexOf(term) !== -1;
                    card.style.display = match ? '' : 'none';
                    if (match) {
                        visible += 1;
                    }
                });
                if (noResult) {
                    noResult.classList.toggle('show', visible === 0);
                }
            }

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && !input.value) {
                input.value = q;
            }
            input.addEventListener('input', applyFilter);
            applyFilter();
        });
    }

    window.setupMoviePlayer = function (playerId, mediaUrl) {
        var box = document.getElementById(playerId);
        if (!box) {
            return;
        }
        var video = box.querySelector('video');
        var overlay = box.querySelector('.play-overlay');
        var prepared = false;

        function prepare() {
            if (prepared || !video) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(mediaUrl);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = mediaUrl;
            }
            prepared = true;
        }

        function play() {
            prepare();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var started = video.play();
            if (started && typeof started.catch === 'function') {
                started.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!prepared || video.paused) {
                    play();
                }
            });
        }
    };

    ready(function () {
        initMenu();
        initHero();
        initScrollControls();
        initFilters();
    });
}());
