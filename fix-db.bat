@echo off
echo ========================================================
echo       Database Synchronization Tool - Opportunities Makers
echo ========================================================
echo.
echo Syncing database and generating Prisma client...
cd backend
call npx prisma generate
call npx prisma db push
echo.
echo Database update complete!
echo Please restart your backend server if it is running.
pause
