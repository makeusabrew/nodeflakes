#!/usr/local/bin/node

var express = require('express'),
    app     = express.createServer(),
    io      = require('socket.io').listen(app),
    fs      = require('fs');

app.listen(7979);

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
    app.set('view engine', 'jade');
    app.set('view options', {
        'layout': false
    });
});

require('./app/routes')(app);

var StreamConsumer = require('./app/workers/stream_consumer');

var consumer = new StreamConsumer(process.argv[2], process.argv[3]);
consumer.connect();

io.sockets.on('connection', function(socket) {
    socket.emit('foo', 'bar');
});
