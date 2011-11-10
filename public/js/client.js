var socket = null;

socket = io.connect();

socket.on('connect', function() {
    console.log('connected');
});

socket.on('tweet', function(tweet) {
    var x = Math.floor(
        Math.random() * $(window).width()
    );
    var y = Math.floor(
        Math.random() * $(window).height()
    );

    var size = Math.round(10 + (tweet.user.followers_count / 100));

    var tweet = $("<img class='tweet' title='"+tweet.text+"' src='img/flake.gif' alt='' >").css({
        "left": x,
        "top" : y,
        "width": size,
        "height": size
    });
    $("#tweets").append(tweet);
});
