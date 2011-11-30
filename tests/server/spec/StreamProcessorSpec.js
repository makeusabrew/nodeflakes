require('colors');
var srcDir = __dirname+'/../../..';

var StreamProcessor = require(srcDir+'/app/workers/stream_processor');

describe('StreamConsumer', function() {
    var processor;
    beforeEach(function() {
        processor = new StreamProcessor();
    });

    it('should emit an error message when processing invalid JSON', function() {
        expect(function() {
            processor.process("Invalid JSON")
        }).toThrow(
            new Error("parse error of: Invalid JSON")
        );
    });

    it('should emit an eror when processing JSON without any text', function() {
        expect(function() {
            processor.process('{"valid":"json"}');
        }).toThrow(
            new Error("discarding message with bad format - assuming delete or rate limit info".bold)
        );
    });

    it('should emit an error when encountering a swear word in the tweet text', function() {
        expect(function() {
            processor.process('{"text":"I don\'t give a fuck", "user":{"screen_name":"Foo"}}');
        }).toThrow(
            new Error("PROFANITY FILTER:".red+" [Foo: I don't give a fuck]")
        );
    });

    it('should emit an error a user with no followers shares a link', function() {
        var tweet = {
            "text": "This is a link http://foo.com",
            "user": {
                "screen_name": "Foo",
                "followers_count": 0,
            },
            "entities": {
                "urls": [
                {
                    "url" : "http://foo.com"
                }
                ]
            }
        };

        tweet = JSON.stringify(tweet);

        expect(function() {
            processor.process(tweet);
        }).toThrow(
            new Error("SPAM FILTER:".yellow+" excessive link Vs follower count (1 Vs 0): Foo: This is a link http://foo.com")
        );
    });
});
