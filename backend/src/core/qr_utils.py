"""QR Code generation and JWT token utilities for Smart Health Cards."""

import os
import urllib.parse
from jose import jwt, JWTError

SECRET_KEY = os.getenv("QR_SECRET", "vitalix-hackathon-secret")
ALGORITHM = "HS256"
BASE_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")


def generate_qr_token(patient_id: int) -> str:
    """Sign a JWT containing the patient ID for QR-based health card access."""
    payload = {
        "patient_id": patient_id,
        "type": "health_card",
        "access": "public",
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def build_scan_url(patient_id: int, token: str) -> str:
    """Build the URL that the QR code will point to."""
    return f"{BASE_URL}/scan/{patient_id}?token={token}"


def build_qr_image_url(scan_url: str) -> str:
    """Build the URL for the api.qrserver.com QR image."""
    encoded = urllib.parse.quote(scan_url, safe="")
    return (
        f"https://api.qrserver.com/v1/create-qr-code/"
        f"?size=250x250&data={encoded}&color=00d4aa&bgcolor=03050f&margin=12"
    )


def verify_qr_token(token: str) -> dict | None:
    """Decode and verify a QR JWT. Returns payload dict or None on failure."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "health_card":
            return None
        return payload
    except JWTError:
        return None
