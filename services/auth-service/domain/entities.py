from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User role enumeration for hotel chain application"""
    CLIENT = "client"
    EMPLOYEE = "employee"
    MANAGER = "manager"
    ADMIN = "admin"


class User(BaseModel):
    """User domain entity"""
    id: Optional[str] = None
    email: EmailStr
    username: str
    hashed_password: str
    role: UserRole = UserRole.CLIENT
    is_active: bool = True
    is_verified: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token domain entity"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
