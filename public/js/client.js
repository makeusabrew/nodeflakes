// requestAnimFrame / cancelRequestanimFrame shims: http://notes.jetienne.com/2011/05/18/cancelRequestAnimFrame-for-paul-irish-requestAnimFrame.html
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback, /* DOMElement */ element){
            return window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
})();


var Client = (function() {
    var socket = null,
        _host = null,
        _port = null;

    var that = {};

    that.start = function(host, port) {
        _host = host;
        _port = port;

        that.connect();

        SoundManager.preloadSound("http://"+_host+":"+_port+"/sounds/hallelujah.mp3", "nodeflake");
        SoundManager.playSound('nodeflake');
        SoundManager.pauseSound('nodeflake');

        Engine.start();
    }

    that.getHost = function() {
        return _host;
    }

    that.getPort = function() {
        return _port;
    }

    that.connect = function() {
        socket = io.connect("http://"+_host, {
            port: _port
        });

        socket.on('connect', function() {
            console.log("connected");
            socket.on('tweet', function(tweet) {
                var data = null;
                try {
                    data = JSON.parse(tweet);
                } catch (e) {
                    console.log("could not parse tweet: "+tweet);
                }
                if (data) {
                    Engine.addRandomlyPositionedTweet(data);
                }
            });
        });

        socket.on('disconnect', function() {
            console.log('disconnect');
            socket.removeAllListeners('tweet');
        });
    }

    that.reconnect = function() {
        socket.socket.reconnect();
    }

    that.disconnect = function() {
        socket.disconnect();
    }

    return that;

})();
