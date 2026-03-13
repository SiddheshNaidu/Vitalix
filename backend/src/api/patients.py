from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.qr_utils import generate_qr_token, build_scan_url, build_qr_image_url
from src.models import models
from src.schemas import schemas
from typing import List

router = APIRouter()


def _enrich_patient_response(patient: models.Patient) -> dict:
    """Add computed qr_image_url and scan_url to patient dict."""
    data = {
        "id": patient.id,
        "abha_id": patient.abha_id,
        "full_name": patient.full_name,
        "date_of_birth": patient.date_of_birth,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "contact_number": patient.contact_number,
        "emergency_contact": patient.emergency_contact,
        "location_id": patient.location_id,
        "medical_history": patient.medical_history or [],
        "records": patient.records or [],
        "qr_token": patient.qr_token,
    }
    if patient.qr_token:
        scan_url = build_scan_url(patient.id, patient.qr_token)
        data["scan_url"] = scan_url
        data["qr_image_url"] = build_qr_image_url(scan_url)
    else:
        data["scan_url"] = None
        data["qr_image_url"] = None
    return data


@router.post("/", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.abha_id == patient.abha_id).first()
    if db_patient and patient.abha_id:
        raise HTTPException(status_code=400, detail="ABHA ID already registered")

    new_patient = models.Patient(**patient.model_dump())
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    # Generate QR token after we have the patient ID
    token = generate_qr_token(new_patient.id)
    scan_url = build_scan_url(new_patient.id, token)
    qr_url = build_qr_image_url(scan_url)

    new_patient.qr_token = token
    new_patient.qr_url = qr_url
    db.commit()
    db.refresh(new_patient)

    return _enrich_patient_response(new_patient)


@router.get("/", response_model=List[schemas.Patient])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    patients = db.query(models.Patient).offset(skip).limit(limit).all()
    return [_enrich_patient_response(p) for p in patients]


@router.get("/{patient_id}", response_model=schemas.Patient)
def read_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return _enrich_patient_response(patient)


@router.post("/{patient_id}/records/", response_model=schemas.MedicalRecord)
def create_medical_record(patient_id: int, record: schemas.MedicalRecordCreate, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    new_record = models.MedicalRecord(**record.model_dump(), patient_id=patient_id)
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record
