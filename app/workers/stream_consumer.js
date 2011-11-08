var http = require('http'),
    util = require('util'),
    zeromq  = require('zeromq');

var auth = 'Basic ' + new Buffer(process.argv[2] + ':' + process.argv[3]).toString('base64');
var options = {
    host: 'stream.twitter.com',
    port: 80,
    path: '/1/statuses/sample.json',
    headers: {
        authorization: auth
    }
};

var s = zeromq.createSocket('push');
s.bind('tcp://127.0.0.1:5554', function(err) {
    if (err) throw err;
    util.debug('bound ZMQ push server');
});
    
var strpos = -1;
var tweet = '';

http.get(options, function(res) {
    res.setEncoding("utf8");
    res.on('data', function(chunk) {
        tweet += chunk;
        strpos = tweet.indexOf("\r");

        if (strpos !== -1) {
            // bung the completed tweet on the queue
            s.send(tweet.substr(0, strpos));
            // make sure we don't lose the remainder
            tweet = tweet.substr(strpos+1);
        }
    });
    res.on('end', function() {
        util.debug('end of response');
        res.end();
    });
});
