import pytest
import subprocess
import time
import requests
from pathlib import Path

@pytest.fixture(scope="session", autouse=True)
def ensure_server_running():
    """Ensure the FastAPI server is running before tests"""
    try:
        # Check if server is already running
        response = requests.get("http://localhost:8000/api/v1/health", timeout=5)
        if response.status_code == 200:
            print("Server is already running")
            return
    except requests.exceptions.RequestException:
        print("Server not running, please start it manually")
        print("Run: uvicorn app.main:app --reload")
        pytest.exit("Please start the server before running tests")

@pytest.fixture
def test_user():
    """Create a test user for use in tests"""
    import time
    import random
    timestamp = int(time.time())
    random_id = random.randint(10000, 99999)
    return {
        "username": f"testuser_{timestamp}_{random_id}",
        "email": f"test_{timestamp}_{random_id}@example.com", 
        "password": "testpass123"
    }

@pytest.fixture
def authenticated_headers(test_user):
    """Get authentication headers for test user"""
    import requests
    
    # Register user
    response = requests.post("http://localhost:8000/api/v1/auth/register", 
                           json=test_user)
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    else:
        pytest.fail(f"Failed to create test user: {response.status_code}")

@pytest.fixture
def sample_prediction_data():
    """Sample prediction data for testing"""
    return {
        "location": "Johannesburg",
        "datetime": "2026-02-24T14:30:00",
        "humidity": 50.0,
        "demand_forecast": 30000.0,
        "generation_capacity": 28000.0
    }