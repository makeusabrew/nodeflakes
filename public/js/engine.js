var Engine = (function() {
    var that = {};

    var _flakes = [];

    that.addRandomlyPositionedTweet = function(data) {
        var x = Math.floor(
            Math.random() * $(window).width()
        );
        var y = Math.floor(
            Math.random() * $(window).height()
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
        that.tick();
        that.render();
    }

    that.tick = function() {
        var i = _flakes.length;
        while (i--) {
            //
            _flakes[i].render();
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
