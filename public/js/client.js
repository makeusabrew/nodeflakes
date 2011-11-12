var socket = null;

socket = io.connect();

socket.on('connect', function() {
    console.log('connected');
});

socket.on('tweet', function(tweet) {
    var data = {};
    try {
        data = JSON.parse(tweet);
    } catch (e) {
        console.log("could not parse tweet");
    }
    Engine.addRandomlyPositionedTweet(data);
});
