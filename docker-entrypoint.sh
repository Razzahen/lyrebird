#!/bin/bash
set -e

# Install dependencies if node_modules doesn't exist or if package.json has changed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "Installing dependencies..."
    npm install
    # Copy package-lock.json to mark installation as complete
    cp package-lock.json node_modules/.package-lock.json
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Execute the main command
exec "$@" 