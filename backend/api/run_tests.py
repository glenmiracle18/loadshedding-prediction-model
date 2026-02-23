#!/usr/bin/env python3
"""
Test runner script for the Load Shedding Prediction API

This script runs all tests and generates a comprehensive test report.
Make sure the FastAPI server is running before executing tests.

Usage:
    python run_tests.py

Requirements:
    - FastAPI server running on http://localhost:8000
    - pytest and requests installed
"""

import subprocess
import sys
import time
import requests

def check_server():
    """Check if the FastAPI server is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            # Server is running if ML models are loaded, even if DB is unhealthy
            return health_data.get("ml_models", {}).get("models_loaded", 0) > 0
        return False
    except requests.exceptions.RequestException:
        return False

def run_tests():
    """Run all test suites"""
    print("=" * 60)
    print("LOAD SHEDDING PREDICTION API - TEST SUITE")
    print("=" * 60)
    
    # Check server status
    print("Checking server status...")
    if not check_server():
        print("ERROR: FastAPI server is not running!")
        print("Please start the server with: uvicorn app.main:app --reload")
        return False
    
    print("Server is running. Starting tests...")
    print()
    
    # Run different test categories
    test_commands = [
        {
            "name": "Authentication Tests",
            "command": ["python3", "-m", "pytest", "tests/test_auth.py", "-v"]
        },
        {
            "name": "ML Service Tests", 
            "command": ["python3", "-m", "pytest", "tests/test_ml_service.py", "-v"]
        },
        {
            "name": "Prediction API Tests",
            "command": ["python3", "-m", "pytest", "tests/test_predictions.py", "-v"]
        },
        {
            "name": "Integration Tests",
            "command": ["python3", "-m", "pytest", "tests/test_integration.py", "-v"]
        }
    ]
    
    all_passed = True
    
    for test_suite in test_commands:
        print(f"Running {test_suite['name']}...")
        print("-" * 40)
        
        try:
            result = subprocess.run(test_suite["command"], 
                                  capture_output=True, 
                                  text=True, 
                                  timeout=300)
            
            print(result.stdout)
            
            if result.returncode != 0:
                print(f"FAILED: {test_suite['name']}")
                print(result.stderr)
                all_passed = False
            else:
                print(f"PASSED: {test_suite['name']}")
                
        except subprocess.TimeoutExpired:
            print(f"TIMEOUT: {test_suite['name']} took too long")
            all_passed = False
        except Exception as e:
            print(f"ERROR: Failed to run {test_suite['name']}: {e}")
            all_passed = False
            
        print()
    
    # Summary
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    if all_passed:
        print("ALL TESTS PASSED!")
        print("The Load Shedding Prediction system is working correctly.")
    else:
        print("SOME TESTS FAILED!")
        print("Please review the output above and fix any issues.")
    
    print()
    return all_passed

def run_quick_validation():
    """Run a quick validation of core functionality"""
    print("QUICK VALIDATION TEST")
    print("-" * 20)
    
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/health")
        assert response.status_code == 200
        print("Health check: PASS")
        
        # Test user registration
        timestamp = int(time.time())
        user_data = {
            "username": f"quicktest_{timestamp}",
            "email": f"quicktest_{timestamp}@example.com",
            "password": "testpass123"
        }
        
        response = requests.post("http://localhost:8000/api/v1/auth/register", json=user_data)
        assert response.status_code == 201
        print("User registration: PASS")
        
        # Test user login
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"]
        }
        
        login_response = requests.post("http://localhost:8000/api/v1/auth/login", json=login_data)
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        print("User login: PASS")
        
        # Test prediction
        headers = {"Authorization": f"Bearer {token}"}
        prediction_data = {
            "location": "Johannesburg",
            "datetime": "2026-02-24T14:30:00", 
            "humidity": 50.0,
            "demand_forecast": 30000.0
        }
        
        response = requests.post("http://localhost:8000/api/v1/predictions/predict",
                               json=prediction_data, headers=headers)
        assert response.status_code == 201
        result = response.json()
        assert "predicted_stage" in result
        print(f"Prediction test: PASS (Stage {result['predicted_stage']})")
        
        print("Quick validation: ALL PASS")
        return True
        
    except Exception as e:
        print(f"Quick validation FAILED: {e}")
        return False

if __name__ == "__main__":
    print("Starting Load Shedding Prediction API Tests...")
    print()
    
    # Run quick validation first
    if not run_quick_validation():
        print("Quick validation failed. Exiting...")
        sys.exit(1)
    
    print()
    
    # Run full test suite
    success = run_tests()
    
    if success:
        print("Test execution completed successfully!")
        sys.exit(0)
    else:
        print("Test execution completed with failures!")
        sys.exit(1)