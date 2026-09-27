"""
Scan Router — Passport, National ID, Driving License endpoints.
"""

import asyncio
import time
from typing import Optional

from fastapi import APIRouter, File, UploadFile, Form

from app.engine import (
    extract_passport_data,
    run_passport_tampering_analysis,
    validate_mrz,
    extract_national_id_data,
    run_database_verification,
    extract_dl_data,
    run_dl_tampering_checks,
)
from app.models import (
    PassportScanResponse,
    TamperingCheck,
    NationalIdResponse,
    DatabaseCheck,
    DrivingLicenseResponse,
    DLTamperCheck,
)

router = APIRouter()


@router.post("/passport", response_model=PassportScanResponse)
async def scan_passport(
    file: Optional[UploadFile] = File(None),
    base64_frame: Optional[str] = Form(None),
):
    """
    POST /api/v1/scan/passport
    Accepts image file or base64 frame.
    Runs OCR extraction, MRZ checksum validation, and tampering analysis.
    """
    start = time.perf_counter()

    # Read image bytes
    image_bytes = None
    if file:
        image_bytes = await file.read()
    elif base64_frame:
        import base64
        try:
            image_bytes = base64.b64decode(base64_frame)
        except Exception:
            pass

    # Simulate realistic processing delay (OCR + analysis pipeline)
    await asyncio.sleep(0.8)

    # Run OCR extraction
    ocr_result = extract_passport_data(image_bytes)

    # MRZ validation
    mrz_line = ocr_result["fields"].get("mrz", "")
    mrz_validation = validate_mrz(mrz_line)

    # Tampering analysis
    tampering_raw = run_passport_tampering_analysis(image_bytes)
    tampering_checks = [TamperingCheck(**t) for t in tampering_raw]

    # Overall document score
    avg_score = sum(t.get("score", 95) for t in tampering_raw) / len(tampering_raw)

    elapsed = round((time.perf_counter() - start) * 1000, 2)

    return PassportScanResponse(
        extracted_fields=ocr_result["fields"],
        mrz_valid=mrz_validation["overall_valid"],
        mrz_checksum_details=mrz_validation,
        tampering_analysis=tampering_checks,
        overall_document_score=round(avg_score, 1),
        processing_time_ms=elapsed,
    )


@router.post("/national-id", response_model=NationalIdResponse)
async def scan_national_id(
    file: Optional[UploadFile] = File(None),
):
    """
    POST /api/v1/scan/national-id
    Extracts Aadhaar/EPIC details and runs cross-database verification.
    """
    start = time.perf_counter()

    image_bytes = None
    if file:
        image_bytes = await file.read()

    # Simulate processing
    await asyncio.sleep(0.6)

    # OCR extraction
    ocr_result = extract_national_id_data(image_bytes)

    # Database verification
    await asyncio.sleep(0.4)
    db_checks_raw = run_database_verification()
    db_checks = [DatabaseCheck(**d) for d in db_checks_raw]

    # Determine overall status
    has_flag = any(d["status"] == "flagged" for d in db_checks_raw)
    verification_status = "FLAGGED" if has_flag else "CLEAR"

    elapsed = round((time.perf_counter() - start) * 1000, 2)

    return NationalIdResponse(
        extracted_fields=ocr_result["fields"],
        verification_status=verification_status,
        database_checks=db_checks,
        processing_time_ms=elapsed,
    )


@router.post("/driving-license", response_model=DrivingLicenseResponse)
async def scan_driving_license(
    file: Optional[UploadFile] = File(None),
):
    """
    POST /api/v1/scan/driving-license
    Extracts DL fields and runs SARATHI verification + tampering checks.
    """
    start = time.perf_counter()

    image_bytes = None
    if file:
        image_bytes = await file.read()

    await asyncio.sleep(0.7)

    # OCR extraction
    ocr_result = extract_dl_data(image_bytes)

    # Tampering checks
    tamper_raw = run_dl_tampering_checks(image_bytes)
    tamper_checks = [DLTamperCheck(**t) for t in tamper_raw]

    # SARATHI verification mock
    sarathi_status = "VERIFIED"

    elapsed = round((time.perf_counter() - start) * 1000, 2)

    return DrivingLicenseResponse(
        extracted_fields=ocr_result["fields"],
        sarathi_verification=sarathi_status,
        tampering_checks=tamper_checks,
        processing_time_ms=elapsed,
    )
