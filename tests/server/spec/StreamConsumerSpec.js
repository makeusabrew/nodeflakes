var srcDir = __dirname+'/../../..';

var StreamConsumer = require(srcDir+'/app/workers/stream_consumer');

describe('StreamConsumer', function() {
    var consumer;
    beforeEach(function() {
        consumer = new StreamConsumer();
    });

    it('should emit an onLine message when receiving a carriage return', function() {
        var count = 0;

        consumer.onLine = function() {
            count ++;
            expect(count).toEqual(1);
        }

        consumer.processChunk('foobar\r');

    });

    it('should emit the correct message to the onLine method on receiving a carriage return', function() {
        consumer.onLine = function(data) {
            expect(data).toEqual('foobar');
        }

        consumer.processChunk('foobar\r');
    });
});
