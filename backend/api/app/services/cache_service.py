import json
import redis
from typing import Optional, Any
from ..core.config import settings


class CacheService:
    def __init__(self):
        try:
            self.redis_client = redis.from_url(settings.REDIS_URL)
            # Test connection
            self.redis_client.ping()
            self.is_connected = True
        except Exception as e:
            print(f"Redis connection failed: {e}")
            self.redis_client = None
            self.is_connected = False
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.is_connected:
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """Set value in cache with optional TTL"""
        if not self.is_connected:
            return False
        
        try:
            ttl = ttl or settings.CACHE_TTL
            self.redis_client.setex(
                key, 
                ttl, 
                json.dumps(value, default=str)
            )
            return True
        except Exception as e:
            print(f"Cache set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.is_connected:
            return False
        
        try:
            self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> bool:
        """Clear all keys matching pattern"""
        if not self.is_connected:
            return False
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
            return True
        except Exception as e:
            print(f"Cache clear pattern error: {e}")
            return False
    
    def health_check(self) -> dict:
        """Check cache service health"""
        try:
            if not self.is_connected:
                return {"status": "disconnected", "error": "Redis not connected"}
            
            self.redis_client.ping()
            return {"status": "healthy", "connection": "active"}
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}


# Global cache service instance
cache_service = CacheService()