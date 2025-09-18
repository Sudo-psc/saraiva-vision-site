# Nginx Reverse Proxy for Saraiva Vision Medical Clinic
# Production-ready with security headers and healthcare compliance

FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy nginx configuration files
COPY infra/nginx/ /etc/nginx/

# Copy custom nginx.conf for reverse proxy
COPY infra/docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Create required directories
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose HTTP port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]