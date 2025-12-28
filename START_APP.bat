@echo off
title Runway DNA - Dev Server
echo ================================
echo   RUNWAY DNA - Starting...
echo ================================
echo.

cd /d "%~dp0"

echo Starting dev server...
start "Runway DNA Server" powershell -NoExit -Command "cd '%~dp0'; bun run dev"

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo Opening browser...
start http://localhost:8080

echo.
echo ================================
echo   App is now running!
echo   Browser: http://localhost:8080
echo ================================
echo.
echo Press any key to exit this window...
pause >nul

