# Hotel Service

A FastAPI-based hotel management microservice built using Domain-Driven Design (DDD) architecture.

## Project Structure

```
hotel-service/
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
│   ├── database.py        # Database configuration
│   └── repositories.py   # Repository implementations
└── interfaces/            # Interfaces Layer
    ├── __init__.py
    └── api/               # REST API controllers
        ├── __init__.py
        └── hotel_router.py
```

## DDD Architecture Layers

### 1. Domain Layer
- **Entities**: Core business objects (`Hotel`, `Room`, `RoomImage`, `Review`)
- **Repositories**: Abstract interfaces for data access
- Contains the core business logic and rules

### 2. Application Layer
- **Services**: Use cases and application services (`HotelService`, `RoomService`, `ReviewService`)
- **DTOs**: Data Transfer Objects for API communication
- Orchestrates domain objects to fulfill use cases

### 3. Infrastructure Layer
- **Repository Implementations**: Concrete implementations of domain repositories
- **Database Configuration**: SQLAlchemy models and database setup
- Currently uses SQLite with async support

### 4. Interfaces Layer
- **API Controllers**: FastAPI routers and endpoints
- **External Adapters**: Interfaces to external systems
- Handles HTTP requests/responses and data serialization

## Available Endpoints (Planned)

- `GET /` - Service status
- `GET /health` - Health check
- `GET /api/v1/hotels` - List all hotels
- `GET /api/v1/hotels/{hotel_id}` - Get hotel details
- `GET /api/v1/hotels/{hotel_id}/rooms` - List rooms in hotel
- `GET /api/v1/hotels/{hotel_id}/rooms/{room_id}` - Get room details
- `GET /api/v1/hotels/{hotel_id}/rooms/{room_id}/images` - Get room images
- `GET /api/v1/hotels/{hotel_id}/rooms/{room_id}/reviews` - Get room reviews
- `POST /api/v1/hotels/{hotel_id}/rooms/{room_id}/reviews` - Add room review (authenticated)

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
   http://localhost:8002/docs
   ```

## Example Usage

### Get all hotels:
```bash
curl -X GET "http://localhost:8002/api/v1/hotels"
```

### Get rooms in a hotel with filters:
```bash
curl -X GET "http://localhost:8002/api/v1/hotels/hotel-id/rooms?available=true&max_price=200"
```

## Next Steps

- Implement repository layers with SQLite
- Add comprehensive filtering and sorting
- Implement image management
- Add review system with authentication
- Add room availability management
- Add comprehensive error handling and validation
