#!/usr/local/bin/node

var express = require('express'),
    app     = express.createServer(),
    io      = require('socket.io').listen(app),
    fs      = require('fs'),
    zmq     = require('zmq');

app.listen(7979);

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
    app.set('view engine', 'jade');
    app.set('view options', {
        'layout': false
    });
});

require('./app/routes')(app);

var queue = zmq.createSocket('pull');

queue.bind('tcp://127.0.0.1:5556', function(err) {
    if (err) throw err;
    console.log('bound ZMQ pull server');
    queue.on('message', function(tweet) {
        console.log("got message");

        var data = {};
        try {
            data = JSON.parse(tweet);
        } catch (e) {
            console.log("could not parse tweet");
        }

        io.sockets.emit('tweet', data);
    });
});

io.sockets.on('connection', function(socket) {
    // any ack?
});
