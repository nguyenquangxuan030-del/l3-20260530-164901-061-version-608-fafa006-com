(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    if (!video || !cover) {
      return;
    }

    var url = video.getAttribute("data-video-url");
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          setTimeout(resolve, 1600);
        });
      }
      video.src = url;
      return Promise.resolve();
    }

    function start() {
      prepare().then(function () {
        cover.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            cover.classList.remove("is-hidden");
          });
        }
      });
    }

    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!prepared) {
        start();
      }
    });
  });
})();
