#  Load Shedding Prediction System

**Proactive Forecasting for South African SMEs**

A machine learning-based system that predicts load shedding stages 6 hours in advance, helping small businesses optimize backup power usage and minimize economic losses.

---

##  Project Overview

### Problem Statement
South Africa experienced 335 days of load shedding in 2023, costing the economy R1 billion per day. Small businesses face severe challenges:
- Lost productivity during outages
- High backup power costs (R18,000+ for generators)
- Inability to plan operations effectively
- 71% of SMEs report direct negative impacts

### Solution
An ML-powered prediction system that:
- **Forecasts** load shedding stages 6 hours ahead (88% accuracy)
- **Analyzes** historical patterns using 4+ years of Eskom data
- **Provides** actionable insights for business planning
- **Optimizes** backup power usage based on predictions

### Key Results
- **88.86% LSTM Accuracy** - 6-hour ahead predictions
- **91.80% XGBoost Accuracy** - Best baseline model
- **6-hour lead time** - Sufficient for business preparation
- **54 predictive features** - Grid conditions, temporal patterns, renewable energy

---

##  Links

- **GitHub Repository**: [https://github.com/glenmiracle18/loadshedding-prediction-model](https://github.com/glenmiracle18/loadshedding-prediction-model)
- **Live Demo**: [Coming Soon]
- **Video Demo**: [Link to Video]
- **Data source and models**: [https://drive.google.com/drive/folders/1f_IevZLn66jib7nBO6_Sya6LkI-ljkUX?usp=sharing]
- **Project Documentation**: See `docs/` folder

---

##  System Architecture
![architecture](./docs/diagrams/system-architecture.png)


---

##  Setup Instructions

### Prerequisites
- **Python**: 3.11+
- **Node.js**: 20+
- **PostgreSQL**: 16+
- **Redis**: 7.2+
- **Git**: Latest version

### 1. Clone the Repository

```bash
git clone https://github.com/glenmiracle18/loadshedding-prediction-model.git
cd loadshedding-prediction
```

### 2. Backend Setup (Python ML Service)

```bash
# Navigate to ML service directory
cd backend/ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download trained models (from Google Drive or release)
# Place models in: backend/ml-service/models/
# Required files:
#   - lstm_final.h5
#   - xgboost.pkl
#   - feature_scaler_final.pkl

# Run ML service
python app.py
# Service runs on http://localhost:5000
```

### 3. Backend Setup (Node.js API)

```bash
# Navigate to API directory
cd backend/api

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your settings:
#   DATABASE_URL=postgresql://user:password@localhost:5432/loadshedding
#   REDIS_URL=redis://localhost:6379
#   ML_SERVICE_URL=http://localhost:5000
#   JWT_SECRET=your-secret-key

# Run database migrations
npm run migrate

# Start API server
npm run dev
# API runs on http://localhost:3000
```

### 4. Frontend Setup (React)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env:
#   REACT_APP_API_URL=http://localhost:3000

# Start development server
npm start
# Frontend runs on http://localhost:3001
```

### 5. Database Setup

```bash
# Start PostgreSQL (if not running)
# Create database
createdb loadshedding

# Start Redis
redis-server
```

### 6. Verify Installation

Visit `http://localhost:3001` - you should see the prediction dashboard.

**Test the ML prediction:**
```bash
curl http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"location": "Gauteng", "datetime": "2024-03-15T18:00:00"}'
```

---

##  Data Sources

### Training Data (Historical)
- **Eskom Load Shedding History**: 2021-2025 (36,143 hourly records)
    - Source: Eskom Data Portal (`eskom_data__ESK17876.csv`)
    - Features: 43 columns including generation, capacity, demand
- **EskomSePush History**: Stage announcements
    - Source: EskomSePush API (`EskomSePush_history.csv`)
    - Records: 1,563 stage changes

### Real-time Data (Inference)
- **Weather API**: OpenWeatherMap
- **Grid Status**: Eskom Data Portal (updated hourly)

---

##  Design & UI

### Figma Mockups
[Insert Figma links or screenshots here]

### Application Screenshots

#### 1. **Dashboard - Prediction View**
![dashboard](./Designs/dashboard.png)


#### 2. **Cost Calculator**
![cost](./Designs/cost-calculator.png)


#### 3. **Historical Analysis**
![historic](./Designs/historical-analysis.png)


### System Diagrams
See `docs/diagrams/` for:
- Class Diagram
- Sequence Diagram (Prediction Flow)
- Entity Relationship Diagram
- ML Pipeline Flow

---

##  Machine Learning Models

### Model Performance

| Model | Accuracy | F1-Score | Training Time |
|-------|----------|----------|---------------|
| **LSTM** | **88.86%** | 0.923 | 1.7 min |
| XGBoost | 91.80% | 0.938 | 13 sec |
| Random Forest | 92.33% | 0.940 | 13 sec |
| Logistic Regression | 81.89% | 0.885 | 3 sec |

### Feature Engineering
- **54 clean features** after comprehensive leakage removal
- **Categories**:
    - Grid conditions (UCLF, Thermal Gen, Nuclear Gen, OCGT)
    - Temporal patterns (hour, day, season, peak indicators)
    - Renewable energy (Wind, PV, CSP)
    - Historical lags (1h, 6h, 24h, 168h)

### Data Leakage Resolution
Removed **38 concurrent features** across 4 iterations:
1. Ultra-short stage lags (1h, 6h)
2. MLR features (emergency response)
3. demand_gap features (concurrent measurement)
4. Actual demand/generation (Residual Demand, Dispatchable Generation)

**Result**: 16% accuracy drop (98% → 82% for Logistic Regression) validates genuine forecasting.

---

##  Deployment Plan

### Development Environment
- **Local Testing**: Docker Compose setup
- **CI/CD**: GitHub Actions
- **Testing**: Pytest (backend), Jest (frontend)

### Staging Deployment

**Infrastructure**: Heroku / Railway

```bash
# Backend API
heroku create loadshedding-api
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini
git push heroku main

# ML Service (separate dyno)
heroku create loadshedding-ml
git subtree push --prefix backend/ml-service heroku main

# Frontend
# Deploy to Vercel/Netlify
vercel deploy --prod
```

**Environment Variables**:
```
DATABASE_URL=<heroku-postgres-url>
REDIS_URL=<heroku-redis-url>
ML_SERVICE_URL=https://loadshedding-ml.herokuapp.com
JWT_SECRET=<production-secret>
WEATHER_API_KEY=<openweathermap-key>
```

### Production Deployment

**Infrastructure**: AWS / Google Cloud Platform

**Architecture**:
- **Frontend**: CloudFront CDN + S3
- **API Gateway**: Application Load Balancer
- **Backend**: ECS Fargate (containerized)
- **ML Service**: SageMaker / Lambda (serverless inference)
- **Database**: RDS PostgreSQL (Multi-AZ)
- **Cache**: ElastiCache Redis
- **Monitoring**: CloudWatch + Sentry

**Deployment Steps**:

1. **Containerization**:
```bash
# Build Docker images
docker build -t loadshedding-api ./backend/api
docker build -t loadshedding-ml ./backend/ml-service
docker build -t loadshedding-frontend ./frontend

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <ecr-url>
docker tag loadshedding-api:latest <ecr-url>/loadshedding-api:latest
docker push <ecr-url>/loadshedding-api:latest
```

2. **Infrastructure as Code** (Terraform):
```hcl
# terraform/main.tf
resource "aws_ecs_cluster" "main" {
  name = "loadshedding-cluster"
}

resource "aws_ecs_service" "api" {
  name            = "loadshedding-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 2
  launch_type     = "FARGATE"
}
```

3. **CI/CD Pipeline** (GitHub Actions):
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      - name: Build Docker images
        run: docker build -t loadshedding-api .
      - name: Deploy to ECS
        run: aws ecs update-service --cluster loadshedding --service api
```

4. **Monitoring & Alerts**:
- **Uptime**: 99.9% SLA
- **Response Time**: <500ms (p95)
- **Error Rate**: <1%
- **Alerts**: Slack notifications for failures

### Scaling Strategy
- **Horizontal**: Auto-scaling based on CPU/memory
- **Vertical**: Upgrade instance types during peak hours
- **ML Optimization**: Model quantization, TensorFlow Lite

---

## 🧪 Testing

### Unit Tests
```bash
# Backend
cd backend/api
npm test

# ML Service
cd backend/ml-service
pytest tests/
```

### Integration Tests
```bash
# API + ML integration
npm run test:integration
```

### Model Validation
- **Backtesting**: 6-month holdout set (never seen during training)
- **Cross-validation**: 5-fold temporal split
- **Metrics**: Accuracy, F1-Score, Confusion Matrix

---

## 📖 Documentation

### API Documentation
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Endpoints**:
    - `POST /api/predict` - Get 6-hour prediction
    - `POST /api/auth/login` - User authentication
    - `GET /api/history` - Historical data
    - `POST /api/cost-calculator` - Business cost analysis

### Model Documentation
See `docs/MODEL_TRAINING_GUIDE.md` for:
- Training process
- Hyperparameters
- Feature engineering
- Data leakage resolution

---

## Contributing

This is a capstone project. For inquiries, contact:
- **Author**: Bonyu Miracle Glen
- **Email**: [m.bonyu@alustudent.com]
- **Institution**: African Leadership University

---

##  License

This project is developed as part of a BSc. Software Engineering capstone at African Leadership University.

---

##  Acknowledgments

- **Supervisor**: Tunde Isiaq Gbadamosi
- **Data Sources**: Eskom, EskomSePush, OpenWeatherMap
- **Inspiration**: South African SMEs struggling with load shedding

---

##  References

- Eskom Data Portal: [https://www.eskom.co.za/dataportal](https://www.eskom.co.za/dataportal)
- FTI Consulting (2025): Load Shedding Economic Impact Report
- Research papers cited in `docs/references.bib`

---

**Built with ❤️ to help South African businesses thrive despite energy challenges.**