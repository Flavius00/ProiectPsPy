from abc import ABC, abstractmethod
from typing import Optional, List
from domain.entities import User, UserProfile, UserActivity, UserRole, UserStatus


class UserRepository(ABC):
    """Abstract user repository interface"""
    
    @abstractmethod
    async def create_user(self, user: User) -> User:
        pass
    
    @abstractmethod
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        pass
    
    @abstractmethod
    async def get_user_by_email(self, email: str) -> Optional[User]:
        pass
    
    @abstractmethod
    async def get_user_by_username(self, username: str) -> Optional[User]:
        pass
    
    @abstractmethod
    async def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        pass
    
    @abstractmethod
    async def update_user(self, user: User) -> User:
        pass
    
    @abstractmethod
    async def delete_user(self, user_id: str) -> bool:
        pass
    
    @abstractmethod
    async def get_users_by_role(self, role: UserRole) -> List[User]:
        pass
    
    @abstractmethod
    async def get_users_by_status(self, status: UserStatus) -> List[User]:
        pass


class UserProfileRepository(ABC):
    """Abstract user profile repository interface"""
    
    @abstractmethod
    async def create_profile(self, profile: UserProfile) -> UserProfile:
        pass
    
    @abstractmethod
    async def get_profile_by_user_id(self, user_id: str) -> Optional[UserProfile]:
        pass
    
    @abstractmethod
    async def update_profile(self, profile: UserProfile) -> UserProfile:
        pass
    
    @abstractmethod
    async def delete_profile(self, user_id: str) -> bool:
        pass


class UserActivityRepository(ABC):
    """Abstract user activity repository interface"""
    
    @abstractmethod
    async def create_activity(self, activity: UserActivity) -> UserActivity:
        pass
    
    @abstractmethod
    async def get_activities_by_user_id(self, user_id: str, skip: int = 0, limit: int = 100) -> List[UserActivity]:
        pass
    
    @abstractmethod
    async def get_activity_by_id(self, activity_id: str) -> Optional[UserActivity]:
        pass
