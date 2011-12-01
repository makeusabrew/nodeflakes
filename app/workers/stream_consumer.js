var Throughput = require('../throughput');

var throughput = new Throughput();

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
                var rate = throughput.measure(data);
                console.log("sending message ("+rate.value+" "+rate.unit+")");

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
