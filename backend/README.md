# B-Tech Buddy Backend

Backend service for the B-Tech Buddy application, built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- MongoDB Atlas account (for production)
- Docker (for containerization)

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure secret key for JWT
- `PORT`: Port to run the server on (default: 5000)

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Building with Docker

1. Build the Docker image:
   ```bash
   docker build -t btech-buddy-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 5000:5000 --env-file .env btech-buddy-backend
   ```

## Deployment to Render

1. Push your code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" and select "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - Name: `btech-buddy-backend`
   - Region: Choose the closest to your users
   - Branch: `main` or your production branch
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variables: Add all variables from `.env`
6. Click "Create Web Service"

## API Documentation

The API will be available at `https://btech-buddy-backend.onrender.com/api` (or your custom domain)

## Environment Variables Reference

- `NODE_ENV`: Environment (development/production)
- `PORT`: Port to run the server on
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `CORS_ORIGIN`: Allowed origin for CORS

## License

MIT
