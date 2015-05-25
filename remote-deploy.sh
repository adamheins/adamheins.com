#!/bin/bash

echo Deploying adamheins.com to production...

ssh adam@adamheins.com bash -c "'
cd ~/personal-website/

git checkout master
git pull origin master

./tools/kill.sh
./deploy.sh
'"
echo Deployment complete.
