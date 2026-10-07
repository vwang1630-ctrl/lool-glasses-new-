@echo off
chcp 65001 >nul
echo Registering FUZZ Server Watchdog...
schtasks /Create /SC MINUTE /MO 5 /TN "FUZZ Server Watchdog" /TR "D:\data\code\cici\fuzz-couch-comfort\scripts\watchdog-server.bat" /F
echo.
echo Done. Verifying:
schtasks /Query /TN "FUZZ Server Watchdog"
echo.
pause
