#!/usr/bin/env python3
"""
Advanced Performance Testing Suite for Load Shedding Prediction System
Generates comprehensive metrics for video demonstration and assignment scoring
"""

import asyncio
import time
import statistics
import json
import requests
import concurrent.futures
from datetime import datetime
import psutil
import sys
import os
from typing import Dict, List

# Add app to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

class PerformanceTestSuite:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.test_results = {}
        self.start_time = time.time()
        
    def print_header(self, title):
        """Print formatted test section header"""
        print(f"\n{'='*60}")
        print(f"  {title}")
        print(f"{'='*60}")
        
    def print_metric(self, name, value, unit=""):
        """Print formatted metric"""
        print(f"  ✓ {name:<35} {value} {unit}")
        
    def measure_response_time(self, func, *args, **kwargs):
        """Measure function execution time"""
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        return result, (end - start) * 1000  # Return result and time in ms
        
    def test_api_health(self):
        """Test basic API health and response times"""
        self.print_header("API Health & Response Time Testing")
        
        endpoints = [
            ("/health", "Health Check"),
            ("/api/v1/health", "API Health Check"),
            ("/docs", "API Documentation")
        ]
        
        response_times = []
        
        for endpoint, description in endpoints:
            try:
                _, response_time = self.measure_response_time(
                    requests.get, f"{self.base_url}{endpoint}", timeout=5
                )
                response_times.append(response_time)
                self.print_metric(description, f"{response_time:.1f}", "ms")
            except Exception as e:
                self.print_metric(f"{description} (ERROR)", str(e))
                
        if response_times:
            avg_time = statistics.mean(response_times)
            self.print_metric("Average Response Time", f"{avg_time:.1f}", "ms")
            self.test_results["api_response_times"] = {
                "average": avg_time,
                "individual": response_times
            }
            
    def test_user_registration_performance(self):
        """Test user registration and authentication speed"""
        self.print_header("User Authentication Performance")
        
        timestamp = int(time.time())
        test_user = {
            "username": f"perftest_{timestamp}",
            "email": f"perftest_{timestamp}@example.com", 
            "password": "testpass123"
        }
        
        try:
            # Test registration speed
            _, reg_time = self.measure_response_time(
                requests.post, 
                f"{self.base_url}/api/v1/auth/register",
                json=test_user
            )
            self.print_metric("User Registration", f"{reg_time:.1f}", "ms")
            
            # Test login speed
            login_data = {
                "username": test_user["username"],
                "password": test_user["password"]
            }
            response, login_time = self.measure_response_time(
                requests.post,
                f"{self.base_url}/api/v1/auth/login", 
                json=login_data
            )
            self.print_metric("User Login", f"{login_time:.1f}", "ms")
            
            if response.status_code == 200:
                token = response.json().get("access_token")
                self.print_metric("JWT Token Generated", "✓ Success")
                
                self.test_results["auth_performance"] = {
                    "registration_time": reg_time,
                    "login_time": login_time
                }
                return token
                
        except Exception as e:
            self.print_metric("Authentication Test (ERROR)", str(e))
            return None
            
    def test_ml_prediction_performance(self, token=None):
        """Test ML prediction speed and accuracy scenarios"""
        self.print_header("ML Prediction Performance Testing")
        
        test_scenarios = [
            {
                "name": "Normal Load Scenario",
                "data": {
                    "location": "Cape Town",
                    "datetime": "2026-02-24T14:30:00",
                    "humidity": 65.0,
                    "demand_forecast": 30000.0,
                    "generation_capacity": 32000.0
                }
            },
            {
                "name": "Peak Demand Scenario", 
                "data": {
                    "location": "Johannesburg",
                    "datetime": "2026-02-24T19:30:00",
                    "humidity": 45.0,
                    "demand_forecast": 38000.0,
                    "generation_capacity": 28000.0
                }
            },
            {
                "name": "Extreme Load Scenario",
                "data": {
                    "location": "Johannesburg",
                    "datetime": "2026-02-24T20:00:00", 
                    "humidity": 25.0,
                    "demand_forecast": 45000.0,
                    "generation_capacity": 20000.0
                }
            }
        ]
        
        prediction_times = []
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        
        for scenario in test_scenarios:
            try:
                response, pred_time = self.measure_response_time(
                    requests.post,
                    f"{self.base_url}/api/v1/predictions/predict",
                    json=scenario["data"],
                    headers=headers
                )
                
                prediction_times.append(pred_time)
                
                if response.status_code == 200:
                    result = response.json()
                    stage = result.get("predicted_stage", "N/A")
                    confidence = result.get("confidence_score", 0)
                    self.print_metric(
                        scenario["name"],
                        f"Stage {stage} ({confidence:.1%}) - {pred_time:.1f}ms"
                    )
                else:
                    self.print_metric(scenario["name"], f"ERROR {response.status_code}")
                    
            except Exception as e:
                self.print_metric(f"{scenario['name']} (ERROR)", str(e))
                
        if prediction_times:
            avg_time = statistics.mean(prediction_times)
            min_time = min(prediction_times)
            max_time = max(prediction_times)
            
            self.print_metric("Average Prediction Time", f"{avg_time:.1f}", "ms")
            self.print_metric("Fastest Prediction", f"{min_time:.1f}", "ms")
            self.print_metric("Slowest Prediction", f"{max_time:.1f}", "ms")
            
            self.test_results["ml_performance"] = {
                "average_time": avg_time,
                "min_time": min_time,
                "max_time": max_time,
                "scenarios_tested": len(test_scenarios)
            }
            
    def test_concurrent_load(self, token=None):
        """Test system under concurrent load"""
        self.print_header("Concurrent Load Testing")
        
        test_data = {
            "location": "Cape Town",
            "datetime": "2026-02-24T15:00:00",
            "humidity": 60.0,
            "demand_forecast": 32000.0
        }
        
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        concurrent_requests = [10, 25, 50]
        
        for num_requests in concurrent_requests:
            try:
                start_time = time.time()
                
                with concurrent.futures.ThreadPoolExecutor(max_workers=num_requests) as executor:
                    futures = [
                        executor.submit(
                            requests.post,
                            f"{self.base_url}/api/v1/predictions/predict",
                            json=test_data,
                            headers=headers,
                            timeout=10
                        )
                        for _ in range(num_requests)
                    ]
                    
                    results = []
                    for future in concurrent.futures.as_completed(futures):
                        try:
                            response = future.result()
                            results.append(response.status_code)
                        except Exception as e:
                            results.append(0)
                            
                end_time = time.time()
                total_time = (end_time - start_time) * 1000
                
                success_rate = (results.count(200) / len(results)) * 100
                avg_time_per_request = total_time / num_requests
                
                self.print_metric(
                    f"{num_requests} Concurrent Requests",
                    f"{success_rate:.1f}% success, {avg_time_per_request:.1f}ms avg"
                )
                
            except Exception as e:
                self.print_metric(f"{num_requests} Requests (ERROR)", str(e))
                
    def test_system_resources(self):
        """Monitor system resource usage"""
        self.print_header("System Resource Monitoring")
        
        # CPU and Memory usage
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        
        self.print_metric("CPU Usage", f"{cpu_percent:.1f}", "%")
        self.print_metric("Memory Usage", f"{memory.percent:.1f}", "%")
        self.print_metric("Available Memory", f"{memory.available / (1024**3):.1f}", "GB")
        
        # Disk usage
        disk = psutil.disk_usage('/')
        self.print_metric("Disk Usage", f"{(disk.used / disk.total) * 100:.1f}", "%")
        
        self.test_results["system_resources"] = {
            "cpu_usage": cpu_percent,
            "memory_usage": memory.percent,
            "available_memory_gb": memory.available / (1024**3)
        }
        
    def generate_test_summary(self):
        """Generate comprehensive test summary"""
        self.print_header("Performance Test Summary")
        
        total_time = time.time() - self.start_time
        self.print_metric("Total Test Duration", f"{total_time:.1f}", "seconds")
        
        # Generate summary statistics
        if "api_response_times" in self.test_results:
            avg_api = self.test_results["api_response_times"]["average"]
            self.print_metric("API Average Response", f"{avg_api:.1f}", "ms")
            
        if "ml_performance" in self.test_results:
            avg_ml = self.test_results["ml_performance"]["average_time"]
            self.print_metric("ML Average Prediction", f"{avg_ml:.1f}", "ms")
            
        if "system_resources" in self.test_results:
            cpu = self.test_results["system_resources"]["cpu_usage"]
            memory = self.test_results["system_resources"]["memory_usage"]
            self.print_metric("Resource Usage", f"CPU: {cpu:.1f}%, RAM: {memory:.1f}%")
            
        # Save results to file for later analysis
        with open("performance_results.json", "w") as f:
            json.dump(self.test_results, f, indent=2)
            
        print(f"\n  📊 Detailed results saved to: performance_results.json")
        print(f"  🎥 Ready for video demonstration!")
        
    def run_all_tests(self):
        """Execute complete performance test suite"""
        print("🚀 Starting Comprehensive Performance Test Suite")
        print(f"   Target: {self.base_url}")
        print(f"   Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Run all test categories
        self.test_api_health()
        token = self.test_user_registration_performance()
        self.test_ml_prediction_performance(token)
        self.test_concurrent_load(token) 
        self.test_system_resources()
        self.generate_test_summary()

if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server detected - starting tests")
            
            test_suite = PerformanceTestSuite()
            test_suite.run_all_tests()
        else:
            print("❌ Backend server not responding properly")
            print("   Please start the backend with: uvicorn app.main:app --reload")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("   Please start the backend with: uvicorn app.main:app --reload")
    except Exception as e:
        print(f"❌ Error checking server status: {e}")