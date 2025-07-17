#!/bin/bash

echo "🐳 Verifying Docker Installation"
echo "==============================="

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "Please install Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker command found"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker daemon is running"

# Check Docker Compose
DOCKER_COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
    echo "✅ Docker Compose (V1) found"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
    echo "✅ Docker Compose (V2) found"
else
    echo "❌ Docker Compose not available"
    exit 1
fi

echo ""
echo "🚀 Docker is ready! Starting the AI Analytics Dashboard..."
echo ""

# Stop any existing containers
echo "🛑 Cleaning up any existing containers..."
$DOCKER_COMPOSE_CMD down

# Build and start the application
echo "🏗️  Building and starting the application..."
$DOCKER_COMPOSE_CMD up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."

if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:8000"
else
    echo "⚠️  Backend might still be starting..."
fi

if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "⚠️  Frontend might still be starting..."
fi

echo ""
echo "🎉 AI Analytics Dashboard is running in Docker!"
echo ""
echo "📍 Access Points:"
echo "   Frontend Dashboard: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "📂 Sample Data Files Ready:"
echo "   - sample-data.json"
echo "   - sample-data2.json"
echo "   - sample-data3.json"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs: $DOCKER_COMPOSE_CMD logs -f"
echo "   Stop app: $DOCKER_COMPOSE_CMD down"
echo "   Restart: $DOCKER_COMPOSE_CMD restart"
echo ""
echo "📊 Ready for testing and demo!" 