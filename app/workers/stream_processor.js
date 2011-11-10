var push = null;
var pull = null;

var StreamProcessor = function() {
    this.start = function() {
        pull.on('message', function(data) {
            console.log("processing message");
            var processed = null;
            try {
                processed = JSON.parse(data);
            } catch (e) {
                // couldn't parse
                console.log("parse error");
                return;
            }
            var tweetData = {
                "text" : processed.text,
                "user": {
                    "followers_count": processed.user.followers_count
                }
            };
            push.send(JSON.stringify(tweetData));
        });
    }

    this.setPushSocket = function(_socket) {
        push = _socket;
        console.log("set push socket");
    }

    this.setPullSocket = function(_socket) {
        pull = _socket;
        console.log("set pull socket");
    }
}

module.exports = StreamProcessor;
