#!/bin/sh

# Add environment variables required.
while read line; do export "$line";
done < .env

# Start the server as a daemon.
nohup nodejs src/server.js >/dev/null 2>&1 &
