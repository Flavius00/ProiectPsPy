#!/bin/bash

# Hotel Chain Application - Docker Startup Script
# This script builds and starts all 3 microservices using Docker Compose

set -e  # Exit on any error

echo "🏨 Hotel Chain Application - Starting All Services"
echo "=================================================="

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Create data directories if they don't exist
print_status "Creating data directories..."
mkdir -p data/auth data/hotel data/user-management

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build and start services
print_status "Building Docker images..."
docker-compose build --no-cache

print_status "Starting all services..."
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."

check_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -sf http://localhost:$port/health > /dev/null 2>&1; then
            print_success "$service_name is healthy!"
            return 0
        fi
        
        print_status "Waiting for $service_name (attempt $attempt/$max_attempts)..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within expected time"
    return 1
}

# Check each service
check_service "Auth Service" 8001
check_service "Hotel Service" 8002
check_service "User Management Service" 8003

print_success "All services are running successfully!"

echo ""
echo "🚀 Application URLs:"
echo "==================="
echo "• Auth Service:           http://localhost:8001"
echo "• Hotel Service:          http://localhost:8002"
echo "• User Management:        http://localhost:8003"
echo ""
echo "📚 API Documentation:"
echo "====================="
echo "• Auth Service Docs:      http://localhost:8001/docs"
echo "• Hotel Service Docs:     http://localhost:8002/docs"
echo "• User Management Docs:   http://localhost:8003/docs"
echo ""
echo "🐳 Docker Commands:"
echo "==================="
echo "• View logs:              docker-compose logs -f"
echo "• Stop services:          docker-compose down"
echo "• Restart services:       docker-compose restart"
echo "• View status:            docker-compose ps"
echo ""

print_success "Hotel Chain Application is ready! 🎉"
