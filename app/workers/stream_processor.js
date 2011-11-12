var push = null;
var pull = null;

var StreamProcessor = function() {
    this.start = function() {
        pull.on('message', function(data) {
            console.log("processing message");
            var processed = null;
            try {
                processed = JSON.parse(data.toString('utf8'));
            } catch (e) {
                // couldn't parse
                console.log("parse error");
                return;
            }
            try {
                var tweetData = {
                    "text" : processed.text,
                    "entities" : processed.entities,
                    "user": {
                        "followers_count": processed.user.followers_count,
                        "screen_name": processed.user.screen_name
                    }
                };
            } catch (e) {
                // temporary to try and figure out why the above fails sometimes
                console.log(processed);
                process.exit(1);
            }
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
