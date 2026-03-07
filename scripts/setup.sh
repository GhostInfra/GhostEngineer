#!/bin/bash
# GhostEngineer — Development Setup Script

set -e

echo "👻 GhostEngineer — Setting up development environment..."

# Backend setup
echo ""
echo "📦 Setting up Python backend..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "   ✅ Virtual environment created"
else
    echo "   ⏭  Virtual environment already exists"
fi

source venv/bin/activate
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    echo "   ✅ Python dependencies installed"
else
    echo "   ⚠️  No requirements.txt found — skipping pip install"
fi

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
if [ -f "package.json" ]; then
    npm install
    echo "   ✅ Node dependencies installed"
else
    echo "   ⚠️  No package.json found — skipping npm install"
fi

echo ""
echo "🚀 Setup complete! You're ready to develop."
