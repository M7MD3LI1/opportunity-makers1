@echo off
title FeedForward - Installation
color 0B

echo ============================================
echo    FeedForward - Installation Script
echo    هذا الملف يقوم بتثبيت جميع المتطلبات الناقصة
echo ============================================
echo.

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

echo [SETUP] Installing backend dependencies...
cd backend
call npm install
echo.

echo [SETUP] Installing frontend dependencies...
cd ../frontend
call npm install
echo.

echo [SETUP] Generating Prisma client...
cd ../backend
call npx prisma generate
echo.

echo [DB] Running database migrations...
call npx prisma migrate dev --name init
echo.

echo [DB] Seeding database...
call npx ts-node src/seed.ts
echo.

cd ..

echo ============================================
echo    Installation Completed Successfully!
echo    تم الانتهاء من التثبيت بنجاح.
echo    يمكنك الآن تشغيل start.bat
echo ============================================
pause
