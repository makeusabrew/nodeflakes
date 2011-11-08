var https = require('https'),
    EventEmitter = require('events').EventEmitter;
    //zeromq  = require('zeromq');


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

    /*
    var s = zeromq.createSocket('push');
    s.bind('tcp://127.0.0.1:5554', function(err) {
        if (err) throw err;
        console.log('bound ZMQ push server');
    });
    */
        
    var strpos = -1;
    var tweet = '';

    this.connect = function() {
        var that = this;
        console.log("attempting connection");
        https.get(options, function(res) {

            console.log("connected!");

            res.setEncoding("utf8");
            res.on('data', function(chunk) {
                tweet += chunk;
                strpos = tweet.indexOf("\r");

                if (strpos !== -1) {
                    // bung the completed tweet on the queue
                    //s.send(tweet.substr(0, strpos));
                    that.emitter.emit('tweet', tweet.substr(0, strpos));
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

    this.emitter = new EventEmitter();
}

module.exports = StreamConsumer;
