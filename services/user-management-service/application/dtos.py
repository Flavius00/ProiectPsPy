from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from domain.entities import UserRole, UserStatus


class CreateUserRequest(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    role: UserRole = UserRole.GUEST


class UpdateUserRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    preferences: Optional[dict] = None


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    role: UserRole
    status: UserStatus
    preferences: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    page_size: int


class CreateProfileRequest(BaseModel):
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    nationality: Optional[str] = None
    address: Optional[dict] = None
    preferred_language: str = "en"
    notification_preferences: Optional[dict] = None


class UpdateProfileRequest(BaseModel):
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    nationality: Optional[str] = None
    address: Optional[dict] = None
    preferred_language: Optional[str] = None
    notification_preferences: Optional[dict] = None


class UserProfileResponse(BaseModel):
    user_id: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    nationality: Optional[str] = None
    address: Optional[dict] = None
    loyalty_points: int
    preferred_language: str
    notification_preferences: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


class UserActivityResponse(BaseModel):
    id: str
    user_id: str
    activity_type: str
    description: str
    metadata: Optional[dict] = None
    timestamp: datetime


class UserActivitiesResponse(BaseModel):
    activities: List[UserActivityResponse]
    total: int
    page: int
    page_size: int
