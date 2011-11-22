var srcDir = __dirname+'/../../..';

var StreamConsumer = require(srcDir+'/app/workers/stream_consumer');

describe('StreamConsumer', function() {
    it('should emit an onLine message when receiving a carriage return', function() {
        var consumer = new StreamConsumer();
        consumer.onLine = function() {
            asyncSpecDone();
        }

        consumer.processChunk('foobar\r');
    });
});
