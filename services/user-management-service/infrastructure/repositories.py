from typing import Optional, List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from domain.entities import User, UserProfile, UserActivity, UserRole, UserStatus
from domain.repositories import UserRepository, UserProfileRepository, UserActivityRepository
from infrastructure.database import UserModel, UserProfileModel, UserActivityModel


class InMemoryUserRepository(UserRepository):
    """In-memory implementation of user repository for testing/demo purposes"""
    
    def __init__(self):
        self._users: Dict[str, User] = {}
    
    async def create_user(self, user: User) -> User:
        # TODO: Implement in-memory user creation
        pass
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        # TODO: Implement get user by ID
        pass
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        # TODO: Implement get user by email
        pass
    
    async def get_user_by_username(self, username: str) -> Optional[User]:
        # TODO: Implement get user by username
        pass
    
    async def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        # TODO: Implement get users list
        pass
    
    async def update_user(self, user: User) -> User:
        # TODO: Implement user update
        pass
    
    async def delete_user(self, user_id: str) -> bool:
        # TODO: Implement user deletion
        pass
    
    async def get_users_by_role(self, role: UserRole) -> List[User]:
        # TODO: Implement get users by role
        pass
    
    async def get_users_by_status(self, status: UserStatus) -> List[User]:
        # TODO: Implement get users by status
        pass


class SQLiteUserRepository(UserRepository):
    """SQLite implementation of user repository"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def _model_to_entity(self, model: UserModel) -> User:
        """Convert SQLAlchemy model to domain entity"""
        return User(
            id=model.id,
            email=model.email,
            username=model.username,
            first_name=model.first_name,
            last_name=model.last_name,
            phone_number=model.phone_number,
            date_of_birth=model.date_of_birth,
            role=UserRole(model.role),
            status=UserStatus(model.status),
            preferences=model.preferences,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
    
    def _entity_to_model(self, user: User) -> UserModel:
        """Convert domain entity to SQLAlchemy model"""
        return UserModel(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            phone_number=user.phone_number,
            date_of_birth=user.date_of_birth,
            role=user.role.value,
            status=user.status.value,
            preferences=user.preferences,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    
    async def create_user(self, user: User) -> User:
        db_user = self._entity_to_model(user)
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return self._model_to_entity(db_user)
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        result = await self.db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        db_user = result.scalar_one_or_none()
        return self._model_to_entity(db_user) if db_user else None
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(
            select(UserModel).where(UserModel.email == email)
        )
        db_user = result.scalar_one_or_none()
        return self._model_to_entity(db_user) if db_user else None
    
    async def get_user_by_username(self, username: str) -> Optional[User]:
        result = await self.db.execute(
            select(UserModel).where(UserModel.username == username)
        )
        db_user = result.scalar_one_or_none()
        return self._model_to_entity(db_user) if db_user else None
    
    async def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        result = await self.db.execute(
            select(UserModel).offset(skip).limit(limit)
        )
        db_users = result.scalars().all()
        return [self._model_to_entity(db_user) for db_user in db_users]
    
    async def update_user(self, user: User) -> User:
        result = await self.db.execute(
            select(UserModel).where(UserModel.id == user.id)
        )
        db_user = result.scalar_one_or_none()
        
        if not db_user:
            raise ValueError(f"User with id {user.id} not found")
        
        # Update fields
        db_user.email = user.email
        db_user.username = user.username
        db_user.first_name = user.first_name
        db_user.last_name = user.last_name
        db_user.phone_number = user.phone_number
        db_user.date_of_birth = user.date_of_birth
        db_user.role = user.role.value
        db_user.status = user.status.value
        db_user.preferences = user.preferences
        db_user.updated_at = user.updated_at
        
        await self.db.commit()
        await self.db.refresh(db_user)
        return self._model_to_entity(db_user)
    
    async def delete_user(self, user_id: str) -> bool:
        result = await self.db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        db_user = result.scalar_one_or_none()
        
        if not db_user:
            return False
        
        await self.db.delete(db_user)
        await self.db.commit()
        return True
    
    async def get_users_by_role(self, role: UserRole) -> List[User]:
        result = await self.db.execute(
            select(UserModel).where(UserModel.role == role.value)
        )
        db_users = result.scalars().all()
        return [self._model_to_entity(db_user) for db_user in db_users]
    
    async def get_users_by_status(self, status: UserStatus) -> List[User]:
        result = await self.db.execute(
            select(UserModel).where(UserModel.status == status.value)
        )
        db_users = result.scalars().all()
        return [self._model_to_entity(db_user) for db_user in db_users]


class SQLiteUserProfileRepository(UserProfileRepository):
    """SQLite implementation of user profile repository"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def _model_to_entity(self, model: UserProfileModel) -> UserProfile:
        """Convert SQLAlchemy model to domain entity"""
        return UserProfile(
            user_id=model.user_id,
            avatar_url=model.avatar_url,
            bio=model.bio,
            nationality=model.nationality,
            address=model.address,
            loyalty_points=model.loyalty_points,
            preferred_language=model.preferred_language,
            notification_preferences=model.notification_preferences,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
    
    def _entity_to_model(self, profile: UserProfile) -> UserProfileModel:
        """Convert domain entity to SQLAlchemy model"""
        return UserProfileModel(
            user_id=profile.user_id,
            avatar_url=profile.avatar_url,
            bio=profile.bio,
            nationality=profile.nationality,
            address=profile.address,
            loyalty_points=profile.loyalty_points,
            preferred_language=profile.preferred_language,
            notification_preferences=profile.notification_preferences,
            created_at=profile.created_at,
            updated_at=profile.updated_at
        )
    
    async def create_profile(self, profile: UserProfile) -> UserProfile:
        db_profile = self._entity_to_model(profile)
        self.db.add(db_profile)
        await self.db.commit()
        await self.db.refresh(db_profile)
        return self._model_to_entity(db_profile)
    
    async def get_profile_by_user_id(self, user_id: str) -> Optional[UserProfile]:
        result = await self.db.execute(
            select(UserProfileModel).where(UserProfileModel.user_id == user_id)
        )
        db_profile = result.scalar_one_or_none()
        return self._model_to_entity(db_profile) if db_profile else None
    
    async def update_profile(self, profile: UserProfile) -> UserProfile:
        result = await self.db.execute(
            select(UserProfileModel).where(UserProfileModel.user_id == profile.user_id)
        )
        db_profile = result.scalar_one_or_none()
        
        if not db_profile:
            raise ValueError(f"Profile for user {profile.user_id} not found")
        
        # Update fields
        db_profile.avatar_url = profile.avatar_url
        db_profile.bio = profile.bio
        db_profile.nationality = profile.nationality
        db_profile.address = profile.address
        db_profile.loyalty_points = profile.loyalty_points
        db_profile.preferred_language = profile.preferred_language
        db_profile.notification_preferences = profile.notification_preferences
        db_profile.updated_at = profile.updated_at
        
        await self.db.commit()
        await self.db.refresh(db_profile)
        return self._model_to_entity(db_profile)
    
    async def delete_profile(self, user_id: str) -> bool:
        result = await self.db.execute(
            select(UserProfileModel).where(UserProfileModel.user_id == user_id)
        )
        db_profile = result.scalar_one_or_none()
        
        if not db_profile:
            return False
        
        await self.db.delete(db_profile)
        await self.db.commit()
        return True


class SQLiteUserActivityRepository(UserActivityRepository):
    """SQLite implementation of user activity repository"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def _model_to_entity(self, model: UserActivityModel) -> UserActivity:
        """Convert SQLAlchemy model to domain entity"""
        return UserActivity(
            id=model.id,
            user_id=model.user_id,
            activity_type=model.activity_type,
            description=model.description,
            metadata=model.activity_metadata,
            timestamp=model.timestamp
        )
    
    def _entity_to_model(self, activity: UserActivity) -> UserActivityModel:
        """Convert domain entity to SQLAlchemy model"""
        return UserActivityModel(
            id=activity.id,
            user_id=activity.user_id,
            activity_type=activity.activity_type,
            description=activity.description,
            activity_metadata=activity.metadata,
            timestamp=activity.timestamp
        )
    
    async def create_activity(self, activity: UserActivity) -> UserActivity:
        db_activity = self._entity_to_model(activity)
        self.db.add(db_activity)
        await self.db.commit()
        await self.db.refresh(db_activity)
        return self._model_to_entity(db_activity)
    
    async def get_activities_by_user_id(self, user_id: str, skip: int = 0, limit: int = 100) -> List[UserActivity]:
        result = await self.db.execute(
            select(UserActivityModel)
            .where(UserActivityModel.user_id == user_id)
            .order_by(UserActivityModel.timestamp.desc())
            .offset(skip)
            .limit(limit)
        )
        db_activities = result.scalars().all()
        return [self._model_to_entity(db_activity) for db_activity in db_activities]
    
    async def get_activity_by_id(self, activity_id: str) -> Optional[UserActivity]:
        result = await self.db.execute(
            select(UserActivityModel).where(UserActivityModel.id == activity_id)
        )
        db_activity = result.scalar_one_or_none()
        return self._model_to_entity(db_activity) if db_activity else None


# Legacy in-memory implementations (keeping for compatibility)
class InMemoryUserProfileRepository(UserProfileRepository):
    """In-memory implementation of user profile repository for testing/demo purposes"""
    
    def __init__(self):
        self._profiles: Dict[str, UserProfile] = {}
    
    async def create_profile(self, profile: UserProfile) -> UserProfile:
        # TODO: Implement profile creation
        pass
    
    async def get_profile_by_user_id(self, user_id: str) -> Optional[UserProfile]:
        # TODO: Implement get profile by user ID
        pass
    
    async def update_profile(self, profile: UserProfile) -> UserProfile:
        # TODO: Implement profile update
        pass
    
    async def delete_profile(self, user_id: str) -> bool:
        # TODO: Implement profile deletion
        pass


class InMemoryUserActivityRepository(UserActivityRepository):
    """In-memory implementation of user activity repository for testing/demo purposes"""
    
    def __init__(self):
        self._activities: Dict[str, UserActivity] = {}
        self._user_activities: Dict[str, List[str]] = {}
    
    async def create_activity(self, activity: UserActivity) -> UserActivity:
        # TODO: Implement activity creation
        pass
    
    async def get_activities_by_user_id(self, user_id: str, skip: int = 0, limit: int = 100) -> List[UserActivity]:
        # TODO: Implement get activities by user ID
        pass
    
    async def get_activity_by_id(self, activity_id: str) -> Optional[UserActivity]:
        # TODO: Implement get activity by ID
        pass
