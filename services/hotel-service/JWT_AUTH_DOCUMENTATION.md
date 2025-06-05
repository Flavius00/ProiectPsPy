# JWT Authentication Middleware - Hotel Service

## Overview

The Hotel Service now includes comprehensive JWT authentication middleware that integrates with the Auth Service to provide role-based access control for all endpoints.

## Authentication Architecture

### 1. Authentication Middleware (`infrastructure/middleware/auth_middleware.py`)

The middleware provides several authentication dependency functions:

- **`require_admin()`** - Admin-only access
- **`require_manager_or_admin()`** - Manager or Admin access
- **`require_employee_or_above()`** - Employee, Manager, or Admin access
- **`require_client()`** - Client role (for reviews and bookings)
- **`require_any_authenticated_user()`** - Any authenticated user
- **`optional_authentication()`** - Optional auth for public endpoints

### 2. JWT Token Validation

The middleware validates JWT tokens by:
- Extracting tokens from `Authorization: Bearer <token>` headers
- Verifying token signature and expiration
- Decoding user information (user_id, role, permissions)
- Providing user context to endpoint handlers

### 3. Role-Based Access Control

#### Role Hierarchy:
```
ADMIN (highest privileges)
├── Full access to all endpoints
├── Can manage hotels, rooms, reviews
└── Can access all user data

MANAGER
├── Can create/update/delete hotels
├── Can manage rooms and images
├── Can view all reviews
└── Cannot delete hotels (admin only)

EMPLOYEE
├── Can create/update rooms
├── Can manage room images
├── Can view hotel and room data
└── Limited administrative access

CLIENT (lowest privileges)
├── Can create/update/delete own reviews
├── Can view public hotel/room data
└── Can access own booking data
```

## Endpoint Authentication

### Hotel Management Endpoints

| Endpoint | Method | Authentication Required | Roles Allowed |
|----------|--------|------------------------|---------------|
| `/hotels` | GET | Optional | Public (with optional auth) |
| `/hotels` | POST | Required | MANAGER, ADMIN |
| `/hotels/{id}` | GET | Optional | Public (with optional auth) |
| `/hotels/{id}` | PUT | Required | MANAGER, ADMIN |
| `/hotels/{id}` | DELETE | Required | ADMIN only |

### Room Management Endpoints

| Endpoint | Method | Authentication Required | Roles Allowed |
|----------|--------|------------------------|---------------|
| `/rooms` | GET | Optional | Public (with optional auth) |
| `/rooms` | POST | Required | EMPLOYEE, MANAGER, ADMIN |
| `/rooms/{id}` | GET | Optional | Public (with optional auth) |
| `/rooms/{id}` | PUT | Required | EMPLOYEE, MANAGER, ADMIN |
| `/rooms/{id}` | DELETE | Required | MANAGER, ADMIN |

### Room Image Management

| Endpoint | Method | Authentication Required | Roles Allowed |
|----------|--------|------------------------|---------------|
| `/rooms/{id}/images` | GET | Optional | Public (with optional auth) |
| `/rooms/{id}/images` | POST | Required | EMPLOYEE, MANAGER, ADMIN |
| `/rooms/{id}/images/{image_id}` | DELETE | Required | EMPLOYEE, MANAGER, ADMIN |

### Review Management

| Endpoint | Method | Authentication Required | Roles Allowed |
|----------|--------|------------------------|---------------|
| `/rooms/{id}/reviews` | GET | Optional | Public (with optional auth) |
| `/rooms/{id}/reviews` | POST | Required | CLIENT |
| `/reviews/{id}` | GET | Optional | Public (with optional auth) |
| `/reviews/{id}` | PUT | Required | Owner or MANAGER/ADMIN |
| `/reviews/{id}` | DELETE | Required | Owner or MANAGER/ADMIN |
| `/users/{id}/reviews` | GET | Required | Owner or MANAGER/ADMIN |

### Client API Endpoints

All client API endpoints (`/client/*`) use optional authentication, making them publicly accessible while still providing user context when authenticated.

## Usage Examples

### 1. Public Access (No Authentication)
```python
# Get hotels - no auth required
response = requests.get("http://localhost:8002/hotels")

# Browse rooms - no auth required  
response = requests.get("http://localhost:8002/client/hotels/hotel-id/rooms")
```

### 2. Authenticated Requests
```python
# Login to get token
auth_response = requests.post("http://localhost:8001/auth/login", json={
    "email": "manager@hotel.com",
    "password": "password"
})
token = auth_response.json()["access_token"]

# Use token in requests
headers = {"Authorization": f"Bearer {token}"}

# Create hotel (requires MANAGER/ADMIN)
response = requests.post(
    "http://localhost:8002/hotels",
    json={"name": "New Hotel", "location": "City", "address": "Address"},
    headers=headers
)

# Create room (requires EMPLOYEE+)
response = requests.post(
    "http://localhost:8002/rooms",
    json={"hotel_id": "hotel-id", "room_number": "101", "room_type": "Standard", "price": 100},
    headers=headers
)
```

### 3. Review Creation (CLIENT role)
```python
# Login as client
auth_response = requests.post("http://localhost:8001/auth/login", json={
    "email": "client@email.com", 
    "password": "password"
})
token = auth_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Create review (requires CLIENT role)
response = requests.post(
    "http://localhost:8002/rooms/room-id/reviews",
    json={"rating": 5, "comment": "Great room!"},
    headers=headers
)
```

## Error Responses

### 401 Unauthorized
```json
{
    "detail": "Authentication required"
}
```

### 403 Forbidden
```json
{
    "detail": "Insufficient permissions. Required role: ADMIN"
}
```

### Invalid Token
```json
{
    "detail": "Invalid or expired token"
}
```

## Security Features

### 1. Token Validation
- Verifies JWT signature using shared secret
- Checks token expiration
- Validates token structure and claims

### 2. Role-Based Authorization
- Granular permission control
- Hierarchical role system
- Ownership validation for user-specific resources

### 3. Optional Authentication
- Public endpoints remain accessible
- User context provided when available
- Graceful degradation for unauthenticated users

### 4. Error Handling
- Consistent error responses
- No sensitive information in error messages
- Proper HTTP status codes

## Configuration

### Environment Variables
```bash
# JWT Secret (should match Auth Service)
JWT_SECRET_KEY=your-secret-key-here

# Auth Service URL (for potential future integrations)
AUTH_SERVICE_URL=http://localhost:8001
```

### Dependencies
```
PyJWT==2.8.0  # JWT token handling
httpx==0.25.2  # HTTP client for auth service communication
```

## Testing

Run the authentication integration tests:

```bash
cd services/hotel-service
python test_auth_integration.py
```

This will test:
- Public endpoint access
- Protected endpoint authentication
- Role-based access control
- Token validation
- Error handling

## Integration with Frontend

The frontend should:

1. **Store JWT tokens** securely (localStorage/sessionStorage)
2. **Include tokens** in API requests via Authorization headers
3. **Handle auth errors** (401/403) by redirecting to login
4. **Refresh tokens** when they expire
5. **Show/hide UI elements** based on user roles

Example frontend integration:
```javascript
// Store token after login
localStorage.setItem('authToken', response.data.access_token);

// Include in API requests
const token = localStorage.getItem('authToken');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Handle auth errors
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

## Next Steps

1. **Test with actual JWT tokens** from the Auth Service
2. **Implement token refresh** mechanism
3. **Add rate limiting** for security
4. **Implement audit logging** for sensitive operations
5. **Add CORS configuration** for frontend integration
6. **Create API documentation** with authentication examples
