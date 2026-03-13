from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.database import engine
from src.models import models
from src.api import users, patients, scan

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vitalix API", description="AI-Powered Smart Healthcare System", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(scan.router, prefix="/api", tags=["QR Scan"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Vitalix API. System is active."}
