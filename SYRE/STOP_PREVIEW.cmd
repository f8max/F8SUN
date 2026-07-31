@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Tools\Stop-SyreServer.ps1" -Port 43213
if errorlevel 1 pause
endlocal
