var zmq            = require('zmq'),
    prompt         = require('prompt');

var socket         = zmq.createSocket('push');
var StreamConsumer = require('./app/workers/stream_consumer');

var properties = [];

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

    var consumer = new StreamConsumer(username, result.password);

    socket.bind('tcp://127.0.0.1:5554', function(err) {
        consumer.setSocket(socket);
        consumer.start();
    });
});
