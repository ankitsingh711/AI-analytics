from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ViolationBase(BaseModel):
    violation_id: str
    type: str
    timestamp: str
    latitude: float
    longitude: float
    image_url: str

class ViolationCreate(ViolationBase):
    pass

class Violation(ViolationBase):
    report_id: int
    
    class Config:
        from_attributes = True

class DroneReportBase(BaseModel):
    drone_id: str
    date: str
    location: str

class DroneReportCreate(DroneReportBase):
    violations: List[ViolationCreate]

class DroneReport(DroneReportBase):
    id: int
    created_at: datetime
    violations: List[Violation] = []
    
    class Config:
        from_attributes = True

class ViolationResponse(BaseModel):
    violation_id: str
    type: str
    timestamp: str
    latitude: float
    longitude: float
    image_url: str
    drone_id: str
    date: str
    location: str
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_violations: int
    violations_by_type: dict
    drones: List[str]
    locations: List[str]
    recent_violations: List[ViolationResponse]

class UploadResponse(BaseModel):
    message: str
    drone_id: str
    date: str
    location: str
    violations_count: int 