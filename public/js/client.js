var socket = null;

socket = io.connect();

socket.on('connect', function() {
    console.log('connected');
});

socket.on('tweet', function(tweet) {
    $("#tweets").append(
        "<div>"+tweet.text+"</div>"
    );
});
