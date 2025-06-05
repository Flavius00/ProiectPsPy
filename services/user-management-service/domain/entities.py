from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User role enumeration"""
    GUEST = "guest"
    CUSTOMER = "customer"
    STAFF = "staff"
    MANAGER = "manager"
    ADMIN = "admin"


class UserStatus(str, Enum):
    """User status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class User(BaseModel):
    """User domain entity"""
    id: Optional[str] = None
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    role: UserRole = UserRole.GUEST
    status: UserStatus = UserStatus.PENDING
    preferences: Optional[dict] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    """User profile domain entity"""
    user_id: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    nationality: Optional[str] = None
    address: Optional[dict] = None
    loyalty_points: int = 0
    preferred_language: str = "en"
    notification_preferences: Optional[dict] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserActivity(BaseModel):
    """User activity domain entity"""
    id: Optional[str] = None
    user_id: str
    activity_type: str
    description: str
    metadata: Optional[dict] = None
    timestamp: datetime

    class Config:
        from_attributes = True
