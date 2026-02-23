import pytest
import requests
import time
from datetime import datetime

API_BASE = "http://localhost:8000/api/v1"

class TestPredictions:
    
    def get_auth_token(self):
        """Helper method to get authentication token"""
        import random
        timestamp = int(time.time())
        random_id = random.randint(1000, 9999)
        user_data = {
            "username": f"predtest_{timestamp}_{random_id}",
            "email": f"predtest_{timestamp}_{random_id}@example.com",
            "password": "testpass123"
        }
        
        response = requests.post(f"{API_BASE}/auth/register", json=user_data)
        if response.status_code != 201:
            print(f"Registration failed: {response.status_code} - {response.text}")
        assert response.status_code == 201
        
        # Login to get token
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"]
        }
        login_response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        return login_response.json()["access_token"]
    
    def test_create_prediction_minimal_data(self):
        """Test creating prediction with minimal required data"""
        token = self.get_auth_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        prediction_data = {
            "location": "Johannesburg",
            "datetime": "2026-02-24T14:30:00",
            "humidity": 50.0,
            "demand_forecast": 30000.0
        }
        
        response = requests.post(f"{API_BASE}/predictions/predict", 
                               json=prediction_data, headers=headers)
        assert response.status_code == 201
        
        data = response.json()
        assert "predicted_stage" in data
        assert "confidence_score" in data
        assert "model_used" in data
        assert 0 <= data["predicted_stage"] <= 8
        assert 0.0 <= data["confidence_score"] <= 1.0
        
    def test_create_prediction_full_data(self):
        """Test creating prediction with all optional data"""
        token = self.get_auth_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        prediction_data = {
            "location": "Cape Town",
            "datetime": "2026-02-24T19:30:00",
            "temperature": 25.0,
            "humidity": 65.0,
            "wind_speed": 12.0,
            "demand_forecast": 35000.0,
            "generation_capacity": 28000.0,
            "historical_avg": 1.8
        }
        
        response = requests.post(f"{API_BASE}/predictions/predict", 
                               json=prediction_data, headers=headers)
        assert response.status_code == 201
        
        data = response.json()
        assert "predicted_stage" in data
        assert "confidence_score" in data
        assert "model_used" in data
        
    def test_high_demand_scenario(self):
        """Test prediction for high demand scenario"""
        token = self.get_auth_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        prediction_data = {
            "location": "Johannesburg",
            "datetime": "2026-02-24T19:30:00",
            "humidity": 40.0,
            "demand_forecast": 45000.0,
            "generation_capacity": 20000.0
        }
        
        response = requests.post(f"{API_BASE}/predictions/predict", 
                               json=prediction_data, headers=headers)
        assert response.status_code == 201
        
        data = response.json()
        # High demand should predict load shedding (Stage 1+)
        assert data["predicted_stage"] >= 1
        
    def test_low_demand_scenario(self):
        """Test prediction for low demand scenario"""
        token = self.get_auth_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        prediction_data = {
            "location": "Cape Town",
            "datetime": "2026-02-24T03:00:00",
            "humidity": 80.0,
            "demand_forecast": 18000.0,
            "generation_capacity": 30000.0
        }
        
        response = requests.post(f"{API_BASE}/predictions/predict", 
                               json=prediction_data, headers=headers)
        assert response.status_code == 201
        
        data = response.json()
        # Low demand should predict no load shedding (Stage 0)
        assert data["predicted_stage"] == 0
        
    def test_get_prediction_history(self):
        """Test retrieving user's prediction history"""
        token = self.get_auth_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a prediction first
        prediction_data = {
            "location": "Durban",
            "datetime": "2026-02-24T12:00:00",
            "humidity": 70.0,
            "demand_forecast": 25000.0
        }
        
        create_response = requests.post(f"{API_BASE}/predictions/predict", 
                                      json=prediction_data, headers=headers)
        assert create_response.status_code == 201
        
        # Get history
        response = requests.get(f"{API_BASE}/predictions/", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) >= 1
        assert data[0]["location"] == "Durban"
        
    def test_invalid_prediction_data(self):
        """Test prediction with invalid data"""
        token = self.get_auth_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        # Missing required fields
        prediction_data = {
            "location": "Johannesburg"
            # Missing datetime, humidity, demand_forecast
        }
        
        response = requests.post(f"{API_BASE}/predictions/predict", 
                               json=prediction_data, headers=headers)
        assert response.status_code == 422
        
    def test_unauthorized_prediction(self):
        """Test creating prediction without authentication"""
        prediction_data = {
            "location": "Johannesburg",
            "datetime": "2026-02-24T14:30:00",
            "humidity": 50.0,
            "demand_forecast": 30000.0
        }
        
        response = requests.post(f"{API_BASE}/predictions/predict", 
                               json=prediction_data)
        assert response.status_code in [401, 403]