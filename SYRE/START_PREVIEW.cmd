@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Tools\Start-SyreServer.ps1" -Port 43213 -OpenBrowser
if errorlevel 1 pause
endlocal
