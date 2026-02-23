# Deployment Guide

## Development Deployment

### Prerequisites
- Python 3.9+
- Redis server
- Git

### Local Setup
```bash
# 1. Clone repository
git clone https://github.com/glenmiracle18/loadshedding-prediction-model.git
cd loadshedding-prediction-model/backend/api

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env  # Create from template
# Edit .env with your settings

# 5. Add ML models
# Copy your model files to ./models/:
# - xgboost.pkl
# - random_forest.pkl  
# - feature_scaler_final.pkl

# 6. Start Redis (required for caching)
redis-server

# 7. Start the API server
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Environment Variables (.env)
```env
# Database
DATABASE_URL=sqlite:///./loadshedding.db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs (optional)
WEATHER_API_KEY=your_openweather_api_key
GRID_API_URL=https://api.gridwatch.co.za/api/v3/status

# ML Models
MODEL_PATH=./models
CACHE_TTL=300

# CORS (add your frontend URLs)
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:8080"]
```

### Verify Installation
```bash
# Test API health
curl http://localhost:8000/api/v1/health

# Test ML models
python3 -c "from app.services.ml_service import ml_service; print(f'Models: {list(ml_service.models.keys())}')"
```

## Docker Deployment

### Dockerfile (Already Created)
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Commands
```bash
# Build image
docker build -t loadshedding-api .

# Run container
docker run -p 8000:8000 -v $(pwd)/models:/app/models loadshedding-api

# With environment file
docker run -p 8000:8000 --env-file .env -v $(pwd)/models:/app/models loadshedding-api
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/loadshedding_db
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./models:/app/models
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=loadshedding_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## Production Deployment

### Cloud Platforms

#### 1. Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### 2. DigitalOcean App Platform
```yaml
# .do/app.yaml
name: loadshedding-api
services:
- name: api
  source_dir: backend/api
  github:
    repo: glenmiracle18/loadshedding-prediction-model
    branch: main
  run_command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: REDIS_URL  
    value: ${redis.REDIS_URL}
  - key: SECRET_KEY
    value: your-production-secret-key

- name: db
  engine: PG
  version: "15"
  
- name: redis
  engine: REDIS
  version: "7"
```

#### 3. Heroku
```bash
# Create Heroku app
heroku create loadshedding-api

# Add buildpack
heroku buildpacks:set heroku/python

# Configure environment
heroku config:set SECRET_KEY=your-production-secret-key
heroku config:set DATABASE_URL=postgresql://...

# Deploy
git push heroku main
```

### Production Environment Variables
```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis (Cloud)
REDIS_URL=redis://username:password@host:port/0

# Security
SECRET_KEY=super-secure-random-key-64-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# External APIs
WEATHER_API_KEY=production_weather_api_key
GRID_API_URL=https://api.gridwatch.co.za/api/v3/status

# ML Models
MODEL_PATH=/app/models
CACHE_TTL=600

# CORS (production frontend URLs)
ALLOWED_ORIGINS=["https://yourfrontend.com", "https://www.yourfrontend.com"]
```

### Production Checklist

#### Security
- [ ] Generate strong SECRET_KEY (64+ characters)
- [ ] Use HTTPS for all communications
- [ ] Enable CORS only for your frontend domains
- [ ] Set up rate limiting
- [ ] Configure firewall rules
- [ ] Use environment variables for all secrets

#### Database
- [ ] Switch to PostgreSQL for production
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Monitor database performance
- [ ] Set up database migrations

#### Monitoring
- [ ] Set up logging (structured JSON logs)
- [ ] Monitor API response times
- [ ] Track ML model performance
- [ ] Monitor memory and CPU usage
- [ ] Set up alerting for errors

#### ML Models
- [ ] Ensure model files are deployed
- [ ] Monitor prediction accuracy
- [ ] Set up model versioning
- [ ] Plan for model updates
- [ ] Monitor cache hit rates

### CI/CD Pipeline

#### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy API

on:
  push:
    branches: [main]
    paths: ['backend/api/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        cd backend/api
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd backend/api
        python -m pytest
    
    - name: Deploy to production
      run: |
        # Add your deployment commands here
        echo "Deploying to production..."
```

### Scaling Considerations

#### Horizontal Scaling
- Use load balancer (nginx, AWS ALB)
- Multiple API instances
- Shared Redis cache
- Database connection pooling

#### Performance Optimization
- Enable response compression
- Implement request rate limiting
- Use CDN for static assets
- Monitor and optimize slow queries
- Cache frequently accessed data

### Maintenance

#### Regular Tasks
- Monitor model performance
- Update ML models monthly
- Review security logs
- Update dependencies
- Database maintenance
- Cache performance analysis

#### Model Updates
```bash
# Update models without downtime
1. Upload new model files to ./models/
2. API auto-reloads on file changes
3. Monitor prediction quality
4. Rollback if needed
```

### Troubleshooting

#### Common Issues
1. **Models not loading**: Check file paths and permissions
2. **Database connection**: Verify DATABASE_URL format
3. **Redis connection**: Check REDIS_URL and service status
4. **Authentication failures**: Verify SECRET_KEY consistency
5. **CORS errors**: Add frontend URL to ALLOWED_ORIGINS

#### Debug Commands
```bash
# Check model status
curl http://localhost:8000/api/v1/health

# Test authentication
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Check logs
docker logs container_name

# Database status
python3 -c "from app.models.database import engine; print(engine.url)"
```

Your backend is production-ready with proper documentation for frontend development.