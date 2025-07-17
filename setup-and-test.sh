#!/bin/bash

echo "🚀 AI Analytics Dashboard - Setup and Test Script"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available (either docker-compose or docker compose)
DOCKER_COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose is not available. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Stop any running containers
echo "🛑 Stopping any existing containers..."
$DOCKER_COMPOSE_CMD down

# Build and start the application
echo "🏗️  Building and starting the application..."
$DOCKER_COMPOSE_CMD up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if backend is running
echo "🔍 Checking backend health..."
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:8000"
else
    echo "❌ Backend is not responding"
fi

# Check if frontend is running
echo "🔍 Checking frontend..."
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎉 Setup complete! Your AI Analytics Dashboard is ready!"
echo ""
echo "📍 Access Points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📂 Sample Data:"
echo "   - sample-data.json (3 violations)"
echo "   - sample-data2.json (4 violations)"
echo ""
echo "🔧 Commands:"
echo "   Stop: $DOCKER_COMPOSE_CMD down"
echo "   Logs: $DOCKER_COMPOSE_CMD logs -f"
echo "   Restart: $DOCKER_COMPOSE_CMD restart"
echo "" 