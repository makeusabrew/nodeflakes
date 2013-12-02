# decking: build as makeusabrew/nodeflakes-server
# decking: run as docker run -name nfserver -p 7979:7979 -d makeusabrew/nodeflakes-server
FROM makeusabrew/nodeflakes

# this is the port our server queue binds on
EXPOSE 5556

ENTRYPOINT ["node", "/nodeflakes/server.js"]
