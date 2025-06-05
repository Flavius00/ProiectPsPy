"""
JWT Authentication middleware for the Auth Service
"""
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Dict, Any
import logging
import os

logger = logging.getLogger(__name__)

# JWT Configuration (should match AuthService settings)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")  # Should be same as in AuthService
ALGORITHM = "HS256"

security = HTTPBearer()


async def get_current_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Extract and validate JWT token, return user information
    """
    token = credentials.credentials
    
    try:
        # Decode JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract user information from token
        user_id: str = payload.get("user_id")
        email: str = payload.get("sub")  # Subject is typically email
        role: str = payload.get("role")
        username: str = payload.get("username")
        
        if user_id is None or email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user information",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Return user context
        return {
            "user_id": user_id,
            "email": email,
            "role": role,
            "username": username
        }
        
    except JWTError as e:
        logger.error(f"JWT validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token validation failed",
            headers={"WWW-Authenticate": "Bearer"},
        )
