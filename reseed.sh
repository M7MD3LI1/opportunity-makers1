#!/bin/bash

echo "============================================"
echo "   Reseeding Database..."
echo "============================================"
echo ""

# Get the directory of the script and go to backend
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/backend" || exit 1

npx ts-node src/seed.ts
echo ""

echo "============================================"
echo "   Done! New committees added:"
echo "   HR, PR, OR, Training, Social Media"
echo "============================================"
