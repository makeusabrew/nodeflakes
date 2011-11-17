var zmq = require('zmq');
var StreamProcessor = require('./app/workers/stream_processor');
var processor = new StreamProcessor();

// the queue we'll get raw tweet data off
var pull = zmq.createSocket('pull');
pull.connect(process.argv[2] || 'tcp://127.0.0.1:5554');

// the queue we'll push processed data onto
var push = zmq.createSocket('push');
push.connect(process.argv[3] || 'tcp://127.0.0.1:5556');

processor.setPushSocket(push);
processor.setPullSocket(pull);

processor.start();
