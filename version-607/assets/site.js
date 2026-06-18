(function() {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function() {
        move(1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        move(-1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        move(1);
        startTimer();
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        startTimer();
      });
    });

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
    show(0);
    startTimer();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-search-input]")).forEach(function(input) {
    var scope = input.closest("main") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var clearButton = input.parentElement ? input.parentElement.querySelector("[data-clear-search]") : null;

    function apply() {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function(card) {
        var text = (card.getAttribute("data-card-text") || card.textContent || "").toLowerCase();
        card.hidden = query.length > 0 && text.indexOf(query) === -1;
      });
    }

    input.addEventListener("input", apply);
    if (clearButton) {
      clearButton.addEventListener("click", function() {
        input.value = "";
        apply();
        input.focus();
      });
    }
  });
})();
