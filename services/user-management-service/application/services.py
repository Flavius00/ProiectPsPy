from typing import Optional, List
from datetime import datetime
from domain.entities import User, UserProfile, UserActivity, UserRole, UserStatus
from domain.repositories import UserRepository, UserProfileRepository, UserActivityRepository
from application.dtos import (
    CreateUserRequest, UpdateUserRequest, UserResponse, UserListResponse,
    CreateProfileRequest, UpdateProfileRequest, UserProfileResponse,
    UserActivityResponse, UserActivitiesResponse
)
from fastapi import HTTPException, status
import uuid


class UserService:
    """User management application service"""
    
    def __init__(
        self,
        user_repository: UserRepository,
        profile_repository: UserProfileRepository,
        activity_repository: UserActivityRepository
    ):
        self.user_repository = user_repository
        self.profile_repository = profile_repository
        self.activity_repository = activity_repository
    
    async def create_user(self, request: CreateUserRequest) -> UserResponse:
        """Create a new user"""
        # Check if user already exists
        existing_user = await self.user_repository.get_user_by_email(request.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        existing_username = await self.user_repository.get_user_by_username(request.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            email=request.email,
            username=request.username,
            first_name=request.first_name,
            last_name=request.last_name,
            phone_number=request.phone_number,
            date_of_birth=request.date_of_birth,
            role=request.role,
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        created_user = await self.user_repository.create_user(user)
        
        # Log activity
        await self._log_activity(
            created_user.id,
            "user_created",
            f"User {created_user.username} was created"
        )
        
        return self._user_to_response(created_user)
    
    async def get_user_by_id(self, user_id: str) -> UserResponse:
        """Get user by ID"""
        user = await self.user_repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return self._user_to_response(user)
    
    async def get_users(self, skip: int = 0, limit: int = 100) -> UserListResponse:
        """Get list of users"""
        users = await self.user_repository.get_users(skip, limit)
        user_responses = [self._user_to_response(user) for user in users]
        
        return UserListResponse(
            users=user_responses,
            total=len(user_responses),  # In production, you'd want a separate count query
            page=skip // limit + 1 if limit > 0 else 1,
            page_size=limit
        )
    
    async def update_user(self, user_id: str, request: UpdateUserRequest) -> UserResponse:
        """Update user"""
        user = await self.user_repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update fields
        if request.first_name is not None:
            user.first_name = request.first_name
        if request.last_name is not None:
            user.last_name = request.last_name
        if request.phone_number is not None:
            user.phone_number = request.phone_number
        if request.date_of_birth is not None:
            user.date_of_birth = request.date_of_birth
        if request.role is not None:
            user.role = request.role
        if request.status is not None:
            user.status = request.status
        if request.preferences is not None:
            user.preferences = request.preferences
        
        user.updated_at = datetime.utcnow()
        
        updated_user = await self.user_repository.update_user(user)
        
        # Log activity
        await self._log_activity(
            updated_user.id,
            "user_updated",
            f"User {updated_user.username} was updated"
        )
        
        return self._user_to_response(updated_user)
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        user = await self.user_repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Log activity before deletion
        await self._log_activity(
            user.id,
            "user_deleted",
            f"User {user.username} was deleted"
        )
        
        return await self.user_repository.delete_user(user_id)
    
    async def get_users_by_role(self, role: UserRole) -> List[UserResponse]:
        """Get users by role"""
        users = await self.user_repository.get_users_by_role(role)
        return [self._user_to_response(user) for user in users]
    
    async def get_users_by_status(self, status: UserStatus) -> List[UserResponse]:
        """Get users by status"""
        users = await self.user_repository.get_users_by_status(status)
        return [self._user_to_response(user) for user in users]
    
    def _user_to_response(self, user: User) -> UserResponse:
        """Convert User entity to UserResponse DTO"""
        return UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            phone_number=user.phone_number,
            date_of_birth=user.date_of_birth,
            role=user.role,
            status=user.status,
            preferences=user.preferences,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    
    async def _log_activity(self, user_id: str, activity_type: str, description: str, metadata: Optional[dict] = None):
        """Log user activity"""
        try:
            activity = UserActivity(
                id=str(uuid.uuid4()),
                user_id=user_id,
                activity_type=activity_type,
                description=description,
                metadata=metadata,
                timestamp=datetime.utcnow()
            )
            await self.activity_repository.create_activity(activity)
        except Exception:
            # Don't fail the main operation if logging fails
            pass


class UserProfileService:
    """User profile management application service"""
    
    def __init__(
        self,
        profile_repository: UserProfileRepository,
        activity_repository: UserActivityRepository
    ):
        self.profile_repository = profile_repository
        self.activity_repository = activity_repository
    
    async def create_profile(self, user_id: str, request: CreateProfileRequest) -> UserProfileResponse:
        """Create user profile"""
        # Check if profile already exists
        existing_profile = await self.profile_repository.get_profile_by_user_id(user_id)
        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Profile already exists for this user"
            )
        
        profile = UserProfile(
            user_id=user_id,
            avatar_url=request.avatar_url,
            bio=request.bio,
            nationality=request.nationality,
            address=request.address,
            preferred_language=request.preferred_language,
            notification_preferences=request.notification_preferences,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        created_profile = await self.profile_repository.create_profile(profile)
        
        # Log activity
        await self._log_activity(
            user_id,
            "profile_created",
            "User profile was created"
        )
        
        return self._profile_to_response(created_profile)
    
    async def get_profile(self, user_id: str) -> UserProfileResponse:
        """Get user profile"""
        profile = await self.profile_repository.get_profile_by_user_id(user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return self._profile_to_response(profile)
    
    async def update_profile(self, user_id: str, request: UpdateProfileRequest) -> UserProfileResponse:
        """Update user profile"""
        profile = await self.profile_repository.get_profile_by_user_id(user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        # Update fields
        if request.avatar_url is not None:
            profile.avatar_url = request.avatar_url
        if request.bio is not None:
            profile.bio = request.bio
        if request.nationality is not None:
            profile.nationality = request.nationality
        if request.address is not None:
            profile.address = request.address
        if request.preferred_language is not None:
            profile.preferred_language = request.preferred_language
        if request.notification_preferences is not None:
            profile.notification_preferences = request.notification_preferences
        
        profile.updated_at = datetime.utcnow()
        
        updated_profile = await self.profile_repository.update_profile(profile)
        
        # Log activity
        await self._log_activity(
            user_id,
            "profile_updated",
            "User profile was updated"
        )
        
        return self._profile_to_response(updated_profile)
    
    async def delete_profile(self, user_id: str) -> bool:
        """Delete user profile"""
        profile = await self.profile_repository.get_profile_by_user_id(user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        # Log activity before deletion
        await self._log_activity(
            user_id,
            "profile_deleted",
            "User profile was deleted"
        )
        
        return await self.profile_repository.delete_profile(user_id)
    
    def _profile_to_response(self, profile: UserProfile) -> UserProfileResponse:
        """Convert UserProfile entity to UserProfileResponse DTO"""
        return UserProfileResponse(
            user_id=profile.user_id,
            avatar_url=profile.avatar_url,
            bio=profile.bio,
            nationality=profile.nationality,
            address=profile.address,
            loyalty_points=profile.loyalty_points,
            preferred_language=profile.preferred_language,
            notification_preferences=profile.notification_preferences,
            created_at=profile.created_at,
            updated_at=profile.updated_at
        )
    
    async def _log_activity(self, user_id: str, activity_type: str, description: str, metadata: Optional[dict] = None):
        """Log user activity"""
        try:
            activity = UserActivity(
                id=str(uuid.uuid4()),
                user_id=user_id,
                activity_type=activity_type,
                description=description,
                metadata=metadata,
                timestamp=datetime.utcnow()
            )
            await self.activity_repository.create_activity(activity)
        except Exception:
            # Don't fail the main operation if logging fails
            pass


class UserActivityService:
    """User activity management application service"""
    
    def __init__(self, activity_repository: UserActivityRepository):
        self.activity_repository = activity_repository
    
    async def log_activity(self, user_id: str, activity_type: str, description: str, metadata: Optional[dict] = None) -> UserActivityResponse:
        """Log user activity"""
        activity = UserActivity(
            id=str(uuid.uuid4()),
            user_id=user_id,
            activity_type=activity_type,
            description=description,
            metadata=metadata,
            timestamp=datetime.utcnow()
        )
        
        created_activity = await self.activity_repository.create_activity(activity)
        return self._activity_to_response(created_activity)
    
    async def get_user_activities(self, user_id: str, skip: int = 0, limit: int = 100) -> UserActivitiesResponse:
        """Get user activities"""
        activities = await self.activity_repository.get_activities_by_user_id(user_id, skip, limit)
        activity_responses = [self._activity_to_response(activity) for activity in activities]
        
        return UserActivitiesResponse(
            activities=activity_responses,
            total=len(activity_responses),  # In production, you'd want a separate count query
            page=skip // limit + 1 if limit > 0 else 1,
            page_size=limit
        )
    
    def _activity_to_response(self, activity: UserActivity) -> UserActivityResponse:
        """Convert UserActivity entity to UserActivityResponse DTO"""
        return UserActivityResponse(
            id=activity.id,
            user_id=activity.user_id,
            activity_type=activity.activity_type,
            description=activity.description,
            metadata=activity.metadata,
            timestamp=activity.timestamp
        )
