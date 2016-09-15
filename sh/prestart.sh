#!/bin/sh

# Start mongo.
if pgrep mongod >/dev/null; then
  echo "mongod process already running, continuing..."
else
  mongod --fork --config /etc/mongodb.conf
fi

