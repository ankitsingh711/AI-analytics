from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./drone_analytics.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DroneReport(Base):
    __tablename__ = "drone_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    drone_id = Column(String, index=True)
    date = Column(String)
    location = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    violations = relationship("Violation", back_populates="report")

class Violation(Base):
    __tablename__ = "violations"
    
    id = Column(Integer, primary_key=True, index=True)
    violation_id = Column(String, unique=True, index=True)
    type = Column(String, index=True)
    timestamp = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    image_url = Column(String)
    report_id = Column(Integer, ForeignKey("drone_reports.id"))
    
    report = relationship("DroneReport", back_populates="violations")

# Create all tables
Base.metadata.create_all(bind=engine) 