(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.stream-player'));
    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-cover');
        var src = player.getAttribute('data-stream');
        var ready = false;
        var hls = null;

        var setup = function () {
            if (ready || !video || !src) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        };

        var start = function () {
            setup();
            player.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };

        if (button) {
            button.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('ended', function () {
                player.classList.remove('is-playing');
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
