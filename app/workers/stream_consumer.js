var https = require('https');

var socket = null;

var StreamConsumer = function(username, password) {
    var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
    var options = {
        host: 'stream.twitter.com',
        port: 443,
        path: '/1/statuses/filter.json?track=christmas',
        headers: {
            authorization: auth
        }
    };
        
    var strpos = -1;
    var tweet = '';

    this.start = function() {
        var that = this;
        console.log("connecting to "+options.host+"...");
        https.get(options, function(res) {
            console.log("connected!");

            res.setEncoding("utf8");
            res.on('data', function(chunk) {
                tweet += chunk;
                strpos = tweet.indexOf("\r");

                if (strpos !== -1) {
                    // bung the completed tweet on the queue
                    console.log("sending message");
                    socket.send(tweet.substr(0, strpos));
                    // make sure we don't lose the remainder
                    tweet = tweet.substr(strpos+1);
                }
            });
            res.on('end', function() {
                console.log('end of response');
                res.end();
            });
        });
    }

    this.setSocket = function(_socket) {
        socket = _socket;
    }
}

module.exports = StreamConsumer;
