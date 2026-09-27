"""
Verify Router — Face Match endpoint.
"""

import asyncio
import time
from typing import Optional

from fastapi import APIRouter, File, UploadFile

from app.engine import compute_face_match
from app.models import FaceMatchResponse, FacialMetric

router = APIRouter()


@router.post("/face-match", response_model=FaceMatchResponse)
async def face_match(
    document_photo: Optional[UploadFile] = File(None),
    live_frame: Optional[UploadFile] = File(None),
):
    """
    POST /api/v1/verify/face-match
    Accepts document photo + live webcam frame.
    Computes facial similarity, detailed metrics breakdown, and liveness score.
    """
    start = time.perf_counter()

    doc_bytes = None
    live_bytes = None

    if document_photo:
        doc_bytes = await document_photo.read()
    if live_frame:
        live_bytes = await live_frame.read()

    # Simulate face detection + embedding computation delay
    await asyncio.sleep(1.2)

    result = compute_face_match(doc_bytes, live_bytes)

    elapsed = round((time.perf_counter() - start) * 1000, 2)

    return FaceMatchResponse(
        similarity_percentage=result["similarity_percentage"],
        facial_metrics=[FacialMetric(**m) for m in result["facial_metrics"]],
        liveness_score=result["liveness_score"],
        liveness_checks=result["liveness_checks"],
        match_status=result["match_status"],
        processing_time_ms=elapsed,
    )
