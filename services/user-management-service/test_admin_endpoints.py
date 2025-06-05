#!/usr/bin/env python3
"""
Test script for admin endpoints in user-management-service
"""
import requests
import json
from datetime import datetime, date

# Test configuration
BASE_URL = "http://localhost:8002"
ADMIN_PREFIX = "/api/v1/admin"

# Mock JWT token for testing (in real scenario, this would come from auth service)
# For testing purposes, we'll create a simple admin token
import jwt

# Create a test admin JWT token
from datetime import timezone
test_admin_token = jwt.encode(
    {
        "sub": "admin-test-user",  # Using 'sub' instead of 'user_id' to match middleware
        "email": "admin@test.com",
        "username": "admin",
        "role": "ADMIN",
        "iat": datetime.now(timezone.utc).timestamp(),  # Issued at
        "exp": datetime.now(timezone.utc).timestamp() + 3600  # 1 hour from now
    },
    "your-secret-key-here",  # This should match the secret in auth middleware
    algorithm="HS256"
)

headers = {
    "Authorization": f"Bearer {test_admin_token}",
    "Content-Type": "application/json"
}

def test_create_user():
    """Test creating a user via admin endpoint"""
    print("Testing admin user creation...")
    
    user_data = {
        "email": "teststaff@hotel.com",
        "username": "teststaff",
        "first_name": "Test",
        "last_name": "Staff",
        "phone_number": "+1234567890",
        "date_of_birth": "1990-01-01T00:00:00",
        "role": "staff"
    }
    
    response = requests.post(
        f"{BASE_URL}{ADMIN_PREFIX}/users",
        headers=headers,
        json=user_data
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.json() if response.status_code == 201 else None

def test_list_users():
    """Test listing users with admin endpoint"""
    print("\nTesting admin user listing...")
    
    response = requests.get(
        f"{BASE_URL}{ADMIN_PREFIX}/users",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.json() if response.status_code == 200 else None

def test_update_user(user_id):
    """Test updating a user via admin endpoint"""
    print(f"\nTesting admin user update for user {user_id}...")
    
    update_data = {
        "first_name": "Updated Test",
        "role": "manager"
    }
    
    response = requests.put(
        f"{BASE_URL}{ADMIN_PREFIX}/users/{user_id}",
        headers=headers,
        json=update_data
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.json() if response.status_code == 200 else None

def test_export_csv():
    """Test CSV export functionality"""
    print("\nTesting CSV export...")
    
    response = requests.get(
        f"{BASE_URL}{ADMIN_PREFIX}/users/export",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print(f"Content-Type: {response.headers.get('content-type')}")
        print(f"Content-Disposition: {response.headers.get('content-disposition')}")
        print(f"CSV Content Preview: {response.text[:200]}...")
    else:
        print(f"Response: {response.json()}")

def test_delete_user(user_id):
    """Test deleting a user via admin endpoint"""
    print(f"\nTesting admin user deletion for user {user_id}...")
    
    response = requests.delete(
        f"{BASE_URL}{ADMIN_PREFIX}/users/{user_id}",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    if response.status_code != 204:
        print(f"Response: {response.json()}")

def test_without_auth():
    """Test that endpoints require authentication"""
    print("\nTesting endpoints without authentication...")
    
    no_auth_headers = {"Content-Type": "application/json"}
    
    response = requests.get(
        f"{BASE_URL}{ADMIN_PREFIX}/users",
        headers=no_auth_headers
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

def main():
    """Run all admin endpoint tests"""
    print("=== User Management Service Admin Endpoints Test ===")
    
    # Test without authentication first
    test_without_auth()
    
    # Test with authentication
    created_user = test_create_user()
    if created_user:
        user_id = created_user.get("id")
        
        # Test listing users
        test_list_users()
        
        # Test updating user
        test_update_user(user_id)
        
        # Test CSV export
        test_export_csv()
        
        # Test deleting user
        test_delete_user(user_id)
        
        # Verify user was deleted
        test_list_users()
    
    print("\n=== Test completed ===")

if __name__ == "__main__":
    main()
