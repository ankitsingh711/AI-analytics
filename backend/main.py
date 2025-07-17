from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import json
import models
import schemas
from models import SessionLocal, DroneReport, Violation

app = FastAPI(title="AI Analytics Dashboard API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "AI Analytics Dashboard API"}

@app.post("/upload", response_model=schemas.DroneReport)
async def upload_report(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a drone report JSON file"""
    try:
        contents = await file.read()
        data = json.loads(contents.decode('utf-8'))
        
        # Validate required fields
        required_fields = ['drone_id', 'date', 'location', 'violations']
        for field in required_fields:
            if field not in data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Create drone report
        db_report = DroneReport(
            drone_id=data['drone_id'],
            date=data['date'],
            location=data['location']
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        # Create violations
        for violation_data in data['violations']:
            db_violation = Violation(
                violation_id=violation_data['id'],
                type=violation_data['type'],
                timestamp=violation_data['timestamp'],
                latitude=violation_data['latitude'],
                longitude=violation_data['longitude'],
                image_url=violation_data['image_url'],
                report_id=db_report.id
            )
            db.add(db_violation)
        
        db.commit()
        
        # Return the created report with violations
        db.refresh(db_report)
        return db_report
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    # Total violations
    total_violations = db.query(Violation).count()
    
    # Violations by type
    violations_by_type = {}
    type_counts = db.query(Violation.type, func.count(Violation.id)).group_by(Violation.type).all()
    for violation_type, count in type_counts:
        violations_by_type[violation_type] = count
    
    # Unique drones
    drones = [drone[0] for drone in db.query(DroneReport.drone_id).distinct().all()]
    
    # Unique locations
    locations = [location[0] for location in db.query(DroneReport.location).distinct().all()]
    
    # Recent violations (last 10)
    recent_violations_query = db.query(Violation, DroneReport).join(DroneReport).order_by(Violation.id.desc()).limit(10).all()
    recent_violations = []
    for violation, report in recent_violations_query:
        recent_violations.append(schemas.ViolationResponse(
            violation_id=violation.violation_id,
            type=violation.type,
            timestamp=violation.timestamp,
            latitude=violation.latitude,
            longitude=violation.longitude,
            image_url=violation.image_url,
            drone_id=report.drone_id,
            date=report.date,
            location=report.location
        ))
    
    return schemas.DashboardStats(
        total_violations=total_violations,
        violations_by_type=violations_by_type,
        drones=drones,
        locations=locations,
        recent_violations=recent_violations
    )

@app.get("/violations", response_model=List[schemas.ViolationResponse])
def get_violations(
    drone_id: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all violations with optional filters"""
    query = db.query(Violation, DroneReport).join(DroneReport)
    
    if drone_id:
        query = query.filter(DroneReport.drone_id == drone_id)
    if date:
        query = query.filter(DroneReport.date == date)
    if violation_type:
        query = query.filter(Violation.type == violation_type)
    
    violations = query.all()
    
    result = []
    for violation, report in violations:
        result.append(schemas.ViolationResponse(
            violation_id=violation.violation_id,
            type=violation.type,
            timestamp=violation.timestamp,
            latitude=violation.latitude,
            longitude=violation.longitude,
            image_url=violation.image_url,
            drone_id=report.drone_id,
            date=report.date,
            location=report.location
        ))
    
    return result

@app.get("/reports", response_model=List[schemas.DroneReport])
def get_reports(db: Session = Depends(get_db)):
    """Get all drone reports"""
    return db.query(DroneReport).all()

@app.get("/violations/types")
def get_violation_types(db: Session = Depends(get_db)):
    """Get all unique violation types"""
    types = db.query(Violation.type).distinct().all()
    return [t[0] for t in types]

@app.get("/drones")
def get_drones(db: Session = Depends(get_db)):
    """Get all unique drone IDs"""
    drones = db.query(DroneReport.drone_id).distinct().all()
    return [d[0] for d in drones]

@app.get("/dates")
def get_dates(db: Session = Depends(get_db)):
    """Get all unique dates"""
    dates = db.query(DroneReport.date).distinct().all()
    return [d[0] for d in dates]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 