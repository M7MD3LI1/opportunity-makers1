@echo off
title Reseed Database
echo ============================================
echo    Reseeding Database...
echo ============================================
echo.
cd /d "%~dp0backend"
call npx ts-node src/seed.ts
echo.
echo ============================================
echo    Done! New committees added:
echo    HR, PR, OR, Training, Social Media
echo ============================================
pause
