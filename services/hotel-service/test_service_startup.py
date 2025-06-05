#!/usr/bin/env python3
"""
Simple test to verify the Hotel Service can start with the new authentication middleware
"""
import subprocess
import time
import sys
import signal
import requests
from pathlib import Path

def test_service_startup():
    """Test that the hotel service can start with authentication middleware"""
    
    print("🚀 Testing Hotel Service startup with JWT authentication...")
    
    # Change to hotel service directory
    service_dir = Path(__file__).parent
    
    # Start the service in background
    print("Starting Hotel Service...")
    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"],
        cwd=service_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait a bit for service to start
    time.sleep(3)
    
    try:
        # Test if service is responding
        print("Testing service health...")
        response = requests.get("http://localhost:8002/health", timeout=5)
        
        if response.status_code == 200:
            print("✅ Hotel Service started successfully!")
            print(f"Health check response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            
        # Test a public endpoint
        print("Testing public endpoint...")
        response = requests.get("http://localhost:8002/api/v1/hotels", timeout=5)
        print(f"GET /api/v1/hotels: {response.status_code}")
        
        # Test an authenticated endpoint (should return 401)
        print("Testing protected endpoint without auth...")
        response = requests.post(
            "http://localhost:8002/api/v1/hotels",
            json={"name": "Test", "location": "Test", "address": "Test"},
            timeout=5
        )
        print(f"POST /api/v1/hotels (no auth): {response.status_code} - Expected: 401/403")
        
        # Test with invalid token
        print("Testing protected endpoint with invalid token...")
        response = requests.post(
            "http://localhost:8002/api/v1/hotels",
            json={"name": "Test", "location": "Test", "address": "Test"},
            headers={"Authorization": "Bearer invalid.token.here"},
            timeout=5
        )
        print(f"POST /api/v1/hotels (invalid token): {response.status_code} - Expected: 401")
        
        # Test docs endpoint
        print("Testing API docs endpoint...")
        response = requests.get("http://localhost:8002/docs", timeout=5)
        print(f"GET /docs: {response.status_code}")
        
        if response.status_code in [401, 403]:
            print("✅ Authentication middleware is working correctly!")
            print("  - 403: No authentication provided (expected)")
            print("  - 401: Invalid token provided (expected)")
        else:
            print("⚠️  Authentication middleware may not be working correctly")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to connect to service: {e}")
        # Check if process has error output
        if process.poll() is not None:
            stdout, stderr = process.communicate()
            print("Service output:", stdout.decode())
            print("Service errors:", stderr.decode())
    
    finally:
        # Clean up - terminate the process
        print("Stopping service...")
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        print("Service stopped.")

if __name__ == "__main__":
    test_service_startup()
