#!/bin/bash 
pm2 kill

echo 'Running Processes:'
ps aux | grep -e PM2 -e node -e gulp | grep -v grep

echo ''
echo ''

echo 'Attempt to kill node & gulp:'
kill -9 `ps aux | grep -e node -e gulp | grep -v grep | awk '{print $2}'`

echo ''
echo ''

echo 'Running processes after the kill attempt:'
ps aux | grep -e PM2 -e node -e gulp | grep -v grep

echo ''
echo ''
echo 'DONE'
