"""
Simple JWT Authentication Middleware for User Management Service
"""
import jwt
import os
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


class AuthMiddleware:
    """Simple JWT authentication middleware"""
    
    def __init__(self):
        self.jwt_secret = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
        self.jwt_algorithm = "HS256"

    async def verify_token(self, credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())) -> Dict[str, Any]:
        """Verify JWT token and return user info"""
        try:
            # Decode the JWT token
            payload = jwt.decode(
                credentials.credentials,
                self.jwt_secret,
                algorithms=[self.jwt_algorithm]
            )
            
            # Check if token has expired
            exp_timestamp = payload.get("exp")
            if exp_timestamp and datetime.utcfromtimestamp(exp_timestamp) < datetime.utcnow():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired"
                )
            
            # Extract user information
            user_info = {
                "user_id": payload.get("sub"),
                "email": payload.get("email"),
                "username": payload.get("username"),
                "role": payload.get("role"),
                "exp": payload.get("exp"),
                "iat": payload.get("iat")
            }
            
            if not user_info["user_id"] or not user_info["role"]:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload"
                )
            
            return user_info
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed"
            )

    def require_admin(self):
        """Require ADMIN role"""
        async def admin_checker(user_info: Dict[str, Any] = Depends(self.verify_token)) -> Dict[str, Any]:
            user_role = user_info.get("role", "").upper()
            if user_role != "ADMIN":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin access required"
                )
            return user_info
        return admin_checker


# Global auth middleware instance
auth_middleware = AuthMiddleware()

# Export commonly used dependencies
require_admin = auth_middleware.require_admin()
verify_token = auth_middleware.verify_token
