#!/usr/bin/env python3
"""
Test script for admin endpoints filtering functionality
"""
import requests
import json
from datetime import datetime, timezone
import jwt

# Test configuration
BASE_URL = "http://localhost:8002"
ADMIN_PREFIX = "/api/v1/admin"

# Create a test admin JWT token
test_admin_token = jwt.encode(
    {
        "sub": "admin-test-user",
        "email": "admin@test.com",
        "username": "admin",
        "role": "ADMIN",
        "iat": datetime.now(timezone.utc).timestamp(),
        "exp": datetime.now(timezone.utc).timestamp() + 3600
    },
    "your-secret-key-here",
    algorithm="HS256"
)

headers = {
    "Authorization": f"Bearer {test_admin_token}",
    "Content-Type": "application/json"
}

def create_test_users():
    """Create multiple users with different roles for testing"""
    print("Creating test users...")
    
    users = [
        {
            "email": "staff1@hotel.com",
            "username": "staff1",
            "first_name": "Staff",
            "last_name": "One",
            "role": "staff"
        },
        {
            "email": "staff2@hotel.com", 
            "username": "staff2",
            "first_name": "Staff",
            "last_name": "Two",
            "role": "staff"
        },
        {
            "email": "manager1@hotel.com",
            "username": "manager1", 
            "first_name": "Manager",
            "last_name": "One",
            "role": "manager"
        },
        {
            "email": "customer1@hotel.com",
            "username": "customer1",
            "first_name": "Customer", 
            "last_name": "One",
            "role": "customer"
        }
    ]
    
    created_users = []
    for user_data in users:
        response = requests.post(
            f"{BASE_URL}{ADMIN_PREFIX}/users",
            headers=headers,
            json=user_data
        )
        if response.status_code == 201:
            created_users.append(response.json())
            print(f"Created user: {user_data['username']} ({user_data['role']})")
        else:
            print(f"Failed to create user {user_data['username']}: {response.json()}")
    
    return created_users

def test_role_filtering():
    """Test filtering users by role"""
    print("\n=== Testing Role Filtering ===")
    
    # Test filtering by staff role
    response = requests.get(
        f"{BASE_URL}{ADMIN_PREFIX}/users?role=staff",
        headers=headers
    )
    
    if response.status_code == 200:
        users = response.json()
        print(f"Staff users found: {len(users)}")
        for user in users:
            print(f"  - {user['username']} ({user['role']})")
    
    # Test filtering by manager role
    response = requests.get(
        f"{BASE_URL}{ADMIN_PREFIX}/users?role=manager",
        headers=headers
    )
    
    if response.status_code == 200:
        users = response.json()
        print(f"Manager users found: {len(users)}")
        for user in users:
            print(f"  - {user['username']} ({user['role']})")

def test_status_filtering():
    """Test filtering users by status"""
    print("\n=== Testing Status Filtering ===")
    
    response = requests.get(
        f"{BASE_URL}{ADMIN_PREFIX}/users?status=active",
        headers=headers
    )
    
    if response.status_code == 200:
        users = response.json()
        print(f"Active users found: {len(users)}")
        for user in users:
            print(f"  - {user['username']} ({user['status']})")

def test_pagination():
    """Test pagination parameters"""
    print("\n=== Testing Pagination ===")
    
    # Test with limit
    response = requests.get(
        f"{BASE_URL}{ADMIN_PREFIX}/users?limit=2",
        headers=headers
    )
    
    if response.status_code == 200:
        users = response.json()
        print(f"Users with limit=2: {len(users)}")
        for user in users:
            print(f"  - {user['username']}")
    
    # Test with skip and limit
    response = requests.get(
        f"{BASE_URL}{ADMIN_PREFIX}/users?skip=1&limit=2",
        headers=headers
    )
    
    if response.status_code == 200:
        users = response.json()
        print(f"Users with skip=1&limit=2: {len(users)}")
        for user in users:
            print(f"  - {user['username']}")

def test_csv_export_with_filters():
    """Test CSV export with filters"""
    print("\n=== Testing CSV Export with Filters ===")
    
    # Export only staff users
    response = requests.get(
        f"{BASE_URL}{ADMIN_PREFIX}/users/export?role=staff",
        headers=headers
    )
    
    if response.status_code == 200:
        print("Staff-only CSV export successful")
        print(f"Content preview: {response.text[:200]}...")
    else:
        print(f"CSV export failed: {response.json()}")

def cleanup_test_users(created_users):
    """Clean up test users"""
    print("\n=== Cleaning up test users ===")
    
    for user in created_users:
        response = requests.delete(
            f"{BASE_URL}{ADMIN_PREFIX}/users/{user['id']}",
            headers=headers
        )
        if response.status_code == 204:
            print(f"Deleted user: {user['username']}")
        else:
            print(f"Failed to delete user {user['username']}")

def main():
    """Run filtering tests"""
    print("=== Admin Endpoints Filtering Tests ===")
    
    # Create test users
    created_users = create_test_users()
    
    try:
        # Run filtering tests
        test_role_filtering()
        test_status_filtering()
        test_pagination()
        test_csv_export_with_filters()
        
    finally:
        # Clean up
        cleanup_test_users(created_users)
    
    print("\n=== Filtering tests completed ===")

if __name__ == "__main__":
    main()
