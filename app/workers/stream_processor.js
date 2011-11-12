var push = null;
var pull = null;

var StreamProcessor = function() {
    this.start = function() {
        var lastChunk = new Date();
        var thisChunk = null;

        pull.on('message', function(data) {
            // temporary rather crude throughput stuff
            thisChunk = new Date();
            var chunkTime = (thisChunk.getTime() - lastChunk.getTime()) / 1000;
            var chunkLength = data.length / 1024;
            var throughput = Math.round(chunkLength / chunkTime);
            lastChunk = thisChunk;

            console.log("processing message ("+throughput+" k/sec)");
            var processed = null;
            try {
                processed = JSON.parse(data.toString('utf8'));
            } catch (e) {
                // couldn't parse
                console.log("parse error of: "+data.toString('utf8'));
                return;
            }
            if (processed.text) {
                var tweetData = {
                    "text" : processed.text,
                    "entities" : processed.entities,
                    "user": {
                        "followers_count": processed.user.followers_count,
                        "screen_name": processed.user.screen_name
                    }
                };
                push.send(JSON.stringify(tweetData));
            } else {
                console.log("discarding message with bad format");
                console.log(processed);
            }
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
