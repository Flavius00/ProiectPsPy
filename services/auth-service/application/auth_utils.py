# filepath: /Users/iosuapaul/Developer/hotel-chain-app/services/auth-service/application/auth_utils.py
"""
Authentication utilities for the auth service.
Contains helper functions related to authentication, role validation, and token management.
"""
from domain.entities import UserRole
from typing import Optional
from application.dtos import RegisterRequest


def validate_registration_role(request: RegisterRequest) -> RegisterRequest:
    """
    Validates that users can only register with CLIENT role.
    
    Args:
        request: The registration request containing user details including role
        
    Returns:
        The validated registration request with role set to CLIENT
        
    Raises:
        Exception: If a non-CLIENT role is specified
    """
    # Force the role to be CLIENT regardless of what was sent
    if request.role != UserRole.CLIENT:
        # Reject any attempt to register as non-client roles
        raise ValueError("Users can only register as clients. Other roles are managed internally.")
    
    # Ensure the role is explicitly set to CLIENT
    request.role = UserRole.CLIENT
    return request
