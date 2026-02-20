import httpx
import random
from typing import Dict, Any, Optional
from datetime import datetime
from ..core.config import settings
from .cache_service import cache_service


class DataService:
    def __init__(self):
        self.weather_api_key = settings.WEATHER_API_KEY
        self.grid_api_url = settings.GRID_API_URL
        
    async def get_weather_data(self, location: str) -> Dict[str, Any]:
        """Get current weather data for location"""
        cache_key = f"weather:{location}"
        
        # Try cache first
        cached_data = cache_service.get(cache_key)
        if cached_data:
            return cached_data
        
        try:
            if self.weather_api_key:
                # Use real weather API (OpenWeatherMap example)
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        f"https://api.openweathermap.org/data/2.5/weather",
                        params={
                            "q": location,
                            "appid": self.weather_api_key,
                            "units": "metric"
                        }
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        weather_data = {
                            "temperature": data["main"]["temp"],
                            "humidity": data["main"]["humidity"],
                            "wind_speed": data["wind"]["speed"],
                            "description": data["weather"][0]["description"],
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        
                        # Cache for 10 minutes
                        cache_service.set(cache_key, weather_data, ttl=600)
                        return weather_data
            
            # Fallback to mock data
            return self._get_mock_weather_data(location)
            
        except Exception as e:
            print(f"Weather API error: {e}")
            return self._get_mock_weather_data(location)
    
    def _get_mock_weather_data(self, location: str) -> Dict[str, Any]:
        """Generate mock weather data"""
        # Simulate realistic South African weather patterns
        base_temp = 22 if "cape town" in location.lower() else 25
        
        weather_data = {
            "temperature": round(base_temp + random.uniform(-5, 8), 1),
            "humidity": random.randint(45, 85),
            "wind_speed": round(random.uniform(2, 15), 1),
            "description": random.choice(["clear sky", "few clouds", "scattered clouds", "overcast"]),
            "timestamp": datetime.utcnow().isoformat(),
            "source": "mock"
        }
        
        # Cache mock data for 5 minutes
        cache_key = f"weather:{location}"
        cache_service.set(cache_key, weather_data, ttl=300)
        
        return weather_data
    
    async def get_grid_status(self) -> Dict[str, Any]:
        """Get current grid status from GridWatch"""
        cache_key = "grid:status"
        
        # Try cache first
        cached_data = cache_service.get(cache_key)
        if cached_data:
            return cached_data
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.grid_api_url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    grid_data = {
                        "demand": data.get("demand", 0),
                        "generation": data.get("generation", 0),
                        "available_capacity": data.get("available_capacity", 0),
                        "eaf": data.get("eaf", 0),  # Energy Availability Factor
                        "timestamp": datetime.utcnow().isoformat(),
                        "source": "gridwatch"
                    }
                    
                    # Cache for 2 minutes
                    cache_service.set(cache_key, grid_data, ttl=120)
                    return grid_data
                    
        except Exception as e:
            print(f"Grid API error: {e}")
        
        # Fallback to mock data
        return self._get_mock_grid_data()
    
    def _get_mock_grid_data(self) -> Dict[str, Any]:
        """Generate mock grid data"""
        # Simulate realistic grid conditions
        base_demand = random.randint(28000, 35000)  # MW
        base_generation = random.randint(25000, 32000)  # MW
        
        grid_data = {
            "demand": base_demand,
            "generation": base_generation,
            "available_capacity": max(0, base_generation - base_demand),
            "eaf": round(random.uniform(0.65, 0.85), 3),
            "timestamp": datetime.utcnow().isoformat(),
            "source": "mock"
        }
        
        # Cache mock data for 2 minutes
        cache_key = "grid:status"
        cache_service.set(cache_key, grid_data, ttl=120)
        
        return grid_data
    
    async def get_historical_averages(self, location: str, hour: int) -> Dict[str, float]:
        """Get historical averages for location and hour"""
        cache_key = f"historical:{location}:{hour}"
        
        # Try cache first
        cached_data = cache_service.get(cache_key)
        if cached_data:
            return cached_data
        
        # Mock historical data based on typical patterns
        peak_hours = [7, 8, 9, 17, 18, 19, 20]  # Morning and evening peaks
        is_peak = hour in peak_hours
        
        historical_data = {
            "avg_demand": random.randint(30000, 34000) if is_peak else random.randint(25000, 29000),
            "avg_generation": random.randint(27000, 31000) if is_peak else random.randint(26000, 30000),
            "avg_loadshedding_probability": random.uniform(0.2, 0.7) if is_peak else random.uniform(0.1, 0.4),
            "historical_stage": random.choice([0, 1, 2, 3, 4]) if is_peak else random.choice([0, 0, 1, 2])
        }
        
        # Cache for 1 hour (historical data doesn't change frequently)
        cache_service.set(cache_key, historical_data, ttl=3600)
        
        return historical_data


# Global data service instance
data_service = DataService()