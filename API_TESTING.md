# Testing the Hotel Chain API

This document provides instructions for testing the Hotel Chain microservices API.

## Prerequisites

1. Python 3.9+ installed
2. All required packages installed in each service directory
3. Populated databases (see instructions below)

## Setting Up Test Data

We've created scripts to populate the databases with test data:

```bash
# Run from the project root
python3 populate_all_dbs.py
```

This will populate all three service databases with:
- Users of different roles (admin, manager, employee, client)
- Hotels with various amenities 
- Rooms of different types and prices
- Sample reviews and reservations

## Starting the Services

To start all three services:

```bash
# From the project root
./start_services.sh
```

The services will start in the background on the following ports:
- Auth Service: http://localhost:8001
- Hotel Service: http://localhost:8002 
- User Management Service: http://localhost:8003

You can check if all services are running with:

```bash
python3 test_services.py
```

## Test Accounts

You can use the following accounts for testing:

| Username | Password   | Role      | Description                           |
|----------|------------|-----------|---------------------------------------|
| admin    | admin123   | ADMIN     | Full access to all features           |
| manager  | manager123 | MANAGER   | Can manage hotels, rooms, employees   |
| employee | employee123| EMPLOYEE  | Can manage rooms, reservations        |
| client   | client123  | CLIENT    | Can make reservations, write reviews  |
| client2  | client123  | CLIENT    | Another client account for testing    |

## Testing Authentication

```bash
# Login
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"client","password":"client123"}'

# Copy the access token from the response
```

## Basic API Tests

### Public Endpoints (No Authentication Required)

```bash
# Get all hotels
curl http://localhost:8002/api/v1/client/hotels

# Get rooms for a hotel (replace hotel_id with actual ID)
curl http://localhost:8002/api/v1/client/hotels/{hotel_id}/rooms

# Get reviews for a room (replace room_id with actual ID)
curl http://localhost:8002/api/v1/client/rooms/{room_id}/reviews
```

### Authenticated Endpoints

```bash
# Replace TOKEN with the access token from login
TOKEN="your_token_here"

# Get user profile
curl http://localhost:8001/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Make a reservation (client)
curl -X POST http://localhost:8002/api/v1/client/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "room_id": "room_id_here",
    "check_in_date": "2025-06-01",
    "check_out_date": "2025-06-05"
  }'

# Get my reservations (client)
curl http://localhost:8002/api/v1/client/reservations \
  -H "Authorization: Bearer $TOKEN"

# Admin: list users (requires admin token)
curl http://localhost:8003/api/v1/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Stopping the Services

When you're done testing:

```bash
# From the project root
./stop_services.sh
```

## Troubleshooting

1. **Services won't start**: Check port conflicts and log files in each service directory
2. **Authentication errors**: Confirm token is valid and not expired 
3. **Database errors**: Verify the DB was properly populated with `populate_all_dbs.py`
4. **Port conflicts**: Ensure no other apps are using ports 8001, 8002, or 8003

For detailed logs check:
```
tail -f services/auth-service/auth-service.log
tail -f services/hotel-service/hotel-service.log
tail -f services/user-management-service/user-management-service.log
```
