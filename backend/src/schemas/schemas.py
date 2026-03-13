from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from datetime import date

# ---- USERS ----
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

# ---- RECORDS ----
class MedicalRecordBase(BaseModel):
    doctor_id: int
    diagnosis: str
    symptoms: List[str]
    prescription: List[dict] # e.g. [{"medicine": "Paracetamol", "dosage": "500mg"}]
    notes: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecord(MedicalRecordBase):
    id: int
    patient_id: int
    date_of_visit: str

    model_config = ConfigDict(from_attributes=True)

# ---- PATIENTS ----
class PatientBase(BaseModel):
    abha_id: Optional[str] = None
    full_name: str
    date_of_birth: str
    gender: str
    blood_group: str
    contact_number: str
    emergency_contact: str
    location_id: str
    medical_history: List[str] = []

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    records: List[MedicalRecord] = []
    qr_token: Optional[str] = None
    qr_image_url: Optional[str] = None
    scan_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PublicPatientProfile(BaseModel):
    """Public data returned when scanning a QR code — no auth required."""
    id: int
    full_name: str
    age: Optional[int] = None
    gender: str
    blood_group: str
    location_id: str
    emergency_contact: str
    last_diagnosis: Optional[str] = None
    last_visit: Optional[str] = None
    doctor: Optional[str] = None
    alert: Optional[str] = None


class ScanResponse(BaseModel):
    valid: bool
    access: Optional[str] = None
    patient: Optional[PublicPatientProfile] = None
    error: Optional[str] = None
