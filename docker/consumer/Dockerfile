# dockerb: build as makeusabrew/nodeflakes/consumer
FROM makeusabrew/nodeflakes

# this is the port our consumer queue binds on
EXPOSE 5554

ENTRYPOINT ["node", "/nodeflakes/consumer.js"]
