var Throughput = function(interval) {
    this.lastInterval = new Date().getTime();
    this.interval = interval;
    this.buffer = '';
    this.msgCount = 0;
}

Throughput.prototype.measure = function(data) {
    this.buffer += data;
    this.msgCount ++;

    var now = new Date().getTime();

    var elapsed = now - this.lastInterval;
    if (elapsed >= this.interval) {
        this.lastInterval = now;
        // reduce get the length in K/sec
        var chunkLength = this.buffer.length / 1024;

        var duration = elapsed / 1000;

        var throughput = {
            "value": Math.round((chunkLength / duration) * 10) / 10,
            "unit" : "kB/s",
            "msgCount": this.msgCount
        };

        console.log("Throughput: ("+throughput.value+" "+throughput.unit+") - ("+throughput.msgCount+")");

        this.msgCount = 0;
        this.buffer = '';
    }
}

module.exports = Throughput;
