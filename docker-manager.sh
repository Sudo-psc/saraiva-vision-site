#!/bin/bash

# Docker Manager Script for Saraiva Vision
# Manages Docker containerization with development and production environments

set -e

# Configuration
PROJECT_NAME="saraiva-vision"
COMPOSE_PROJECT_NAME="saraivavision"
BASE_COMPOSE_FILE="docker-compose.yml"
DEV_COMPOSE_FILE="docker-compose.dev.yml"
PROD_COMPOSE_FILE="docker-compose.prod.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        "INFO")  echo -e "${CYAN}[INFO]${NC} ${timestamp} - $message" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} ${timestamp} - $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} ${timestamp} - $message" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} ${timestamp} - $message" ;;
        "DEBUG") echo -e "${PURPLE}[DEBUG]${NC} ${timestamp} - $message" ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log "ERROR" "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log "ERROR" "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log "ERROR" "Docker daemon is not running. Please start Docker first."
        exit 1
    fi

    # Check required files
    local required_files=("$BASE_COMPOSE_FILE" "$DEV_COMPOSE_FILE" "$PROD_COMPOSE_FILE")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log "ERROR" "Required file $file not found."
            exit 1
        fi
    done

    # Check environment files
    if [[ ! -f ".env.docker" ]]; then
        log "WARN" ".env.docker not found. Creating from template..."
        if [[ -f ".env.example" ]]; then
            cp .env.example .env.docker
            log "SUCCESS" "Created .env.docker from template. Please review and update values."
        else
            log "ERROR" ".env.example not found. Cannot create .env.docker"
            exit 1
        fi
    fi

    log "SUCCESS" "Prerequisites check completed."
}

# Environment setup
setup_environment() {
    local env=$1

    log "INFO" "Setting up $env environment..."

    # Create necessary directories
    case $env in
        "production")
            sudo mkdir -p /opt/saraiva-vision/{data/wordpress,ssl/{certs,private},cache/nginx,backups}
            sudo chown -R $USER:$USER /opt/saraiva-vision
            log "SUCCESS" "Production directories created."
            ;;
        "development")
            mkdir -p ./backups ./logs
            log "SUCCESS" "Development directories created."
            ;;
    esac

    # Set proper permissions
    chmod +x scripts/docker-health-check.sh 2>/dev/null || true

    log "SUCCESS" "Environment setup completed for $env."
}

# Build services
build_services() {
    local env=$1
    local service=$2

    log "INFO" "Building services for $env environment..."

    local compose_files="-f $BASE_COMPOSE_FILE"

    case $env in
        "development")
            compose_files="$compose_files -f $DEV_COMPOSE_FILE"
            ;;
        "production")
            compose_files="$compose_files -f $PROD_COMPOSE_FILE"
            ;;
    esac

    if [[ -n "$service" ]]; then
        log "INFO" "Building specific service: $service"
        docker-compose $compose_files build $service
    else
        log "INFO" "Building all services..."
        docker-compose $compose_files build
    fi

    log "SUCCESS" "Build completed for $env environment."
}

# Start services
start_services() {
    local env=$1
    local detached=$2

    log "INFO" "Starting services in $env mode..."

    local compose_files="-f $BASE_COMPOSE_FILE"

    case $env in
        "development")
            compose_files="$compose_files -f $DEV_COMPOSE_FILE"
            ;;
        "production")
            compose_files="$compose_files -f $PROD_COMPOSE_FILE"
            ;;
    esac

    # Set project name
    export COMPOSE_PROJECT_NAME="$COMPOSE_PROJECT_NAME"

    if [[ "$detached" == "true" ]]; then
        docker-compose $compose_files up -d
        log "SUCCESS" "Services started in detached mode."

        # Show status
        sleep 5
        show_status "$env"
    else
        docker-compose $compose_files up
    fi
}

# Stop services
stop_services() {
    local env=$1

    log "INFO" "Stopping services..."

    local compose_files="-f $BASE_COMPOSE_FILE"

    case $env in
        "development")
            compose_files="$compose_files -f $DEV_COMPOSE_FILE"
            ;;
        "production")
            compose_files="$compose_files -f $PROD_COMPOSE_FILE"
            ;;
    esac

    docker-compose $compose_files down

    log "SUCCESS" "Services stopped."
}

# Show status
show_status() {
    local env=$1

    log "INFO" "Showing service status for $env environment..."

    local compose_files="-f $BASE_COMPOSE_FILE"

    case $env in
        "development")
            compose_files="$compose_files -f $DEV_COMPOSE_FILE"
            ;;
        "production")
            compose_files="$compose_files -f $PROD_COMPOSE_FILE"
            ;;
    esac

    echo -e "\n${CYAN}=== Container Status ===${NC}"
    docker-compose $compose_files ps

    echo -e "\n${CYAN}=== Health Checks ===${NC}"
    local services=("frontend" "api" "wordpress" "nginx")
    for service in "${services[@]}"; do
        local container_name="${COMPOSE_PROJECT_NAME}-${service}"
        local health=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no container")

        case $health in
            "healthy") echo -e "  $service: ${GREEN}$health${NC}" ;;
            "unhealthy") echo -e "  $service: ${RED}$health${NC}" ;;
            "starting") echo -e "  $service: ${YELLOW}$health${NC}" ;;
            *) echo -e "  $service: ${PURPLE}$health${NC}" ;;
        esac
    done

    echo -e "\n${CYAN}=== Network Information ===${NC}"
    docker network ls | grep saraiva || echo "No Saraiva Vision networks found"

    echo -e "\n${CYAN}=== Volume Information ===${NC}"
    docker volume ls | grep saraiva || echo "No Saraiva Vision volumes found"
}

# View logs
view_logs() {
    local env=$1
    local service=$2
    local follow=$3

    log "INFO" "Viewing logs for $env environment..."

    local compose_files="-f $BASE_COMPOSE_FILE"

    case $env in
        "development")
            compose_files="$compose_files -f $DEV_COMPOSE_FILE"
            ;;
        "production")
            compose_files="$compose_files -f $PROD_COMPOSE_FILE"
            ;;
    esac

    if [[ "$follow" == "true" ]]; then
        if [[ -n "$service" ]]; then
            docker-compose $compose_files logs -f "$service"
        else
            docker-compose $compose_files logs -f
        fi
    else
        if [[ -n "$service" ]]; then
            docker-compose $compose_files logs --tail=50 "$service"
        else
            docker-compose $compose_files logs --tail=20
        fi
    fi
}

# Run health checks
run_health_checks() {
    log "INFO" "Running comprehensive health checks..."

    # Check if health check script exists
    if [[ -f "scripts/docker-health-check.sh" ]]; then
        bash scripts/docker-health-check.sh
    else
        log "WARN" "Health check script not found. Running basic checks..."

        # Basic health checks
        local services=("frontend:3002" "api:3001" "wordpress:9000" "nginx:80")
        for service_port in "${services[@]}"; do
            local service=$(echo $service_port | cut -d: -f1)
            local port=$(echo $service_port | cut -d: -f2)

            if curl -sf "http://localhost:$port/health" &> /dev/null; then
                log "SUCCESS" "$service health check passed"
            else
                log "ERROR" "$service health check failed"
            fi
        done
    fi
}

# Clean up resources
cleanup() {
    local env=$1
    local full_cleanup=$2

    log "INFO" "Cleaning up Docker resources for $env environment..."

    local compose_files="-f $BASE_COMPOSE_FILE"

    case $env in
        "development")
            compose_files="$compose_files -f $DEV_COMPOSE_FILE"
            ;;
        "production")
            compose_files="$compose_files -f $PROD_COMPOSE_FILE"
            ;;
    esac

    # Stop and remove containers
    docker-compose $compose_files down --remove-orphans

    if [[ "$full_cleanup" == "true" ]]; then
        log "WARN" "Performing full cleanup (removing volumes and images)..."

        # Remove volumes
        docker-compose $compose_files down -v

        # Remove images
        docker-compose $compose_files down --rmi all

        # Clean system
        docker system prune -f

        log "SUCCESS" "Full cleanup completed."
    else
        log "SUCCESS" "Basic cleanup completed."
    fi
}

# Interactive menu
interactive_menu() {
    while true; do
        echo -e "\n${CYAN}=== Saraiva Vision Docker Manager ===${NC}"
        echo "1) Start Development Environment"
        echo "2) Start Production Environment"
        echo "3) Stop Services"
        echo "4) View Status"
        echo "5) View Logs"
        echo "6) Run Health Checks"
        echo "7) Build Services"
        echo "8) Cleanup"
        echo "9) Exit"
        echo -n "Please select an option: "

        read -r choice

        case $choice in
            1)
                setup_environment "development"
                build_services "development"
                start_services "development" "true"
                ;;
            2)
                setup_environment "production"
                build_services "production"
                start_services "production" "true"
                ;;
            3)
                echo -n "Environment (dev/prod): "
                read -r env
                stop_services "$env"
                ;;
            4)
                echo -n "Environment (dev/prod): "
                read -r env
                show_status "$env"
                ;;
            5)
                echo -n "Environment (dev/prod): "
                read -r env
                echo -n "Service (or press Enter for all): "
                read -r service
                echo -n "Follow logs? (y/n): "
                read -r follow
                [[ "$follow" == "y" ]] && follow="true" || follow="false"
                view_logs "$env" "$service" "$follow"
                ;;
            6)
                run_health_checks
                ;;
            7)
                echo -n "Environment (dev/prod): "
                read -r env
                echo -n "Service (or press Enter for all): "
                read -r service
                build_services "$env" "$service"
                ;;
            8)
                echo -n "Environment (dev/prod): "
                read -r env
                echo -n "Full cleanup? (y/n): "
                read -r full
                [[ "$full" == "y" ]] && full="true" || full="false"
                cleanup "$env" "$full"
                ;;
            9)
                log "INFO" "Exiting Docker Manager."
                exit 0
                ;;
            *)
                log "ERROR" "Invalid option. Please try again."
                ;;
        esac
    done
}

# Main function
main() {
    local command=$1
    shift

    # Always check prerequisites
    check_prerequisites

    case $command in
        "start")
            local env=${1:-development}
            local detached=${2:-true}
            setup_environment "$env"
            build_services "$env"
            start_services "$env" "$detached"
            ;;
        "stop")
            local env=${1:-development}
            stop_services "$env"
            ;;
        "status")
            local env=${1:-development}
            show_status "$env"
            ;;
        "logs")
            local env=${1:-development}
            local service=$2
            local follow=${3:-false}
            view_logs "$env" "$service" "$follow"
            ;;
        "build")
            local env=${1:-development}
            local service=$2
            build_services "$env" "$service"
            ;;
        "health")
            run_health_checks
            ;;
        "cleanup")
            local env=${1:-development}
            local full=${2:-false}
            cleanup "$env" "$full"
            ;;
        "setup")
            local env=${1:-development}
            setup_environment "$env"
            ;;
        "interactive"|"menu"|"")
            interactive_menu
            ;;
        "help"|"-h"|"--help")
            echo -e "${CYAN}Saraiva Vision Docker Manager${NC}"
            echo ""
            echo "Usage: $0 [COMMAND] [OPTIONS]"
            echo ""
            echo "Commands:"
            echo "  start [dev|prod] [detached]  Start services"
            echo "  stop [dev|prod]              Stop services"
            echo "  status [dev|prod]            Show service status"
            echo "  logs [dev|prod] [service]    View logs"
            echo "  build [dev|prod] [service]   Build services"
            echo "  health                       Run health checks"
            echo "  cleanup [dev|prod] [full]    Clean up resources"
            echo "  setup [dev|prod]             Setup environment"
            echo "  interactive                  Interactive menu"
            echo "  help                         Show this help"
            echo ""
            echo "Examples:"
            echo "  $0 start dev                 Start development environment"
            echo "  $0 start prod true           Start production in detached mode"
            echo "  $0 logs dev frontend true    Follow frontend logs in dev"
            echo "  $0 build prod api            Build API service for production"
            echo "  $0 cleanup dev true          Full cleanup of dev environment"
            ;;
        *)
            log "ERROR" "Unknown command: $command"
            echo "Use '$0 help' for usage information."
            exit 1
            ;;
    esac
}

# Handle script interruption
trap 'echo -e "\n${YELLOW}Script interrupted. Cleaning up...${NC}"; exit 1' INT TERM

# Execute main function
main "$@"