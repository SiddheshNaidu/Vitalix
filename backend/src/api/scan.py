"""Public QR scan verification endpoint — no auth required."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.qr_utils import verify_qr_token
from src.models import models
from src.schemas import schemas
from datetime import datetime, date

router = APIRouter()


def _calculate_age(dob_str: str) -> int | None:
    """Calculate age from a date-of-birth string (YYYY-MM-DD)."""
    try:
        dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
        today = date.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except (ValueError, TypeError):
        return None


@router.get("/scan/{patient_id}", response_model=schemas.ScanResponse)
def verify_scan(patient_id: int, token: str = Query(...), db: Session = Depends(get_db)):
    """Verify a QR token and return the public patient profile."""
    # 1. Decode token
    payload = verify_qr_token(token)
    if payload is None:
        return schemas.ScanResponse(valid=False, error="Invalid or expired health card")

    # 2. Verify patient_id matches
    if payload.get("patient_id") != patient_id:
        return schemas.ScanResponse(valid=False, error="Invalid or expired health card")

    # 3. Fetch patient
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if patient is None:
        return schemas.ScanResponse(valid=False, error="Patient not found")

    # 4. Get latest record for last_diagnosis / last_visit / doctor
    latest_record = (
        db.query(models.MedicalRecord)
        .filter(models.MedicalRecord.patient_id == patient_id)
        .order_by(models.MedicalRecord.id.desc())
        .first()
    )

    last_diagnosis = latest_record.diagnosis if latest_record else None
    last_visit = latest_record.date_of_visit if latest_record else None

    # Get doctor name from user table
    doctor_name = None
    if latest_record and latest_record.doctor_id:
        doctor = db.query(models.User).filter(models.User.id == latest_record.doctor_id).first()
        doctor_name = doctor.full_name if doctor else None

    # 5. Build alert from medical history
    alert = None
    if patient.medical_history:
        allergies = [h for h in patient.medical_history if "allerg" in h.lower()]
        if allergies:
            alert = " | ".join(allergies)

    profile = schemas.PublicPatientProfile(
        id=patient.id,
        full_name=patient.full_name,
        age=_calculate_age(patient.date_of_birth),
        gender=patient.gender,
        blood_group=patient.blood_group,
        location_id=patient.location_id,
        emergency_contact=patient.emergency_contact,
        last_diagnosis=last_diagnosis,
        last_visit=last_visit,
        doctor=doctor_name,
        alert=alert,
    )

    return schemas.ScanResponse(valid=True, access="public", patient=profile)
