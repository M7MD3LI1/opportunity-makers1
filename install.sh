#!/bin/bash

echo "============================================"
echo "   FeedForward - Installation Script"
echo "   هذا الملف يقوم بتثبيت جميع المتطلبات الناقصة"
echo "============================================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "[INFO] Node.js version:"
node --version
echo ""

echo "[SETUP] Installing backend dependencies..."
cd backend || exit 1
npm install
echo ""

echo "[SETUP] Installing frontend dependencies..."
cd ../frontend || exit 1
npm install
echo ""

echo "[SETUP] Generating Prisma client..."
cd ../backend || exit 1
npx prisma generate
echo ""

echo "[DB] Running database migrations..."
npx prisma migrate dev --name init
echo ""

echo "[DB] Seeding database..."
npx ts-node src/seed.ts
echo ""

cd ..

echo "============================================"
echo "   Installation Completed Successfully!"
echo "   تم الانتهاء من التثبيت بنجاح."
echo "   يمكنك الآن تشغيل start.sh"
echo "============================================"
