# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Load Shedding Prediction System - An AI-powered forecasting application for South African load shedding with 6-hour advance predictions. The system combines a FastAPI backend with machine learning models and a Next.js frontend.

**Live Application**: https://loadshedding-prediction-model-mq71.vercel.app/

## Development Commands

### Backend (FastAPI)
```bash
# Setup and Development
cd backend/api
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run Development Server
uvicorn app.main:app --reload

# Testing and Performance
python3 performance_tests.py  # Comprehensive performance tests (requires server running)

# The backend runs on http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Frontend (Next.js)
```bash
# Setup and Development  
cd frontend-nextjs
npm install

# Run Development Server
npm run dev
npm run build  # Production build
npm run start  # Production server

# Linting
npm run lint

# The frontend runs on http://localhost:3000
```

## High-Level Architecture

### Backend Structure (FastAPI)
- **`app/main.py`**: Application entry point with CORS, lifespan events, and health checks
- **`app/core/`**: Configuration (`config.py`) and security utilities (`security.py`)
- **`app/routers/`**: API endpoints for authentication (`auth.py`) and predictions (`predictions.py`)
- **`app/models/`**: Database models and SQLAlchemy setup
- **`app/schemas/`**: Pydantic schemas for request/response validation
- **`app/services/`**: Business logic including ML service and caching

### Frontend Structure (Next.js + TanStack Start)
- **App Router**: Uses Next.js 16+ app directory structure
- **`src/app/`**: Main application pages and layouts with TypeScript
- **`src/components/`**: Reusable UI components  
- **`src/hooks/`**: Custom React hooks including authentication (`useAuth`)
- **`src/lib/`**: Utility functions and configurations

### Design System - "Energy Minimal"
- **Color Palette**: Amber/orange primary (#F59E0B) with dark slate backgrounds (#1E293B)
- **Typography**: Jost (body), Montserrat (headings) with larger text sizes for accessibility
- **Styling**: Glassmorphism UI with minimal rounded corners, no shadows
- **Components**: Consistent dark theme with white/amber accents across all pages
- **Video Background**: External video hosting on landing page only (not auth pages)
- **Forms**: Dark transparent cards with amber focus states and validation

### Machine Learning Integration
- **Model Hosting**: Uses Hugging Face Hub for model distribution (`yaralexie/loadshedding-prediction-models`)
- **Models**: XGBoost (91.80% accuracy), Random Forest (92.33% accuracy), LSTM (88.86% accuracy)
- **Features**: 54 engineered features for 6-hour ahead prediction
- **No Local Models**: All models are loaded from Hugging Face Hub during startup

### Database
- **Development**: SQLite (`loadshedding.db`)
- **Production**: PostgreSQL (configured via DATABASE_URL)
- **Caching**: Redis for performance optimization
- **ORM**: SQLAlchemy with automatic table creation

## Key Environment Variables

Backend requires `.env` file in `backend/api/`:
- `SECRET_KEY`: JWT signing key
- `DATABASE_URL`: Database connection string  
- `REDIS_URL`: Redis cache connection
- `WEATHER_API_KEY`: OpenWeatherMap API key
- `HUGGINGFACE_TOKEN`: For model access
- `HUGGINGFACE_REPO`: Model repository name
- `ALLOWED_ORIGINS`: CORS origins list

## Important Implementation Details

### Authentication Flow
- JWT-based authentication with 24-hour token expiry
- User registration and login through `/api/v1/auth` endpoints
- Frontend uses `AuthProvider` context for session management

### ML Prediction Pipeline  
- Real-time feature engineering from input data
- 6-hour prediction horizon (not concurrent classification)
- Confidence scoring with ensemble model voting
- Results cached for performance

### Cost Calculator & Business Analysis
- **Impact Analysis Modal**: Comprehensive financial projections, ROI analysis, and implementation planning
- **Data-Backed Calculations**: All estimates based on verified sources (SARB, Eskom, industry research)
- **Monthly Revenue Input**: Converts monthly business revenue to hourly (22 days × 8 hours standard)
- **Generator Pricing**: Tiered pricing model (R8k-R18k per kVA) based on 2024-2025 SA market data
- **Load Shedding Frequency**: Historical patterns from Eskom official data (2024-2025)
- **Documentation**: Comprehensive data sources documented in `/docs/COST_CALCULATOR_DATA_SOURCES.md`

### Data Validation
- Comprehensive Pydantic schemas for all API endpoints
- Frontend validation using TanStack React Form
- Input sanitization and error handling

### Performance Considerations
- Redis caching with 5-minute TTL
- Model pre-loading during application startup
- Optimized queries and connection pooling
- Comprehensive performance testing suite (`performance_tests.py`)

## Testing

Backend includes extensive performance testing framework:
- API response time testing
- ML prediction performance analysis  
- Concurrent load testing (10-500 users)
- System resource monitoring
- Run with: `python3 performance_tests.py` (requires backend server running)

## Development Patterns

### Code Style
- Backend: Follow PEP 8, use type hints consistently
- Frontend: TypeScript strict mode, component-based architecture
- Both: Comprehensive error handling and logging

### Database Operations
- Use SQLAlchemy ORM for type safety
- Implement proper connection management
- Handle migrations through alembic when needed

### API Design
- RESTful endpoints with clear resource naming
- Consistent response formats with proper HTTP status codes
- Comprehensive OpenAPI documentation auto-generated

### UI/UX Design Guidelines
- **Energy Minimal Design System**: Consistent amber/dark slate theme across all pages
- **Glassmorphism Components**: `bg-white/10 backdrop-blur border border-white/20 rounded`
- **Typography Classes**: Use `text-display` for headings, larger font sizes for accessibility
- **No Shadows**: Avoid `shadow-` classes, use borders instead for minimal aesthetic
- **Rounded Corners**: Use `rounded` (not `rounded-lg`) for consistency
- **Form Styling**: Dark inputs with `bg-white/10 text-white placeholder:text-white/50`
- **Button States**: Primary (amber), Secondary (white/transparent), Success (green)

## Security
- JWT token validation on protected endpoints
- Input validation and sanitization
- CORS properly configured for deployment
- No sensitive data logging or exposure
- Environment-based configuration management

## Documentation Standards

### Data Source Requirements
- All business calculations must be backed by verifiable sources
- Document data sources in `/docs/` directory with `.md` files
- Include confidence levels and update schedules for estimates
- Provide academic references and official government data where possible
- Regular review cycles (quarterly/annually) to maintain accuracy