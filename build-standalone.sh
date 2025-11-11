#!/bin/bash

# Build the backend Docker image as a standalone container
echo "Building backend Docker image..."
docker build -t job-app-backend:latest .

echo "Backend image built successfully!"
echo "To run the backend container, use: ./run-standalone.sh"
