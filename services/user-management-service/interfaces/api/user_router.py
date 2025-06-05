from fastapi import APIRouter, HTTPException, status, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from application.services import UserService, UserProfileService, UserActivityService
from application.dtos import (
    CreateUserRequest, UpdateUserRequest, UserResponse, UserListResponse,
    CreateProfileRequest, UpdateProfileRequest, UserProfileResponse,
    UserActivityResponse, UserActivitiesResponse
)
from domain.entities import UserRole, UserStatus
from infrastructure.repositories import (
    SQLiteUserRepository, SQLiteUserProfileRepository, SQLiteUserActivityRepository
)
from infrastructure.database import get_db

router = APIRouter()

# Dependency injection functions
async def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    user_repository = SQLiteUserRepository(db)
    profile_repository = SQLiteUserProfileRepository(db)
    activity_repository = SQLiteUserActivityRepository(db)
    return UserService(user_repository, profile_repository, activity_repository)

async def get_profile_service(db: AsyncSession = Depends(get_db)) -> UserProfileService:
    profile_repository = SQLiteUserProfileRepository(db)
    activity_repository = SQLiteUserActivityRepository(db)
    return UserProfileService(profile_repository, activity_repository)

async def get_activity_service(db: AsyncSession = Depends(get_db)) -> UserActivityService:
    activity_repository = SQLiteUserActivityRepository(db)
    return UserActivityService(activity_repository)


# User Management Endpoints
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(request: CreateUserRequest, user_service: UserService = Depends(get_user_service)):
    """Create a new user"""
    try:
        user = await user_service.create_user(request)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, user_service: UserService = Depends(get_user_service)):
    """Get user by ID"""
    try:
        user = await user_service.get_user(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/", response_model=UserListResponse)
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_service: UserService = Depends(get_user_service)
):
    """Get list of users"""
    try:
        users = await user_service.get_users(skip=skip, limit=limit)
        return users
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, request: UpdateUserRequest, user_service: UserService = Depends(get_user_service)):
    """Update user"""
    try:
        user = await user_service.update_user(user_id, request)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.delete("/{user_id}")
async def delete_user(user_id: str, user_service: UserService = Depends(get_user_service)):
    """Delete user"""
    try:
        success = await user_service.delete_user(user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/role/{role}")
async def get_users_by_role(role: UserRole, user_service: UserService = Depends(get_user_service)):
    """Get users by role"""
    try:
        users = await user_service.get_users_by_role(role)
        return {"users": users, "total": len(users)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/status/{status}")
async def get_users_by_status(status: UserStatus, user_service: UserService = Depends(get_user_service)):
    """Get users by status"""
    try:
        users = await user_service.get_users_by_status(status)
        return {"users": users, "total": len(users)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


# User Profile Endpoints
@router.post("/{user_id}/profile", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_user_profile(user_id: str, request: CreateProfileRequest, profile_service: UserProfileService = Depends(get_profile_service)):
    """Create user profile"""
    try:
        profile = await profile_service.create_profile(user_id, request)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/{user_id}/profile", response_model=UserProfileResponse)
async def get_user_profile(user_id: str, profile_service: UserProfileService = Depends(get_profile_service)):
    """Get user profile"""
    try:
        profile = await profile_service.get_profile(user_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
        return profile
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.put("/{user_id}/profile", response_model=UserProfileResponse)
async def update_user_profile(user_id: str, request: UpdateProfileRequest, profile_service: UserProfileService = Depends(get_profile_service)):
    """Update user profile"""
    try:
        profile = await profile_service.update_profile(user_id, request)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
        return profile
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.delete("/{user_id}/profile")
async def delete_user_profile(user_id: str, profile_service: UserProfileService = Depends(get_profile_service)):
    """Delete user profile"""
    try:
        success = await profile_service.delete_profile(user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
        return {"message": "User profile deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


# User Activity Endpoints
@router.get("/{user_id}/activities", response_model=UserActivitiesResponse)
async def get_user_activities(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    activity_service: UserActivityService = Depends(get_activity_service)
):
    """Get user activities"""
    try:
        activities = await activity_service.get_user_activities(user_id, skip=skip, limit=limit)
        return activities
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.post("/{user_id}/activities", response_model=UserActivityResponse, status_code=status.HTTP_201_CREATED)
async def log_user_activity(user_id: str, activity_type: str, description: str, metadata: dict = None, activity_service: UserActivityService = Depends(get_activity_service)):
    """Log user activity"""
    try:
        activity = await activity_service.log_activity(user_id, activity_type, description, metadata)
        return activity
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
