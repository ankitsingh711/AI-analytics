#!/bin/bash

echo "🚀 AI Analytics Dashboard - Local Development Setup"
echo "================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Python and Node.js are installed"

# Setup Backend
echo "🐍 Setting up Python backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

echo "✅ Backend dependencies installed"

# Start backend in background
echo "🚀 Starting backend server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

# Setup Frontend
echo "⚛️  Setting up React frontend..."
cd frontend

# Install Node dependencies
npm install

echo "✅ Frontend dependencies installed"

# Start frontend in background
echo "🚀 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

cd ..

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking services..."

if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:8000"
else
    echo "❌ Backend failed to start"
fi

if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend failed to start"
fi

echo ""
echo "🎉 Local development setup complete!"
echo ""
echo "📍 Access Points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📂 Sample Data:"
echo "   - sample-data.json (3 violations)"
echo "   - sample-data2.json (4 violations)"
echo "   - sample-data3.json (5 violations)"
echo ""
echo "🛑 To stop the servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   Or press Ctrl+C to stop this script"
echo ""

# Keep script running
wait 