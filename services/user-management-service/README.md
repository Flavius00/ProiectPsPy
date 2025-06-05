# User Management Service

A comprehensive user management microservice for the hotel chain application, providing user authentication, profile management, and administrative controls.

## Features

### Core User Management
- User registration and authentication
- User profile management
- User activity tracking
- Password hashing and security

### ✅ NEW: Admin Endpoints (COMPLETE)
- **Admin user creation**: Create employee/manager/customer accounts
- **User listing with filtering**: Filter by role, status with pagination
- **User updates**: Modify user information and roles
- **User deletion**: Remove user accounts
- **CSV export**: Export user data with filtering options
- **Role-based authentication**: Admin-only access with JWT validation

### API Endpoints

#### Public Endpoints
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User authentication
- `GET /api/v1/users/profile/{user_id}` - Get user profile

#### Admin Endpoints (Requires ADMIN role)
- `POST /api/v1/admin/users` - Create user account
- `GET /api/v1/admin/users` - List users (with role/status filtering)
- `PUT /api/v1/admin/users/{user_id}` - Update user
- `DELETE /api/v1/admin/users/{user_id}` - Delete user
- `GET /api/v1/admin/users/export` - Export users as CSV

## Authentication & Security

### JWT Authentication
- All admin endpoints require valid JWT tokens
- Role-based access control (ADMIN role required)
- Token expiration handling
- Secure password hashing with bcrypt

### Input Validation
- Comprehensive input validation using Pydantic
- Email format validation
- Role and status validation
- Datetime format handling

## Getting Started

### Prerequisites
- Python 3.8+
- FastAPI
- SQLAlchemy
- Pydantic

### Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
```

The service will start on `http://localhost:8002`

### Admin Access
To access admin endpoints, include a valid JWT token with ADMIN role:
```bash
Authorization: Bearer <JWT_TOKEN>
```

### Testing Admin Endpoints
```bash
# Run comprehensive admin endpoint tests
python test_admin_endpoints.py

# Run filtering functionality tests
python test_admin_filtering.py
```

## Database Schema

### Users Table
- User authentication and basic information
- Role-based access control
- Status management (active, inactive, suspended, pending)

### User Profiles Table
- Extended user information
- Preferences and settings

### User Activities Table
- Activity logging and tracking
- Audit trail for admin actions

## Configuration

### Environment Variables
- `JWT_SECRET_KEY`: Secret key for JWT token validation (default: "your-secret-key-here")
- `DATABASE_URL`: Database connection string

### Supported User Roles
- `guest`: Basic access
- `customer`: Customer access
- `staff`: Hotel staff access
- `manager`: Manager access
- `admin`: Full administrative access

### User Status Values
- `active`: Active user account
- `inactive`: Inactive account
- `suspended`: Suspended account
- `pending`: Pending activation

## Architecture

### Clean Architecture Implementation
- **Domain Layer**: User entities and business rules
- **Application Layer**: Use cases and business logic
- **Infrastructure Layer**: Database repositories and external services
- **Interface Layer**: API routes and controllers

### Dependencies
- FastAPI for web framework
- SQLAlchemy for database ORM
- Pydantic for data validation
- PyJWT for JWT token handling
- bcrypt for password hashing

## Status: ✅ PRODUCTION READY

The user management service is fully implemented with comprehensive admin functionality, proper authentication, and thorough testing coverage.
