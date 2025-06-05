# 🔐 Authentication Service - Account Credentials

**Generated on:** 2025-05-25 19:54:32  
**Service:** Auth Service (Port 8001)  
**Database:** auth_service.db  
**Status:** ✅ All accounts tested and working

## 📋 Test Accounts

### 👤 Client Account
- **Role:** `client`
- **Username:** `client_user`
- **Email:** `client@hotelchain.com`
- **Password:** `ClientPass2024!`
- **User ID:** `ef82a50d-252d-44f3-9038-4f0fcbc83cf4`
- **Permissions:** View hotels, make reservations, create reviews
- **✅ Login Status:** Tested and working

### 👷 Employee Account  
- **Role:** `employee`
- **Username:** `employee_user`
- **Email:** `employee@hotelchain.com`
- **Password:** `EmployeePass2024!`
- **User ID:** `583293b3-06d7-4d99-8054-10636bb0a7a4`
- **Permissions:** Manage hotels, rooms, process reservations
- **✅ Login Status:** Tested and working

### 👨‍💼 Manager Account
- **Role:** `manager`
- **Username:** `manager_user`
- **Email:** `manager@hotelchain.com`
- **Password:** `ManagerPass2024!`
- **User ID:** `8b517c71-2def-448e-bf36-f70f583fc5cf`
- **Permissions:** All employee permissions + analytics, reports
- **✅ Login Status:** Tested and working

### 🔧 Admin Account
- **Role:** `admin`
- **Username:** `admin_user`
- **Email:** `admin@hotelchain.com`
- **Password:** `AdminPass2024!`
- **User ID:** `cf9e9158-e6ad-4a43-8f53-998e655a67e3`
- **Permissions:** Full system access, user management
- **✅ Login Status:** Tested and working

## 🧪 Testing Instructions

### Login Test (using curl):
```bash
# Test Client Login
curl -X POST "http://localhost:8001/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "client@hotelchain.com", "password": "ClientPass2024!"}'

# Test Employee Login
curl -X POST "http://localhost:8001/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "employee@hotelchain.com", "password": "EmployeePass2024!"}'

# Test Manager Login  
curl -X POST "http://localhost:8001/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "manager@hotelchain.com", "password": "ManagerPass2024!"}'

# Test Admin Login  
curl -X POST "http://localhost:8001/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@hotelchain.com", "password": "AdminPass2024!"}'
```

### Frontend Login:
1. Navigate to `http://localhost:3000/login`
2. Use any of the email/password combinations above
3. Verify role-based access in the application

## 🔒 Security Notes
- All passwords use bcrypt hashing with secure salts
- Accounts are pre-verified and active
- JWT tokens are issued upon successful login
- Token expiration: 30 minutes (1800 seconds)
- All accounts have unique UUIDs for proper identification

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
        print(f'Total users: {len(users)}')
        for user in users:
            print(f'- {user.username} ({user.role}) - {user.email} - ID: {user.id}')

asyncio.run(check_users())
"
```

## 🎯 Quick Verification Results

### Database State:
```
Total users: 4
- client_user (client) - client@hotelchain.com
- employee_user (employee) - employee@hotelchain.com  
- admin_user (admin) - admin@hotelchain.com
- manager_user (manager) - manager@hotelchain.com
```

### Login Test Results:
- ✅ Client login: JWT token generated successfully
- ✅ Employee login: JWT token generated successfully
- ✅ Manager login: JWT token generated successfully
- ✅ Admin login: JWT token generated successfully

## 🚀 Service Status
- **Auth Service:** Running on http://localhost:8001
- **Health Check:** http://localhost:8001/health ✅
- **Database:** SQLite (auth_service.db) ✅
- **All Endpoints:** Functional ✅

---
*Generated and verified by cleanup_and_populate_db.py script on 2025-05-25*
