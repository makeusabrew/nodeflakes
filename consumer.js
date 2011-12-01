var zmq            = require('zmq'),
    prompt         = require('prompt'),
    https          = require('https');

var socket         = zmq.createSocket('push');
var StreamConsumer = require('./app/workers/stream_consumer');

var properties = [];

var endpoint = 'tcp://127.0.0.1:5554';


if (process.argv[2] == null)  {
    properties.push({
        message: 'Twiter username',
        name: 'username',
        empty: false
    });
}

if (process.argv[4] == null)  {
    properties.push({
        message: 'Twiter username password',
        name: 'password',
        empty: false,
        hidden: true
    });
}

if (process.argv[3] == null) {
    properties.push({
        message: 'Track keyword(s) (blank for default)',
        name: 'track',
    });
}

prompt.start();
prompt.get(properties, function(err, result) {

    var username = result.username || process.argv[2];
    var password = result.password || process.argv[4];
    var track    = result.track    || process.argv[3];

    if (track == null || track == '') {
        track = 'merry christmas,happy christmas,father christmas,christmas presents,merry xmas,love christmas,christmas songs,nodeflakes';
    }

    track = encodeURI(track);

    var auth = 'Basic ' + new Buffer(username + ':' + result.password).toString('base64');
    var options = {
        host: 'stream.twitter.com',
        port: 443,
        path: '/1/statuses/filter.json?track='+track,
        headers: {
            authorization: auth
        }
    };

    var consumer = new StreamConsumer();

    function streamConnect() {
        https.get(options, function(response) {
            response.setEncoding("utf8");
            if (response.statusCode != 200) {
                console.log("got non OK response code: "+response.statusCode);
                return;
            }

            consumer.start();

            consumer.onLine = function(line) {
                socket.send(line);
            }

            response.on('data', function(chunk) {
                consumer.processChunk(chunk);
            });

            response.on('end', function() {
                consumer.stop();
                console.log('end of response - reconnecting in 0.5 seconds');
                setTimeout(function() {
                    connectToStream();
                }, 500);
            });
        });
    }

    console.log('binding queue on '+endpoint);

    socket.bind(endpoint, function(err) {
        console.log("connecting to "+options.host+options.path);

        streamConnect();

    });
});

