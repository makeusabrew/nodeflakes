# decking: build as makeusabrew/nodeflakes/processor
# decking: run as docker run -name nfprocessor -link nfserver:server -link nfconsumer:consumer -d makeusabrew/nodeflakes/processor
FROM makeusabrew/nodeflakes

# this is the port our consumer queue binds on
EXPOSE 5554

ENTRYPOINT ["node", "/nodeflakes/processor.js"]
