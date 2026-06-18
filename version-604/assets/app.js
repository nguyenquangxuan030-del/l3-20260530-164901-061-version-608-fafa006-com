(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initHeader() {
    var header = document.querySelector("[data-header]");
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!header) {
      return;
    }
    var update = function () {
      if (window.scrollY > 18 || document.body.classList.contains("inner-page")) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    if (button && nav) {
      button.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
      nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          nav.classList.remove("is-open");
        });
      });
    }
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;
    var show = function (target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    };
    var start = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    show(0);
    start();
  }

  function matchYear(cardYear, selected) {
    if (!selected) {
      return true;
    }
    var year = parseInt(cardYear, 10);
    if (selected === "2010") {
      return year >= 2010 && year <= 2019;
    }
    if (selected === "2000") {
      return year >= 2000 && year <= 2009;
    }
    return String(year) === selected;
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var search = root.querySelector("[data-search-input]");
      var type = root.querySelector("[data-type-filter]");
      var category = root.querySelector("[data-category-filter]");
      var year = root.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
      var empty = root.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      if (search && params.get("q")) {
        search.value = params.get("q");
      }
      var apply = function () {
        var q = search ? search.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";
        var categoryValue = category ? category.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.category,
            card.dataset.year
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (typeValue && card.dataset.type !== typeValue) {
            ok = false;
          }
          if (categoryValue && card.dataset.category !== categoryValue) {
            ok = false;
          }
          if (!matchYear(card.dataset.year, yearValue)) {
            ok = false;
          }
          card.classList.toggle("hidden-card", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      [search, type, category, year].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initHomeSearch() {
    document.querySelectorAll("[data-home-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var q = input ? input.value.trim() : "";
        var target = form.getAttribute("data-target") || "search.html";
        window.location.href = q ? target + "?q=" + encodeURIComponent(q) : target;
      });
    });
  }

  function initPlayer(sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var playButton = document.getElementById("playButton");
    if (!video || !sourceUrl) {
      return;
    }
    var attached = false;
    var attach = function () {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = sourceUrl;
      }
    };
    var play = function () {
      attach();
      if (playButton) {
        playButton.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    };
    if (playButton) {
      playButton.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (playButton) {
        playButton.classList.add("is-hidden");
      }
    });
  }

  window.initMoviePlayer = initPlayer;

  ready(function () {
    initHeader();
    initHero();
    initFilters();
    initHomeSearch();
  });
})();
