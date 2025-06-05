from pydantic import BaseModel, EmailStr
from typing import Optional
from domain.entities import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    role: Optional[UserRole] = UserRole.CLIENT


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    role: UserRole
    is_active: bool
    is_verified: bool


class LogoutResponse(BaseModel):
    message: str
    success: bool
