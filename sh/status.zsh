#!/bin/zsh

PID_FILE=/var/run/adamheins.com.pid

# Check for PID file.
if [ -f "$PID_FILE" ]; then
  print -P "%F{2}Found PID file for adamheins.com at $PID_FILE."
else
  print -P "%F{1}Did not find PID file for adamheins.com."
fi

# Check for nodejs process.
if pgrep nodejs > /dev/null; then
  print -P "%F{2}nodejs process is running."
else
  print -P "%F{1}nodejs process is not running."
fi

# Check for mongod process.
if pgrep mongod > /dev/null; then
  print -P "%F{2}mongod process is running."
else
  print -P "%F{1}mongod process is not running."
fi
