var srcDir = __dirname+'/../../..';

var StreamProcessor = require(srcDir+'/app/workers/stream_processor');

describe('StreamConsumer', function() {
    var processor;
    beforeEach(function() {
        processor = new StreamProcessor();
    });

    it('should emit an error message when processing invalid JSON', function() {
        expect(function() {
            processor.process("Invalid JSON")
        }).toThrow(
            new Error("parse error of: Invalid JSON")
        );
    });
});
