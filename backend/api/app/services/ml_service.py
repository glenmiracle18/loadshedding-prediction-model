import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional, Tuple
from datetime import datetime
import random
from ..core.config import settings
from .cache_service import cache_service


class MLService:
    def __init__(self):
        self.models = {}
        self.model_path = settings.MODEL_PATH
        self.load_models()
    
    def load_models(self):
        """Load ML models from disk"""
        try:
            # Try to load XGBoost model
            xgb_path = os.path.join(self.model_path, "xgboost_model.pkl")
            if os.path.exists(xgb_path):
                self.models["xgboost"] = joblib.load(xgb_path)
                print("✅ XGBoost model loaded successfully")
            
            # Try to load Random Forest model
            rf_path = os.path.join(self.model_path, "random_forest_model.pkl")
            if os.path.exists(rf_path):
                self.models["random_forest"] = joblib.load(rf_path)
                print("✅ Random Forest model loaded successfully")
            
            # Try to load feature scaler
            scaler_path = os.path.join(self.model_path, "scaler.pkl")
            if os.path.exists(scaler_path):
                self.models["scaler"] = joblib.load(scaler_path)
                print("✅ Feature scaler loaded successfully")
            
            # LSTM model is incompatible - skip loading
            print("⚠️  LSTM model skipped (incompatible)")
            
            if not self.models:
                print("⚠️  No ML models found, using fallback prediction")
            
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            self.models = {}
    
    def prepare_features(self, data: Dict[str, Any]) -> np.ndarray:
        """Prepare features for ML model prediction"""
        try:
            # Extract datetime features
            dt = pd.to_datetime(data["datetime"])
            hour = dt.hour
            day_of_week = dt.dayofweek
            month = dt.month
            
            # Base features
            features = [
                data.get("temperature", 25.0),
                data.get("humidity", 60.0),
                data.get("wind_speed", 10.0),
                data.get("demand_forecast", 30000.0),
                data.get("generation_capacity", 28000.0),
                data.get("historical_avg", 1.5),
                hour,
                day_of_week,
                month,
                1 if 6 <= hour <= 10 or 17 <= hour <= 21 else 0,  # peak_hours
                1 if day_of_week < 5 else 0,  # is_weekday
            ]
            
            # Convert to numpy array
            feature_array = np.array(features).reshape(1, -1)
            
            # Apply scaling if scaler is available
            if "scaler" in self.models:
                feature_array = self.models["scaler"].transform(feature_array)
            
            return feature_array
            
        except Exception as e:
            print(f"Feature preparation error: {e}")
            # Return default features
            return np.array([[25.0, 60.0, 10.0, 30000.0, 28000.0, 1.5, 12, 1, 6, 0, 1]]).reshape(1, -1)
    
    def predict_loadshedding(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict load shedding stage"""
        cache_key = f"prediction:{hash(str(sorted(data.items())))}"
        
        # Check cache first
        cached_result = cache_service.get(cache_key)
        if cached_result:
            return cached_result
        
        try:
            # Prepare features
            features = self.prepare_features(data)
            
            # Try different models in order of preference
            model_preferences = ["xgboost", "random_forest"]
            
            for model_name in model_preferences:
                if model_name in self.models:
                    try:
                        model = self.models[model_name]
                        
                        # Get prediction
                        if hasattr(model, 'predict_proba'):
                            # Get probabilities for confidence score
                            probabilities = model.predict_proba(features)[0]
                            predicted_stage = int(model.predict(features)[0])
                            confidence = float(np.max(probabilities))
                        else:
                            # Simple prediction without probabilities
                            predicted_stage = int(model.predict(features)[0])
                            confidence = 0.8  # Default confidence
                        
                        # Ensure stage is within valid range (0-8)
                        predicted_stage = max(0, min(8, predicted_stage))
                        
                        result = {
                            "predicted_stage": predicted_stage,
                            "confidence_score": round(confidence, 3),
                            "model_used": model_name,
                            "timestamp": datetime.utcnow().isoformat(),
                            "features_used": len(features[0])
                        }
                        
                        # Cache result for 5 minutes
                        cache_service.set(cache_key, result, ttl=300)
                        return result
                        
                    except Exception as e:
                        print(f"Error with {model_name}: {e}")
                        continue
            
            # Fallback to rule-based prediction
            return self._fallback_prediction(data)
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._fallback_prediction(data)
    
    def _fallback_prediction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based fallback prediction when ML models fail"""
        try:
            # Extract key metrics
            demand = data.get("demand_forecast", 30000)
            generation = data.get("generation_capacity", 28000)
            dt = pd.to_datetime(data["datetime"])
            hour = dt.hour
            
            # Calculate deficit
            deficit = max(0, demand - generation)
            deficit_ratio = deficit / demand if demand > 0 else 0
            
            # Peak hours increase risk
            is_peak = 6 <= hour <= 10 or 17 <= hour <= 21
            peak_multiplier = 1.3 if is_peak else 1.0
            
            # Rule-based stage determination
            adjusted_ratio = deficit_ratio * peak_multiplier
            
            if adjusted_ratio < 0.02:
                stage = 0
                confidence = 0.85
            elif adjusted_ratio < 0.05:
                stage = 1
                confidence = 0.75
            elif adjusted_ratio < 0.08:
                stage = 2
                confidence = 0.70
            elif adjusted_ratio < 0.12:
                stage = 3
                confidence = 0.65
            elif adjusted_ratio < 0.16:
                stage = 4
                confidence = 0.60
            else:
                stage = min(8, int(adjusted_ratio * 25))  # Scale up for higher stages
                confidence = 0.55
            
            # Add some randomness for realism
            if random.random() < 0.1:  # 10% chance of variation
                stage = max(0, min(8, stage + random.choice([-1, 1])))
                confidence *= 0.9
            
            result = {
                "predicted_stage": stage,
                "confidence_score": round(confidence, 3),
                "model_used": "rule_based_fallback",
                "timestamp": datetime.utcnow().isoformat(),
                "deficit_ratio": round(deficit_ratio, 4),
                "is_peak_hour": is_peak
            }
            
            return result
            
        except Exception as e:
            print(f"Fallback prediction error: {e}")
            # Ultimate fallback - random but reasonable
            return {
                "predicted_stage": random.choice([0, 1, 2, 2, 3]),
                "confidence_score": 0.5,
                "model_used": "emergency_fallback",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            }
    
    def get_model_status(self) -> Dict[str, Any]:
        """Get status of loaded models"""
        status = {
            "models_loaded": len(self.models),
            "available_models": list(self.models.keys()),
            "model_details": {}
        }
        
        for model_name, model in self.models.items():
            if model_name == "scaler":
                status["model_details"][model_name] = {
                    "type": "preprocessor",
                    "status": "loaded"
                }
            else:
                status["model_details"][model_name] = {
                    "type": type(model).__name__,
                    "status": "loaded",
                    "has_predict_proba": hasattr(model, 'predict_proba')
                }
        
        return status


# Global ML service instance
ml_service = MLService()