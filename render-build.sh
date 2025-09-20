#!/bin/bash
# Exit on error
set -o errexit

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the frontend
echo "Building frontend..."
npm run build

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install --production
cd ..

echo "Build completed successfully!"
