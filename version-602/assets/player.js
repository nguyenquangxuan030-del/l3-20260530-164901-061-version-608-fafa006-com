(function () {
  var video = document.querySelector('[data-player]');
  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var overlay = document.querySelector('[data-player-toggle]');
  var startButton = document.querySelector('[data-player-start]');
  var muteButton = document.querySelector('[data-player-mute]');
  var fullscreenButton = document.querySelector('[data-player-fullscreen]');
  var hlsInstance = null;

  function attachSource() {
    if (!source) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    }
  }

  function updateOverlay() {
    if (overlay) {
      overlay.classList.toggle('playing', !video.paused);
    }
    if (startButton) {
      startButton.textContent = video.paused ? '立即播放' : '暂停播放';
    }
  }

  function togglePlay() {
    if (video.paused) {
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    } else {
      video.pause();
    }
    updateOverlay();
  }

  attachSource();

  if (overlay) {
    overlay.addEventListener('click', togglePlay);
  }

  if (startButton) {
    startButton.addEventListener('click', togglePlay);
  }

  if (muteButton) {
    muteButton.addEventListener('click', function () {
      video.muted = !video.muted;
      muteButton.textContent = video.muted ? '取消静音' : '静音';
    });
  }

  if (fullscreenButton) {
    fullscreenButton.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    });
  }

  video.addEventListener('play', updateOverlay);
  video.addEventListener('pause', updateOverlay);
  video.addEventListener('ended', updateOverlay);
  updateOverlay();

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
