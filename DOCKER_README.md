# 🏨 Hotel Chain Application - Docker Setup

This document provides instructions for running all 3 microservices using Docker with a single command.

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- At least 2GB of available RAM
- Ports 8001, 8002, and 8003 available

### Start All Services

```bash
# Make scripts executable (first time only)
chmod +x start-services.sh stop-services.sh

# Start all services
./start-services.sh
```

### Stop All Services

```bash
./stop-services.sh
```

## 📋 Services Overview

| Service | Port | Description | Health Check |
|---------|------|-------------|--------------|
| Auth Service | 8001 | User authentication & JWT tokens | `/health` |
| Hotel Service | 8002 | Hotels, rooms, reviews, reservations | `/health` |
| User Management | 8003 | Admin user management | `/health` |

## 🔗 Service URLs

### Application Endpoints
- **Auth Service**: http://localhost:8001
- **Hotel Service**: http://localhost:8002  
- **User Management**: http://localhost:8003

### API Documentation (Swagger)
- **Auth Service Docs**: http://localhost:8001/docs
- **Hotel Service Docs**: http://localhost:8002/docs
- **User Management Docs**: http://localhost:8003/docs

## 🐳 Docker Commands

### Basic Operations
```bash
# Start services in background
docker-compose up -d

# Start services with logs visible
docker-compose up

# Stop services
docker-compose down

# Restart specific service
docker-compose restart auth-service

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f hotel-service
```

### Advanced Operations
```bash
# Rebuild images (after code changes)
docker-compose build --no-cache

# Scale a service (not recommended for this app)
docker-compose up -d --scale hotel-service=2

# View service status
docker-compose ps

# Execute commands in running container
docker-compose exec auth-service bash

# Remove everything (containers, networks, volumes)
docker-compose down -v --remove-orphans
```

## 📊 Health Monitoring

The services include built-in health checks:

```bash
# Check all service health
curl http://localhost:8001/health
curl http://localhost:8002/health  
curl http://localhost:8003/health

# Expected response: {"status": "healthy"}
```

## 💾 Data Persistence

Data is persisted in Docker volumes mapped to local directories:

```
./data/
├── auth/                 # Auth service database
├── hotel/               # Hotel service database  
└── user-management/     # User management database
```

### Backup Data
```bash
# Create backup
tar -czf hotel-app-backup-$(date +%Y%m%d).tar.gz data/

# Restore backup
tar -xzf hotel-app-backup-YYYYMMDD.tar.gz
```

## 🔧 Configuration

### Environment Variables

Edit `docker-compose.yml` to modify:

```yaml
environment:
  - JWT_SECRET_KEY=your-secret-key-here
  - DATABASE_URL=sqlite:///./data/service.db
```

### Port Configuration

To change ports, update both `docker-compose.yml` and the respective `main.py` files:

```yaml
ports:
  - "NEW_PORT:INTERNAL_PORT"
```

## 🐛 Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check Docker is running
docker info

# Check port availability
lsof -i :8001
lsof -i :8002
lsof -i :8003

# View detailed logs
docker-compose logs auth-service
```

**Database issues:**
```bash
# Reset databases (WARNING: Data loss!)
rm -rf data/
mkdir -p data/auth data/hotel data/user-management
docker-compose restart
```

**Build failures:**
```bash
# Clean build cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache
```

**Permission issues:**
```bash
# Fix data directory permissions
sudo chown -R $USER:$USER data/
chmod -R 755 data/
```

### Service Dependencies

Services start in this order:
1. **Auth Service** (first)
2. **Hotel Service** (depends on Auth)
3. **User Management** (depends on Auth)

If a service fails, check dependencies are healthy first.

### Memory Issues

If you encounter memory issues:
```bash
# Check Docker memory usage
docker stats

# Increase Docker Desktop memory allocation
# Docker Desktop → Settings → Resources → Memory
```

## 🔄 Development Workflow

### Making Code Changes

1. Make changes to service code
2. Rebuild specific service:
   ```bash
   docker-compose build auth-service
   docker-compose up -d auth-service
   ```

### Adding New Dependencies

1. Update `requirements.txt` in the service
2. Rebuild the service:
   ```bash
   docker-compose build --no-cache SERVICE_NAME
   ```

### Database Changes

If you modify database schemas:
```bash
# Stop services
docker-compose down

# Remove database files
rm -rf data/

# Restart (will recreate databases)
./start-services.sh
```

## 📝 Logs

### View All Logs
```bash
docker-compose logs -f
```

### View Specific Service Logs
```bash
docker-compose logs -f auth-service
docker-compose logs -f hotel-service
docker-compose logs -f user-management-service
```

### Save Logs to File
```bash
docker-compose logs > hotel-app-logs.txt
```

## 🔒 Security Notes

- JWT secret keys are configurable via environment variables
- Services communicate over a private Docker network
- Health checks don't expose sensitive information
- Database files are stored in local volumes

## 🎯 Next Steps

After starting the services:

1. **Test API endpoints** using the Swagger docs
2. **Create test users** via the Auth Service
3. **Set up frontend** to connect to these services
4. **Configure monitoring** and logging as needed

## 💡 Tips

- Use `./start-services.sh` for quick startup with health checks
- Monitor logs during development: `docker-compose logs -f`
- Use `docker-compose ps` to check service status
- Keep Docker Desktop running for best performance
