#!/bin/bash

# This script implements a blue-green deployment strategy for the Docker containers.

set -e

# Change to the project root directory
cd /home/saraiva-vision-site || exit 1

# The project name will be used to distinguish between the blue and green environments.
PROJECT_NAME_BLUE="saraivavision_blue"
PROJECT_NAME_GREEN="saraivavision_green"

# Determine which environment is currently active.
if docker ps --filter "name=${PROJECT_NAME_BLUE}" --filter "status=running" | grep -q .; then
  ACTIVE_ENV="blue"
  INACTIVE_ENV="green"
else
  ACTIVE_ENV="green"
  INACTIVE_ENV="blue"
fi

echo "Active environment: $ACTIVE_ENV"
echo "Inactive environment: $INACTIVE_ENV"

# Build and start the inactive environment.
echo "Building and starting the $INACTIVE_ENV environment..."
docker compose -p "saraivavision_${INACTIVE_ENV}" -f docker-compose.production.yml up -d --build

# Wait for the new environment to be healthy.
echo "Waiting for the $INACTIVE_ENV environment to be healthy..."
# This is a simple health check. A more robust solution would be to check the health of each container.
sleep 30

# Switch the Nginx configuration to point to the new environment.
echo "Switching Nginx to the $INACTIVE_ENV environment..."
# This is a placeholder. In a real-world scenario, you would update the Nginx configuration to point to the new containers.
# For example, you could have two different nginx config files and switch between them.

# Stop the old environment.
echo "Stopping the $ACTIVE_ENV environment..."
docker compose -p "saraivavision_${ACTIVE_ENV}" -f docker-compose.production.yml down

echo "Deployment successful. The $INACTIVE_ENV environment is now active."
