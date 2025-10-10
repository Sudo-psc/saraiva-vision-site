# Gemini Code Assistant Context

This document provides a comprehensive overview of the Saraiva Vision website project, its architecture, and development workflows.

## Project Overview

This is a modern, high-performance institutional website for the Saraiva Vision ophthalmology clinic. The project is built with a focus on user experience, performance, and security.

### Architecture

The project utilizes a **native VPS (Virtual Private Server) architecture without Docker**. This means all services run directly on the Ubuntu/Debian operating system for maximum performance and control.

*   **Frontend:** A React 18 Single Page Application (SPA) built with Vite. It's served by a native Nginx web server.
*   **Backend:** A Node.js and Express.js REST API running as a native `systemd` service.
*   **Database:** A native MySQL server is used for the WordPress CMS and other application data.
*   **Caching:** A native Redis server is used for API response caching and user sessions.
*   **CMS:** A headless WordPress instance, powered by a native PHP-FPM 8.1+ installation, serves as the content management system.
*   **Proxy:** Nginx also acts as a reverse proxy for the backend API and the headless WordPress CMS.

### Key Technologies

*   **Frontend:**
    *   React 18
    *   Vite
    *   Tailwind CSS
    *   Framer Motion (for animations)
    *   Three.js / React Three Fiber (for 3D components)
    *   React Router
*   **Backend:**
    *   Node.js
    *   Express.js
*   **Database & Caching:**
    *   MySQL
    *   Redis
*   **CMS:**
    *   Headless WordPress
*   **Development & Testing:**
    *   Vitest
    *   React Testing Library
    *   ESLint

## Building and Running

The project uses `npm` for package management and scripts.

### Development

To start the local development server, run:

```bash
npm run dev
```

This will start a Vite development server with hot module replacement.

### Building for Production

To build the application for production, run:

```bash
npm run build
```

This will create a `dist` directory with the optimized and minified production assets.

### Running Tests

The project uses Vitest for testing.

*   To run tests in watch mode:
    ```bash
    npm run test
    ```
*   To run all tests once:
    ```bash
    npm run test:run
    ```
*   To generate a test coverage report:
    ```bash
    npm run test:coverage
    ```

## Deployment

The project is deployed to a native VPS. The deployment process is automated with shell scripts.

*   `setup-vps-native.sh`: This script is used for the initial setup of the VPS, installing and configuring all the necessary services.
*   `deploy-vps-native.sh`: This script builds the application, backs up the previous deployment, uploads the new build to the VPS, and restarts the necessary services.

The `npm run deploy` command will build the project and then print the manual commands needed to deploy the application on the VPS.

## Development Conventions

*   **Coding Style:** The project uses ESLint to enforce a consistent coding style.
*   **Testing:** The project has a comprehensive testing strategy, including unit, integration, and end-to-end tests.
*   **Commits:** (Inferring from standard practice) Commit messages should follow the Conventional Commits specification.
*   **Branching:** (Inferring from standard practice) Development should be done on feature branches, with pull requests to the `main` branch.
