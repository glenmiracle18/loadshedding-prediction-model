import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional, Tuple
from datetime import datetime
import random
from huggingface_hub import hf_hub_download
from ..core.config import settings
from .cache_service import cache_service


class MLService:
    def __init__(self):
        self.models = {}
        self.model_path = settings.MODEL_PATH
        self.load_models()
    
    def load_models(self):
        """Load ML models from Hugging Face Hub"""
        try:
            print("🤗 Loading models from Hugging Face Hub...")
            
            # Model files to download
            model_files = {
                "xgboost": "xgboost.pkl",
                "random_forest": "random_forest.pkl", 
                "scaler": "feature_scaler_final.pkl"
            }
            
            for model_name, filename in model_files.items():
                try:
                    print(f"📥 Downloading {filename}...")
                    
                    # Download model from Hugging Face
                    model_path = hf_hub_download(
                        repo_id=settings.HUGGINGFACE_REPO,
                        filename=filename,
                        token=settings.HUGGINGFACE_TOKEN,
                        cache_dir=self.model_path  # Cache locally
                    )
                    
                    # Load the model
                    self.models[model_name] = joblib.load(model_path)
                    print(f"✅ {model_name} model loaded from Hugging Face")
                    
                except Exception as e:
                    print(f"⚠️  Failed to load {model_name}: {e}")
            
            # LSTM model is incompatible - skip loading
            print("⚠️  LSTM model skipped (incompatible)")
            
            if not self.models:
                print("⚠️  No ML models loaded, using fallback prediction")
                print("Check HUGGINGFACE_TOKEN in .env file")
            else:
                print(f"🎉 Successfully loaded {len(self.models)} models from Hugging Face")
            
        except Exception as e:
            print(f"❌ Error loading models from Hugging Face: {e}")
            print("Falling back to local model loading...")
            self._load_local_models()
    
    def _load_local_models(self):
        """Fallback: Load ML models from local disk"""
        try:
            # Try to load XGBoost model
            xgb_path = os.path.join(self.model_path, "xgboost.pkl")
            if os.path.exists(xgb_path):
                self.models["xgboost"] = joblib.load(xgb_path)
                print("✅ XGBoost model loaded locally")
            
            # Try to load Random Forest model
            rf_path = os.path.join(self.model_path, "random_forest.pkl")
            if os.path.exists(rf_path):
                self.models["random_forest"] = joblib.load(rf_path)
                print("✅ Random Forest model loaded locally")
            
            # Try to load feature scaler
            scaler_path = os.path.join(self.model_path, "feature_scaler_final.pkl")
            if os.path.exists(scaler_path):
                self.models["scaler"] = joblib.load(scaler_path)
                print("✅ Feature scaler loaded locally")
                
        except Exception as e:
            print(f"❌ Local model loading also failed: {e}")
    
    def prepare_features(self, data: Dict[str, Any]) -> np.ndarray:
        """Prepare features for ML model prediction - matches training data format"""
        try:
            # Extract datetime features
            dt = pd.to_datetime(data["datetime"])
            hour = dt.hour
            day_of_week = dt.dayofweek
            month = dt.month
            
            # Map API inputs to training features (simplified approximation)
            # Original features from training data
            residual_demand = data.get("demand_forecast", 30000.0)
            rsa_contracted_demand = residual_demand * 1.05  # approximation
            dispatchable_generation = data.get("generation_capacity", 28000.0)
            thermal_generation = dispatchable_generation * 0.7  # approximation
            nuclear_generation = dispatchable_generation * 0.15  # approximation
            eskom_ocgt = dispatchable_generation * 0.1  # approximation
            total_re = 2000.0  # renewable energy - default
            total_uclf = 1000.0  # unplanned capacity loss factor
            total_oclf = 500.0  # other capacity loss factor
            total_uclf_oclf = total_uclf + total_oclf
            total_pclf = 300.0  # planned capacity loss factor  
            ils_usage = 0.0  # independent load shedding
            mlr = data.get("historical_avg", 1.5) * 1000  # manual load reduction
            intl_imports = 1000.0  # international imports
            
            # Calculate derived features
            demand_gap = max(0, residual_demand - dispatchable_generation)
            
            # Build feature vector matching training order (51 features after leakage removal)
            features = [
                # Core grid features (non-leaking)
                thermal_generation,
                nuclear_generation,
                eskom_ocgt,
                total_re,
                total_uclf,
                total_oclf,
                total_uclf_oclf,
                total_pclf,
                ils_usage,
                intl_imports,
                hour,
                day_of_week,
                month,
                
                # Lag features for grid metrics (not stage) - 16 features
                *[total_uclf_oclf * 0.9] * 4,  # Total UCLF+OCLF lags
                *[eskom_ocgt * 0.95] * 4,      # OCGT lags  
                *[thermal_generation * 0.98] * 4,  # Thermal lags
                *[demand_gap * 0.9] * 4,       # Demand gap lags (approximated)
                
                # Rolling features for grid metrics - 16 features
                *[total_uclf_oclf] * 4,        # UCLF+OCLF rolling
                *[eskom_ocgt] * 4,             # OCGT rolling
                *[thermal_generation] * 4,     # Thermal rolling  
                *[demand_gap] * 4,             # Demand gap rolling
                
                # Additional temporal features - 6 features
                dt.day,  # day_of_month
                (month - 1) // 3 + 1,  # quarter
                dt.isocalendar()[1],  # week_of_year
                1 if day_of_week >= 5 else 0,  # is_weekend
                1 if 7 <= hour <= 10 else 0,  # is_peak_morning
                1 if 18 <= hour <= 21 else 0,  # is_peak_evening
            ]
            
            # Convert to numpy array and ensure we have exactly the right number of features
            feature_array = np.array(features).reshape(1, -1)
            
            # Debug: check feature count  
            expected_features = 51
            if feature_array.shape[1] != expected_features:
                print(f"⚠️  Feature count mismatch: got {feature_array.shape[1]}, expected {expected_features}")
                # Pad or trim to match expected size
                if feature_array.shape[1] < expected_features:
                    padding = np.zeros((1, expected_features - feature_array.shape[1]))
                    feature_array = np.hstack([feature_array, padding])
                else:
                    feature_array = feature_array[:, :expected_features]
            
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
                        
                        # Get prediction with improved logic
                        if hasattr(model, 'predict_proba'):
                            # Get probabilities for all stages
                            probabilities = model.predict_proba(features)[0]
                            
                            # Use smarter prediction logic for better load shedding detection
                            # If there's significant probability for higher stages, consider them
                            total_loadshedding_prob = np.sum(probabilities[1:])  # Sum of Stage 1-8
                            
                            if total_loadshedding_prob > 0.6:  # More than 60% chance of load shedding
                                # Find the highest probability stage among load shedding stages (1+)
                                loadshedding_probs = probabilities[1:]
                                predicted_stage = int(np.argmax(loadshedding_probs) + 1)
                                confidence = float(loadshedding_probs[predicted_stage - 1])
                            else:
                                # Use standard prediction
                                predicted_stage = int(np.argmax(probabilities))
                                confidence = float(probabilities[predicted_stage])
                                
                            # Additional logic for high-demand scenarios
                            if 'demand_forecast' in data and 'generation_capacity' in data:
                                demand = data.get('demand_forecast', 30000)
                                generation = data.get('generation_capacity', 28000)
                                if demand and generation and demand > generation * 1.1:  # 10%+ shortage
                                    # Boost load shedding prediction for clear shortage scenarios
                                    if predicted_stage == 0 and total_loadshedding_prob > 0.3:
                                        # Find most likely load shedding stage
                                        loadshedding_probs = probabilities[1:]
                                        predicted_stage = int(np.argmax(loadshedding_probs) + 1)
                                        confidence = max(confidence, 0.7)  # Boost confidence for obvious scenarios
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