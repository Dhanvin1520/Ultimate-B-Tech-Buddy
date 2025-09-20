#!/bin/bash
# Exit on error
set -o errexit

# Set default Node.js version to 20.x LTS if not specified
export NODE_VERSION=${NODE_VERSION:-20.11.1}

# Print environment variables for debugging
echo "=== Build Environment ==="
echo "Using Node.js version: ${NODE_VERSION}"
echo "NODE_ENV: ${NODE_ENV}"
echo "NPM_VERSION: $(npm --version)"
echo "NODE_PATH: $(which node)"

# Install specified Node.js version
echo "=== Installing Node.js ${NODE_VERSION} ==="
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install ${NODE_VERSION}
nvm use ${NODE_VERSION}

# Verify Node.js and npm versions
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Install global dependencies
echo "=== Installing Global Dependencies ==="
npm install -g typescript@latest vite@latest

# Install project dependencies
echo "=== Installing Project Dependencies ==="
npm install --force

# Build the project
echo "=== Building Project ==="
npm run build

# Install backend dependencies
echo "=== Installing Backend Dependencies ==="
cd backend
npm install --production
cd ..

echo "=== Build Completed Successfully ==="
