@echo off
chcp 65001 > nul
title DayFlow Desktop
cd /d "%~dp0"

:: Проверяем, запущен ли сервер на 8080
powershell -NoProfile -Command "$c = New-Object System.Net.Sockets.TcpClient; try { $c.Connect('localhost', 8080); exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo [*] Запуск ядра DayFlow в фоне...
    start /min "DayFlow Server" java -jar "backend\build\libs\daily-planner-0.0.1-SNAPSHOT.jar"
    timeout /t 4 /nobreak > nul
)

:: Открываем автономное окно приложения через Edge App Mode
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="http://localhost:8080" --window-size=1240,860
    exit
)

if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app="http://localhost:8080" --window-size=1240,860
    exit
)

start http://localhost:8080
exit
