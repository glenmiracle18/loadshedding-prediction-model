# Load Shedding Prediction System

**Proactive AI-Powered Forecasting for South African Users**

A machine learning-based web application that predicts load shedding stages 6 hours in advance, featuring a clean, minimalistic interface designed for optimal user experience.

---

## 🚀 Project Overview

### Problem Statement
South Africa experienced 335 days of load shedding in 2023, costing the economy R1 billion per day. Citizens and businesses face severe challenges:
- Lost productivity during outages
- High backup power costs (R18,000+ for generators)
- Inability to plan daily activities effectively
- Need for reliable advance warning systems

### Solution
An AI-powered prediction system that:
- **Forecasts** load shedding stages 6 hours ahead (92%+ accuracy)
- **Analyzes** real-time grid conditions and historical patterns
- **Provides** clean, user-friendly web interface
- **Calculates** backup power costs for different solutions
- **Tracks** prediction history and accuracy

### Key Results
- **92.33% Random Forest Accuracy** - Best performing model
- **91.80% XGBoost Accuracy** - Primary prediction model  
- **6-hour lead time** - Sufficient for preparation
- **51 optimized features** - Grid conditions, weather, temporal patterns

---

## ✨ Features

### 🎯 Core Functionality
- **AI Predictions**: Load shedding stage forecasting (0-8 stages) with confidence scores
- **Simple Interface**: Clean, minimalistic design focusing on usability
- **User Authentication**: Secure JWT-based login with session management
- **Prediction History**: Track and analyze your prediction accuracy
- **Cost Calculator**: Compare backup solutions (generator, UPS, solar, battery)

### 🔧 Technical Features
- **Automatic Session Handling**: Smart logout on token expiry with notifications
- **Real-time Processing**: Prioritizes user input over cached external data
- **Mobile Responsive**: Optimized for all device sizes
- **Fallback System**: Multiple ML models ensure reliability
- **External Data Integration**: Weather and grid status APIs

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **TanStack Start** - Full-stack React meta-framework
- **Tailwind CSS v4** - Utility-first CSS framework
- **TypeScript** - Type-safe development

### Backend
- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Pydantic** - Data validation using Python type annotations
- **JWT Authentication** - Secure token-based auth

### Machine Learning
- **XGBoost** - Gradient boosting framework (91.80% accuracy)
- **Random Forest** - Ensemble learning method (92.33% accuracy)
- **Scikit-learn** - Feature scaling and preprocessing
- **51 Engineered Features** - Optimized for SA grid conditions

### Database & Deployment
- **SQLite** - Lightweight database for development
- **PostgreSQL** - Production database option
- **Docker** - Containerized deployment ready

---

## 🚦 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/glenmiracle18/loadshedding-prediction-model.git
cd loadshedding-prediction-model
```

### 2. Backend Setup
```bash
cd backend/api
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on: http://localhost:8000
API Documentation: http://localhost:8000/docs

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

### 4. Access Application
1. Open http://localhost:3000
2. Register a new account or login
3. Navigate to "Predict" to make load shedding predictions
4. View your prediction history and use the cost calculator

---

## 🎨 Design Philosophy

### Clean & Minimalistic
- **No Gradients or Shadows**: Clean, flat design approach
- **White & Blue Theme**: Professional, easy on the eyes
- **Essential Fields Only**: Simplified forms focusing on required information
- **Single-Page Hero**: Streamlined homepage with key features

### User Experience Focus
- **Mobile-First**: Responsive design for all devices
- **Fast Loading**: Optimized performance and minimal complexity
- **Clear Navigation**: Intuitive menu structure
- **Smart Notifications**: Informative alerts for session and error states

---

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user info

### Predictions
- `POST /api/v1/predictions/predict` - Create new prediction
- `GET /api/v1/predictions/` - Get user prediction history
- `DELETE /api/v1/predictions/{id}` - Delete prediction

### System
- `GET /api/v1/health` - System health check

---

## 🧠 Machine Learning Models

### Model Performance
- **Random Forest**: 92.33% accuracy, robust ensemble method
- **XGBoost**: 91.80% accuracy, gradient boosting with regularization
- **Feature Engineering**: 51 optimized features including:
  - Grid capacity and demand metrics
  - Temporal patterns (hour, day, month, seasonality)
  - Weather conditions (temperature, humidity, wind)
  - Historical load shedding patterns

### Prediction Process
1. User provides location, date/time, and optional parameters
2. System fetches real-time weather and grid data if needed
3. Features are engineered and scaled using trained scaler
4. Multiple models generate predictions with confidence scores
5. Best prediction is selected and stored in user history

---

## 📈 Recent Updates

### Latest Session (February 2024)
- ✅ **Complete UI Redesign**: Clean minimalistic interface replacing dark theme
- ✅ **Simplified Prediction Form**: Reduced to essential fields (city, date/time, humidity, demand)
- ✅ **Session Management**: Automatic logout on token expiry with user notifications
- ✅ **Prediction Fix**: Resolved issue where user input was overridden by cached data
- ✅ **Cost Calculator**: New page for backup power solution analysis
- ✅ **Homepage Redesign**: Single-page hero section with key features
- ✅ **Mobile Optimization**: Improved responsive design across all pages

---

## 🔮 Future Enhancements

- [ ] **Real-time Notifications**: Push notifications for predicted load shedding
- [ ] **Location Services**: GPS-based automatic location detection
- [ ] **Advanced Analytics**: Trend analysis and accuracy metrics
- [ ] **API Integration**: Direct integration with Eskom data feeds
- [ ] **Multi-language Support**: Afrikaans and other local languages
- [ ] **Mobile App**: Native iOS and Android applications

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Contact

**Glen Miracle** - [GitHub](https://github.com/glenmiracle18)

Project Link: [https://github.com/glenmiracle18/loadshedding-prediction-model](https://github.com/glenmiracle18/loadshedding-prediction-model)

---

**Built with ❤️ for South African resilience**