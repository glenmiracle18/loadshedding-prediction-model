# Test Execution Guide

## Prerequisites

1. **Backend Server Running**:
   ```bash
   cd backend/api
   uvicorn app.main:app --reload
   ```

2. **Install Test Dependencies**:
   ```bash
   pip install -r requirements-test.txt
   ```

## Running Tests

### Quick Test (Recommended for Demo)
```bash
cd backend/api
python run_tests.py
```

This runs all test suites with a comprehensive report.

### Individual Test Suites

**Authentication Tests**:
```bash
python -m pytest tests/test_auth.py -v
```

**ML Model Tests**:
```bash
python -m pytest tests/test_ml_service.py -v
```

**Prediction API Tests**:
```bash
python -m pytest tests/test_predictions.py -v
```

**Integration Tests**:
```bash
python -m pytest tests/test_integration.py -v
```

## Test Coverage

### Authentication Tests (`test_auth.py`)
- User registration validation
- Login functionality 
- Token-based authentication
- Protected endpoint access
- Invalid credential handling

### ML Service Tests (`test_ml_service.py`)
- Model loading verification
- Feature preparation accuracy
- Prediction consistency
- High/low demand scenario testing
- Peak vs off-peak time analysis
- Weather impact validation
- Fallback prediction system
- Extreme scenario handling

### Prediction API Tests (`test_predictions.py`)
- Prediction creation with minimal/full data
- High demand scenario validation
- Low demand scenario validation
- Prediction history retrieval
- Invalid data handling
- Authentication requirement enforcement

### Integration Tests (`test_integration.py`)
- Complete user workflow testing
- Multiple prediction scenarios
- System health checks
- Response time performance
- Error handling validation
- Concurrent user testing

## Expected Results

**Successful Test Run Output**:
```
Authentication Tests: PASSED
ML Service Tests: PASSED  
Prediction API Tests: PASSED
Integration Tests: PASSED

ALL TESTS PASSED!
```

**Key Validations**:
- High demand (45,000MW) predicts Stage 1+ load shedding
- Low demand (18,000MW) predicts Stage 0 (no load shedding)
- Response times under 5 seconds
- 80%+ success rate for concurrent users
- Consistent predictions for same input data

## Demo Usage

For presentation purposes, run:
```bash
python run_tests.py
```

This provides a clean, comprehensive test report showing:
1. Server connectivity verification
2. Authentication system validation
3. ML model performance testing
4. API endpoint functionality
5. Integration workflow testing
6. Performance benchmarking

The test suite validates the core claim that the system provides accurate load shedding predictions based on demand/generation scenarios.