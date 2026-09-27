/**
 * SSB National Document Screening Portal — API Service Layer
 * 
 * Handles all HTTP communication with the FastAPI backend.
 * Includes automatic fallback to mock data if the backend is offline,
 * ensuring the demo never breaks.
 */

const API_BASE = 'http://localhost:8000/api/v1';
const HEALTH_URL = 'http://localhost:8000/health';

// ─── Backend availability cache ───
let _backendAvailable = null;
let _lastCheck = 0;
const CHECK_INTERVAL = 10000; // Re-check every 10s

/**
 * Check if the Python backend server is reachable.
 * Caches result for CHECK_INTERVAL ms to avoid hammering.
 */
export async function isBackendOnline() {
  const now = Date.now();
  if (_backendAvailable !== null && now - _lastCheck < CHECK_INTERVAL) {
    return _backendAvailable;
  }
  try {
    const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(2000) });
    _backendAvailable = res.ok;
  } catch {
    _backendAvailable = false;
  }
  _lastCheck = now;
  return _backendAvailable;
}

// ─── Helper: POST with file or JSON ───

async function postFile(endpoint, file = null, fieldName = 'file') {
  const formData = new FormData();
  if (file) {
    formData.append(fieldName, file);
  }
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function postJSON(endpoint, payload) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function postMultiFile(endpoint, files = {}) {
  const formData = new FormData();
  for (const [key, file] of Object.entries(files)) {
    if (file) formData.append(key, file);
  }
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}


// ════════════════════════════════════════════════
// MOCK FALLBACK DATA
// ════════════════════════════════════════════════

const MOCK_PASSPORT = {
  extracted_fields: {
    name: 'ARJUN KUMAR SHARMA',
    passportNo: 'N8472916',
    dob: '15-MAR-1988',
    expiry: '22-JAN-2029',
    nationality: 'INDIAN',
    issuePlace: 'NEW DELHI',
    gender: 'MALE',
    mrz: 'P<INDSHARMA<<ARJUN<KUMAR<<<<<<<<<<<<<<<<<<<<<N84729164IND8803155M2901227<<<<<<<<<<<<<<04',
  },
  mrz_valid: true,
  mrz_checksum_details: { overall_valid: true },
  tampering_analysis: [
    { label: 'Photo Replacement Detection', status: 'pass', detail: 'No splicing artifacts detected', score: 96.2 },
    { label: 'MRZ Checksum Validation', status: 'pass', detail: 'All check digits valid (MOD 10)', score: 100 },
    { label: 'Font Consistency Analysis', status: 'pass', detail: 'OCR-B font pattern matched', score: 97.1 },
    { label: 'UV Watermark Verification', status: 'pass', detail: 'Ashoka emblem pattern verified', score: 93.5 },
    { label: 'Microprint Integrity', status: 'warn', detail: 'Minor degradation — within threshold', score: 88.4 },
  ],
  overall_document_score: 95.0,
  processing_time_ms: 842.5,
};

const MOCK_NATIONAL_ID = {
  extracted_fields: {
    name: 'ARJUN KUMAR SHARMA',
    idType: 'AADHAAR CARD',
    idNumber: 'XXXX-XXXX-7842',
    dob: '15-03-1988',
    address: '42-B, RAJOURI GARDEN, NEW DELHI - 110027',
    gender: 'MALE',
    issueDate: '12-AUG-2019',
  },
  verification_status: 'CLEAR',
  database_checks: [
    { label: 'National Blacklist Database', status: 'clear', detail: 'No records found' },
    { label: 'Interpol Red Notice Check', status: 'clear', detail: 'No match in INTERPOL DB' },
    { label: 'Immigration Watch List', status: 'clear', detail: 'Not flagged' },
    { label: 'Anti-Terror Registry (NIA)', status: 'clear', detail: 'No associations found' },
    { label: 'Cross-Document Name Match', status: 'pass', detail: 'Name consistent with Passport data' },
  ],
  processing_time_ms: 1024.3,
};

const MOCK_DL = {
  extracted_fields: {
    name: 'ARJUN KUMAR SHARMA',
    dlNumber: 'DL-0420190184729',
    dob: '15-03-1988',
    validity: '14-03-2039',
    bloodGroup: 'B+',
    vehicleClass: 'LMV / MCWG',
    issuingAuth: 'RTO SOUTH DELHI',
    address: '42-B, RAJOURI GARDEN, NEW DELHI',
  },
  sarathi_verification: 'VERIFIED',
  tampering_checks: [
    { label: 'Hologram Integrity Check', status: 'pass', detail: 'Rainbow hologram pattern intact' },
    { label: 'Photo Splice Detection', status: 'pass', detail: 'No edge artifacts in photo zone' },
    { label: 'Barcode / QR Validation', status: 'pass', detail: 'Data matches printed fields' },
    { label: 'Lamination Analysis', status: 'pass', detail: 'No re-lamination traces detected' },
    { label: 'Cross-Document DOB Match', status: 'pass', detail: 'DOB consistent across all documents' },
  ],
  processing_time_ms: 756.8,
};

const MOCK_FACE_MATCH = {
  similarity_percentage: 96.7,
  facial_metrics: [
    { label: 'Eye Spacing Ratio', value: 98.2 },
    { label: 'Nasal Bridge Profile', value: 95.1 },
    { label: 'Jawline Contour', value: 97.3 },
    { label: 'Forehead Proportion', value: 96.8 },
  ],
  liveness_score: 100,
  liveness_checks: {
    blink_detection: true,
    depth_3d_mapping: true,
    skin_texture_analysis: true,
    micro_motion_tracking: true,
  },
  match_status: 'MATCH',
  processing_time_ms: 1340.2,
};

const MOCK_THREAT_LOW = {
  composite_score: 8,
  risk_classification: 'LOW RISK — CLEAR',
  verdict: 'LOW RISK — CLEAR',
  breakdown: [
    { label: 'Document Tampering Score', value: 12, max: 100, color: '#10B981', inverted: false },
    { label: 'Impersonation Level', value: 3, max: 100, color: '#10B981', inverted: false },
    { label: 'Expiry Validity', value: 100, max: 100, color: '#10B981', inverted: true },
    { label: 'Database Blacklist Status', value: 0, max: 100, color: '#10B981', inverted: false },
    { label: 'MRZ Consistency Score', value: 98, max: 100, color: '#10B981', inverted: true },
  ],
  audit_trail: [
    { time: '00:00:01', event: 'Session initiated — Operator SSB-4927' },
    { time: '00:00:03', event: 'Passport scan initiated — ICAO 9303 module' },
    { time: '00:00:06', event: 'OCR extraction complete — 8 fields captured' },
    { time: '00:00:09', event: 'Tampering analysis — 5/5 checks passed' },
    { time: '00:00:12', event: 'National ID scan — Aadhaar verified via UID API' },
    { time: '00:00:16', event: 'Blacklist cross-ref — 4 databases queried (CLEAR)' },
    { time: '00:00:19', event: 'Driving License scan — SARATHI module activated' },
    { time: '00:00:23', event: 'DL integrity — All checks passed' },
    { time: '00:00:27', event: 'Face match initiated — DeepFace AI engine' },
    { time: '00:00:35', event: 'Similarity: 96.7% — Liveness: 100% — CONFIRMED' },
    { time: '00:00:38', event: 'Threat assessment computed — Risk Score: 8/100' },
  ],
  subject_summary: {
    name: 'ARJUN K. SHARMA',
    passport: 'N8472916',
    aadhaar: 'XXXX-7842',
    dl: 'DL-0420190184729',
    dob: '15-MAR-1988',
    nationality: 'INDIAN',
    face_match: '96.7%',
    liveness: '100%',
  },
  processing_time_ms: 520.1,
};

function getMockThreat(riskMode) {
  if (riskMode === 'high') {
    return {
      ...MOCK_THREAT_LOW,
      composite_score: 87,
      risk_classification: 'HIGH RISK — DETAINMENT',
      verdict: 'HIGH RISK — FAKE / TAMPERED',
      breakdown: [
        { label: 'Document Tampering Score', value: 82, max: 100, color: '#DC2626', inverted: false },
        { label: 'Impersonation Level', value: 91, max: 100, color: '#DC2626', inverted: false },
        { label: 'Expiry Validity', value: 0, max: 100, color: '#DC2626', inverted: true },
        { label: 'Database Blacklist Status', value: 95, max: 100, color: '#DC2626', inverted: false },
        { label: 'MRZ Consistency Score', value: 22, max: 100, color: '#DC2626', inverted: true },
      ],
    };
  }
  if (riskMode === 'medium') {
    return {
      ...MOCK_THREAT_LOW,
      composite_score: 48,
      risk_classification: 'MEDIUM RISK',
      verdict: 'MEDIUM RISK — MANUAL CHECK',
      breakdown: [
        { label: 'Document Tampering Score', value: 38, max: 100, color: '#f59e0b', inverted: false },
        { label: 'Impersonation Level', value: 25, max: 100, color: '#f59e0b', inverted: false },
        { label: 'Expiry Validity', value: 60, max: 100, color: '#f59e0b', inverted: true },
        { label: 'Database Blacklist Status', value: 0, max: 100, color: '#10B981', inverted: false },
        { label: 'MRZ Consistency Score', value: 72, max: 100, color: '#f59e0b', inverted: true },
      ],
    };
  }
  return MOCK_THREAT_LOW;
}


// ════════════════════════════════════════════════
// PUBLIC API FUNCTIONS (with fallback)
// ════════════════════════════════════════════════

/**
 * Scan passport document.
 * @param {File|null} imageFile - Optional image file to upload
 * @returns {Promise<object>} Passport scan results
 */
export async function scanPassport(imageFile = null) {
  const online = await isBackendOnline();
  if (online) {
    try {
      return await postFile('/scan/passport', imageFile);
    } catch (e) {
      console.warn('[API] Passport scan failed, using mock:', e.message);
    }
  }
  // Mock fallback with simulated delay
  await new Promise(r => setTimeout(r, 800));
  return MOCK_PASSPORT;
}

/**
 * Scan national ID document.
 * @param {File|null} imageFile
 * @returns {Promise<object>}
 */
export async function scanNationalId(imageFile = null) {
  const online = await isBackendOnline();
  if (online) {
    try {
      return await postFile('/scan/national-id', imageFile);
    } catch (e) {
      console.warn('[API] National ID scan failed, using mock:', e.message);
    }
  }
  await new Promise(r => setTimeout(r, 600));
  return MOCK_NATIONAL_ID;
}

/**
 * Scan driving license document.
 * @param {File|null} imageFile
 * @returns {Promise<object>}
 */
export async function scanDrivingLicense(imageFile = null) {
  const online = await isBackendOnline();
  if (online) {
    try {
      return await postFile('/scan/driving-license', imageFile);
    } catch (e) {
      console.warn('[API] DL scan failed, using mock:', e.message);
    }
  }
  await new Promise(r => setTimeout(r, 700));
  return MOCK_DL;
}

/**
 * Run face match verification.
 * @param {File|null} documentPhoto
 * @param {File|null} liveFrame
 * @returns {Promise<object>}
 */
export async function verifyFaceMatch(documentPhoto = null, liveFrame = null) {
  const online = await isBackendOnline();
  if (online) {
    try {
      return await postMultiFile('/verify/face-match', {
        document_photo: documentPhoto,
        live_frame: liveFrame,
      });
    } catch (e) {
      console.warn('[API] Face match failed, using mock:', e.message);
    }
  }
  await new Promise(r => setTimeout(r, 1200));
  return MOCK_FACE_MATCH;
}

/**
 * Calculate composite threat assessment.
 * @param {object} payload - Assessment input parameters
 * @returns {Promise<object>}
 */
export async function calculateThreat(payload = {}) {
  const online = await isBackendOnline();
  if (online) {
    try {
      return await postJSON('/assessment/calculate-threat', payload);
    } catch (e) {
      console.warn('[API] Threat assessment failed, using mock:', e.message);
    }
  }
  await new Promise(r => setTimeout(r, 500));
  return getMockThreat(payload.risk_mode || 'low');
}
