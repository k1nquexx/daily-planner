@echo off
chcp 65001 > nul
title DayFlow Stop
cd /d "%~dp0"

echo [*] Остановка процессов DayFlow (Java и Cloudflare)...

taskkill /f /im cloudflared.exe 2>nul
taskkill /f /im java.exe 2>nul

echo.
echo [V] Приложение DayFlow и туннель полностью остановлены!
timeout /t 2 > nul
exit
