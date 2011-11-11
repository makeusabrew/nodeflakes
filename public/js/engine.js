var Engine = (function() {
    var that = {};

    var _flakes = [],
        _delta = 0,
        _lastTick = 0,
        _tickTime = 0;

    that.addRandomlyPositionedTweet = function(data) {
        var x = Math.floor(
            Math.random() * $(window).width()
        );
        var y = Math.floor(
            Math.random() * ($(window).height() * 0.75)
        );

        var flake = new Flake();
        flake.spawn({
            "x": x,
            "y": y,
            "tweet": data
        });
        $("#tweets").append(flake.elem);

        _flakes.push(flake);
    }

    that.loop = function() {
        _tickTime = new Date().getTime();
        // we want a delta in *seconds*, to make it easier to scale our values
        _delta = (_tickTime - _lastTick) / 1000;
        _lastTick = _tickTime;

        that.tick();
        that.render();
    }

    that.tick = function() {
        var i = _flakes.length;
        while (i--) {
            //
            _flakes[i].tick(_delta);
        }
    }

    that.render = function() {
        var i = _flakes.length;
        while (i--) {
            //
            _flakes[i].render();
        }
    }

    return that;
})();

var animFrame = null;

function tick() {
    animFrame = requestAnimFrame(tick);
    Engine.loop();
}
