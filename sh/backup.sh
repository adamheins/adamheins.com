#!/bin/bash
# Back up mongodb database of articles.
mongodump --db adamheins --out ~/backups/$(date +%F_%s) --collection posts
