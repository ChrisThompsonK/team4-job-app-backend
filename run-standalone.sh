#!/bin/bash

# Run the backend Docker container as a standalone container
echo "Starting backend Docker container..."

# Stop and remove existing container if it exists
docker stop job-app-backend-standalone 2>/dev/null || true
docker rm job-app-backend-standalone 2>/dev/null || true

# Run the backend container
docker run -d \
  --name job-app-backend-standalone \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e DATABASE_URL=file:/app/data/database.sqlite \
  -e CV_UPLOAD_DIR=/app/uploads/cvs \
  -e JWT_SECRET=${JWT_SECRET:-your-secret-key-change-in-production} \
  -e SESSION_SECRET=${SESSION_SECRET:-your-session-secret-change-in-production} \
  -e BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET:-your-better-auth-secret-change-in-production} \
  -v "$(pwd)/data:/app/data" \
  -v "$(pwd)/uploads:/app/uploads" \
  --restart unless-stopped \
  job-app-backend:latest

echo "Backend container started successfully!"
echo "Access the backend at: http://localhost:3001"
echo "To view logs: docker logs -f job-app-backend-standalone"
echo "To stop: docker stop job-app-backend-standalone"
