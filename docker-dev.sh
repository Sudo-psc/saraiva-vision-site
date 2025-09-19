#!/bin/bash

# Saraiva Vision Docker Development Script
# This script provides an easy interface for managing the Docker development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Saraiva Vision Docker Development Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  up          - Start the development environment"
    echo "  down        - Stop the development environment"
    echo "  restart     - Restart the development environment"
    echo "  status      - Show status of all containers"
    echo "  logs        - Show logs from all services"
    echo "  health      - Show health status of all services"
    echo "  clean       - Clean up containers, volumes, and images"
    echo "  build       - Rebuild all services"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 up                    # Start development environment"
    echo "  $0 logs -f               # Follow logs"
    echo "  $0 logs frontend        # Show logs for frontend service"
    echo ""
}

# Function to start the development environment
start_environment() {
    print_status "Starting Saraiva Vision development environment..."

    # Create necessary directories
    mkdir -p wordpress-local
    mkdir -p wordpress-plugins
    mkdir -p nginx-logs
    mkdir -p mysql-backup

    # Start the environment
    docker compose -f docker-compose.dev.yml up -d

    print_success "Development environment started successfully!"
    print_status "Services available at:"
    echo "  - Frontend:      http://localhost:3002"
    echo "  - API:           http://localhost:3001"
    echo "  - WordPress:     http://localhost:8083"
    echo "  - Nginx:        http://localhost:80"
    echo "  - Dev Tools:     docker exec -it saraiva-dev-tools sh"
    echo ""
    print_status "Health monitoring is running in the background."
    print_status "Use '$0 health' to check service health status."
}

# Function to stop the development environment
stop_environment() {
    print_status "Stopping Saraiva Vision development environment..."
    docker compose -f docker-compose.yml down
    print_success "Development environment stopped successfully!"
}

# Function to restart the development environment
restart_environment() {
    print_status "Restarting Saraiva Vision development environment..."
    docker compose -f docker-compose.yml down
    sleep 5
    start_environment
}

# Function to show status
show_status() {
    print_status "Saraiva Vision Development Environment Status:"
    echo ""
    docker compose -f docker-compose.yml ps
}

# Function to show logs
show_logs() {
    if [ -n "$2" ]; then
        print_status "Showing logs for $2..."
        docker compose -f docker-compose.yml logs -f "$2"
    else
        print_status "Showing logs for all services..."
        docker compose -f docker-compose.yml logs -f
    fi
}

# Function to show health status
show_health() {
    print_status "Saraiva Vision Health Status:"
    echo ""

    # Check if containers are running
    if ! docker compose -f docker-compose.yml ps | grep -q "Up"; then
        print_error "No containers are running. Use '$0 up' to start the environment."
        exit 1
    fi

    # Test health endpoints
    print_status "Testing health endpoints..."
    echo ""

    # Test Nginx health
    if curl -f http://localhost:80/health > /dev/null 2>&1; then
        print_success "Nginx: Healthy"
    else
        print_error "Nginx: Unhealthy"
    fi

    # Test Frontend health
    if curl -f http://localhost:3002/health > /dev/null 2>&1; then
        print_success "Frontend: Healthy"
    else
        print_error "Frontend: Unhealthy"
    fi

    # Test API health
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        print_success "API: Healthy"
    else
        print_error "API: Unhealthy"
    fi

    # Test WordPress health
    if curl -f http://localhost:8083/wp-json/saraiva-vision/v1/health > /dev/null 2>&1; then
        print_success "WordPress: Healthy"
    else
        print_error "WordPress: Unhealthy"
    fi

    # Test Redis health
    if docker exec saraiva-redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis: Healthy"
    else
        print_error "Redis: Unhealthy"
    fi

    echo ""
    print_status "For detailed health monitoring, check the health-monitor container logs:"
    echo "  docker compose -f docker-compose.yml logs health-monitor"
}

# Function to clean up
clean_environment() {
    print_warning "This will remove all containers, volumes, and images."
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up Saraiva Vision development environment..."
        docker compose -f docker-compose.yml down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed successfully!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to rebuild services
rebuild_services() {
    print_status "Rebuilding Saraiva Vision services..."
    docker compose -f docker-compose.yml build --no-cache
    print_success "Services rebuilt successfully!"
    print_status "Use '$0 up' to start the environment."
}

# Main script logic
case "${1:-}" in
    "up")
        check_docker
        start_environment
        ;;
    "down")
        check_docker
        stop_environment
        ;;
    "restart")
        check_docker
        restart_environment
        ;;
    "status")
        check_docker
        show_status
        ;;
    "logs")
        check_docker
        show_logs "$@"
        ;;
    "health")
        check_docker
        show_health
        ;;
    "clean")
        check_docker
        clean_environment
        ;;
    "build")
        check_docker
        rebuild_services
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac