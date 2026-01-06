# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files (including package-lock.json)
COPY package.json package-lock.json ./

# Install production dependencies only (using modern npm syntax)
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install wget for health check
RUN apk add --no-cache wget

# Copy dependencies and application from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start application with initialization script
CMD ["sh", "-c", "node database/run-migrations.js && node database/seeds/seed.js && node src/index.js"]
