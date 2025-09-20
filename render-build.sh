#!/bin/bash
# Exit on error
set -o errexit

# Print environment variables for debugging
echo "=== Build Environment ==="
echo "NODE_ENV: ${NODE_ENV}"
echo "NODE_VERSION: ${NODE_VERSION}"
echo "NPM_VERSION: $(npm --version)"
echo "NODE_PATH: $(which node)"

# Install Node.js version if specified
if [ -n "${NODE_VERSION}" ]; then
  echo "Installing Node.js ${NODE_VERSION}..."
  npm install -g n
  n ${NODE_VERSION}
fi

# Install global dependencies
echo "=== Installing Global Dependencies ==="
npm install -g typescript@latest
npm install -g vite

# Install project dependencies
echo "=== Installing Project Dependencies ==="
npm install --force

# Install type definitions
echo "=== Installing Type Definitions ==="
npm install --save-dev @types/node @types/react @types/react-dom @vitejs/plugin-react

# Build the project
echo "=== Building Project ==="
npm run build

# Install backend dependencies
echo "=== Installing Backend Dependencies ==="
cd backend
npm install --production
cd ..

echo "=== Build Completed Successfully ==="
