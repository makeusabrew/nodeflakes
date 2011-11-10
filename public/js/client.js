var socket = null;

socket = io.connect();

socket.on('connect', function() {
    console.log('connected');
});

socket.on('tweet', function(tweet) {
    Engine.addRandomlyPositionedTweet(tweet);
});
