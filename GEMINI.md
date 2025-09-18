# Gemini - Containerized Development Workflow

This document provides instructions for setting up and using the containerized development environment for the Saraiva Vision project.

## Overview

The development environment is fully containerized using Docker and Docker Compose. This ensures a consistent and reproducible environment for all developers.

The following services are included:

*   **frontend:** The React/Vite frontend application with hot-reloading.
*   **api:** The Node.js API server.
*   **wordpress:** The WordPress CMS with PHP-FPM.
*   **nginx:** The Nginx reverse proxy that routes traffic to the other services.

## Prerequisites

*   Docker Engine 20.10+
*   Docker Compose 2.0+

## Getting Started

1.  **Build and start the development environment:**

    ```bash
    docker-compose -f docker-compose.dev.yml up --build
    ```

2.  **Access the services:**

    *   **Frontend:** [http://localhost:3002](http://localhost:3002)
    *   **API:** [http://localhost:3001](http://localhost:3001)
    *   **WordPress Admin:** [http://localhost:8080/wp-admin](http://localhost:8080/wp-admin)

## Development Workflow

### Hot Reloading

The frontend service is configured with hot-reloading. Any changes you make to the source code in the `src` directory will be automatically reflected in your browser.

### Viewing Logs

To view the logs for all services, run:

```bash
docker-compose -f docker-compose.dev.yml logs -f
```

To view the logs for a specific service, run:

```bash
docker-compose -f docker-compose.dev.yml logs -f <service_name>
```

### Troubleshooting

*   **Containers not starting:** Check the logs for error messages.
*   **Port conflicts:** Make sure the ports used by the containers are not already in use on your host machine.
*   **Health check failures:** Check the health check logs for the failing service.

## Deployment

To deploy the application, use the `deploy.sh` script with the `--docker` flag:

```bash
sudo ./deploy.sh --docker
```

This will trigger a blue-green deployment of the Docker containers.