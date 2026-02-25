#!/bin/bash
set -e

echo "🚀 Starting Load Shedding Prediction API..."

# Check Python and pip
echo "🐍 Python version: $(python --version)"
echo "📦 Pip version: $(pip --version)"

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📦 Installing dependencies..."
pip install --no-cache-dir -r requirements.txt

# Verify FastAPI installation
echo "🔍 Verifying FastAPI installation..."
python -c "import fastapi; print(f'✅ FastAPI {fastapi.__version__} installed')"

# Start the server
echo "🌟 Starting FastAPI server..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}