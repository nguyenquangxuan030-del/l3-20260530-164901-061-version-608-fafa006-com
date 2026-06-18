(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(
        slider.querySelectorAll("[data-hero-slide]"),
      );
      var dots = Array.prototype.slice.call(
        slider.querySelectorAll("[data-hero-dot]"),
      );
      var previous = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function startTimer() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          startTimer();
        });
      });

      if (previous) {
        previous.addEventListener("click", function () {
          show(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          startTimer();
        });
      }

      show(0);
      startTimer();
    }

    var filterRoot = document.querySelector("[data-filter-root]");
    if (filterRoot) {
      var buttons = Array.prototype.slice.call(
        filterRoot.querySelectorAll("[data-filter-year]"),
      );
      var cards = Array.prototype.slice.call(
        document.querySelectorAll("[data-movie-card]"),
      );
      var empty = document.querySelector("[data-empty]");

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var selected = button.getAttribute("data-filter-year");
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          var visible = 0;
          cards.forEach(function (card) {
            var matched =
              selected === "all" || card.getAttribute("data-year") === selected;
            card.style.display = matched ? "" : "none";
            if (matched) {
              visible += 1;
            }
          });
          if (empty) {
            empty.style.display = visible ? "none" : "block";
          }
        });
      });
    }

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage && Array.isArray(window.MOVIE_INDEX)) {
      var form = searchPage.querySelector("[data-search-form]");
      var input = searchPage.querySelector("[data-search-input]");
      var results = searchPage.querySelector("[data-search-results]");
      var state = searchPage.querySelector("[data-search-state]");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      input.value = initial;

      function card(item) {
        var tags = item.tags
          .slice(0, 3)
          .map(function (tag) {
            return '<span class="tag">' + escapeHtml(tag) + "</span>";
          })
          .join("");
        return [
          '<article class="movie-card">',
          '<a class="poster-wrap" href="' + item.url + '">',
          '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">',
          '<span class="card-badge">' + item.year + "</span>",
          '<span class="play-mask">▶</span>',
          "</a>",
          '<div class="card-body">',
          '<h3><a href="' +
            item.url +
            '">' +
            escapeHtml(item.title) +
            "</a></h3>",
          '<p class="card-meta">' +
            escapeHtml(item.region) +
            " · " +
            escapeHtml(item.type) +
            " · " +
            escapeHtml(item.genre) +
            "</p>",
          '<p class="card-desc">' + escapeHtml(item.oneLine) + "</p>",
          '<div class="tag-row">' + tags + "</div>",
          "</div>",
          "</article>",
        ].join("");
      }

      function escapeHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function runSearch(query) {
        var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        if (!words.length) {
          results.innerHTML = "";
          state.textContent = "输入片名、地区、类型或标签，发现更多精彩内容。";
          return;
        }
        var matched = window.MOVIE_INDEX.filter(function (item) {
          var haystack = [
            item.title,
            item.region,
            item.type,
            item.genre,
            item.oneLine,
            item.tags.join(" "),
          ]
            .join(" ")
            .toLowerCase();
          return words.every(function (word) {
            return haystack.indexOf(word) !== -1;
          });
        }).slice(0, 120);
        state.textContent = matched.length
          ? "为你找到相关内容"
          : "没有找到相关内容，换个关键词试试。";
        results.innerHTML = matched.map(card).join("");
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = input.value.trim();
        var url = new URL(window.location.href);
        if (value) {
          url.searchParams.set("q", value);
        } else {
          url.searchParams.delete("q");
        }
        history.replaceState(null, "", url.toString());
        runSearch(value);
      });

      runSearch(initial);
    }
  });
})();
