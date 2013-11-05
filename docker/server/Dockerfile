# decking: build as makeusabrew/nodeflakes/server
# decking: run as docker run -name nfserver -p 7979:7979 -expose 5556 -d makeusabrew/nodeflakes/server 8125 "*:*"
FROM makeusabrew/nodeflakes

# this is the port our server queue binds on
EXPOSE 5556

ENTRYPOINT ["node", "/nodeflakes/server.js"]
