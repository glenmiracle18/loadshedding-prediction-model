#!/usr/bin/env python3
"""
Upload ML models to Hugging Face Hub
Usage: python upload_models_to_hf.py
"""

import os
from huggingface_hub import HfApi, create_repo

# Configuration
HF_USERNAME = "yaralexie"
REPO_NAME = "loadshedding-prediction-models" 
REPO_ID = f"{HF_USERNAME}/{REPO_NAME}"
MODELS_DIR = "backend/api/models"

def upload_models():
    print("🤗 Starting Hugging Face model upload...")
    
    # Initialize Hugging Face API
    api = HfApi()
    
    # Create repository (this will do nothing if it already exists)
    try:
        print(f"📦 Creating repository: {REPO_ID}")
        create_repo(
            repo_id=REPO_ID,
            repo_type="model",
            exist_ok=True,
            private=False  # Set to True if you want private repo
        )
        print("✅ Repository created/verified")
    except Exception as e:
        print(f"⚠️  Repository might already exist: {e}")
    
    # Model files to upload
    model_files = [
        "random_forest.pkl",
        "xgboost.pkl", 
        "lstm_final.h5",
        "feature_scaler_final.pkl"
    ]
    
    print(f"🚀 Uploading models from {MODELS_DIR}...")
    
    for model_file in model_files:
        local_path = os.path.join(MODELS_DIR, model_file)
        
        if os.path.exists(local_path):
            file_size = os.path.getsize(local_path)
            file_size_mb = file_size / (1024 * 1024)
            
            print(f"📤 Uploading {model_file} ({file_size_mb:.1f}MB)...")
            
            try:
                api.upload_file(
                    path_or_fileobj=local_path,
                    path_in_repo=model_file,
                    repo_id=REPO_ID,
                    repo_type="model",
                    commit_message=f"Upload {model_file}"
                )
                print(f"✅ {model_file} uploaded successfully")
            except Exception as e:
                print(f"❌ Failed to upload {model_file}: {e}")
        else:
            print(f"⚠️  File not found: {local_path}")
    
    # Create a README.md for the repository
    readme_content = f"""---
title: Load Shedding Prediction Models
emoji: ⚡
colorFrom: blue
colorTo: red
sdk: static
pinned: false
---

# Load Shedding Prediction Models

This repository contains trained machine learning models for predicting load shedding stages in South Africa.

## Models

- **random_forest.pkl**: Random Forest model (92.33% accuracy)
- **xgboost.pkl**: XGBoost model (91.80% accuracy) 
- **lstm_final.h5**: LSTM deep learning model
- **feature_scaler_final.pkl**: Feature scaler for preprocessing

## Usage

```python
from huggingface_hub import hf_hub_download
import joblib

# Download and load model
model_path = hf_hub_download(
    repo_id="{REPO_ID}",
    filename="xgboost.pkl"
)
model = joblib.load(model_path)
```

## Features

The models use 51 engineered features including:
- Grid capacity and demand metrics
- Temporal patterns (hour, day, month, seasonality)
- Weather conditions (temperature, humidity, wind)
- Historical load shedding patterns

## Project

This is part of the Load Shedding Prediction System: AI-powered forecasting for South African users.
"""

    try:
        print("📝 Creating README.md...")
        api.upload_file(
            path_or_fileobj=readme_content.encode(),
            path_in_repo="README.md",
            repo_id=REPO_ID,
            repo_type="model",
            commit_message="Add README documentation"
        )
        print("✅ README.md uploaded")
    except Exception as e:
        print(f"⚠️  README upload failed: {e}")

    print(f"🎉 Upload complete! Visit: https://huggingface.co/{REPO_ID}")

if __name__ == "__main__":
    # Check if user is logged in to HF
    try:
        api = HfApi()
        user = api.whoami()
        print(f"👤 Logged in as: {user['name']}")
        upload_models()
    except Exception as e:
        print("❌ Not logged in to Hugging Face!")
        print("Please run: huggingface-cli login")
        print("Get your token from: https://huggingface.co/settings/tokens")