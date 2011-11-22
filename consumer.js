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

properties.push({
    message: 'Twiter username password',
    name: 'password',
    empty: false,
    hidden: true
});

prompt.start();
prompt.get(properties, function(err, result) {

    var username = result.username || process.argv[2];

    var auth = 'Basic ' + new Buffer(username + ':' + result.password).toString('base64');
    var options = {
        host: 'stream.twitter.com',
        port: 443,
        //path: '/1/statuses/filter.json?track=merry%20christmas,happy%20christmas,father%20christmas,christmas%20presents,merry%20xmas,love%20christmas,christmas%20songs,nodeflakes',
        // for hardcore flake action, use the tracker below instead!
        path: '/1/statuses/filter.json?track=christmas',
        headers: {
            authorization: auth
        }
    };

    var consumer = new StreamConsumer();

    console.log('binding queue on '+endpoint);

    socket.bind(endpoint, function(err) {
        console.log("connecting to "+options.host+"...");

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
                console.log('end of response');
            });
        });
    });
});
