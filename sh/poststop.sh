#!/bin/sh

# Stop mongo.
if pgrep mongod >/dev/null; then
  mongod --dbpath db --shutdown
else
  echo "No mongod process found, continuing..."
fi
