#!/bin/bash

# Change to parent of this script's directory.
cd "$(dirname "${BASH_SOURCE[0]}")"/..

PID_FILE=/var/run/adamheins.com.pid

# Add environment variables required.
while read line; do export "$line";
done < .env

# Start the server as a daemon.
if [ -f "$PID_FILE" ]; then
  echo "adamheins.com PID file found, restarting..."
  npm restart
else
  nohup nodejs src/server.js >/dev/null 2>&1 &
  echo $! > "$PID_FILE"
fi
