#!/bin/sh

# Compile client-side resources.
gulp

# Start mongo.
if pgrep mongod >/dev/null; then
  echo "mongod process found, restarting..."
  killall mongod
fi
mongod --dbpath db --fork --logpath /dev/null

