# Auth Service

A FastAPI-based authentication microservice built using Domain-Driven Design (DDD) architecture.

## Project Structure

```
auth-service/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── application/            # Application Layer
│   ├── __init__.py
│   ├── dtos.py            # Data Transfer Objects
│   └── services.py        # Application services (use cases)
├── domain/                 # Domain Layer
│   ├── __init__.py
│   ├── entities.py        # Domain entities
│   └── repositories.py   # Repository interfaces
├── infrastructure/        # Infrastructure Layer
│   ├── __init__.py
│   └── repositories.py   # Repository implementations
└── interfaces/            # Interfaces Layer
    ├── __init__.py
    └── api/               # REST API controllers
        ├── __init__.py
        └── auth_router.py
```

## DDD Architecture Layers

### 1. Domain Layer
- **Entities**: Core business objects (`User`, `Token`)
- **Repositories**: Abstract interfaces for data access
- Contains the core business logic and rules

### 2. Application Layer
- **Services**: Use cases and application services (`AuthService`)
- **DTOs**: Data Transfer Objects for API communication
- Orchestrates domain objects to fulfill use cases

### 3. Infrastructure Layer
- **Repository Implementations**: Concrete implementations of domain repositories
- Currently uses in-memory storage for simplicity
- Can be easily extended to use databases, external APIs, etc.

### 4. Interfaces Layer
- **API Controllers**: FastAPI routers and endpoints
- **External Adapters**: Interfaces to external systems
- Handles HTTP requests/responses and data serialization

## Available Endpoints

- `GET /` - Service status
- `GET /health` - Health check
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User authentication

## Running the Service

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the server:
   ```bash
   python3 main.py
   ```

3. Access the API documentation:
   ```
   http://localhost:8001/docs
   ```

## Example Usage

### Register a new user:
```bash
curl -X POST "http://localhost:8001/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "myuser",
    "password": "mypassword123"
  }'
```

### Login:
```bash
curl -X POST "http://localhost:8001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "mypassword123"
  }'
```

## Next Steps

- Replace in-memory repository with a proper database (PostgreSQL, MongoDB, etc.)
- Add JWT token validation middleware
- Implement password reset functionality
- Add email verification
- Add role-based access control (RBAC)
- Add rate limiting and security headers
- Add comprehensive logging and monitoring
