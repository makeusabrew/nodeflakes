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
    };

    this.stop = function() {
        console.log('stopping consumer');
    };

    this.processChunk = function(chunk) {
        // this is now almost totally redundant but in the interests
        // of not making major changes it just marshals up the JSON
        // and emits an onLine whilst preserving throughput tracking
        var data = JSON.stringify(chunk);

        throughput.measure(data);

        stats.increment('nodeflakes.consumer.line');
        this.onLine(data);
    };

    this.onLine = function(line) {
      // no-op by default
    };
};

module.exports = StreamConsumer;
