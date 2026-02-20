# Load Shedding Prediction System

## Project Overview
ML-powered system that predicts load shedding stages 6 hours in advance for South African SMEs.

## Current Status
- ✅ **ML Models Trained**: XGBoost (91.80%), Random Forest (92.33%)
- ⚠️ **Backend**: Basic FastAPI structure restored (need to rebuild full endpoints)
- ❌ **Frontend**: Not implemented
- ❌ **Database**: Not configured

## Quick Start
```bash
cd backend/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

## Key Models Available
- `xgboost.pkl` (91.80% accuracy)
- `random_forest.pkl` (92.33% accuracy)  
- `feature_scaler_final.pkl`
- `feature_list_final.txt`

**Note**: Download model files from Google Drive (too large for git)