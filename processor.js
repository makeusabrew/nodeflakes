var zmq = require('zmq');
var StreamProcessor = require('./app/workers/stream_processor');
var processor = new StreamProcessor();

// the queue we'll get raw tweet data off
var pull = zmq.createSocket('pull');
var pushEndpoint = process.env.CONSUMER_PORT;
console.log("pull: "+pullEndpoint);

pull.connect(pullEndpoint);

// the queue we'll push processed data onto
var push = zmq.createSocket('push');
var pushEndpoint = process.env.SERVER_PORT;
console.log("push: "+pushEndpoint);

push.connect(pushEndpoint);

pull.on('message', function(data) {
    try {
        push.send(
            processor.process(data)
        );
    } catch (e) {
        // something's amiss. Let's log what.
        console.log(e.message);
    }
});
