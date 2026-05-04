@echo off
setlocal

echo ============================================
echo    صناع الفرص — Starting Platform
echo ============================================
echo.

:: Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

:: ========== INSTALL DEPENDENCIES ==========
if not exist "backend\node_modules" (
    echo [SETUP] Installing backend dependencies...
    pushd backend
    call npm install
    popd
    echo.
)

if not exist "frontend\node_modules" (
    echo [SETUP] Installing frontend dependencies...
    pushd frontend
    call npm install
    popd
    echo.
)

:: ========== DATABASE SETUP ==========
echo [DB] Syncing database schema...
pushd backend

:: Generate Prisma client
call npx prisma generate 2>nul
echo [DB] Prisma client generated.

:: Push schema to DB (adds any new fields)
call npx prisma db push --accept-data-loss 2>nul
if %ERRORLEVEL% equ 0 (
    echo [DB] Schema synced successfully!
) else (
    echo [WARNING] Schema push encountered an issue. Trying migrate...
    call npx prisma migrate dev --name update 2>nul
)

:: Seed database
echo [DB] Seeding database...
call npx ts-node src/seed.ts 2>nul
popd
echo.

echo ============================================
echo.
echo    Admin Login:
echo    Email:    admin@sona3.com
echo    Password: admin123
echo.
echo    Press Ctrl+C to stop both servers.
echo ============================================
echo.

:: Start backend server in background
echo [OK] Starting Backend server on port 5000...
start /B "Backend Server" cmd /c "cd backend && npm run dev"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

:: Start frontend server in background
echo [OK] Starting Frontend server on port 5173...
start /B "Frontend Server" cmd /c "cd frontend && npm run dev"

:: Wait for frontend to be ready then open browser
timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo    Both servers are running!
echo.
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo ============================================

:: Open the browser
start http://localhost:5173

:: Keep the window open
echo Waiting for servers to run...
echo (Close this window to stop the servers)
pause >nul
