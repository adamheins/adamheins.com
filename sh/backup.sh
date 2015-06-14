#!/bin/bash
mongodump --db adamheins --out ~/mongodb/backups/ --collection posts
mongodump --db adamheins --out ~/mongodb/backups/ --collection users
