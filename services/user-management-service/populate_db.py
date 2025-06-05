#!/usr/bin/env python3
"""
User Management Service Database Population Script
Populates the user-management-service database with test users
"""
import sys
import os
import asyncio
import uuid
import random
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path to import modules
sys.path.append(str(Path(__file__).parent.parent))

from infrastructure.database import create_tables, AsyncSessionLocal, UserModel
from application.services import get_password_hash

# Sample data
FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
ROLES = ["ADMIN", "MANAGER", "EMPLOYEE", "CLIENT"]
STATUSES = ["active", "inactive", "suspended", "pending"]

async def populate_user_management_db():
    """Populate user management database with test users"""
    print("Creating tables...")
    await create_tables()
    
    async with AsyncSessionLocal() as session:
        # Create a fixed set of users (one for each role)
        # These should match users in auth service
        fixed_users = [
            UserModel(
                id=str(uuid.uuid4()),
                username="admin",
                email="admin@hotelchain.com",
                password_hash=get_password_hash("admin123"),
                role="ADMIN",
                status="active",
                first_name="Admin",
                last_name="User",
                created_at=datetime.utcnow() - timedelta(days=100),
                updated_at=datetime.utcnow() - timedelta(days=10),
                last_login=datetime.utcnow() - timedelta(hours=2)
            ),
            UserModel(
                id=str(uuid.uuid4()),
                username="manager",
                email="manager@hotelchain.com",
                password_hash=get_password_hash("manager123"),
                role="MANAGER",
                status="active",
                first_name="Manager",
                last_name="User",
                created_at=datetime.utcnow() - timedelta(days=90),
                updated_at=datetime.utcnow() - timedelta(days=5),
                last_login=datetime.utcnow() - timedelta(days=1)
            ),
            UserModel(
                id=str(uuid.uuid4()),
                username="employee",
                email="employee@hotelchain.com",
                password_hash=get_password_hash("employee123"),
                role="EMPLOYEE",
                status="active",
                first_name="Employee",
                last_name="User",
                created_at=datetime.utcnow() - timedelta(days=60),
                updated_at=datetime.utcnow() - timedelta(days=3),
                last_login=datetime.utcnow() - timedelta(hours=5)
            ),
            UserModel(
                id=str(uuid.uuid4()),
                username="client",
                email="client@example.com",
                password_hash=get_password_hash("client123"),
                role="CLIENT",
                status="active",
                first_name="Client",
                last_name="User",
                created_at=datetime.utcnow() - timedelta(days=30),
                updated_at=datetime.utcnow() - timedelta(days=30),
                last_login=datetime.utcnow() - timedelta(days=2)
            ),
        ]
        
        for user in fixed_users:
            # Check if user already exists
            stmt = f"SELECT id FROM users WHERE email = '{user.email}'"
            result = await session.execute(stmt)
            existing_user = result.first()
            
            if not existing_user:
                session.add(user)
                print(f"Adding user: {user.username} ({user.role})")
            else:
                print(f"User {user.username} already exists, skipping")
        
        await session.commit()
        
        # Create additional random users
        for i in range(20):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            # 70% clients, 20% employees, 5% managers, 5% admins
            role_weights = [0.05, 0.05, 0.2, 0.7]
            role = random.choices(ROLES, weights=role_weights)[0]
            
            # 80% active, 10% inactive, 5% suspended, 5% pending
            status_weights = [0.8, 0.1, 0.05, 0.05]
            status = random.choices(STATUSES, weights=status_weights)[0]
            
            # Username is usually firstinitial_lastname
            username = f"{first_name[0].lower()}{last_name.lower()}{random.randint(1, 99)}"
            
            user = UserModel(
                id=str(uuid.uuid4()),
                username=username,
                email=f"{username}@example.com",
                password_hash=get_password_hash("password123"),
                role=role,
                status=status,
                first_name=first_name,
                last_name=last_name,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 365)),
                updated_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
                last_login=datetime.utcnow() - timedelta(days=random.randint(0, 60))
            )
            
            # Check if user already exists
            stmt = f"SELECT id FROM users WHERE email = '{user.email}'"
            result = await session.execute(stmt)
            existing_user = result.first()
            
            if not existing_user:
                session.add(user)
                print(f"Adding user: {user.username} ({user.role})")
            else:
                print(f"User {user.username} already exists, skipping")
        
        await session.commit()
    
    print("User Management database populated successfully!")

if __name__ == "__main__":
    asyncio.run(populate_user_management_db())
