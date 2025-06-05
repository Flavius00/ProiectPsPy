from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from application.services import AuthService
from application.dtos import RegisterRequest, LoginRequest, UserResponse, LogoutResponse
from domain.entities import Token
from infrastructure.repositories import SQLiteUserRepository
from infrastructure.database import get_db
from infrastructure.middleware.auth_middleware import get_current_user_from_token
from typing import Dict, Any

router = APIRouter()


# Dependency to get auth service with SQLite repository
async def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    user_repository = SQLiteUserRepository(db)
    return AuthService(user_repository)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, auth_service: AuthService = Depends(get_auth_service)):
    """Register a new user (only as client role)"""
    try:
        from application.auth_utils import validate_registration_role
        # Validate and enforce that users can only register as clients
        validated_request = validate_registration_role(request)
        return await auth_service.register_user(validated_request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/login", response_model=Token)
async def login(request: LoginRequest, auth_service: AuthService = Depends(get_auth_service)):
    """Login user and return access token"""
    try:
        return await auth_service.login_user(request)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/logout", response_model=LogoutResponse)
async def logout(auth_service: AuthService = Depends(get_auth_service)):
    """Logout user - minimal implementation for stateless JWT"""
    try:
        return await auth_service.logout_user()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Dict[str, Any] = Depends(get_current_user_from_token),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Get current user information"""
    try:
        user_id = current_user["user_id"]
        return await auth_service.get_current_user(user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
