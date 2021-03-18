#!/bin/sh
# This scripts runs a HTTP server on the local machine, providing access to the
# build/public directory.

PORT=8000
DIR=public

# Python >= 3.7 is required for the --directory argument
python3.7 -m http.server "$PORT" --directory "$DIR"
