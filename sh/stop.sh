#!/bin/sh

PID_FILE=/var/run/adamheins.com.pid

if [ -f "$PID_FILE" ]; then
  kill -9 $(cat "$PID_FILE")
  rm "$PID_FILE"
else
  echo "No PID file found for adamheins.com"
fi
