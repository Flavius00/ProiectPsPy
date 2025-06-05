from typing import Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from domain.entities import User
from domain.repositories import UserRepository
from infrastructure.database import UserModel


class InMemoryUserRepository(UserRepository):
    """In-memory implementation of user repository for testing/demo purposes"""
    
    def __init__(self):
        self._users: Dict[str, User] = {}
    
    async def create_user(self, user: User) -> User:
        self._users[user.id] = user
        return user
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        for user in self._users.values():
            if user.email == email:
                return user
        return None
    
    async def get_user_by_username(self, username: str) -> Optional[User]:
        for user in self._users.values():
            if user.username == username:
                return user
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self._users.get(user_id)
    
    async def update_user(self, user: User) -> User:
        if user.id in self._users:
            self._users[user.id] = user
            return user
        raise ValueError(f"User with id {user.id} not found")


class SQLiteUserRepository(UserRepository):
    """SQLite implementation of user repository"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def _model_to_entity(self, model: UserModel) -> User:
        """Convert SQLAlchemy model to domain entity"""
        from domain.entities import UserRole
        return User(
            id=model.id,
            email=model.email,
            username=model.username,
            hashed_password=model.hashed_password,
            role=UserRole(model.role),
            is_active=model.is_active,
            is_verified=model.is_verified,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
    
    def _entity_to_model(self, user: User) -> UserModel:
        """Convert domain entity to SQLAlchemy model"""
        return UserModel(
            id=user.id,
            email=user.email,
            username=user.username,
            hashed_password=user.hashed_password,
            role=user.role.value,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    
    async def create_user(self, user: User) -> User:
        try:
            db_user = self._entity_to_model(user)
            self.db.add(db_user)
            await self.db.commit()
            await self.db.refresh(db_user)
            return self._model_to_entity(db_user)
        except Exception as e:
            await self.db.rollback()
            raise e
    
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
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        result = await self.db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        db_user = result.scalar_one_or_none()
        return self._model_to_entity(db_user) if db_user else None
    
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
        db_user.hashed_password = user.hashed_password
        db_user.role = user.role.value
        db_user.is_active = user.is_active
        db_user.is_verified = user.is_verified
        db_user.updated_at = user.updated_at
        
        await self.db.commit()
        await self.db.refresh(db_user)
        return self._model_to_entity(db_user)
