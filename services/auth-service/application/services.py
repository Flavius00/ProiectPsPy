from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from domain.entities import User, Token, UserRole
from domain.repositories import UserRepository
from application.dtos import RegisterRequest, LoginRequest, UserResponse, LogoutResponse
from fastapi import HTTPException, status
import uuid
import os


class AuthService:
    """Authentication application service"""
    
    SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")  # In production, use environment variables
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def _hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)
    
    def _verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def _create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
        return encoded_jwt
    
    async def register_user(self, request: RegisterRequest) -> UserResponse:
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
        
        # Enforce client role - this is a double check in case the validation in auth_utils wasn't called
        if request.role != UserRole.CLIENT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Users can only register as clients. Other roles are managed internally."
            )
        
        # Create new user
        hashed_password = self._hash_password(request.password)
        user = User(
            id=str(uuid.uuid4()),
            email=request.email,
            username=request.username,
            hashed_password=hashed_password,
            role=UserRole.CLIENT,  # Force client role
            is_active=True,
            is_verified=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        created_user = await self.user_repository.create_user(user)
        
        return UserResponse(
            id=created_user.id,
            email=created_user.email,
            username=created_user.username,
            role=created_user.role,
            is_active=created_user.is_active,
            is_verified=created_user.is_verified
        )
    
    async def login_user(self, request: LoginRequest) -> Token:
        # Authenticate user
        user = await self.user_repository.get_user_by_email(request.email)
        if not user or not self._verify_password(request.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = self._create_access_token(
            data={
                "sub": user.email,
                "user_id": user.id,
                "role": user.role.value,
                "username": user.username
            }, 
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=self.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    async def logout_user(self) -> LogoutResponse:
        """
        Logout user - minimal implementation for stateless JWT.
        In a production system, you might want to:
        - Add token to a blacklist
        - Store invalidated tokens in a cache/database
        - Implement token refresh logic
        """
        return LogoutResponse(
            message="Successfully logged out",
            success=True
        )

    async def get_current_user(self, user_id: str) -> UserResponse:
        """Get current user information by user ID from JWT token"""
        user = await self.user_repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        return UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified
        )
