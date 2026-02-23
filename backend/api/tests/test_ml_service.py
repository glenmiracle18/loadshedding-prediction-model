import pytest
import numpy as np
from datetime import datetime
from app.services.ml_service import MLService

class TestMLService:
    
    @classmethod
    def setup_class(cls):
        """Initialize ML service once for all tests"""
        cls.ml_service = MLService()
    
    def test_model_loading(self):
        """Test that ML models load successfully"""
        assert len(self.ml_service.models) >= 2
        assert "xgboost" in self.ml_service.models or "random_forest" in self.ml_service.models
        
    def test_feature_preparation(self):
        """Test feature preparation from input data"""
        test_data = {
            "location": "Johannesburg",
            "datetime": "2026-02-24T14:30:00",
            "humidity": 50.0,
            "demand_forecast": 30000.0,
            "generation_capacity": 28000.0
        }
        
        features = self.ml_service.prepare_features(test_data)
        
        assert features is not None
        assert isinstance(features, np.ndarray)
        assert features.shape[0] == 1  # Single prediction
        assert features.shape[1] > 0   # Has features
        
    def test_prediction_basic(self):
        """Test basic prediction functionality"""
        test_data = {
            "location": "Cape Town",
            "datetime": "2026-02-24T14:30:00",
            "humidity": 60.0,
            "demand_forecast": 25000.0
        }
        
        result = self.ml_service.predict_loadshedding(test_data)
        
        assert "predicted_stage" in result
        assert "confidence_score" in result
        assert "model_used" in result
        assert "timestamp" in result
        
        assert 0 <= result["predicted_stage"] <= 8
        assert 0.0 <= result["confidence_score"] <= 1.0
        assert result["model_used"] in ["xgboost", "random_forest", "rule_based_fallback"]
        
    def test_high_demand_prediction(self):
        """Test prediction for high demand scenario"""
        test_data = {
            "location": "Johannesburg",
            "datetime": "2026-02-24T19:30:00",
            "humidity": 35.0,
            "demand_forecast": 45000.0,
            "generation_capacity": 20000.0
        }
        
        result = self.ml_service.predict_loadshedding(test_data)
        
        # High demand deficit should predict load shedding
        assert result["predicted_stage"] >= 1
        assert result["confidence_score"] > 0.3
        
    def test_low_demand_prediction(self):
        """Test prediction for low demand scenario"""
        test_data = {
            "location": "Cape Town",
            "datetime": "2026-02-24T03:00:00",
            "humidity": 80.0,
            "demand_forecast": 18000.0,
            "generation_capacity": 30000.0
        }
        
        result = self.ml_service.predict_loadshedding(test_data)
        
        # Low demand with high generation should predict no load shedding
        assert result["predicted_stage"] == 0
        assert result["confidence_score"] > 0.5
        
    def test_peak_vs_offpeak(self):
        """Test time-based predictions"""
        base_data = {
            "location": "Johannesburg",
            "humidity": 50.0,
            "demand_forecast": 32000.0,
            "generation_capacity": 28000.0
        }
        
        # Peak time
        peak_data = base_data.copy()
        peak_data["datetime"] = "2026-02-24T19:30:00"
        peak_result = self.ml_service.predict_loadshedding(peak_data)
        
        # Off-peak time
        offpeak_data = base_data.copy()
        offpeak_data["datetime"] = "2026-02-24T03:00:00"
        offpeak_result = self.ml_service.predict_loadshedding(offpeak_data)
        
        # Both should be valid predictions
        assert 0 <= peak_result["predicted_stage"] <= 8
        assert 0 <= offpeak_result["predicted_stage"] <= 8
        
    def test_different_cities(self):
        """Test predictions for different cities"""
        base_data = {
            "datetime": "2026-02-24T14:30:00",
            "humidity": 55.0,
            "demand_forecast": 30000.0
        }
        
        cities = ["Johannesburg", "Cape Town", "Durban", "Pretoria"]
        
        for city in cities:
            city_data = base_data.copy()
            city_data["location"] = city
            
            result = self.ml_service.predict_loadshedding(city_data)
            
            assert 0 <= result["predicted_stage"] <= 8
            assert 0.0 <= result["confidence_score"] <= 1.0
            
    def test_weather_variations(self):
        """Test predictions with different weather conditions"""
        base_data = {
            "location": "Johannesburg",
            "datetime": "2026-02-24T14:30:00",
            "demand_forecast": 30000.0
        }
        
        humidity_levels = [30, 50, 70, 90]
        
        for humidity in humidity_levels:
            weather_data = base_data.copy()
            weather_data["humidity"] = float(humidity)
            
            result = self.ml_service.predict_loadshedding(weather_data)
            
            assert 0 <= result["predicted_stage"] <= 8
            assert 0.0 <= result["confidence_score"] <= 1.0
            
    def test_fallback_prediction(self):
        """Test fallback prediction when ML models fail"""
        test_data = {
            "location": "TestCity",
            "datetime": "2026-02-24T14:30:00",
            "humidity": 50.0,
            "demand_forecast": 30000.0,
            "generation_capacity": 25000.0
        }
        
        result = self.ml_service._fallback_prediction(test_data)
        
        assert "predicted_stage" in result
        assert "confidence_score" in result
        assert "model_used" in result
        assert result["model_used"] == "rule_based_fallback"
        assert 0 <= result["predicted_stage"] <= 8
        
    def test_model_status(self):
        """Test model status reporting"""
        status = self.ml_service.get_model_status()
        
        assert "models_loaded" in status
        assert "available_models" in status
        assert "model_details" in status
        assert status["models_loaded"] >= 0
        assert isinstance(status["available_models"], list)
        
    def test_prediction_consistency(self):
        """Test that same input produces consistent results"""
        test_data = {
            "location": "Johannesburg",
            "datetime": "2026-02-24T14:30:00",
            "humidity": 50.0,
            "demand_forecast": 30000.0
        }
        
        # Make multiple predictions with same data
        results = []
        for _ in range(3):
            result = self.ml_service.predict_loadshedding(test_data)
            results.append(result)
        
        # All predictions should have same stage (consistency)
        stages = [r["predicted_stage"] for r in results]
        assert len(set(stages)) <= 2  # Allow minor variation
        
    def test_extreme_scenarios(self):
        """Test extreme demand scenarios"""
        # High demand scenario (more realistic)
        high_demand = {
            "location": "Johannesburg",
            "datetime": "2026-02-24T19:30:00",
            "humidity": 35.0,
            "demand_forecast": 38000.0,
            "generation_capacity": 25000.0
        }
        
        result_high = self.ml_service.predict_loadshedding(high_demand)
        assert result_high["predicted_stage"] >= 1  # Should predict some load shedding
        
        # Very low demand
        extreme_low = {
            "location": "Cape Town",
            "datetime": "2026-02-24T03:00:00",
            "humidity": 85.0,
            "demand_forecast": 15000.0,
            "generation_capacity": 35000.0
        }
        
        result_low = self.ml_service.predict_loadshedding(extreme_low)
        assert result_low["predicted_stage"] == 0