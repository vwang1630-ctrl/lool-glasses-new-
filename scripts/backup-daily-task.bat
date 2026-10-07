@echo off
cd /d D:\data\code\cici\fuzz-couch-comfort
node scripts\backup-to-git.mjs
git add backup\git\
git commit -m "backup daily"
git push
