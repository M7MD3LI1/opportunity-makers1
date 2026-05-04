#!/bin/bash

echo "============================================"
echo "   صناع الفرص — Starting Platform"
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

# ========== INSTALL DEPENDENCIES ==========
if [ ! -d "backend/node_modules" ]; then
    echo "[SETUP] Installing backend dependencies..."
    cd backend || exit 1
    npm install
    cd ..
    echo ""
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "[SETUP] Installing frontend dependencies..."
    cd frontend || exit 1
    npm install
    cd ..
    echo ""
fi

# ========== DATABASE SETUP ==========
echo "[DB] Syncing database schema..."
cd backend || exit 1

# Generate Prisma client
npx prisma generate 2>/dev/null
echo "[DB] Prisma client generated."

# Push schema to DB (adds any new fields like profilePicture)
npx prisma db push --accept-data-loss 2>/dev/null
if [ $? -eq 0 ]; then
    echo "[DB] Schema synced successfully!"
else
    echo "[WARNING] Schema push encountered an issue. Trying migrate..."
    npx prisma migrate dev --name update 2>/dev/null
fi

# Seed database
echo "[DB] Seeding database..."
npx ts-node src/seed.ts 2>/dev/null
cd ..
echo ""

echo "============================================"
echo ""
echo "   Admin Login:"
echo "   Email:    admin@sona3.com"
echo "   Password: admin123"
echo ""
echo "   Press Ctrl+C to stop both servers."
echo "============================================"
echo ""

# Start backend server in background
echo "[OK] Starting Backend server on port 5000..."
(cd backend && npm run dev) &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 3

# Start frontend server in background
echo "[OK] Starting Frontend server on port 5173..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

# Trap Ctrl+C to kill background processes
trap "echo -e '\nStopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for frontend to be ready then open browser
sleep 5

echo ""
echo "============================================"
echo "   Both servers are running!"
echo ""
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "============================================"

# Open the browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
elif command -v sensible-browser &> /dev/null; then
    sensible-browser http://localhost:5173
elif command -v gnome-open &> /dev/null; then
    gnome-open http://localhost:5173
else
    echo "Could not detect web browser. Please open http://localhost:5173 manually."
fi

# Wait for background processes to keep script running
wait
