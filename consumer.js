var zmq            = require('zmq');
var Stream         = require('twitter-stream-oauth');

var socket         = zmq.createSocket('push');
var StreamConsumer = require('./app/workers/stream_consumer');

var endpoint = 'tcp://*:5554';
var track    = process.argv[2];

if (!track) {
    track = 'merry christmas,happy christmas,father christmas,christmas presents,merry xmas,love christmas,nodeflakes,christmas songs,christmas shopping';
}

var stream = new Stream({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    api: 'filter',
    api_params: {
      track: track
    }
});

console.log('binding queue on '+endpoint);

socket.bind(endpoint, function(err) {
    console.log("connecting to streaming API");
    startStream();
});

var retries = 5;
var retryTimeout = 1000;

function startStream() {
    var consumer = new StreamConsumer();

    stream.stream();

    consumer.start();

    stream.on("connected", function() {
      console.log("stream connected");
    });

    stream.on("data", function(json) {
      consumer.processChunk(json);
    });

    consumer.onLine = function(line) {
        socket.send(line);
    };

    stream.on("error", function(error) {
        console.log(arguments);
        var statusCode;

        consumer.stop();

        if (error.type === "response") {
          statusCode = error.data.code;
        } else {
          // @TODO
          statusCode = 500;
        }
        switch (statusCode) {
            // bad credentials
            case 401:
                console.log("bad credentials - check username / password");
                break;
            // rate limited
            case 420:
                if (retries > 0) {
                    console.log("rate limited - retrying "+retries+" more times");
                    setTimeout(function() {
                        retries --;
                        retryTimeout *= 2;

                        startStream();

                    }, retryTimeout);
                }
                break;
            // all looks okay, so just try again
            case 200:
                console.log('end of OK response - reconnecting in 2 seconds');
                setTimeout(function() {
                    startStream();
                }, 2000);
                break;
            default:
                console.log("Unhandled response code ["+response.statusCode+"] - aborting");
                break;
        }
    });
}
