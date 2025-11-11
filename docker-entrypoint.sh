#!/bin/sh
set -e

# Set default environment variables if not provided
export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-3001}"
export DATABASE_URL="${DATABASE_URL:-file:/app/data/database.sqlite}"
export CV_UPLOAD_DIR="${CV_UPLOAD_DIR:-/app/uploads/cvs}"

# Generate random secrets if not provided
if [ -z "$JWT_SECRET" ]; then
  export JWT_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
  echo "Generated JWT_SECRET"
fi

if [ -z "$SESSION_SECRET" ]; then
  export SESSION_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
  echo "Generated SESSION_SECRET"
fi

if [ -z "$BETTER_AUTH_SECRET" ]; then
  export BETTER_AUTH_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
  echo "Generated BETTER_AUTH_SECRET"
fi

# Run database migrations
echo "Running database migrations..."
node dist/db/migrate.js || echo "Migration script not found or failed, continuing..."

# Seed the database
echo "Seeding database..."
node dist/db/seed.js || echo "Seed script not found or failed, continuing..."

echo "Starting application..."
exec npm start
