#!/bin/bash

# Hotel Chain Application - Docker Stop Script
# This script stops all running services

set -e

echo "🛑 Hotel Chain Application - Stopping All Services"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running."
    exit 1
fi

# Stop services
print_status "Stopping all services..."
docker-compose down

print_status "Removing unused containers and networks..."
docker system prune -f

print_success "All services have been stopped! 🛑"

echo ""
echo "💡 To start services again, run:"
echo "   ./start-services.sh"
echo ""
