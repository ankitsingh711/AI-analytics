from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, ResponseValidationError
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
import json
import models
import schemas
from models import SessionLocal, DroneReport, Violation

app = FastAPI(
    title="AI Analytics Dashboard API", 
    version="1.0.0",
    response_model_exclude_unset=True,
    response_model_validate=False
)

# Enable CORS for frontend - Allow all origins temporarily to bypass validation issue
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Add CORS headers to all responses, including errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
            "Access-Control-Allow-Headers": "Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Cache-Control, Pragma",
        }
    )

@app.exception_handler(ResponseValidationError)
async def response_validation_exception_handler(request: Request, exc: ResponseValidationError):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error - response validation failed"},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
            "Access-Control-Allow-Headers": "Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Cache-Control, Pragma",
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
            "Access-Control-Allow-Headers": "Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Cache-Control, Pragma",
        }
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

@app.post("/upload-test")
async def upload_test():
    """Simple upload test"""
    return {"message": "Upload test works"}

@app.post("/upload")
async def upload_report(file: UploadFile = File(...)):
    """Upload a drone report JSON file"""
    print("=== UPLOAD STARTED ===")
    try:
        contents = await file.read()
        print(f"=== FILE RECEIVED: {file.filename}, Size: {len(contents)} ===")
        
        # Just return success without database operations for now
        return {
            "message": "Upload endpoint works!",
            "filename": file.filename,
            "size": len(contents)
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file format. Please check your file and try again.")
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing required field in violation data: {str(e)}")
    except Exception as e:
        db.rollback()
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your file. Please try again.")

@app.get("/dashboard/stats")
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

@app.get("/violations")
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

@app.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    """Get all drone reports"""
    reports = db.query(DroneReport).all()
    result = []
    for report in reports:
        result.append({
            "id": report.id,
            "drone_id": report.drone_id,
            "date": report.date,
            "location": report.location,
            "created_at": report.created_at.isoformat() if report.created_at else None,
            "violations_count": len(report.violations)
        })
    return result

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

@app.delete("/reports/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    """Delete a report and all its violations"""
    report = db.query(DroneReport).filter(DroneReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Delete associated violations first
    db.query(Violation).filter(Violation.report_id == report_id).delete()
    # Delete the report
    db.delete(report)
    db.commit()
    
    return {"message": "Report deleted successfully"}

@app.post("/reset-database")
def reset_database(db: Session = Depends(get_db)):
    """Reset the database by clearing all data"""
    try:
        # Delete all violations first (foreign key constraint)
        db.query(Violation).delete()
        # Delete all reports
        db.query(DroneReport).delete()
        db.commit()
        return {"message": "Database reset successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error resetting database: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 