"""
Authentication interface for reservation endpoints
"""
from typing import Optional, Dict, Any
from fastapi import Depends
from infrastructure.middleware.auth_middleware import (
    auth_middleware,
    require_employee_or_above,
    optional_authentication
)


async def get_current_user(user_info: Optional[Dict[str, Any]] = Depends(optional_authentication)) -> Optional[Dict[str, Any]]:
    """Get current authenticated user (optional)"""
    if user_info:
        # Map user_info to expected format for reservations
        # Handle case where token only has 'sub' field (from auth service)
        user_id = user_info.get("user_id") or user_info.get("sub")
        email = user_info.get("email") or user_info.get("sub")  # Use sub as email fallback
        role = user_info.get("role")
        
        if not user_id or not role:
            return None
        
        return {
            "sub": user_id,  # Standard JWT subject claim
            "email": email,
            "role": role,
            "username": user_info.get("username") or email  # Use email as username fallback
        }
    return None


async def require_employee(user_info: Dict[str, Any] = Depends(require_employee_or_above)) -> Dict[str, Any]:
    """Require employee role or above"""
    user_id = user_info.get("user_id") or user_info.get("sub")
    return {
        "sub": user_id,  # Standard JWT subject claim
        "email": user_info["email"],
        "role": user_info["role"],
        "username": user_info["username"]
    }
