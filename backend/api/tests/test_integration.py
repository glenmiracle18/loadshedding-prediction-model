import pytest
import requests
import time

API_BASE = "http://localhost:8000/api/v1"

class TestIntegration:
    
    def test_complete_user_workflow(self):
        """Test complete user workflow from registration to predictions"""
        timestamp = int(time.time())
        
        # Step 1: Register user
        user_data = {
            "username": f"workflow_{timestamp}",
            "email": f"workflow_{timestamp}@example.com",
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
        
        # Step 2: Make prediction
        prediction_data = {
            "location": "Johannesburg",
            "datetime": "2026-02-24T14:30:00",
            "humidity": 50.0,
            "demand_forecast": 30000.0
        }
        
        predict_response = requests.post(f"{API_BASE}/predictions/predict", 
                                       json=prediction_data, headers=headers)
        assert predict_response.status_code == 201
        
        # Step 3: Get prediction history
        history_response = requests.get(f"{API_BASE}/predictions/", headers=headers)
        assert history_response.status_code == 200
        history = history_response.json()
        assert len(history) >= 1
        
        # Step 4: Verify user info
        user_response = requests.get(f"{API_BASE}/auth/me", headers=headers)
        assert user_response.status_code == 200
        user_info = user_response.json()
        assert user_info["username"] == user_data["username"]
        
    def test_multiple_predictions_same_user(self):
        """Test multiple predictions for same user"""
        timestamp = int(time.time())
        
        # Register user
        user_data = {
            "username": f"multitest_{timestamp}",
            "email": f"multitest_{timestamp}@example.com",
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
        
        # Make multiple predictions
        scenarios = [
            {"location": "Johannesburg", "humidity": 45.0, "demand_forecast": 35000.0},
            {"location": "Cape Town", "humidity": 65.0, "demand_forecast": 25000.0},
            {"location": "Durban", "humidity": 75.0, "demand_forecast": 20000.0}
        ]
        
        for scenario in scenarios:
            prediction_data = {
                "datetime": "2026-02-24T14:30:00",
                **scenario
            }
            
            response = requests.post(f"{API_BASE}/predictions/predict", 
                                   json=prediction_data, headers=headers)
            assert response.status_code == 201
            
        # Check history has all predictions
        history_response = requests.get(f"{API_BASE}/predictions/", headers=headers)
        history = history_response.json()
        assert len(history) >= len(scenarios)
        
    def test_system_health_check(self):
        """Test system health endpoint"""
        response = requests.get("http://localhost:8000/health")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert data["status"] in ["healthy", "unhealthy"]  # Allow either status
        
    def test_prediction_accuracy_scenarios(self):
        """Test prediction accuracy for known scenarios"""
        timestamp = int(time.time())
        
        # Register user
        user_data = {
            "username": f"accuracy_{timestamp}",
            "email": f"accuracy_{timestamp}@example.com", 
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
        
        # Test scenarios with expected outcomes
        test_cases = [
            {
                "scenario": {
                    "location": "Johannesburg",
                    "datetime": "2026-02-24T19:30:00",
                    "humidity": 30.0,
                    "demand_forecast": 45000.0,
                    "generation_capacity": 20000.0
                },
                "expected_min_stage": 1  # High demand should predict load shedding
            },
            {
                "scenario": {
                    "location": "Cape Town", 
                    "datetime": "2026-02-24T03:00:00",
                    "humidity": 80.0,
                    "demand_forecast": 18000.0,
                    "generation_capacity": 30000.0
                },
                "expected_stage": 0  # Low demand should predict no load shedding
            }
        ]
        
        for test_case in test_cases:
            response = requests.post(f"{API_BASE}/predictions/predict",
                                   json=test_case["scenario"], headers=headers)
            assert response.status_code == 201
            
            data = response.json()
            
            if "expected_min_stage" in test_case:
                assert data["predicted_stage"] >= test_case["expected_min_stage"]
            elif "expected_stage" in test_case:
                assert data["predicted_stage"] == test_case["expected_stage"]
                
    def test_response_time_performance(self):
        """Test API response time performance"""
        timestamp = int(time.time())
        
        # Register user
        user_data = {
            "username": f"perf_{timestamp}",
            "email": f"perf_{timestamp}@example.com",
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
        
        # Test prediction response time
        prediction_data = {
            "location": "Johannesburg",
            "datetime": "2026-02-24T14:30:00",
            "humidity": 50.0,
            "demand_forecast": 30000.0
        }
        
        start_time = time.time()
        response = requests.post(f"{API_BASE}/predictions/predict",
                               json=prediction_data, headers=headers)
        response_time = time.time() - start_time
        
        assert response.status_code == 201
        assert response_time < 5.0  # Should respond within 5 seconds
        
    def test_error_handling(self):
        """Test API error handling"""
        timestamp = int(time.time())
        
        # Register user
        user_data = {
            "username": f"error_{timestamp}",
            "email": f"error_{timestamp}@example.com",
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
        
        # Test invalid prediction data
        invalid_data = {
            "location": "InvalidCity",
            # Missing required fields
        }
        
        response = requests.post(f"{API_BASE}/predictions/predict",
                               json=invalid_data, headers=headers)
        assert response.status_code == 422
        
        # Test unauthorized access
        response = requests.get(f"{API_BASE}/predictions/")
        assert response.status_code in [401, 403]  # Either unauthorized or forbidden
        
    def test_concurrent_users(self):
        """Test system with multiple concurrent users"""
        import threading
        
        results = []
        
        def create_user_and_predict(user_id):
            try:
                # Register user
                user_data = {
                    "username": f"concurrent_{user_id}_{int(time.time())}",
                    "email": f"concurrent_{user_id}_{int(time.time())}@example.com",
                    "password": "testpass123"
                }
                
                register_response = requests.post(f"{API_BASE}/auth/register", json=user_data)
                if register_response.status_code != 201:
                    results.append(False)
                    return
                
                # Login to get token
                login_data = {
                    "username": user_data["username"],
                    "password": user_data["password"]
                }
                login_response = requests.post(f"{API_BASE}/auth/login", json=login_data)
                if login_response.status_code != 200:
                    results.append(False)
                    return
                token = login_response.json()["access_token"]
                headers = {"Authorization": f"Bearer {token}"}
                
                # Make prediction
                prediction_data = {
                    "location": "Johannesburg",
                    "datetime": "2026-02-24T14:30:00",
                    "humidity": 50.0,
                    "demand_forecast": 30000.0
                }
                
                response = requests.post(f"{API_BASE}/predictions/predict",
                                       json=prediction_data, headers=headers)
                results.append(response.status_code == 201)
                
            except Exception as e:
                results.append(False)
        
        # Create 5 concurrent users
        threads = []
        for i in range(5):
            thread = threading.Thread(target=create_user_and_predict, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Check that most requests succeeded
        success_rate = sum(results) / len(results)
        assert success_rate >= 0.8  # At least 80% success rate