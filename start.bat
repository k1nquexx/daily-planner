@echo off
chcp 65001 > nul
title DayFlow Desktop
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"

echo [*] Запуск настольного приложения DayFlow...
start "" npx electron .
exit
