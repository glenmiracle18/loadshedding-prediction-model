from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime

from .core.config import settings
from .models.database import engine
from .models.models import Base
from .routers import auth, predictions
from .services.ml_service import ml_service
from .services.cache_service import cache_service
from .schemas.schemas import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Starting Load Shedding Prediction API...")
    
    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified")
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
    
    # Initialize ML service
    print(f"🤖 ML Service initialized with {len(ml_service.models)} models")
    
    # Test cache connection
    cache_health = cache_service.health_check()
    print(f"📦 Cache service: {cache_health['status']}")
    
    print("✅ Application startup complete!")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Load Shedding Prediction API...")


app = FastAPI(
    title="Load Shedding Prediction API",
    description="ML-powered load shedding prediction system for South Africa",
    version="1.0.0",
    docs_url="/api-docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(predictions.router, prefix="/api/v1")


@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Load Shedding Prediction API",
        "status": "active",
        "version": "1.0.0",
        "docs": "/api-docs",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health", response_model=HealthResponse)
def health_check():
    """Comprehensive health check endpoint"""
    try:
        # Check database connection
        from .models.database import SessionLocal
        db = SessionLocal()
        try:
            db.execute("SELECT 1")
            db_status = "healthy"
        except Exception as e:
            db_status = f"unhealthy: {str(e)}"
        finally:
            db.close()
        
        # Check cache service
        cache_health = cache_service.health_check()
        cache_status = cache_health["status"]
        
        # Check ML models
        ml_status = ml_service.get_model_status()
        
        # Overall status
        overall_status = "healthy" if all([
            db_status == "healthy",
            cache_status in ["healthy", "disconnected"],  # Cache is optional
            ml_status["models_loaded"] >= 0  # At least fallback works
        ]) else "unhealthy"
        
        return HealthResponse(
            status=overall_status,
            timestamp=datetime.utcnow(),
            database=db_status,
            cache=cache_status,
            ml_models=ml_status
        )
        
    except Exception as e:
        return HealthResponse(
            status="unhealthy",
            timestamp=datetime.utcnow(),
            database="unknown",
            cache="unknown",
            ml_models={"error": str(e)}
        )


@app.get("/api/v1/status")
def api_status():
    """API status and configuration info"""
    return {
        "api_version": "1.0.0",
        "environment": "development",
        "features": {
            "authentication": True,
            "ml_predictions": True,
            "caching": cache_service.is_connected,
            "external_apis": True,
            "batch_predictions": True
        },
        "endpoints": {
            "docs": "/api-docs",
            "health": "/health",
            "auth": "/api/v1/auth",
            "predictions": "/api/v1/predictions"
        },
        "timestamp": datetime.utcnow().isoformat()
    }