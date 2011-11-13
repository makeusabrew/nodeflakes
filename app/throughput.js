var Throughput = function() {
    this.lastData = new Date();
    this.thisData = null;
}

Throughput.prototype.measure = function(data) {
    this.thisData = new Date();
    // figure out how many seconds have elapsed since our last message
    var duration = (this.thisData.getTime() - this.lastData.getTime()) / 1000;

    this.lastData = this.thisData;

    // reduce get the length in K/sec
    var chunkLength = data.length / 1024;

    var throughput = {
        "value": Math.round((chunkLength / duration) * 10) / 10,
        "unit" : "kB/s"
    };

    return throughput;
}

module.exports = Throughput;
