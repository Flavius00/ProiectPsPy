"""
Admin endpoints for user management
"""
import csv
import io
from fastapi import APIRouter, HTTPException, status, Query, Depends, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional
from application.services import UserService
from application.dtos import CreateUserRequest, UpdateUserRequest, UserResponse
from domain.entities import UserRole, UserStatus
from infrastructure.repositories import (
    SQLiteUserRepository, SQLiteUserProfileRepository, SQLiteUserActivityRepository
)
from infrastructure.database import get_db
from infrastructure.middleware.auth_middleware import require_admin

router = APIRouter()

# Dependency injection
async def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    user_repository = SQLiteUserRepository(db)
    profile_repository = SQLiteUserProfileRepository(db)
    activity_repository = SQLiteUserActivityRepository(db)
    return UserService(user_repository, profile_repository, activity_repository)


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_account(
    request: CreateUserRequest,
    user_service: UserService = Depends(get_user_service),
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Create employee/manager/admin accounts (Admin only)"""
    try:
        # Ensure only valid business roles can be created via admin
        if request.role not in [UserRole.CUSTOMER, UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN]:
            request.role = UserRole.STAFF  # Default to staff if invalid
        
        user = await user_service.create_user(request)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user")


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    status_filter: Optional[UserStatus] = Query(None, alias="status", description="Filter by user status"),
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of users to return"),
    user_service: UserService = Depends(get_user_service),
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """List all users with filtering (Admin only)"""
    try:
        # Get all users using existing method
        user_list_response = await user_service.get_users(skip=skip, limit=limit)
        users = user_list_response.users
        
        # Apply filters
        filtered_users = []
        for user in users:
            # Role filter
            if role and user.role != role:
                continue
            # Status filter
            if status_filter and user.status != status_filter:
                continue
            filtered_users.append(user)
        
        return filtered_users
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch users")


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    request: UpdateUserRequest,
    user_service: UserService = Depends(get_user_service),
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Update user information (Admin only)"""
    try:
        user = await user_service.update_user(user_id, request)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update user")


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Delete user (Admin only)"""
    try:
        success = await user_service.delete_user(user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete user")


@router.get("/users/export")
async def export_users_csv(
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    status_filter: Optional[UserStatus] = Query(None, alias="status", description="Filter by user status"),
    user_service: UserService = Depends(get_user_service),
    current_user: Dict[str, Any] = Depends(require_admin)
):
    """Export users list as CSV (Admin only)"""
    try:
        # Get all users for export using existing method
        user_list_response = await user_service.get_users(skip=0, limit=10000)  # Large limit for export
        users = user_list_response.users
        
        # Apply filters
        filtered_users = []
        for user in users:
            if role and user.role != role:
                continue
            if status_filter and user.status != status_filter:
                continue
            filtered_users.append(user)
        
        # Create CSV content
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow([
            'ID', 'Email', 'Username', 'First Name', 'Last Name',
            'Phone', 'Date of Birth', 'Role', 'Status', 'Created At', 'Updated At'
        ])
        
        # Write user data
        for user in filtered_users:
            writer.writerow([
                user.id,
                user.email,
                user.username,
                user.first_name,
                user.last_name,
                user.phone_number or '',
                user.date_of_birth.strftime('%Y-%m-%d') if user.date_of_birth else '',
                user.role.value,
                user.status.value,
                user.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                user.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        output.seek(0)
        
        # Create response
        response = StreamingResponse(
            io.StringIO(output.getvalue()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=users_export.csv"}
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to export users")
