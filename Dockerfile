# Use the official Node.js 18 image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json from backend
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy the backend source code
COPY backend/ .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "server.js"]
