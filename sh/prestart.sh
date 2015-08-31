#!/bin/sh

# Compile client-side resources.
gulp

# Start mongo.
mongod --dbpath db --fork --logpath /dev/null

