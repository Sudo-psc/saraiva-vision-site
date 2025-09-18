.PHONY: help build-web up up-staging down logs ps reload-nginx restart-api logs-export logs-analyze logs-monitor troubleshoot

help:
	@echo "Common targets:"
	@echo "  make build-web       -> Build static site into dist/"
	@echo "  make up              -> Start Nginx + API (production defaults)"
	@echo "  make up-staging      -> Start with staging overrides (faster SSE)"
	@echo "  make down            -> Stop all services"
	@echo "  make logs            -> Tail logs (nginx + api)"
	@echo "  make logs-monitor    -> Monitor logs in real-time"
	@echo "  make logs-export     -> Export logs for analysis"
	@echo "  make logs-analyze    -> Analyze error patterns"
	@echo "  make ps              -> Show service status"
	@echo "  make reload-nginx    -> Reload Nginx config"
	@echo "  make restart-api     -> Restart API service"
	@echo "  make troubleshoot    -> Run troubleshooting script"

build-web:
	npm ci --no-audit --no-fund
	npm run build

up:
	docker compose up -d

up-staging:
	docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d

up-monitoring:
	docker compose --profile monitoring up -d

down:
	docker compose down

logs:
	docker compose logs -f nginx api

logs-monitor:
	./scripts/troubleshoot-logs.sh monitor

logs-export:
	./scripts/troubleshoot-logs.sh export

logs-analyze:
	./scripts/troubleshoot-logs.sh errors

troubleshoot:
	./scripts/troubleshoot-logs.sh help

ps:
	docker compose ps

reload-nginx:
	docker compose exec nginx nginx -s reload || true

restart-api:
	docker compose restart api

# Development helpers
dev-logs:
	docker compose -f docker-compose.yml -f docker-compose.staging.yml logs -f

health-check:
	./scripts/troubleshoot-logs.sh health

disk-usage:
	./scripts/troubleshoot-logs.sh disk

