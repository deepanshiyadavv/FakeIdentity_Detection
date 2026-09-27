"""
Pydantic models for all API request/response schemas.
"""

from pydantic import BaseModel
from typing import Optional


# ──── Passport ────

class TamperingCheck(BaseModel):
    label: str
    status: str  # 'pass', 'warn', 'fail'
    detail: str
    score: Optional[float] = None


class PassportScanResponse(BaseModel):
    extracted_fields: dict
    mrz_valid: bool
    mrz_checksum_details: dict
    tampering_analysis: list[TamperingCheck]
    overall_document_score: float
    processing_time_ms: float


# ──── National ID ────

class DatabaseCheck(BaseModel):
    label: str
    status: str  # 'clear', 'pass', 'flagged'
    detail: str


class NationalIdResponse(BaseModel):
    extracted_fields: dict
    verification_status: str  # 'CLEAR', 'FLAGGED'
    database_checks: list[DatabaseCheck]
    processing_time_ms: float


# ──── Driving License ────

class DLTamperCheck(BaseModel):
    label: str
    status: str
    detail: str


class DrivingLicenseResponse(BaseModel):
    extracted_fields: dict
    sarathi_verification: str  # 'VERIFIED', 'MISMATCH', 'NOT_FOUND'
    tampering_checks: list[DLTamperCheck]
    processing_time_ms: float


# ──── Face Match ────

class FacialMetric(BaseModel):
    label: str
    value: float


class FaceMatchResponse(BaseModel):
    similarity_percentage: float
    facial_metrics: list[FacialMetric]
    liveness_score: float
    liveness_checks: dict
    match_status: str  # 'MATCH', 'MISMATCH', 'INCONCLUSIVE'
    processing_time_ms: float


# ──── Threat Assessment ────

class BreakdownItem(BaseModel):
    label: str
    value: float
    max: float
    color: str
    inverted: bool = False


class AuditEntry(BaseModel):
    time: str
    event: str


class ThreatAssessmentRequest(BaseModel):
    passport_score: Optional[float] = 95.0
    national_id_status: Optional[str] = "CLEAR"
    dl_verification: Optional[str] = "VERIFIED"
    face_similarity: Optional[float] = 96.7
    liveness_score: Optional[float] = 100.0
    risk_mode: Optional[str] = "low"  # 'low', 'medium', 'high'


class SubjectSummary(BaseModel):
    name: str
    passport: str
    aadhaar: str
    dl: str
    dob: str
    nationality: str
    face_match: str
    liveness: str


class ThreatAssessmentResponse(BaseModel):
    composite_score: float
    risk_classification: str
    verdict: str
    breakdown: list[BreakdownItem]
    audit_trail: list[AuditEntry]
    subject_summary: SubjectSummary
    processing_time_ms: float
