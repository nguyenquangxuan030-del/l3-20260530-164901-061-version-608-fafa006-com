(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function updateHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 24) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot'));
        showSlide(index);
        startTimer();
      });
    });

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  });

  document.querySelectorAll('[data-library-filter]').forEach(function (panel) {
    var scope = panel.closest('section') || document;
    var searchInput = panel.querySelector('[data-search-input]');
    var typeFilter = panel.querySelector('[data-type-filter]');
    var visibleCount = panel.querySelector('[data-visible-count]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(searchInput && searchInput.value);
      var type = normalize(typeFilter && typeFilter.value);
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-type')
        ].join(' '));
        var cardType = normalize(card.getAttribute('data-type'));
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        var typeMatched = !type || cardType.indexOf(type) !== -1;
        var shouldShow = keywordMatched && typeMatched;

        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          shown += 1;
        }
      });

      if (visibleCount) {
        visibleCount.textContent = shown;
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilter);
    }

    applyFilter();
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var status = player.querySelector('[data-player-status]');
    var hlsInstance = null;
    var started = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击播放器。');
        });
      }
    }

    function startPlayer() {
      if (!video || started) {
        playVideo();
        return;
      }

      started = true;
      var source = video.getAttribute('data-hls');

      if (!source) {
        setStatus('播放源暂不可用。');
        return;
      }

      setStatus('正在加载高清播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          player.classList.add('is-playing');
          setStatus('播放源加载完成。');
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，请刷新页面后重试。');
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          player.classList.add('is-playing');
          setStatus('播放源加载完成。');
          playVideo();
        }, { once: true });
      } else {
        video.src = source;
        player.classList.add('is-playing');
        setStatus('已尝试使用浏览器原生方式播放。');
        playVideo();
      }
    }

    if (button) {
      button.addEventListener('click', startPlayer);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          setStatus('播放已暂停。');
        }
      });
    }
  });
})();
