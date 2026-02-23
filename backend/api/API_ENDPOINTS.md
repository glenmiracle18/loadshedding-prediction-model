# API Endpoints Documentation

Base URL: `http://localhost:8000`
API Prefix: `/api/v1`

## Authentication Endpoints

### 1. Register User
**POST** `/api/v1/auth/register`

```json
{
    "email": "glen@example.com",
    "username": "glen_user", 
    "password": "securepassword123"
}
```

**Response:**
```json
{
    "id": 1,
    "email": "glen@example.com",
    "username": "glen_user",
    "is_active": true,
    "created_at": "2026-02-21T22:00:00"
}
```

### 2. Login User
**POST** `/api/v1/auth/login`

```json
{
    "username": "glen_user",
    "password": "securepassword123"
}
```

**Response:**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
}
```

### 3. Get Current User
**GET** `/api/v1/auth/me`
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "id": 1,
    "email": "glen@example.com", 
    "username": "glen_user",
    "is_active": true,
    "created_at": "2026-02-21T22:00:00"
}
```

### 4. Logout
**POST** `/api/v1/auth/logout`

```json
{"message": "Successfully logged out"}
```

## Prediction Endpoints

### 1. Create Prediction
**POST** `/api/v1/predictions/predict`
**Headers:** `Authorization: Bearer <token>`

```json
{
    "location": "Johannesburg",
    "datetime": "2026-02-22T08:00:00",
    "temperature": 24.5,
    "humidity": 68.0,
    "wind_speed": 9.2,
    "demand_forecast": 35000.0,
    "generation_capacity": 29500.0,
    "historical_avg": 3.2
}
```

**Response:**
```json
{
    "id": 13,
    "predicted_stage": 2,
    "confidence_score": 0.847,
    "model_used": "xgboost",
    "location": "Johannesburg",
    "datetime": "2026-02-22T08:00:00",
    "created_at": "2026-02-21T22:23:05"
}
```

### 2. Get User Predictions
**GET** `/api/v1/predictions/?limit=10&offset=0`
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
    {
        "id": 13,
        "predicted_stage": 2,
        "confidence_score": 0.847,
        "model_used": "xgboost",
        "location": "Johannesburg", 
        "datetime": "2026-02-22T08:00:00",
        "created_at": "2026-02-21T22:23:05"
    }
]
```

### 3. Get Specific Prediction
**GET** `/api/v1/predictions/{prediction_id}`
**Headers:** `Authorization: Bearer <token>`

### 4. Delete Prediction
**DELETE** `/api/v1/predictions/{prediction_id}`
**Headers:** `Authorization: Bearer <token>`

### 5. Batch Predictions (max 10)
**POST** `/api/v1/predictions/batch`
**Headers:** `Authorization: Bearer <token>`

```json
[
    {
        "location": "Cape Town",
        "datetime": "2026-02-22T19:30:00",
        "temperature": 21.8,
        "demand_forecast": 36500.0,
        "generation_capacity": 28000.0
    },
    {
        "location": "Durban", 
        "datetime": "2026-02-22T20:00:00",
        "temperature": 26.1,
        "demand_forecast": 32000.0,
        "generation_capacity": 30000.0
    }
]
```

### 6. Historical Data
**GET** `/api/v1/predictions/historical/data?location=Cape Town&limit=100`

## Cost Calculator Endpoints

### 1. Calculate Backup Costs
**POST** `/api/v1/costs/calculate`
**Headers:** `Authorization: Bearer <token>`

```json
{
    "location": "Cape Town",
    "household_size": 4,
    "monthly_consumption": 800.0,
    "backup_solution": "generator"
}
```

**Response:**
```json
{
    "id": 1,
    "location": "Cape Town",
    "household_size": 4,
    "monthly_consumption": 800.0,
    "backup_solution": "generator",
    "backup_cost": 25000.0,
    "fuel_cost_monthly": 1200.0,
    "equipment_cost": 25000.0,
    "maintenance_cost_yearly": 3000.0,
    "total_yearly_cost": 42600.0,
    "potential_savings": 8400.0,
    "payback_period_months": 36,
    "created_at": "2026-02-21T22:30:00"
}
```

## Health Check Endpoints

### 1. System Health
**GET** `/api/v1/health`

```json
{
    "status": "healthy",
    "timestamp": "2026-02-21T22:30:00",
    "database": "connected",
    "cache": "connected", 
    "ml_models": {
        "xgboost": "loaded",
        "random_forest": "loaded",
        "scaler": "loaded"
    }
}
```

## Request/Response Examples

### Sample Prediction Requests

**Morning Peak (High Risk):**
```json
{
    "location": "Johannesburg",
    "datetime": "2026-02-22T08:00:00",
    "temperature": 24.5,
    "humidity": 68.0,
    "wind_speed": 9.2,
    "demand_forecast": 35000.0,
    "generation_capacity": 29500.0,
    "historical_avg": 3.2
}
```

**Evening Peak (Highest Risk):**
```json
{
    "location": "Cape Town",
    "datetime": "2026-02-22T19:30:00", 
    "temperature": 21.8,
    "humidity": 75.0,
    "wind_speed": 14.5,
    "demand_forecast": 36500.0,
    "generation_capacity": 28000.0,
    "historical_avg": 4.1
}
```

**Off-Peak (Low Risk):**
```json
{
    "location": "Pretoria",
    "datetime": "2026-02-22T14:15:00",
    "temperature": 28.3,
    "humidity": 52.0,
    "wind_speed": 11.7,
    "demand_forecast": 27500.0,
    "generation_capacity": 31000.0,
    "historical_avg": 0.8
}
```

### Expected Response Format

```json
{
    "id": 13,
    "predicted_stage": 2,
    "confidence_score": 0.847,
    "model_used": "xgboost",
    "location": "Johannesburg",
    "datetime": "2026-02-22T08:00:00", 
    "created_at": "2026-02-21T22:23:05"
}
```

## Error Handling

### Common HTTP Status Codes
- `200`: Success
- `201`: Created (predictions, registrations)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found (prediction/user not found)
- `500`: Internal Server Error

### Error Response Format
```json
{
    "detail": "Error message description"
}
```

### Validation Error Format
```json
{
    "detail": [
        {
            "type": "missing",
            "loc": ["body", "datetime"],
            "msg": "Field required",
            "input": {...}
        }
    ]
}
```

## Load Shedding Stages

- **Stage 0**: No load shedding
- **Stage 1**: 1000MW shortage - 2hr rolling blackouts
- **Stage 2**: 2000MW shortage - 2hr rolling blackouts  
- **Stage 3**: 3000MW shortage - 2.5hr rolling blackouts
- **Stage 4**: 4000MW shortage - 4hr rolling blackouts
- **Stage 5**: 5000MW shortage - 4hr rolling blackouts
- **Stage 6**: 6000MW shortage - 6hr rolling blackouts
- **Stage 7**: 7000MW shortage - 8hr rolling blackouts
- **Stage 8**: 8000MW shortage - 12hr rolling blackouts

## API Features

### Machine Learning
- **Models**: XGBoost (primary), Random Forest (fallback), Rule-based (emergency)
- **Features**: 51 engineered features from grid data and temporal patterns
- **Prediction Horizon**: 6 hours ahead
- **Confidence Scores**: Variable based on model certainty
- **Caching**: 5-minute TTL for identical requests

### External Data Integration
- **Weather API**: OpenWeatherMap integration (optional)
- **Grid Status**: GridWatch API integration with fallbacks
- **Mock Data**: Realistic fallbacks when external APIs fail

### Performance
- **Response Time**: ~200-500ms for cached requests
- **Database**: Connection pooling and query optimization
- **Cache**: Redis for frequently accessed data
- **Async**: Non-blocking operations throughout

## Production Considerations

### Security
- Change `SECRET_KEY` in production
- Use environment variables for sensitive config
- Enable HTTPS in production
- Rate limiting recommended

### Database
- Switch to PostgreSQL for production
- Set up database migrations
- Configure connection pooling
- Regular backups

### Monitoring
- Health check endpoint available
- Logging configured for errors
- ML model status monitoring
- Cache performance tracking

## Development Workflow

### Starting the Server
```bash
cd /path/to/backend/api
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Installing Dependencies
```bash
pip3 install -r requirements.txt
```

### Running Tests
- Unit tests: Check README for test commands
- Integration tests: Use Postman collection
- Load tests: Monitor performance under load

## Common Issues & Solutions

### Models Not Loading
- Ensure model files are in `./models/` directory
- Check file permissions and paths
- Verify numpy/scikit-learn compatibility

### Database Errors
- SQLite file permissions
- Database schema mismatches
- Connection string format

### Authentication Issues
- Token expiration (30 minutes default)
- Missing Authorization header
- Invalid token format

### Feature Shape Errors
- Models expect exactly 51 features
- Feature preparation matches training data
- Scaling applied consistently

This backend is fully ready for frontend integration.