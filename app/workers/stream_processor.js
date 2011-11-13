var Throughput = require('../throughput');

var push = null;
var pull = null;

var throughput = new Throughput();

var StreamProcessor = function() {
    this.start = function() {
        var lastChunk = new Date();
        var thisChunk = null;

        pull.on('message', function(data) {
            var rate = throughput.measure(data);
            console.log("processing message ("+rate.value+" "+rate.unit+")");
            var processed = null;
            try {
                processed = JSON.parse(data.toString('utf8'));
            } catch (e) {
                // couldn't parse
                console.log("parse error of: "+data.toString('utf8'));
                return;
            }
            if (processed.text == null) {
                console.log("discarding message with bad format - assuming delete or rate limit info");
                console.log(processed);
                return;
            }
                
            var filter = new RegExp("fuck|shit|bollocks|\bdick\b|pussy|\bcunt\b|\bporn\b|\bsex\b", "i");

            var fullTweet = processed.user.screen_name+": "+processed.text;

            if (filter.test(fullTweet)) {
                console.log("discarding tweet due to profanity filter: ["+fullTweet+"]");
                return;
            }

            var tweetData = {
                "text" : processed.text,
                "entities" : processed.entities,
                "user": {
                    "followers_count": processed.user.followers_count,
                    "screen_name": processed.user.screen_name
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
