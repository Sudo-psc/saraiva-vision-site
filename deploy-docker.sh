#!/bin/bash

# Saraiva Vision Docker Deployment Script
# Medical-grade containerized deployment with comprehensive health checks

set -e  # Exit on any error

# Color codes for output
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Docker status
check_docker() {
    if ! command_exists docker; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi

    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi

    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running"
        exit 1
    fi

    print_success "Docker environment is ready"
}

# Function to validate environment variables
validate_environment() {
    print_status "Validating environment variables..."

    required_vars=(
        "VITE_SUPABASE_URL"
        "VITE_SUPABASE_ANON_KEY"
        "SUPABASE_URL"
        "SUPABASE_SERVICE_ROLE_KEY"
        "MYSQL_ROOT_PASSWORD"
        "MYSQL_DATABASE"
        "MYSQL_USER"
        "MYSQL_PASSWORD"
        "REDIS_PASSWORD"
    )

    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_error "Missing required environment variables:"
        printf ' %s\n' "${missing_vars[@]}"
        exit 1
    fi

    print_success "All required environment variables are set"
}

# Function to create necessary directories
setup_directories() {
    print_status "Creating necessary directories..."

    dirs=(
        "logs/nginx"
        "logs/api"
        "logs/mysql"
        "logs/redis"
        "logs/wordpress"
        "logs/health-monitor"
        "mysql/conf"
        "mysql/init"
        "redis"
        "monitoring"
        "fluent-bit"
        "nginx/sites-available"
        "nginx/sites-enabled"
    )

    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_status "Created directory: $dir"
        fi
    done

    print_success "Directories are ready"
}

# Function to clean up previous deployment
cleanup() {
    print_status "Cleaning up previous deployment..."

    # Stop and remove existing containers
    if docker-compose down --remove-orphans 2>/dev/null; then
        print_success "Stopped existing containers"
    fi

    # Remove unused Docker objects
    if docker system prune -f 2>/dev/null; then
        print_success "Cleaned up unused Docker objects"
    fi

    # Clean up build artifacts
    if [ -d "dist" ]; then
        rm -rf dist
        print_status "Cleaned up build artifacts"
    fi
}

# Function to build and start services
deploy_services() {
    print_status "Building and starting Docker services..."

    # Build all services
    if docker-compose build --no-cache; then
        print_success "Successfully built all services"
    else
        print_error "Failed to build services"
        exit 1
    fi

    # Start services in detached mode
    if docker-compose up -d; then
        print_success "Successfully started all services"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Function to run health checks
health_checks() {
    print_status "Running comprehensive health checks..."

    # Wait for services to be ready
    sleep 30

    services=("frontend" "api" "wordpress" "mysql" "redis" "nginx")

    for service in "${services[@]}"; do
        print_status "Checking health of $service service..."

        if docker-compose exec -T "$service" curl -f http://localhost/health >/dev/null 2>&1; then
            print_success "$service service is healthy"
        else
            print_warning "$service service health check failed or endpoint not available"
        fi
    done

    # Special health check for MySQL
    if docker-compose exec -T mysql mysqladmin ping -h localhost -u root -p"$MYSQL_ROOT_PASSWORD" >/dev/null 2>&1; then
        print_success "MySQL database is healthy"
    else
        print_error "MySQL database health check failed"
    fi

    # Special health check for Redis
    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        print_success "Redis cache is healthy"
    else
        print_error "Redis cache health check failed"
    fi
}

# Function to display service status
show_status() {
    print_status "Current service status:"
    docker-compose ps
}

# Function to show logs
show_logs() {
    print_status "Showing recent logs..."
    docker-compose logs --tail=20
}

# Function to run smoke tests
smoke_tests() {
    print_status "Running smoke tests..."

    # Test frontend
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        print_success "Frontend is responding"
    else
        print_error "Frontend is not responding"
    fi

    # Test API
    if curl -f http://localhost:3002/api/health >/dev/null 2>&1; then
        print_success "API is responding"
    else
        print_error "API is not responding"
    fi

    # Test WordPress
    if curl -f http://localhost:8080/wp-json/wp/v2/ >/dev/null 2>&1; then
        print_success "WordPress is responding"
    else
        print_error "WordPress is not responding"
    fi
}

# Main deployment function
main() {
    echo "🏥 Saraiva Vision Docker Deployment"
    echo "=================================="

    # Validate prerequisites
    check_docker
    validate_environment

    # Setup environment
    setup_directories

    # Clean up previous deployment
    cleanup

    # Deploy services
    deploy_services

    # Run health checks
    health_checks

    # Show status
    show_status

    # Run smoke tests
    smoke_tests

    echo ""
    print_success "🎉 Saraiva Vision Docker deployment completed successfully!"
    echo ""
    echo "🌐 Access Points:"
    echo "   Frontend: http://localhost:3000"
    echo "   API:      http://localhost:3002"
    echo "   WordPress: http://localhost:8080"
    echo "   Nginx:    http://localhost:80"
    echo ""
    echo "📊 Management Commands:"
    echo "   View logs: docker-compose logs -f [service]"
    echo "   Stop all:  docker-compose down"
    echo "   Restart:   docker-compose restart"
    echo ""
    echo "🔍 Health Monitoring:"
    echo "   Health Monitor: http://localhost:3000/monitor-health"
    echo "   Logs:          docker-compose logs health-monitor"
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"