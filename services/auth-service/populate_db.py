#!/usr/bin/env python3
"""
Auth Service Database Population Script
Populates the auth-service database with test users of various roles
"""
import sys
import os
import asyncio
import uuid
import datetime
from pathlib import Path
from sqlalchemy import select

# Add parent directory to path to import modules
sys.path.append(str(Path(__file__).parent.parent))

from infrastructure.database import create_tables, UserModel, AsyncSessionLocal
from passlib.context import CryptContext

# Initialize password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

async def populate_auth_db():
    """Populate auth database with test users"""
    print("Creating tables...")
    await create_tables()
    
    # Create test users
    users = [
        # Admin user
        UserModel(
            id=str(uuid.uuid4()),
            username="admin",
            email="admin@hotelchain.com",
            hashed_password=get_password_hash("admin123"),
            role="ADMIN",
            is_active=True,
            is_verified=True,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc)
        ),
        # Manager user
        UserModel(
            id=str(uuid.uuid4()),
            username="manager",
            email="manager@hotelchain.com",
            hashed_password=get_password_hash("manager123"),
            role="MANAGER",
            is_active=True,
            is_verified=True,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc)
        ),
        # Employee user
        UserModel(
            id=str(uuid.uuid4()),
            username="employee",
            email="employee@hotelchain.com",
            hashed_password=get_password_hash("employee123"),
            role="EMPLOYEE",
            is_active=True,
            is_verified=True,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc)
        ),
        # Client user
        UserModel(
            id=str(uuid.uuid4()),
            username="client",
            email="client@example.com",
            hashed_password=get_password_hash("client123"),
            role="CLIENT",
            is_active=True,
            is_verified=True,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc)
        ),
        # Another client user
        UserModel(
            id=str(uuid.uuid4()),
            username="client2",
            email="client2@example.com",
            hashed_password=get_password_hash("client123"),
            role="CLIENT",
            is_active=True,
            is_verified=True,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc)
        ),
    ]
    
    async with AsyncSessionLocal() as session:
        # Check if users already exist
        for user in users:
            result = await session.execute(select(UserModel).where(UserModel.email == user.email))
            existing_user = result.scalar_one_or_none()
            if not existing_user:
                session.add(user)
                print(f"Adding user: {user.username} ({user.role})")
            else:
                print(f"User {user.username} with email {user.email} already exists, skipping")
        
        await session.commit()
    
    print("Auth database populated successfully!")

if __name__ == "__main__":
    asyncio.run(populate_auth_db())
