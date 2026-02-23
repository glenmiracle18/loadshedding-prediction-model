#!/usr/bin/env python3
"""
Quick Test Script - Perfect for Presentation Demo
Tests core functionality without complex pytest setup
"""

import requests
import time
import random

API_BASE = "http://localhost:8000/api/v1"

def create_unique_user():
    """Create a unique user for testing"""
    timestamp = int(time.time() * 1000)  # Include milliseconds for uniqueness
    random_id = random.randint(10000, 99999)
    return {
        "username": f"quicktest_{timestamp}_{random_id}",
        "email": f"quicktest_{timestamp}_{random_id}@example.com",
        "password": "testpass123"
    }

def get_auth_token():
    """Register user and get authentication token"""
    user_data = create_unique_user()
    
    # Register
    response = requests.post(f"{API_BASE}/auth/register", json=user_data)
    if response.status_code != 201:
        raise Exception(f"Registration failed: {response.status_code} - {response.text}")
    
    # Login
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    login_response = requests.post(f"{API_BASE}/auth/login", json=login_data)
    if login_response.status_code != 200:
        raise Exception(f"Login failed: {login_response.status_code} - {login_response.text}")
    
    return login_response.json()["access_token"]

def test_predictions():
    """Test the prediction functionality"""
    print("Testing Load Shedding Predictions")
    print("=" * 40)
    
    # Get authentication
    print("1. Getting authentication...")
    try:
        token = get_auth_token()
        headers = {"Authorization": f"Bearer {token}"}
        print("   ✅ Authentication successful")
    except Exception as e:
        print(f"   ❌ Authentication failed: {e}")
        return False
    
    # Test scenarios
    scenarios = [
        {
            "name": "High Demand Scenario",
            "data": {
                "location": "Johannesburg",
                "datetime": "2026-02-24T19:30:00",
                "humidity": 35.0,
                "demand_forecast": 38000.0,
                "generation_capacity": 25000.0
            }
        },
        {
            "name": "Low Demand Scenario", 
            "data": {
                "location": "Cape Town",
                "datetime": "2026-02-24T03:00:00",
                "humidity": 80.0,
                "demand_forecast": 18000.0,
                "generation_capacity": 30000.0
            }
        },
        {
            "name": "Peak Evening Scenario",
            "data": {
                "location": "Johannesburg",
                "datetime": "2026-02-24T20:00:00", 
                "humidity": 50.0,
                "demand_forecast": 32000.0,
                "generation_capacity": 28000.0
            }
        }
    ]
    
    print("\n2. Testing prediction scenarios...")
    for i, scenario in enumerate(scenarios, 1):
        print(f"   Scenario {i}: {scenario['name']}")
        
        try:
            response = requests.post(f"{API_BASE}/predictions/predict",
                                   json=scenario["data"], headers=headers)
            
            if response.status_code == 201:
                result = response.json()
                print(f"      → Stage {result['predicted_stage']} ({result['confidence_score']:.1%} confidence)")
                print(f"      → Model: {result['model_used']}")
                print("      ✅ Prediction successful")
            else:
                print(f"      ❌ Prediction failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"      ❌ Error: {e}")
            return False
    
    # Test history
    print("\n3. Testing prediction history...")
    try:
        history_response = requests.get(f"{API_BASE}/predictions/", headers=headers)
        if history_response.status_code == 200:
            history = history_response.json()
            print(f"   ✅ Retrieved {len(history)} predictions from history")
        else:
            print(f"   ❌ History failed: {history_response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ History error: {e}")
        return False
    
    print("\n" + "=" * 40)
    print("✅ ALL PREDICTION TESTS PASSED!")
    return True

def test_ml_service():
    """Test ML service directly"""
    print("\nTesting ML Service Directly")
    print("=" * 40)
    
    try:
        # Import here to avoid module path issues
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from app.services.ml_service import MLService
        
        ml = MLService()
        print(f"1. ML Models loaded: {len(ml.models)}")
        print(f"   Available models: {list(ml.models.keys())}")
        
        # Test prediction
        test_data = {
            "location": "Johannesburg",
            "datetime": "2026-02-24T14:30:00",
            "humidity": 50.0,
            "demand_forecast": 30000.0
        }
        
        result = ml.predict_loadshedding(test_data)
        print(f"2. Direct ML prediction: Stage {result['predicted_stage']} ({result['confidence_score']:.1%})")
        print("   ✅ ML Service working correctly")
        
        return True
        
    except Exception as e:
        print(f"   ❌ ML Service error: {e}")
        return False

def main():
    print("Quick Test Suite for Load Shedding Prediction System")
    print("=" * 55)
    
    # Test system health
    print("Testing system health...")
    try:
        health = requests.get("http://localhost:8000/health")
        if health.status_code == 200:
            data = health.json()
            print(f"✅ System Status: {data['status']}")
        else:
            print("❌ Health check failed")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        return False
    
    # Run tests
    success = True
    success &= test_predictions()
    success &= test_ml_service()
    
    if success:
        print("\n🎉 ALL TESTS PASSED - System ready for demo!")
        return True
    else:
        print("\n❌ Some tests failed")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)