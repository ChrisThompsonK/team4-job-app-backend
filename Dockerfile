# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code and configuration
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Create non-root user and group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for migrations)
RUN npm ci

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Create data directory for database
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app/data

# Change ownership of app directory to non-root user
RUN chown -R nodejs:nodejs /app

# Set default port (can be overridden)
ENV PORT=3001

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE $PORT

# Run migrations and seed, then start the application
CMD ["sh", "-c", "npm run db:migrate && node dist/db/seed.js && npm start"]
