@echo off
chcp 65001 > nul
title DayFlow Global Online
cd /d "%~dp0"

echo ========================================================
echo        DayFlow - Запуск с доступом отовсюду
echo ========================================================
echo.

:: 1. Проверяем / запускаем бэкенд на порту 8080
powershell -NoProfile -Command "$c = New-Object System.Net.Sockets.TcpClient; try { $c.Connect('localhost', 8080); exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo [*] Запуск сервера DayFlow на Java 21...
    start /min "DayFlow Backend" java -jar "backend\build\libs\daily-planner-0.0.1-SNAPSHOT.jar"
    timeout /t 4 /nobreak > nul
)

:: 2. Проверяем / запускаем Cloudflare Tunnel
tasklist /fi "imagename eq cloudflared.exe" 2>nul | find /i "cloudflared.exe" >nul
if %errorlevel% neq 0 (
    echo [*] Запуск защищенного туннеля Cloudflare...
    start /min "Cloudflare Tunnel" "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:8080
    timeout /t 3 /nobreak > nul
)

:: 3. Запуск десктопного окна приложения
echo [*] Открытие приложения DayFlow...
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="http://localhost:8080" --window-size=1240,860
exit
