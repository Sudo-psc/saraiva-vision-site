.PHONY: help build-web up up-staging down logs ps reload-nginx restart-api

help:
	@echo "Common targets:"
	@echo "  make build-web       -> Build static site into dist/"
	@echo "  make up              -> Start Nginx + API (production defaults)"
	@echo "  make up-staging      -> Start with staging overrides (faster SSE)"
	@echo "  make down            -> Stop all services"
	@echo "  make logs            -> Tail logs (nginx + api)"
	@echo "  make ps              -> Show service status"
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

