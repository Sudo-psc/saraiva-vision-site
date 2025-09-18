# Backend/API Dockerfile - Saraiva Vision
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install security updates and curl for health checks
RUN apk update && apk upgrade && \
    apk add --no-cache ca-certificates curl && \
    rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies (use pnpm if available, otherwise npm)
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile --prod; \
    else \
      npm ci --only=production; \
    fi

# Copy API server and related files
COPY server.js ./
COPY api/ ./api/
COPY .env* ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 && \
    chown -R nodeuser:nodejs /app

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Expose port
EXPOSE 3001

# Use non-root user
USER nodeuser

# Start the API server
CMD ["node", "server.js"]