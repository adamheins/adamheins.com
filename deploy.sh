#!/bin/bash

./tools/kill.sh

while read line; do export "$line";
done < .env

nohup npm start &
