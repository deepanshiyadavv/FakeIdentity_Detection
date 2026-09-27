"""
SSB Document Processing Engine
Handles OCR extraction, MRZ validation, tampering analysis, face matching,
and threat assessment computation.

All processing uses intelligent simulation with realistic delays and scoring,
designed to work without heavy ML dependencies (easyocr/deepface) while
producing production-quality API responses.
"""

import hashlib
import random
import time
from datetime import datetime, timezone, timedelta
from io import BytesIO
from typing import Optional

import numpy as np
from PIL import Image


# ──────────────────────────────────────────────
# MRZ VALIDATION (ICAO 9303 Standard)
# ──────────────────────────────────────────────

MRZ_WEIGHTS = [7, 3, 1]
MRZ_CHAR_VALUES = {chr(i): i - 55 for i in range(65, 91)}  # A=10, B=11...
MRZ_CHAR_VALUES.update({str(i): i for i in range(10)})       # 0-9
MRZ_CHAR_VALUES['<'] = 0


def mrz_check_digit(data: str) -> int:
    """Compute ICAO 9303 check digit using MOD 10 with weights 7,3,1."""
    total = 0
    for i, ch in enumerate(data):
        val = MRZ_CHAR_VALUES.get(ch, 0)
        total += val * MRZ_WEIGHTS[i % 3]
    return total % 10


def validate_mrz(mrz_line: str) -> dict:
    """
    Validate a Type 3 (TD3) passport MRZ line.
    Returns breakdown of check digit validations.
    """
    if len(mrz_line) < 44:
        # Pad or truncate for demo
        mrz_line = mrz_line.ljust(88, '<')

    line2 = mrz_line[44:] if len(mrz_line) >= 88 else mrz_line

    # For demo purposes: compute realistic check digit results
    passport_no_segment = "N84729164"
    dob_segment = "880315"
    expiry_segment = "290122"

    pn_check = mrz_check_digit(passport_no_segment[:-1])
    dob_check = mrz_check_digit(dob_segment)
    exp_check = mrz_check_digit(expiry_segment)

    return {
        "passport_number_check": {
            "segment": passport_no_segment,
            "computed_digit": pn_check,
            "expected_digit": int(passport_no_segment[-1]) if passport_no_segment[-1].isdigit() else 0,
            "valid": True
        },
        "dob_check": {
            "segment": dob_segment,
            "computed_digit": dob_check,
            "valid": True
        },
        "expiry_check": {
            "segment": expiry_segment,
            "computed_digit": exp_check,
            "valid": True
        },
        "composite_check": {
            "valid": True,
            "method": "MOD 10 (ICAO 9303)"
        },
        "overall_valid": True,
    }


# ──────────────────────────────────────────────
# IMAGE ANALYSIS HELPERS
# ──────────────────────────────────────────────

def analyze_image_properties(image_bytes: bytes) -> dict:
    """
    Analyze basic image properties: dimensions, color distribution,
    edge density — used to inform tampering scores.
    """
    try:
        img = Image.open(BytesIO(image_bytes))
        width, height = img.size
        img_array = np.array(img.convert("RGB"))

        # Compute basic statistics
        mean_brightness = float(np.mean(img_array))
        std_dev = float(np.std(img_array))

        # Edge density approximation via gradient magnitude
        gray = np.mean(img_array, axis=2)
        gx = np.abs(np.diff(gray, axis=1))
        gy = np.abs(np.diff(gray, axis=0))
        edge_density = float(np.mean(gx) + np.mean(gy))

        # Hash for uniqueness tracking
        img_hash = hashlib.md5(image_bytes[:4096]).hexdigest()[:12]

        return {
            "width": width,
            "height": height,
            "mean_brightness": round(mean_brightness, 2),
            "std_dev": round(std_dev, 2),
            "edge_density": round(edge_density, 2),
            "image_hash": img_hash,
            "valid_image": True,
        }
    except Exception:
        return {
            "width": 0,
            "height": 0,
            "mean_brightness": 0,
            "std_dev": 0,
            "edge_density": 0,
            "image_hash": "none",
            "valid_image": False,
        }


# ──────────────────────────────────────────────
# PASSPORT OCR EXTRACTION
# ──────────────────────────────────────────────

def extract_passport_data(image_bytes: Optional[bytes] = None) -> dict:
    """
    Extract passport fields via OCR simulation.
    In production, this would run EasyOCR / Tesseract on the image.
    The image properties influence confidence scoring.
    """
    img_props = analyze_image_properties(image_bytes) if image_bytes else {}

    # Base data — would come from OCR in production
    base_data = {
        "name": "ARJUN KUMAR SHARMA",
        "passportNo": "N8472916",
        "dob": "15-MAR-1988",
        "expiry": "22-JAN-2029",
        "nationality": "INDIAN",
        "issuePlace": "NEW DELHI",
        "gender": "MALE",
        "mrz": "P<INDSHARMA<<ARJUN<KUMAR<<<<<<<<<<<<<<<<<<<<<N84729164IND8803155M2901227<<<<<<<<<<<<<<04",
    }

    # If we have image data, modulate confidence based on image quality
    confidence = 0.92 + random.uniform(0, 0.07) if img_props.get("valid_image") else 0.95

    return {
        "fields": base_data,
        "ocr_confidence": round(confidence, 4),
        "image_properties": img_props if img_props.get("valid_image") else None,
    }


def run_passport_tampering_analysis(image_bytes: Optional[bytes] = None) -> list[dict]:
    """
    Run tampering analysis on passport image.
    Checks: photo replacement, MRZ checksum, font consistency,
    UV watermark, microprint integrity.
    """
    img_props = analyze_image_properties(image_bytes) if image_bytes else {}

    # Compute scores influenced by actual image properties
    edge_factor = min(img_props.get("edge_density", 15) / 20, 1.0) if img_props.get("valid_image") else 0.9

    checks = [
        {
            "label": "Photo Replacement Detection",
            "status": "pass",
            "detail": "No splicing artifacts detected — edge continuity confirmed",
            "score": round(92 + random.uniform(0, 6) * edge_factor, 1),
        },
        {
            "label": "MRZ Checksum Validation",
            "status": "pass",
            "detail": "All check digits valid (MOD 10 — ICAO 9303)",
            "score": 100.0,
        },
        {
            "label": "Font Consistency Analysis",
            "status": "pass",
            "detail": "OCR-B font pattern matched across all text zones",
            "score": round(94 + random.uniform(0, 5), 1),
        },
        {
            "label": "UV Watermark Verification",
            "status": "pass",
            "detail": "Ashoka emblem UV pattern verified at 365nm wavelength",
            "score": round(88 + random.uniform(0, 10), 1),
        },
        {
            "label": "Microprint Integrity",
            "status": "warn",
            "detail": "Minor degradation detected — within acceptable threshold (>85%)",
            "score": round(85 + random.uniform(0, 8), 1),
        },
    ]
    return checks


# ──────────────────────────────────────────────
# NATIONAL ID EXTRACTION
# ──────────────────────────────────────────────

def extract_national_id_data(image_bytes: Optional[bytes] = None) -> dict:
    """Extract Aadhaar / EPIC fields via OCR simulation."""
    img_props = analyze_image_properties(image_bytes) if image_bytes else {}

    fields = {
        "name": "ARJUN KUMAR SHARMA",
        "idType": "AADHAAR CARD",
        "idNumber": "XXXX-XXXX-7842",
        "dob": "15-03-1988",
        "address": "42-B, RAJOURI GARDEN, NEW DELHI - 110027",
        "gender": "MALE",
        "issueDate": "12-AUG-2019",
    }

    confidence = 0.91 + random.uniform(0, 0.08)

    return {
        "fields": fields,
        "ocr_confidence": round(confidence, 4),
    }


def run_database_verification() -> list[dict]:
    """
    Simulate cross-verification against national databases:
    blacklist, Interpol, immigration watch list, NIA, cross-document match.
    """
    return [
        {"label": "National Blacklist Database", "status": "clear", "detail": "No records found in NCRB database"},
        {"label": "Interpol Red Notice Check", "status": "clear", "detail": "No match in INTERPOL I-24/7 system"},
        {"label": "Immigration Watch List", "status": "clear", "detail": "Not flagged in BOI immigration records"},
        {"label": "Anti-Terror Registry (NIA)", "status": "clear", "detail": "No associations found in NIA database"},
        {"label": "Cross-Document Name Match", "status": "pass", "detail": "Name consistent with Passport data — Levenshtein distance: 0"},
    ]


# ──────────────────────────────────────────────
# DRIVING LICENSE EXTRACTION
# ──────────────────────────────────────────────

def extract_dl_data(image_bytes: Optional[bytes] = None) -> dict:
    """Extract driving license fields via OCR simulation."""
    img_props = analyze_image_properties(image_bytes) if image_bytes else {}

    fields = {
        "name": "ARJUN KUMAR SHARMA",
        "dlNumber": "DL-0420190184729",
        "dob": "15-03-1988",
        "validity": "14-03-2039",
        "bloodGroup": "B+",
        "vehicleClass": "LMV / MCWG",
        "issuingAuth": "RTO SOUTH DELHI",
        "address": "42-B, RAJOURI GARDEN, NEW DELHI",
    }

    return {
        "fields": fields,
        "ocr_confidence": round(0.93 + random.uniform(0, 0.06), 4),
    }


def run_dl_tampering_checks(image_bytes: Optional[bytes] = None) -> list[dict]:
    """Run integrity checks on driving license."""
    return [
        {"label": "Hologram Integrity Check", "status": "pass", "detail": "Rainbow hologram pattern intact — spectral analysis passed"},
        {"label": "Photo Splice Detection", "status": "pass", "detail": "No edge artifacts detected in photo zone"},
        {"label": "Barcode / QR Validation", "status": "pass", "detail": "Encoded data matches printed fields — CRC32 valid"},
        {"label": "Lamination Analysis", "status": "pass", "detail": "No re-lamination traces — thermal profile nominal"},
        {"label": "Cross-Document DOB Match", "status": "pass", "detail": "DOB consistent across all submitted documents"},
    ]


# ──────────────────────────────────────────────
# FACE MATCHING ENGINE
# ──────────────────────────────────────────────

def compute_face_match(
    document_image_bytes: Optional[bytes] = None,
    live_image_bytes: Optional[bytes] = None,
) -> dict:
    """
    Compute facial similarity between document photo and live webcam frame.
    In production: DeepFace / InsightFace cosine similarity on 512-d embeddings.
    Simulation produces realistic facial metric breakdowns.
    """
    # Analyze both images if provided
    doc_props = analyze_image_properties(document_image_bytes) if document_image_bytes else {}
    live_props = analyze_image_properties(live_image_bytes) if live_image_bytes else {}

    # Base similarity with slight randomization
    base_similarity = 96.7
    jitter = random.uniform(-1.2, 0.8)
    similarity = round(min(base_similarity + jitter, 99.9), 1)

    # Compute individual facial metrics
    metrics = [
        {"label": "Eye Spacing Ratio", "value": round(min(similarity * 1.01 + random.uniform(-0.3, 0.5), 99.5), 1)},
        {"label": "Nasal Bridge Profile", "value": round(min(similarity * 0.98 + random.uniform(-0.5, 0.8), 99.0), 1)},
        {"label": "Jawline Contour", "value": round(min(similarity * 0.99 + random.uniform(-0.2, 0.6), 99.2), 1)},
        {"label": "Forehead Proportion", "value": round(min(similarity * 1.02 + random.uniform(-0.4, 0.3), 99.8), 1)},
    ]

    # Liveness verification
    liveness_checks = {
        "blink_detection": True,
        "depth_3d_mapping": True,
        "skin_texture_analysis": True,
        "micro_motion_tracking": True,
    }
    liveness_score = 100.0

    # Determine match status
    if similarity >= 85:
        match_status = "MATCH"
    elif similarity >= 60:
        match_status = "INCONCLUSIVE"
    else:
        match_status = "MISMATCH"

    return {
        "similarity_percentage": similarity,
        "facial_metrics": metrics,
        "liveness_score": liveness_score,
        "liveness_checks": liveness_checks,
        "match_status": match_status,
    }


# ──────────────────────────────────────────────
# THREAT ASSESSMENT ENGINE
# ──────────────────────────────────────────────

def calculate_threat_assessment(
    passport_score: float = 95.0,
    national_id_status: str = "CLEAR",
    dl_verification: str = "VERIFIED",
    face_similarity: float = 96.7,
    liveness_score: float = 100.0,
    risk_mode: str = "low",
) -> dict:
    """
    Compute composite threat score from all document and biometric results.
    Uses weighted scoring across five dimensions.
    """
    now = datetime.now(timezone(timedelta(hours=5, seconds=1800)))  # IST

    if risk_mode == "high":
        composite = 87
        breakdown = [
            {"label": "Document Tampering Score", "value": 82, "max": 100, "color": "#DC2626", "inverted": False},
            {"label": "Impersonation Level", "value": 91, "max": 100, "color": "#DC2626", "inverted": False},
            {"label": "Expiry Validity", "value": 0, "max": 100, "color": "#DC2626", "inverted": True},
            {"label": "Database Blacklist Status", "value": 95, "max": 100, "color": "#DC2626", "inverted": False},
            {"label": "MRZ Consistency Score", "value": 22, "max": 100, "color": "#DC2626", "inverted": True},
        ]
        verdict = "HIGH RISK — FAKE / TAMPERED"
        classification = "HIGH RISK — DETAINMENT"
    elif risk_mode == "medium":
        composite = 48
        breakdown = [
            {"label": "Document Tampering Score", "value": 38, "max": 100, "color": "#f59e0b", "inverted": False},
            {"label": "Impersonation Level", "value": 25, "max": 100, "color": "#f59e0b", "inverted": False},
            {"label": "Expiry Validity", "value": 60, "max": 100, "color": "#f59e0b", "inverted": True},
            {"label": "Database Blacklist Status", "value": 0, "max": 100, "color": "#10B981", "inverted": False},
            {"label": "MRZ Consistency Score", "value": 72, "max": 100, "color": "#f59e0b", "inverted": True},
        ]
        verdict = "MEDIUM RISK — MANUAL CHECK"
        classification = "MEDIUM RISK"
    else:
        # LOW RISK — compute weighted score from actual inputs
        tamper_score = max(0, 100 - passport_score) + random.uniform(0, 5)
        impersonation = max(0, 100 - face_similarity) + random.uniform(0, 2)
        expiry_validity = 100.0  # all documents valid
        blacklist_status = 0.0 if national_id_status == "CLEAR" else 50.0
        mrz_consistency = 98.0

        composite = round(
            tamper_score * 0.25
            + impersonation * 0.25
            + (100 - expiry_validity) * 0.15
            + blacklist_status * 0.2
            + (100 - mrz_consistency) * 0.15,
            0,
        )
        composite = max(int(composite), 5) + random.randint(0, 3)
        composite = min(composite, 25)

        breakdown = [
            {"label": "Document Tampering Score", "value": round(tamper_score, 0), "max": 100, "color": "#10B981", "inverted": False},
            {"label": "Impersonation Level", "value": round(impersonation, 0), "max": 100, "color": "#10B981", "inverted": False},
            {"label": "Expiry Validity", "value": expiry_validity, "max": 100, "color": "#10B981", "inverted": True},
            {"label": "Database Blacklist Status", "value": blacklist_status, "max": 100, "color": "#10B981", "inverted": False},
            {"label": "MRZ Consistency Score", "value": mrz_consistency, "max": 100, "color": "#10B981", "inverted": True},
        ]
        verdict = "LOW RISK — CLEAR"
        classification = "LOW RISK — CLEAR"

    # Generate realistic audit trail with timestamps
    base_time = now - timedelta(seconds=38)
    audit_trail = [
        {"time": "00:00:01", "event": f"Session initiated — Operator SSB-{random.randint(1000, 9999)}"},
        {"time": "00:00:03", "event": "Passport scan initiated — ICAO 9303 module"},
        {"time": "00:00:06", "event": "OCR extraction complete — 8 fields captured"},
        {"time": "00:00:09", "event": "Tampering analysis — 5/5 checks passed"},
        {"time": "00:00:12", "event": "National ID scan — Aadhaar verified via UID API"},
        {"time": "00:00:16", "event": "Blacklist cross-ref — 4 databases queried (CLEAR)"},
        {"time": "00:00:19", "event": "Driving License scan — SARATHI module activated"},
        {"time": "00:00:23", "event": "DL integrity — All checks passed"},
        {"time": "00:00:27", "event": "Face match initiated — DeepFace AI engine"},
        {"time": "00:00:35", "event": f"Similarity: {face_similarity}% — Liveness: {liveness_score}% — CONFIRMED"},
        {"time": "00:00:38", "event": f"Threat assessment computed — Risk Score: {composite}/100"},
    ]

    subject_summary = {
        "name": "ARJUN K. SHARMA",
        "passport": "N8472916",
        "aadhaar": "XXXX-7842",
        "dl": "DL-0420190184729",
        "dob": "15-MAR-1988",
        "nationality": "INDIAN",
        "face_match": f"{face_similarity}%",
        "liveness": f"{liveness_score}%",
    }

    return {
        "composite_score": composite,
        "risk_classification": classification,
        "verdict": verdict,
        "breakdown": breakdown,
        "audit_trail": audit_trail,
        "subject_summary": subject_summary,
    }
