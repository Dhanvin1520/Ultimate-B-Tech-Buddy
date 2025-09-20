#!/bin/bash
# Exit on error
set -o errexit

# Print environment variables for debugging
echo "NODE_ENV: ${NODE_ENV}"
echo "NODE_VERSION: ${NODE_VERSION}"

# Install Node.js version if specified
if [ -n "${NODE_VERSION}" ]; then
  echo "Installing Node.js ${NODE_VERSION}..."
  n ${NODE_VERSION}
fi

# Install dependencies
echo "Installing dependencies..."
npm install --force

# Build the frontend
echo "Building frontend..."
npm run build
npm run build

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install --production
cd ..

echo "Build completed successfully!"
