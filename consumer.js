var zmq            = require('zmq');
var socket         = zmq.createSocket('push');
var StreamConsumer = require('./app/workers/stream_consumer');

var consumer = new StreamConsumer(process.argv[2], process.argv[3]);

socket.bind('tcp://127.0.0.1:5554', function(err) {
    consumer.setSocket(socket);
    consumer.start();
});
