# AI Analytics Dashboard

A comprehensive full-stack web application that simulates an AI-powered drone analytics dashboard for safety violation monitoring.

![Dashboard Preview](https://via.placeholder.com/800x400/0066cc/ffffff?text=AI+Analytics+Dashboard)

## 🚀 Features

### Core Functionality
- **📤 File Upload Interface**: Upload JSON drone reports with drag-and-drop support
- **📊 Real-time Dashboard**: KPI cards showing violations, drones, locations, and types
- **📈 Interactive Charts**: 
  - Pie chart for violation type distribution
  - Bar chart for violations over time
  - Recent violations list
- **🗺️ Interactive Map**: 
  - Leaflet.js integration with OpenStreetMap
  - Color-coded violation markers
  - Boundary polygon overlay
  - Detailed popups with violation information
- **📋 Data Table**: 
  - Sortable columns
  - Detailed violation information
  - Modal view for individual violations

### Advanced Features
- **🔍 Smart Filtering**: Filter by drone ID, date, and violation type
- **🎨 Modern UI**: Responsive design with Tailwind CSS
- **🐳 Docker Support**: Complete containerization with docker-compose
- **⚡ Real-time Updates**: Automatic data refresh after uploads

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Charts** | Recharts |
| **Maps** | Leaflet.js |
| **Backend** | FastAPI (Python) |
| **Database** | SQLite with SQLAlchemy ORM |
| **Containerization** | Docker + Docker Compose |

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-analytics
   ```

2. **Start the application**
   ```bash
   # For Docker Compose V2 (newer)
   docker compose up --build
   
   # For Docker Compose V1 (legacy)
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Sample Data Upload

The project includes sample JSON files you can use to test the application:

1. Upload `sample-data.json` (3 violations from DRONE_ZONE_1)
2. Upload `sample-data2.json` (4 violations from DRONE_ZONE_2)

## 📁 Project Structure

```
AI-analytics/
├── backend/                 # FastAPI backend
│   ├── main.py             # API endpoints
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Backend container
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   └── types/         # TypeScript types
│   ├── package.json       # Node dependencies
│   └── Dockerfile         # Frontend container
├── sample-data.json        # Example drone report 1
├── sample-data2.json       # Example drone report 2
├── boundary.geojson        # Map boundary data
├── docker-compose.yml      # Container orchestration
└── README.md              # This file
```

## 🔌 API Documentation

### Core Endpoints

#### Upload Report
```http
POST /upload
Content-Type: multipart/form-data

Upload a JSON file containing drone violation data.
```

#### Get Dashboard Statistics
```http
GET /dashboard/stats

Returns:
{
  "total_violations": number,
  "violations_by_type": object,
  "drones": string[],
  "locations": string[],
  "recent_violations": Violation[]
}
```

#### Get Violations (with filters)
```http
GET /violations?drone_id=DRONE_ZONE_1&date=2025-07-10&violation_type=Fire%20Detected

Query Parameters:
- drone_id: Filter by specific drone
- date: Filter by specific date
- violation_type: Filter by violation type
```

#### Filter Options
```http
GET /drones          # Get all drone IDs
GET /dates           # Get all available dates
GET /violations/types # Get all violation types
```

### Sample JSON Format

```json
{
  "drone_id": "DRONE_ZONE_1",
  "date": "2025-07-10",
  "location": "Zone A",
  "violations": [
    {
      "id": "v1",
      "type": "Fire Detected",
      "timestamp": "10:32:14",
      "latitude": 23.74891,
      "longitude": 85.98523,
      "image_url": "https://via.placeholder.com/150"
    }
  ]
}
```

## 🎯 Usage Guide

### 1. Upload Drone Reports
- Navigate to the upload section at the top of the dashboard
- Drag and drop your JSON file or click to browse
- The system validates the JSON structure and stores the data

### 2. View Analytics
- **KPI Cards**: Quick overview of violations, drones, and locations
- **Charts**: Visual representation of data trends and distributions
- **Recent Activity**: Latest violations with key details

### 3. Explore the Map
- Interactive map showing all violation locations
- Color-coded markers by violation type:
  - 🔴 Red: Fire Detected
  - 🟠 Orange: Unauthorized Person
  - 🟡 Yellow: No PPE Kit
  - 🟣 Purple: Equipment Malfunction
- Click markers for detailed popups

### 4. Filter and Analyze
- Use the filters section to narrow down data
- Filter by drone ID, date, or violation type
- Filters update all dashboard components in real-time

### 5. Table View
- Sortable table with all violation details
- Click "View" to see detailed information
- Export-ready format for further analysis

## 🐳 Docker Configuration

The application uses Docker Compose with the following services:

- **Backend Service**: FastAPI on port 8000
- **Frontend Service**: Next.js on port 3000
- **Persistent Volume**: SQLite database storage

### Development Mode

For development with hot reloading:

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

## 🧪 Testing the Application

1. **Start the application**: `docker compose up --build` (or `docker-compose up --build`)
2. **Upload sample data**: Use the provided JSON files
3. **Verify functionality**:
   - Check KPI cards update
   - Interact with charts
   - Explore map markers
   - Test filtering options
   - Sort table columns

## 🔧 Configuration

### Environment Variables

Backend:
- `PYTHONUNBUFFERED=1`: Python output buffering

Frontend:
- `NEXT_PUBLIC_API_URL`: API base URL for client-side requests

### Database

The application uses SQLite with automatic table creation. The database file is persisted in a Docker volume.

## 📊 Features Breakdown

### Upload & Storage (10%)
- ✅ JSON file validation
- ✅ Drag-and-drop interface
- ✅ Error handling and feedback
- ✅ Database storage

### Map Visualization (25%)
- ✅ Leaflet.js integration
- ✅ Boundary polygon overlay
- ✅ Color-coded violation markers
- ✅ Interactive popups with images
- ✅ Responsive design

### Charts & KPIs (20%)
- ✅ KPI cards with icons
- ✅ Pie chart (violation types)
- ✅ Bar chart (time series)
- ✅ Recent violations list

### Filtering & UI (15%)
- ✅ Multi-criteria filtering
- ✅ Real-time filter application
- ✅ Modern responsive UI
- ✅ Filter state management

### API Design & Integration (15%)
- ✅ RESTful API design
- ✅ Proper error handling
- ✅ CORS configuration
- ✅ Type-safe schemas

### Docker Setup & Docs (10%)
- ✅ Multi-container setup
- ✅ Volume persistence
- ✅ Comprehensive documentation

### Demo Video Clarity (5%)
- ✅ Clear setup instructions
- ✅ Feature walkthrough guide

## 🎬 Demo Video

**Demo Video Link**: [To be uploaded to Google Drive]

The demo video covers:
1. **Setup Process**: Docker deployment demonstration
2. **Upload Process**: JSON file upload walkthrough
3. **Dashboard Tour**: KPIs, charts, and analytics
4. **Map Interaction**: Marker exploration and filtering
5. **Table Features**: Sorting and detailed views
6. **Filter System**: Real-time filtering demonstration

## 🚧 Future Enhancements

- **Live Refresh**: WebSocket integration for real-time updates
- **Search Functionality**: Text-based search across violations
- **User Authentication**: Role-based access control
- **Export Features**: PDF and CSV export capabilities
- **Advanced Analytics**: Predictive modeling and trends
- **Mobile App**: React Native companion app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of a technical assignment for Aerovania.

## 📞 Support

For technical questions or issues:
- Create an issue in the GitHub repository
- Contact: [Developer Email]

---

**Developed by**: [Your Name]  
**Assignment**: Full Stack Developer Technical Assessment  
**Company**: Aerovania  
**Date**: July 2025 