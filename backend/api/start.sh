#!/bin/bash
set -e

echo "🚀 Starting Load Shedding Prediction API..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install --no-cache-dir -r requirements.txt

# Start the server
echo "🌟 Starting FastAPI server..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}