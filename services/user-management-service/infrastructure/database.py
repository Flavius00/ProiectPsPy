from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, JSON
from datetime import datetime
import os

# Database URL - SQLite with async support
DATABASE_URL = "sqlite+aiosqlite:///./user_management_service.db"

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()


class UserModel(Base):
    """SQLAlchemy User model"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone_number = Column(String)
    date_of_birth = Column(DateTime)
    role = Column(String, nullable=False, default="guest")
    status = Column(String, nullable=False, default="pending")
    preferences = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserProfileModel(Base):
    """SQLAlchemy User Profile model"""
    __tablename__ = "user_profiles"
    
    user_id = Column(String, primary_key=True, index=True)
    avatar_url = Column(String)
    bio = Column(Text)
    nationality = Column(String)
    address = Column(JSON)
    loyalty_points = Column(Integer, default=0)
    preferred_language = Column(String, default="en")
    notification_preferences = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserActivityModel(Base):
    """SQLAlchemy User Activity model"""
    __tablename__ = "user_activities"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    activity_type = Column(String, nullable=False)
    description = Column(String, nullable=False)
    activity_metadata = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)


# Database dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# Create tables
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


class Database:
    """Database manager class"""
    
    def __init__(self):
        self.engine = engine
        self.session_local = AsyncSessionLocal
    
    async def init_db(self):
        """Initialize database tables"""
        await create_tables()
    
    async def get_session(self):
        """Get database session"""
        async with self.session_local() as session:
            try:
                yield session
            finally:
                await session.close()
