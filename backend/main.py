"""
SASHASTRA SEEMA BAL (SSB) — NATIONAL DOCUMENT SCREENING PORTAL
FastAPI Backend Server — Main Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import scan, verify, assessment

app = FastAPI(
    title="SSB National Document Screening Portal — API",
    description="Backend engine for document OCR, tampering analysis, biometric face matching, and threat assessment.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow Vite dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(scan.router, prefix="/api/v1/scan", tags=["Document Scanning"])
app.include_router(verify.router, prefix="/api/v1/verify", tags=["Biometric Verification"])
app.include_router(assessment.router, prefix="/api/v1/assessment", tags=["Threat Assessment"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "SSB National Document Screening Portal",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "endpoints": {
            "passport_scan": "/api/v1/scan/passport",
            "national_id_scan": "/api/v1/scan/national-id",
            "driving_license_scan": "/api/v1/scan/driving-license",
            "face_match": "/api/v1/verify/face-match",
            "threat_assessment": "/api/v1/assessment/calculate-threat",
        },
    }


@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    return {"status": "online"}
