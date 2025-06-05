from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Security scheme for Bearer token
security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)

class AuthMiddleware:
    """JWT Authentication Middleware for Hotel Service"""
    
    def __init__(self):
        # These should match your Auth Service configuration
        self.jwt_secret = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
        self.jwt_algorithm = "HS256"
        self.auth_service_url = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
    
    async def verify_token(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
        """
        Verify JWT token and return user information
        
        Returns:
            dict: User information including user_id, email, role, username
        
        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            # Decode the JWT token
            payload = jwt.decode(
                credentials.credentials,
                self.jwt_secret,
                algorithms=[self.jwt_algorithm]
            )
            
            print(f"DEBUG: JWT payload: {payload}")  # Debug logging
            
            # Check if token has expired
            exp_timestamp = payload.get("exp")
            if exp_timestamp and datetime.utcfromtimestamp(exp_timestamp) < datetime.utcnow():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            
            # Extract user information - handle both old and new token formats
            sub = payload.get("sub")  # Standard JWT subject claim
            user_id = payload.get("user_id") or sub  # Fallback to sub for user_id
            email = payload.get("email") or sub  # Use sub as email if not present
            username = payload.get("username") or email or sub  # Use email or sub as username
            
            user_info = {
                "user_id": user_id,
                "email": email,
                "role": payload.get("role"),
                "username": username,
                "sub": sub,  # Keep the original sub field
                "exp": payload.get("exp"),
                "iat": payload.get("iat")
            }
            
            # Validate required fields
            if not user_info["role"] or not (user_info["user_id"] or user_info["sub"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            
            print(f"DEBUG: Final user_info: {user_info}")  # Debug logging
            
            logger.info(f"User authenticated: {user_info['username']} ({user_info['role']})")
            return user_info
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"}
            )
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"}
            )
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed",
                headers={"WWW-Authenticate": "Bearer"}
            )
    
    async def optional_verify_token(self, credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)) -> Optional[Dict[str, Any]]:
        """
        Optional token verification - returns user info if authenticated, None if not
        Used for endpoints that work for both authenticated and anonymous users
        """
        if not credentials:
            return None
        
        try:
            # Use the same verification logic but don't raise exceptions
            payload = jwt.decode(
                credentials.credentials,
                self.jwt_secret,
                algorithms=[self.jwt_algorithm]
            )
            
            # Check expiration
            exp_timestamp = payload.get("exp")
            if exp_timestamp and datetime.utcfromtimestamp(exp_timestamp) < datetime.utcnow():
                return None
            
            # Extract user information - handle both old and new token formats
            sub = payload.get("sub")  # Standard JWT subject claim
            user_id = payload.get("user_id") or sub  # Fallback to sub for user_id
            email = payload.get("email") or sub  # Use sub as email if not present
            username = payload.get("username") or email or sub  # Use email or sub as username
            
            user_info = {
                "user_id": user_id,
                "email": email,
                "role": payload.get("role"),
                "username": username,
                "sub": sub,  # Keep the original sub field
                "exp": payload.get("exp"),
                "iat": payload.get("iat")
            }
            
            if not user_info["role"] or not (user_info["user_id"] or user_info["sub"]):
                return None
            
            logger.info(f"Optional auth successful: {user_info['username']} ({user_info['role']})")
            return user_info
            
        except Exception as e:
            logger.debug(f"Optional authentication failed: {str(e)}")
            return None
    
    def require_roles(self, required_roles: List[str]):
        """
        Create a dependency that requires specific roles
        
        Args:
            required_roles: List of roles that are allowed access (case-insensitive)
        
        Returns:
            Dependency function that can be used with FastAPI Depends()
        """
        async def role_checker(user_info: Dict[str, Any] = Depends(self.verify_token)) -> Dict[str, Any]:
            user_role = user_info.get("role", "").upper()
            required_roles_upper = [role.upper() for role in required_roles]
            if user_role not in required_roles_upper:
                logger.warning(f"Access denied for user {user_info.get('username')} with role {user_info.get('role')}. Required: {required_roles}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required roles: {', '.join(required_roles)}"
                )
            return user_info
        
        return role_checker

# Global middleware instance
auth_middleware = AuthMiddleware()

# Common role-based dependencies
async def require_admin(user_info: Dict[str, Any] = Depends(auth_middleware.verify_token)) -> Dict[str, Any]:
    """Require ADMIN role"""
    user_role = user_info["role"].upper() if user_info["role"] else ""
    if user_role != "ADMIN":
        logger.warning(f"Admin access denied for user {user_info.get('username')} with role {user_info['role']}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator privileges required."
        )
    return user_info

async def require_manager_or_admin(user_info: Dict[str, Any] = Depends(auth_middleware.verify_token)) -> Dict[str, Any]:
    """Require MANAGER or ADMIN role"""
    user_role = user_info["role"].upper() if user_info["role"] else ""
    if user_role not in ["MANAGER", "ADMIN"]:
        logger.warning(f"Manager/Admin access denied for user {user_info.get('username')} with role {user_info['role']}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Manager or Administrator privileges required."
        )
    return user_info

async def require_employee_or_above(user_info: Dict[str, Any] = Depends(auth_middleware.verify_token)) -> Dict[str, Any]:
    """Require EMPLOYEE, MANAGER, or ADMIN role"""
    user_role = user_info["role"].upper() if user_info["role"] else ""
    if user_role not in ["EMPLOYEE", "MANAGER", "ADMIN"]:
        logger.warning(f"Employee access denied for user {user_info.get('username')} with role {user_info['role']}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employee privileges or higher required."
        )
    return user_info

async def require_client(user_info: Dict[str, Any] = Depends(auth_middleware.verify_token)) -> Dict[str, Any]:
    """Require CLIENT role (for creating reviews, bookings, etc.)"""
    user_role = user_info["role"].upper() if user_info["role"] else ""
    if user_role != "CLIENT":
        logger.warning(f"Client access denied for user {user_info.get('username')} with role {user_info['role']}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Client role required."
        )
    return user_info

async def require_any_authenticated_user(user_info: Dict[str, Any] = Depends(auth_middleware.verify_token)) -> Dict[str, Any]:
    """Require any valid authenticated user (any role)"""
    return user_info

async def optional_authentication(user_info: Optional[Dict[str, Any]] = Depends(auth_middleware.optional_verify_token)) -> Optional[Dict[str, Any]]:
    """Optional authentication - returns user info if authenticated, None otherwise"""
    return user_info

# Utility functions
def get_current_user_id(user_info: Dict[str, Any]) -> str:
    """Extract user ID from user info"""
    return user_info["user_id"]

def get_current_user_role(user_info: Dict[str, Any]) -> str:
    """Extract user role from user info"""
    return user_info["role"]

def is_admin(user_info: Dict[str, Any]) -> bool:
    """Check if current user is admin"""
    return user_info.get("role") == "ADMIN"

def is_manager_or_admin(user_info: Dict[str, Any]) -> bool:
    """Check if current user is manager or admin"""
    return user_info.get("role") in ["MANAGER", "ADMIN"]

def can_manage_hotels(user_info: Dict[str, Any]) -> bool:
    """Check if user can manage hotels (employee or above)"""
    return user_info.get("role") in ["EMPLOYEE", "MANAGER", "ADMIN"]
