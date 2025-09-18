.PHONY: help build-web up up-staging down logs ps reload-nginx restart-api health-test health-check docker-logs

help:
	@echo "Common targets:"
	@echo "  make build-web       -> Build static site into dist/"
	@echo "  make up              -> Start all services with Docker Compose"
	@echo "  make up-staging      -> Start with staging overrides (faster health checks)"
	@echo "  make down            -> Stop all services"
	@echo "  make logs            -> Tail logs (nginx + api)"
	@echo "  make docker-logs     -> Show Docker container logs"
	@echo "  make ps              -> Show service status"
	@echo "  make health-check    -> Check service health status"
	@echo "  make health-test     -> Run comprehensive health tests"
	@echo "  make reload-nginx    -> Reload Nginx config"
	@echo "  make restart-api     -> Restart API service"

build-web:
	npm ci --no-audit --no-fund
	npm run build

up:
	docker compose up -d

up-staging:
	docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d

down:
	docker compose down

logs:
	docker compose logs -f nginx api

ps:
	docker compose ps

reload-nginx:
	docker compose exec nginx nginx -s reload || true

restart-api:
	docker compose restart api

# Health check commands
health-check:
	@echo "Checking Docker container health status..."
	@docker compose ps
	@echo ""
	@echo "Individual service health:"
	@docker inspect --format='{{.Name}}: {{.State.Health.Status}}' $$(docker compose ps -q) 2>/dev/null || echo "Some containers may not be running"

health-test:
	@echo "Running comprehensive health tests..."
	./scripts/docker-health-test.sh

docker-logs:
	docker compose logs -f --tail=50

