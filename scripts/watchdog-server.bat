@echo off
rem FUZZ Server Watchdog — 端口 80 无监听则自动拉起生产服务(站主令 2026-10-01)
rem 计划任务:每 5 分钟一次(schtasks "FUZZ Server Watchdog")
rem 判定:80 端口 LISTENING = 正常退出;无监听 = 拉起并记日志
netstat -ano | findstr ":80 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 exit /b 0

echo %date% %time% : port 80 DOWN - restarting production server >> "D:\data\code\cici\fuzz-couch-comfort\logs\watchdog.log"
cd /d "D:\data\code\cici\fuzz-couch-comfort"
set PORT=80
start "" /min cmd /c "node --env-file=.env .output\server\index.mjs >> logs\server.log 2>&1"
exit /b 0
