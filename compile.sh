#!/bin/sh

# Utility script to clean and compile a fresh version of the website.

if [ -z $1 ]; then
  node ./blogger.js
  exit 1
fi

# Remove existing public directory.
if [ -d public ]; then
  rm -r public
fi

# Compile new html files.
node ./blogger.js "$1"

