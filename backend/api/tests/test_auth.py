import pytest
import requests
import time
from datetime import datetime

API_BASE = "http://localhost:8000/api/v1"

class TestAuth:
    
    def test_user_registration(self):
        """Test user registration with valid data"""
        timestamp = int(time.time())
        user_data = {
            "username": f"testuser_{timestamp}",
            "email": f"test_{timestamp}@example.com",
            "password": "testpass123"
        }
        
        response = requests.post(f"{API_BASE}/auth/register", json=user_data)
        assert response.status_code == 201
        
        data = response.json()
        assert "username" in data
        assert data["username"] == user_data["username"]
        
    def test_user_login(self):
        """Test user login with valid credentials"""
        # First register a user
        timestamp = int(time.time())
        user_data = {
            "username": f"logintest_{timestamp}",
            "email": f"logintest_{timestamp}@example.com",
            "password": "testpass123"
        }
        
        register_response = requests.post(f"{API_BASE}/auth/register", json=user_data)
        assert register_response.status_code == 201
        
        # Then login
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"]
        }
        
        response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        login_data = {
            "username": "nonexistent",
            "password": "wrongpassword"
        }
        
        response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        assert response.status_code == 401
        
    def test_protected_endpoint(self):
        """Test accessing protected endpoint with valid token"""
        # Register and login to get token
        timestamp = int(time.time())
        user_data = {
            "username": f"protectedtest_{timestamp}",
            "email": f"protectedtest_{timestamp}@example.com",
            "password": "testpass123"
        }
        
        register_response = requests.post(f"{API_BASE}/auth/register", json=user_data)
        assert register_response.status_code == 201
        
        # Login to get token
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"]
        }
        login_response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == user_data["username"]