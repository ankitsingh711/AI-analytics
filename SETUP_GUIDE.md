# 🚀 Setup Guide - AI Analytics Dashboard

Since Docker is not available on your system, here are multiple ways to run and test the application:

## Option 1: Quick Local Setup (Recommended)

### Prerequisites
- Python 3.8+ installed
- Node.js 18+ installed

### Automated Setup
```bash
./local-setup.sh
```

This script will:
- Set up Python virtual environment
- Install all dependencies
- Start both backend and frontend servers
- Provide you with access URLs

## Option 2: Manual Setup

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup (in a new terminal)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Option 3: Testing Individual Components

### Backend API Testing
```bash
# After starting the backend, test these endpoints:

# Root endpoint
curl http://localhost:8000/

# Get dashboard stats
curl http://localhost:8000/dashboard/stats

# API documentation (open in browser)
open http://localhost:8000/docs
```

### Frontend Components Testing
```bash
# After starting frontend, access:
# Main dashboard: http://localhost:3000
# All components will be visible on the main page
```

## Option 4: When Docker Becomes Available

### Install Docker
1. Download Docker Desktop for Mac from: https://docs.docker.com/desktop/install/mac-install/
2. Install and start Docker Desktop
3. Run our Docker setup:

```bash
# Using the automated script
./setup-and-test.sh

# Or manually
docker compose up --build
```

## 🧪 Testing the Application

### 1. Upload Sample Data
- Use the provided JSON files: `sample-data.json`, `sample-data2.json`, `sample-data3.json`
- Test the drag-and-drop upload interface

### 2. Verify All Features
- ✅ KPI Cards update with new data
- ✅ Charts show violation distribution and timeline
- ✅ Map displays color-coded markers
- ✅ Filters work for drone ID, date, and violation type
- ✅ Table sorting and detail views function
- ✅ Boundary polygon appears on map

### 3. API Testing
```bash
# Test file upload
curl -X POST "http://localhost:8000/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample-data.json"

# Test filtering
curl "http://localhost:8000/violations?drone_id=DRONE_ZONE_1"
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000 and 8000
   sudo lsof -ti:3000 | xargs kill -9
   sudo lsof -ti:8000 | xargs kill -9
   ```

2. **Python Virtual Environment Issues**
   ```bash
   # Remove and recreate venv
   rm -rf backend/venv
   cd backend && python3 -m venv venv
   ```

3. **Node Modules Issues**
   ```bash
   # Clean and reinstall
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Database Issues**
   ```bash
   # Remove existing database
   rm backend/drone_analytics.db
   # Restart backend to recreate tables
   ```

## 📱 Demo Preparation

### For Creating Demo Video

1. **Start Application**: Use `./local-setup.sh`
2. **Prepare Browser**: Open http://localhost:3000
3. **Sample Files Ready**: Have sample-data.json files ready
4. **Record Workflow**:
   - Show upload process
   - Demonstrate filtering
   - Explore map interactions
   - Show table sorting
   - Display charts and KPIs

### Screen Recording Tools
- **macOS**: Built-in QuickTime Player (File → New Screen Recording)
- **Third-party**: OBS Studio, Loom, or ScreenFlow

## 🎯 Success Criteria

After setup, you should see:
- ✅ Backend API responding at http://localhost:8000
- ✅ Frontend dashboard at http://localhost:3000  
- ✅ Swagger docs at http://localhost:8000/docs
- ✅ Ability to upload JSON files
- ✅ Interactive map with markers
- ✅ Charts updating with data
- ✅ Filters working correctly

## 📞 Getting Help

If you encounter any issues:

1. Check the terminal output for error messages
2. Verify Python 3.8+ and Node.js 18+ are installed
3. Ensure ports 3000 and 8000 are available
4. Try the manual setup if the automated script fails

The application is fully functional without Docker - you'll get the same experience and be able to demonstrate all features for your technical assignment! 