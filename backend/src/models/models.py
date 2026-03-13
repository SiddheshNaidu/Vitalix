from sqlalchemy import Boolean, Column, Integer, String, Date, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from src.core.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # Admin, Doctor, Viewer
    is_active = Column(Boolean, default=True)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    abha_id = Column(String, unique=True, index=True, nullable=True) # Assuming ABHA/National ID
    full_name = Column(String, index=True)
    date_of_birth = Column(String)
    gender = Column(String)
    blood_group = Column(String)
    contact_number = Column(String)
    emergency_contact = Column(String)
    location_id = Column(String) # E.g., PHC ID or district
    medical_history = Column(JSON) # e.g. ["Hypertension", "Diabetes"]
    qr_token = Column(Text, nullable=True)
    qr_url = Column(Text, nullable=True)
    
    records = relationship("MedicalRecord", back_populates="patient")

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))
    date_of_visit = Column(String, default=lambda: datetime.utcnow().isoformat())
    diagnosis = Column(String)
    symptoms = Column(JSON)
    prescription = Column(JSON)
    notes = Column(Text)
    
    patient = relationship("Patient", back_populates="records")
    doctor = relationship("User")
