@echo off
echo ========================================
echo   Starting LMS Backend Services
echo ========================================
echo.

echo [1/6] Starting Gateway Service (Port 8000)...
start "LMS Gateway" cmd /k "cd /d %~dp0 && uvicorn gateway.main:app --reload --port 8000"
timeout /t 3 /nobreak

echo [2/6] Starting Auth Service (Port 8001)...
start "LMS Auth" cmd /k "cd /d %~dp0 && uvicorn auth.main:app --reload --port 8001"
timeout /t 2 /nobreak

echo [3/6] Starting Material Service (Port 8003)...
start "LMS Material" cmd /k "cd /d %~dp0 && uvicorn material.main:app --reload --port 8003"
timeout /t 2 /nobreak

echo [4/6] Starting Course Service (Port 8002)...
start "LMS Course" cmd /k "cd /d %~dp0 && uvicorn course.main:app --reload --port 8002"
timeout /t 2 /nobreak

echo [5/6] Starting Material Service (Port 8004)...
start "LMS Homework" cmd /k "cd /d %~dp0 && uvicorn homework.main:app --reload --port 8004"
timeout /t 2 /nobreak

echo [6/6] Starting notification Service (Port 8005)...
start "LMS Notification" cmd /k "cd /d %~dp0 && uvicorn notification.main:app --reload --port 8005"
timeout /t 2 /nobreak

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo Services are starting up...
echo Please wait 10-15 seconds for initialization.
echo.
echo Then open:
echo   - Diagnostic: http://localhost/soa-final/web/diagnostic.html
echo   - LMS Login: http://localhost/soa-final/web/index.html
echo.
echo Press any key to open diagnostic page...
pause > nul

start http://localhost/soa-final/web/diagnostic.html

