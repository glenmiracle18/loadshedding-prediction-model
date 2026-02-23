#!/usr/bin/env python3
"""
Login to Hugging Face and upload models
Uses token from .env file for security
"""

import os
import sys
from huggingface_hub import HfApi, create_repo, login
from dotenv import load_dotenv

# Load environment variables
load_dotenv("backend/api/.env")

# Configuration
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
HF_USERNAME = "yaralexie"
REPO_NAME = "loadshedding-prediction-models" 
REPO_ID = f"{HF_USERNAME}/{REPO_NAME}"
MODELS_DIR = "backend/api/models"

def main():
    print("🤗 Setting up Hugging Face upload...")
    
    if not HF_TOKEN:
        print("❌ HUGGINGFACE_TOKEN not found in .env file!")
        print("1. Get token from: https://huggingface.co/settings/tokens")
        print("2. Add HUGGINGFACE_TOKEN=your_token to backend/api/.env")
        print("3. Run this script again")
        return
    
    print("✅ Token loaded from .env file")
    
    # Login with token
    try:
        print("🔐 Logging in to Hugging Face...")
        login(token=HF_TOKEN)
        print("✅ Login successful!")
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return
    
    # Initialize API
    api = HfApi()
    
    # Create repository
    try:
        print(f"📦 Creating repository: {REPO_ID}")
        create_repo(
            repo_id=REPO_ID,
            repo_type="model", 
            exist_ok=True,
            private=False
        )
        print("✅ Repository ready!")
    except Exception as e:
        print(f"Repository setup: {e}")
    
    # Upload models
    model_files = [
        "random_forest.pkl",
        "xgboost.pkl",
        "lstm_final.h5", 
        "feature_scaler_final.pkl"
    ]
    
    for model_file in model_files:
        local_path = os.path.join(MODELS_DIR, model_file)
        
        if os.path.exists(local_path):
            file_size_mb = os.path.getsize(local_path) / (1024 * 1024)
            print(f"📤 Uploading {model_file} ({file_size_mb:.1f}MB)...")
            
            try:
                api.upload_file(
                    path_or_fileobj=local_path,
                    path_in_repo=model_file,
                    repo_id=REPO_ID,
                    commit_message=f"Add {model_file}"
                )
                print(f"✅ {model_file} uploaded!")
            except Exception as e:
                print(f"❌ Upload failed for {model_file}: {e}")
        else:
            print(f"⚠️  File not found: {local_path}")
    
    print(f"🎉 All done! Visit: https://huggingface.co/{REPO_ID}")

if __name__ == "__main__":
    main()