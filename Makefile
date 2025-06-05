# Hotel Chain Application - Makefile
# Simple commands for managing Docker services

.PHONY: start stop restart logs status clean build help

# Default target
help:
	@echo "🏨 Hotel Chain Application - Docker Commands"
	@echo "============================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make start    - Start all services"
	@echo "  make stop     - Stop all services" 
	@echo "  make restart  - Restart all services"
	@echo "  make logs     - View logs from all services"
	@echo "  make status   - Show service status"
	@echo "  make build    - Rebuild all images"
	@echo "  make clean    - Stop and remove everything"
	@echo "  make health   - Check service health"
	@echo ""

# Start all services
start:
	@echo "🚀 Starting all services..."
	./start-services.sh

# Stop all services
stop:
	@echo "🛑 Stopping all services..."
	./stop-services.sh

# Restart all services
restart: stop start

# View logs
logs:
	@echo "📋 Viewing logs..."
	docker-compose logs -f

# Show service status
status:
	@echo "📊 Service Status:"
	docker-compose ps

# Rebuild all images
build:
	@echo "🔨 Rebuilding all images..."
	docker-compose build --no-cache

# Clean everything
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v --remove-orphans
	docker system prune -f

# Check service health
health:
	@echo "🏥 Checking service health..."
	@echo "Auth Service:"
	@curl -sf http://localhost:8001/health || echo "❌ Not responding"
	@echo ""
	@echo "Hotel Service:"
	@curl -sf http://localhost:8002/health || echo "❌ Not responding"
	@echo ""
	@echo "User Management Service:"
	@curl -sf http://localhost:8003/health || echo "❌ Not responding"
	@echo ""

# Quick development commands
dev-auth:
	@echo "🔧 Rebuilding Auth Service..."
	docker-compose build auth-service
	docker-compose up -d auth-service

dev-hotel:
	@echo "🔧 Rebuilding Hotel Service..."
	docker-compose build hotel-service
	docker-compose up -d hotel-service

dev-user:
	@echo "🔧 Rebuilding User Management Service..."
	docker-compose build user-management-service
	docker-compose up -d user-management-service

# View individual service logs
logs-auth:
	docker-compose logs -f auth-service

logs-hotel:
	docker-compose logs -f hotel-service

logs-user:
	docker-compose logs -f user-management-service
