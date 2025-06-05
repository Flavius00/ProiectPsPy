#!/usr/bin/env python3
"""
Auth Service Database Cleanup and Population Script
Cleans up the existing auth-service database and populates it with 4 new accounts:
- Client
- Employee  
- Admin
- Manager

This script also creates a credentials markdown file for verification.
"""
import sys
import os
import asyncio
import uuid
import datetime
from pathlib import Path
from sqlalchemy import select, delete

# Add parent directory to path to import modules
sys.path.append(str(Path(__file__).parent))

from infrastructure.database import create_tables, UserModel, AsyncSessionLocal, engine
from passlib.context import CryptContext

# Initialize password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

async def cleanup_database():
    """Clean up existing users from the database"""
    print("🧹 Cleaning up existing database...")
    
    async with AsyncSessionLocal() as session:
        # Delete all existing users
        await session.execute(delete(UserModel))
        await session.commit()
        print("✅ Database cleaned up successfully")

async def populate_auth_db():
    """Populate auth database with 4 new accounts"""
    print("📋 Creating tables...")
    await create_tables()
    
    # Generate unique IDs for consistency
    client_id = str(uuid.uuid4())
    employee_id = str(uuid.uuid4())
    admin_id = str(uuid.uuid4())
    manager_id = str(uuid.uuid4())
    
    current_time = datetime.datetime.now(datetime.timezone.utc)
    
    # Create the 4 required users with secure passwords
    users = [
        # Client user
        UserModel(
            id=client_id,
            username="client_user",
            email="client@hotelchain.com", 
            hashed_password=get_password_hash("ClientPass2024!"),
            role="client",
            is_active=True,
            is_verified=True,
            created_at=current_time,
            updated_at=current_time
        ),
        # Employee user
        UserModel(
            id=employee_id,
            username="employee_user",
            email="employee@hotelchain.com",
            hashed_password=get_password_hash("EmployeePass2024!"),
            role="employee",
            is_active=True,
            is_verified=True,
            created_at=current_time,
            updated_at=current_time
        ),
        # Admin user
        UserModel(
            id=admin_id,
            username="admin_user",
            email="admin@hotelchain.com",
            hashed_password=get_password_hash("AdminPass2024!"),
            role="admin",
            is_active=True,
            is_verified=True,
            created_at=current_time,
            updated_at=current_time
        ),
        # Manager user
        UserModel(
            id=manager_id,
            username="manager_user",
            email="manager@hotelchain.com",
            hashed_password=get_password_hash("ManagerPass2024!"),
            role="manager",
            is_active=True,
            is_verified=True,
            created_at=current_time,
            updated_at=current_time
        ),
    ]
    
    async with AsyncSessionLocal() as session:
        # Add all users to the database
        for user in users:
            session.add(user)
            print(f"➕ Adding user: {user.username} ({user.role}) - {user.email}")
        
        await session.commit()
    
    print("✅ Auth database populated successfully with 4 new accounts!")
    
    # Return user credentials for markdown file creation
    return [
        {"id": client_id, "username": "client_user", "email": "client@hotelchain.com", "password": "ClientPass2024!", "role": "client"},
        {"id": employee_id, "username": "employee_user", "email": "employee@hotelchain.com", "password": "EmployeePass2024!", "role": "employee"},
        {"id": admin_id, "username": "admin_user", "email": "admin@hotelchain.com", "password": "AdminPass2024!", "role": "admin"},
        {"id": manager_id, "username": "manager_user", "email": "manager@hotelchain.com", "password": "ManagerPass2024!", "role": "manager"},
    ]

def create_credentials_file(credentials):
    """Create a markdown file with account credentials"""
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    content = f"""# 🔐 Authentication Service - Account Credentials

**Generated on:** {current_time}  
**Service:** Auth Service (Port 8001)  
**Database:** auth_service.db  

## 📋 Test Accounts

### 👤 Client Account
- **Role:** CLIENT
- **Username:** `client_user`
- **Email:** `client@hotelchain.com`
- **Password:** `ClientPass2024!`
- **User ID:** `{credentials[0]['id']}`
- **Permissions:** View hotels, make reservations, create reviews

### 👷 Employee Account  
- **Role:** EMPLOYEE
- **Username:** `employee_user`
- **Email:** `employee@hotelchain.com`
- **Password:** `EmployeePass2024!`
- **User ID:** `{credentials[1]['id']}`
- **Permissions:** Manage hotels, rooms, process reservations

### 👨‍💼 Manager Account
- **Role:** MANAGER
- **Username:** `manager_user`
- **Email:** `manager@hotelchain.com`
- **Password:** `ManagerPass2024!`
- **User ID:** `{credentials[3]['id']}`
- **Permissions:** All employee permissions + analytics, reports

### 🔧 Admin Account
- **Role:** ADMIN
- **Username:** `admin_user`
- **Email:** `admin@hotelchain.com`
- **Password:** `AdminPass2024!`
- **User ID:** `{credentials[2]['id']}`
- **Permissions:** Full system access, user management

## 🧪 Testing Instructions

### Login Test (using curl):
```bash
# Test Client Login
curl -X POST "http://localhost:8001/api/v1/auth/login" \\
     -H "Content-Type: application/json" \\
     -d '{{"email": "client@hotelchain.com", "password": "ClientPass2024!"}}'

# Test Admin Login  
curl -X POST "http://localhost:8001/api/v1/auth/login" \\
     -H "Content-Type: application/json" \\
     -d '{{"email": "admin@hotelchain.com", "password": "AdminPass2024!"}}'
```

### Frontend Login:
1. Navigate to `http://localhost:3000/login`
2. Use any of the email/password combinations above
3. Verify role-based access in the application

## 🔒 Security Notes
- All passwords use bcrypt hashing
- Accounts are pre-verified and active
- JWT tokens will be issued upon successful login
- Token expiration follows service configuration

## 📊 Database Verification
```bash
# Check if users were created successfully
cd /Users/iosuapaul/Developer/hotel-chain-app/services/auth-service
python3 -c "
import asyncio
from infrastructure.database import AsyncSessionLocal, UserModel
from sqlalchemy import select

async def check_users():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserModel))
        users = result.scalars().all()
        print(f'Total users: {{len(users)}}')
        for user in users:
            print(f'- {{user.username}} ({{user.role}}) - {{user.email}}')

asyncio.run(check_users())
"
```

---
*Generated by cleanup_and_populate_db.py script*
"""
    
    # Write the markdown file
    file_path = Path(__file__).parent / "AUTH_SERVICE_CREDENTIALS.md"
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"📄 Credentials file created: {file_path}")
    print("🔍 You can now verify the accounts using the information in AUTH_SERVICE_CREDENTIALS.md")

async def main():
    """Main function to cleanup and populate the database"""
    print("🚀 Starting Auth Service Database Cleanup and Population")
    print("=" * 60)
    
    try:
        # Step 1: Cleanup existing database
        await cleanup_database()
        
        # Step 2: Populate with new accounts
        credentials = await populate_auth_db()
        
        # Step 3: Create credentials file
        create_credentials_file(credentials)
        
        print("\n" + "=" * 60)
        print("🎉 SUCCESS! Database cleanup and population completed!")
        print("📋 Summary:")
        print("   • Database cleaned up")
        print("   • 4 new accounts created (CLIENT, EMPLOYEE, ADMIN, MANAGER)")
        print("   • Credentials saved to AUTH_SERVICE_CREDENTIALS.md")
        print("   • Auth service is ready for testing!")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("Please check the error details and try again.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
