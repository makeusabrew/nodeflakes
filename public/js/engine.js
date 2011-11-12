var Engine = (function() {
    var that = {};

    var _flakes = [],
        _delta = 0,
        _lastTick = 0,
        _tickTime = 0,
        _height;

    that.addRandomlyPositionedTweet = function(data) {
        var size = Math.round(10 + (data.user.followers_count / 100));

        var x = Math.floor(
            Math.random() * $(window).width() - size
        );
        var y = -(Math.floor(Math.random() * 20) + size);


        var flake = new Flake();
        flake.spawn({
            "x": x,
            "y": y,
            "tweet": data,
            "size": size
        });

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

            if (!_flakes[i].isDying() && _flakes[i].getProjectedBottom(2000) >= _height) {
                _flakes[i].startDeath(2000);
            }

            if (_flakes[i].isDead()) {
                console.log("removing flake ("+i+")");
                _flakes.splice(i, 1);
            }
        }
    }

    that.render = function() {
        var i = _flakes.length;
        while (i--) {
            //
            _flakes[i].render();
        }
    }


    that.start = function() {
        _height = $(document).height();
        tick();
    }

    that.getElement = function() {
        return $("body");
    }

    return that;
})();

var animFrame = null;

function tick() {
    animFrame = requestAnimFrame(tick);
    Engine.loop();
}
