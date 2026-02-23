# Load Shedding Prediction API - Backend Documentation

## Overview

FastAPI backend service that provides load shedding predictions using machine learning models (XGBoost, Random Forest). The API includes user authentication, ML predictions, historical data access, and cost calculations.

## Architecture

```
backend/api/
├── app/
│   ├── main.py                 # FastAPI app entry point
│   ├── core/
│   │   ├── config.py          # Configuration settings
│   │   └── security.py        # JWT authentication
│   ├── models/
│   │   ├── database.py        # SQLAlchemy setup
│   │   └── models.py          # Database models
│   ├── schemas/
│   │   └── schemas.py         # Pydantic request/response models
│   ├── routers/
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── predictions.py    # ML prediction endpoints
│   │   ├── health.py         # Health check endpoints
│   │   └── cost_calculator.py # Cost calculation endpoints
│   └── services/
│       ├── ml_service.py     # ML model integration
│       ├── cache_service.py  # Redis caching
│       └── data_service.py   # External API integration
├── models/                    # ML model files (.pkl)
├── requirements.txt
└── Dockerfile
```

## Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: SQLite (local), PostgreSQL (production)
- **Cache**: Redis
- **ML Models**: XGBoost, Random Forest, Feature Scaler
- **Authentication**: JWT Bearer tokens
- **Validation**: Pydantic schemas

## Database Models

### Users
- `id`, `email`, `username`, `hashed_password`, `is_active`, `created_at`

### Predictions
- `id`, `user_id`, `location`, `date_time`, `temperature`, `humidity`, `wind_speed`
- `demand_forecast`, `generation_capacity`, `historical_avg`
- `predicted_stage`, `confidence_score`, `model_used`, `created_at`

### Historical Data
- `id`, `date_time`, `location`, `temperature`, `humidity`, `wind_speed`
- `demand`, `generation`, `available_capacity`, `actual_stage`, `created_at`

### Cost Calculations
- `id`, `user_id`, `location`, `household_size`, `monthly_consumption`
- `backup_solution`, `backup_cost`, `fuel_cost_monthly`, `equipment_cost`
- `maintenance_cost_yearly`, `total_yearly_cost`, `potential_savings`
- `payback_period_months`, `created_at`

## ML Models

### Current Status
- **XGBoost**: 91.80% accuracy, primary model
- **Random Forest**: 92.33% accuracy, fallback
- **Feature Scaler**: StandardScaler for input normalization
- **LSTM**: Available but incompatible (TensorFlow format)

### Feature Engineering
Models trained on 51 features after removing data leakage:
- Grid conditions (thermal, nuclear, OCGT generation)
- Capacity loss factors (UCLF, OCLF, PCLF)
- Temporal patterns (hour, day, month)
- Historical lags of grid metrics
- Rolling averages for trend analysis

### Prediction Logic
1. Extract 51 features from API request
2. Apply feature scaling (StandardScaler)
3. Try XGBoost → Random Forest → Rule-based fallback
4. Return prediction with confidence score
5. Cache results for 5 minutes

## Configuration

Environment variables (`.env` file):
```env
# Database
DATABASE_URL=sqlite:///./loadshedding.db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs
WEATHER_API_KEY=optional_weather_api_key
GRID_API_URL=https://api.gridwatch.co.za/api/v3/status

# ML Models
MODEL_PATH=./models
CACHE_TTL=300

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:8080"]
```

## Security Features

- JWT Bearer token authentication
- Password hashing with bcrypt
- CORS middleware for frontend integration
- Input validation with Pydantic
- Error handling and logging

## Performance Features

- Redis caching for predictions and external API calls
- Async/await for non-blocking operations
- Connection pooling for database
- Model loading optimization
- Response compression

## Development Status

✅ **Completed**:
- User authentication (register, login, logout)
- ML prediction endpoints with real models
- Database models and migrations
- Redis caching integration
- Error handling and validation
- CORS configuration

🔄 **Current**:
- Backend fully functional for frontend integration
- All endpoints tested and working
- ML models loaded and predicting

📋 **Ready for Frontend**:
- Base URL: `http://localhost:8000`
- API prefix: `/api/v1`
- Authentication: Bearer tokens
- All endpoints documented below