# decking: build as makeusabrew/nodeflakes-processor
# decking: run as docker run -name nfprocessor -link nfserver:server -link nfconsumer:consumer -d makeusabrew/nodeflakes-processor
FROM makeusabrew/nodeflakes

ENTRYPOINT ["node", "/nodeflakes/processor.js"]
