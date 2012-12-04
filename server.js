#!/usr/local/bin/node

var io     = require('socket.io').listen(7979),
    fs     = require('fs'),
    zmq    = require('zmq'),
    StatsD = require ('node-statsd').StatsD;

var Throughput = require('./app/throughput');

io.configure(function() {
    //io.set('transports', ['websocket']);
    io.set('log level', 2); // info
    console.log("restricting origin: "+process.argv[3]);
    io.set("origins", process.argv[3]);
});

var stats = new StatsD(process.argv[2], 8125);

var queue = zmq.createSocket('pull');

var throughput = new Throughput(2000);
var handled = {};
var handledArray = [];

throughput.setStats(stats, 'server');

queue.bind('tcp://127.0.0.1:5556', function(err) {
    if (err) throw err;
    console.log('bound ZMQ pull server');
    queue.on('message', function(data) {

        throughput.measure(data);

        // @todo ideally we wouldn't parse the inbound data *just* to get the tweet ID. Perhaps
        // the processor daemons can put a delemited message on instead?
        var tweet = {};
        try {
            tweet = JSON.parse(data);
        } catch (e) {
            console.log("could not parse tweet");
            stats.increment('nodeflakes.server.parse_error');
            return;
        }
        if (handled[tweet.id] != null) {
            console.log("ignoring duplicate tweet ["+tweet.id+"]");
            stats.increment('nodeflakes.server.duplicate_tweet');
            return;
        }

        handled[tweet.id] = tweet;
        handledArray.push(tweet.id);
        if (handledArray.length > 20) {
            var id = handledArray.shift();
            delete handled[id];
        }

        stats.increment('nodeflakes.server.tweet');
        io.sockets.emit('tweet', data.toString('utf8'));
    });
});

io.sockets.on('connection', function(socket) {
    // any ack?
    stats.increment('nodeflakes.server.connect');
    socket.on('disconnect', function() {
        stats.increment('nodeflakes.server.disconnect');
    });
});
