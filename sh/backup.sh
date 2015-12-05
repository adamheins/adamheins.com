#!/bin/bash

# Back up mongodb database of articles and users.

mongodump --db adamheins --out ~/backups/$(date +%F_%s) --collection posts
mongodump --db adamheins --out ~/backups/$(date +%F_%s) --collection users
