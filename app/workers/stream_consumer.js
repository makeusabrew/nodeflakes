var Throughput = require('../throughput'),
    StatsD     = require ('node-statsd').StatsD;

var throughput = new Throughput(2000);

var stats = new StatsD(process.argv[5], 8125);

throughput.setStats(stats, 'consumer');

var StreamConsumer = function() {
        
    var strpos = null,
        buffer = null;

    this.start = function() {
        console.log('starting consumer');
        strpos = -1;
        buffer = '';
    }

    this.stop = function() {
        console.log('stopping consumer');
    }

    this.processChunk = function(chunk) {
        buffer += chunk;
        strpos = buffer.indexOf("\r");

        if (strpos !== -1) {
            var data = buffer.substr(0, strpos);
            if (data.length > 1) {
                throughput.measure(data);

                stats.increment('nodeflakes.consumer.line');
                this.onLine(data);
            } else {
                console.log("ignoring heartbeat "+data.length);
            }

            // make sure we don't lose the remainder
            buffer = buffer.substr(strpos+1);
        }
    }

    this.onLine = function(line) {

    }
}

module.exports = StreamConsumer;
