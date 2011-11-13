#!/usr/local/bin/node

var express = require('express'),
    app     = express.createServer(),
    io      = require('socket.io').listen(app),
    fs      = require('fs'),
    zmq     = require('zmq');

var Throughput = require('./app/throughput');

app.listen(7979);

app.configure(function() {
    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public', {maxAge: oneYear}));
    app.set('view engine', 'jade');
    app.set('view options', {
        'layout': false
    });
});

io.configure(function() {
    //io.set('transports', ['websocket']);
    io.set('log level', 2); // info
});

require('./app/routes')(app);

var queue = zmq.createSocket('pull');

var throughput = new Throughput();
var lastChunk = new Date();
var thisChunk = null;


queue.bind('tcp://127.0.0.1:5556', function(err) {
    if (err) throw err;
    console.log('bound ZMQ pull server');
    queue.on('message', function(data) {

        var rate = throughput.measure(data);
        console.log("got message ("+rate.value+" "+rate.unit+")");

        /*
        don't parse the data, assume it's valid
        let the client parse instead, put the burden on them
        var data = {};
        try {
            data = JSON.parse(tweet);
        } catch (e) {
            console.log("could not parse tweet");
        }
        */

        io.sockets.emit('tweet', data.toString('utf8'));
    });
});

io.sockets.on('connection', function(socket) {
    // any ack?
});
