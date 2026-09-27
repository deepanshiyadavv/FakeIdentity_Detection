"""
Assessment Router — Threat Assessment endpoint.
"""

import asyncio
import time

from fastapi import APIRouter

from app.engine import calculate_threat_assessment
from app.models import (
    ThreatAssessmentRequest,
    ThreatAssessmentResponse,
    BreakdownItem,
    AuditEntry,
    SubjectSummary,
)

router = APIRouter()


@router.post("/calculate-threat", response_model=ThreatAssessmentResponse)
async def calculate_threat(payload: ThreatAssessmentRequest):
    """
    POST /api/v1/assessment/calculate-threat
    Accepts combined results from all scan steps.
    Returns composite risk score, breakdown, classification, and audit trail.
    """
    start = time.perf_counter()

    # Simulate threat computation pipeline
    await asyncio.sleep(0.5)

    result = calculate_threat_assessment(
        passport_score=payload.passport_score,
        national_id_status=payload.national_id_status,
        dl_verification=payload.dl_verification,
        face_similarity=payload.face_similarity,
        liveness_score=payload.liveness_score,
        risk_mode=payload.risk_mode,
    )

    elapsed = round((time.perf_counter() - start) * 1000, 2)

    return ThreatAssessmentResponse(
        composite_score=result["composite_score"],
        risk_classification=result["risk_classification"],
        verdict=result["verdict"],
        breakdown=[BreakdownItem(**b) for b in result["breakdown"]],
        audit_trail=[AuditEntry(**a) for a in result["audit_trail"]],
        subject_summary=SubjectSummary(**result["subject_summary"]),
        processing_time_ms=elapsed,
    )
