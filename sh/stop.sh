#!/bin/sh

if pgrep nodejs >/dev/null; then
  killall nodejs
else
  echo "No nodejs process found, continuing..."
fi
