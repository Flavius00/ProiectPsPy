#!/usr/bin/env python3
"""
Test script to verify JWT authentication middleware integration
"""
import asyncio
import httpx
import json
from typing import Dict, Any

# Base URLs
AUTH_SERVICE_URL = "http://localhost:8001"
HOTEL_SERVICE_URL = "http://localhost:8002"

async def get_auth_token(email: str, password: str) -> str:
    """Get JWT token from auth service"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{AUTH_SERVICE_URL}/auth/login",
            json={"email": email, "password": password}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token", "")
        else:
            print(f"Login failed: {response.text}")
            return ""

async def test_public_endpoints():
    """Test public endpoints without authentication"""
    print("\n=== Testing Public Endpoints (No Auth Required) ===")
    
    async with httpx.AsyncClient() as client:
        # Test getting hotels
        response = await client.get(f"{HOTEL_SERVICE_URL}/hotels")
        print(f"GET /hotels: {response.status_code}")
        
        # Test client API
        response = await client.get(f"{HOTEL_SERVICE_URL}/client/hotels")
        print(f"GET /client/hotels: {response.status_code}")
        
        # Test search
        response = await client.get(f"{HOTEL_SERVICE_URL}/client/search/hotels?q=hotel")
        print(f"GET /client/search/hotels: {response.status_code}")

async def test_protected_endpoints_without_auth():
    """Test protected endpoints without authentication (should fail)"""
    print("\n=== Testing Protected Endpoints (No Auth - Should Fail) ===")
    
    async with httpx.AsyncClient() as client:
        # Test creating hotel (should require manager/admin)
        hotel_data = {
            "name": "Test Hotel",
            "location": "Test City",
            "address": "123 Test St",
            "description": "A test hotel"
        }
        response = await client.post(f"{HOTEL_SERVICE_URL}/hotels", json=hotel_data)
        print(f"POST /hotels (no auth): {response.status_code} - {response.text[:100]}")
        
        # Test creating room (should require employee+)
        room_data = {
            "hotel_id": "test-hotel-id",
            "room_number": "101",
            "room_type": "Standard",
            "price": 100.0,
            "capacity": 2,
            "amenities": ["WiFi"],
            "is_available": True
        }
        response = await client.post(f"{HOTEL_SERVICE_URL}/rooms", json=room_data)
        print(f"POST /rooms (no auth): {response.status_code} - {response.text[:100]}")

async def test_protected_endpoints_with_auth(token: str, role: str):
    """Test protected endpoints with authentication"""
    print(f"\n=== Testing Protected Endpoints (With {role} Auth) ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Test creating hotel (requires manager/admin)
        hotel_data = {
            "name": f"Test Hotel - {role}",
            "location": "Test City",
            "address": "123 Test St",
            "description": f"A test hotel created by {role}"
        }
        response = await client.post(f"{HOTEL_SERVICE_URL}/hotels", json=hotel_data, headers=headers)
        print(f"POST /hotels (with {role}): {response.status_code}")
        if response.status_code == 201:
            hotel_id = response.json().get("id")
            print(f"  Created hotel ID: {hotel_id}")
        
        # Test creating room (requires employee+)
        room_data = {
            "hotel_id": "test-hotel-id",
            "room_number": "101",
            "room_type": "Standard",
            "price": 100.0,
            "capacity": 2,
            "amenities": ["WiFi"],
            "is_available": True
        }
        response = await client.post(f"{HOTEL_SERVICE_URL}/rooms", json=room_data, headers=headers)
        print(f"POST /rooms (with {role}): {response.status_code}")
        
        # Test creating review (requires client role)
        review_data = {
            "rating": 5,
            "comment": "Great room!",
            "user_id": "test-user-id"
        }
        response = await client.post(f"{HOTEL_SERVICE_URL}/rooms/test-room-id/reviews", json=review_data, headers=headers)
        print(f"POST /rooms/*/reviews (with {role}): {response.status_code}")

async def test_role_based_access():
    """Test different role-based access scenarios"""
    print("\n=== Testing Role-Based Access Control ===")
    
    # Test cases for different user roles
    test_users = [
        {"email": "admin@test.com", "password": "admin123", "role": "ADMIN"},
        {"email": "manager@test.com", "password": "manager123", "role": "MANAGER"},
        {"email": "employee@test.com", "password": "employee123", "role": "EMPLOYEE"},
        {"email": "client@test.com", "password": "client123", "role": "CLIENT"}
    ]
    
    for user in test_users:
        print(f"\nTesting with {user['role']} role...")
        token = await get_auth_token(user["email"], user["password"])
        if token:
            await test_protected_endpoints_with_auth(token, user["role"])
        else:
            print(f"Failed to get token for {user['role']}")

async def test_token_validation():
    """Test JWT token validation"""
    print("\n=== Testing JWT Token Validation ===")
    
    # Test with invalid token
    invalid_headers = {"Authorization": "Bearer invalid.token.here"}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{HOTEL_SERVICE_URL}/hotels",
            json={"name": "Test", "location": "Test", "address": "Test"},
            headers=invalid_headers
        )
        print(f"POST /hotels (invalid token): {response.status_code} - {response.text[:100]}")
        
        # Test with malformed Authorization header
        malformed_headers = {"Authorization": "InvalidFormat token"}
        response = await client.post(
            f"{HOTEL_SERVICE_URL}/hotels",
            json={"name": "Test", "location": "Test", "address": "Test"},
            headers=malformed_headers
        )
        print(f"POST /hotels (malformed auth): {response.status_code} - {response.text[:100]}")

async def main():
    """Run all authentication tests"""
    print("🔐 JWT Authentication Middleware Integration Tests")
    print("=" * 60)
    
    try:
        # Test public endpoints
        await test_public_endpoints()
        
        # Test protected endpoints without auth
        await test_protected_endpoints_without_auth()
        
        # Test token validation
        await test_token_validation()
        
        # Test role-based access (this requires auth service to have test users)
        await test_role_based_access()
        
    except Exception as e:
        print(f"\nError during testing: {e}")
    
    print("\n" + "=" * 60)
    print("🏁 Authentication tests completed!")
    print("\nNote: Some tests may fail if:")
    print("- Auth service is not running")
    print("- Hotel service is not running") 
    print("- Test users don't exist in the auth service")
    print("- Services are running on different ports")

if __name__ == "__main__":
    asyncio.run(main())
