# Load Shedding Prediction System

## Project Overview
ML-powered system that predicts load shedding stages 6 hours in advance for South African users. Features a clean, minimalistic web interface with AI predictions, cost calculator, and historical analysis.

## Current Status ✨
- ✅ **ML Models**: XGBoost (91.80%), Random Forest (92.33%) - fully integrated
- ✅ **Backend**: Complete FastAPI REST API with authentication, predictions, and ML service
- ✅ **Frontend**: Modern React app with clean minimalistic design using TanStack Start
- ✅ **Database**: SQLite configured with user management and prediction history
- ✅ **Authentication**: JWT-based auth with session expiry handling
- ✅ **Session Management**: Automatic logout on token expiry with user notifications

## Features
🎯 **Core Functionality**:
- AI-powered load shedding stage predictions (0-8 stages)
- 6-hour ahead forecasting with confidence scores
- User authentication and prediction history
- Cost calculator for backup solutions (generator, UPS, solar, battery)
- Clean, responsive design optimized for mobile and desktop

🔧 **Technical Features**:
- Automatic session expiry detection and logout
- Real-time prediction with user input prioritization
- Fallback system with multiple ML models
- External data integration (weather, grid status)
- Comprehensive error handling and validation

## Quick Start

### Backend
```bash
cd backend/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Architecture
- **Frontend**: React 19 + TanStack Start + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + Pydantic
- **Database**: SQLite (easy setup) / PostgreSQL (production)
- **ML**: XGBoost + Random Forest with feature scaling
- **Auth**: JWT tokens with automatic expiry handling

## API Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/predictions/predict` - Create prediction
- `GET /api/v1/predictions/` - Get user prediction history
- `GET /api/v1/health` - System health check

## Key Models Available
- `xgboost.pkl` (91.80% accuracy)
- `random_forest.pkl` (92.33% accuracy)  
- `feature_scaler_final.pkl`
- Feature engineering with 51 optimized features

## Recent Updates (Latest Session)
- ✅ Implemented clean minimalistic UI design (removed all gradients/shadows)
- ✅ Simplified prediction form to only essential fields (city, date/time, humidity, demand)
- ✅ Fixed prediction issue where user input was overridden by cached data
- ✅ Added automatic session expiry handling with user notifications
- ✅ Created cost calculator for backup power solutions
- ✅ Converted homepage to single-page hero section
- ✅ Complete visual redesign with white/blue theme for better usability

## Development Notes
- Frontend runs on http://localhost:3000
- Backend API runs on http://localhost:8000
- API documentation available at http://localhost:8000/docs
- All models loaded automatically on startup
- Session tokens expire and trigger automatic logout