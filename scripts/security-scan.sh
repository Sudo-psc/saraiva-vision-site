#!/bin/bash

# This script scans the Docker images for vulnerabilities using docker scan (Snyk).

echo "Scanning frontend image..."
docker scan saraivavision-site-v3_frontend

echo "Scanning api image..."
docker scan saraivavision-site-v3_api

echo "Scanning wordpress image..."
docker scan saraivavision-site-v3_wordpress

echo "Scanning nginx image..."
docker scan saraivavision-site-v3_nginx
