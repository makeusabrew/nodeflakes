# decking: build as makeusabrew/nodeflakes-consumer
# decking: run as docker run -name nfconsumer -e CONSUMER_KEY="" -e CONSUMER_SECRET="" -e ACCESS_TOKEN_KEY="" -e ACCESS_TOKEN_SECRET="" -d makeusabrew/nodeflakes-consumer
FROM makeusabrew/nodeflakes

# this is the port our consumer queue binds on
EXPOSE 5554

ENTRYPOINT ["node", "/nodeflakes/consumer.js"]
