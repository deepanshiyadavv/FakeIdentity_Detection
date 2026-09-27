import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle2, AlertTriangle, Fingerprint, ScanLine, Loader2, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScanViewport from './ScanViewport';
import { scanPassport, isBackendOnline } from '../services/apiService';

export default function PassportScan({ onComplete }) {
  const [phase, setPhase] = useState('idle');
  const [extractedFields, setExtractedFields] = useState([]);
  const [tamperChecks, setTamperChecks] = useState([]);
  const [fieldIndex, setFieldIndex] = useState(0);
  const [tamperIndex, setTamperIndex] = useState(0);
  const [apiData, setApiData] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);

  // Check backend status on mount
  useEffect(() => {
    isBackendOnline().then(setBackendStatus);
  }, []);

  const startScan = useCallback(async () => {
    setPhase('loading');
    setExtractedFields([]);
    setTamperChecks([]);
    setFieldIndex(0);
    setTamperIndex(0);
    setApiData(null);
    setProcessingTime(null);

    try {
      // Call the real API (or fallback mock)
      const result = await scanPassport();
      setApiData(result);
      setProcessingTime(result.processing_time_ms);
      setPhase('scanning');
    } catch (err) {
      console.error('Scan failed:', err);
      setPhase('idle');
    }
  }, []);

  // Animate OCR extraction field by field from API response
  useEffect(() => {
    if (phase !== 'scanning' || !apiData) return;
    const fields = Object.entries(apiData.extracted_fields);
    if (fieldIndex < fields.length) {
      const timer = setTimeout(() => {
        setExtractedFields(prev => [...prev, { key: fields[fieldIndex][0], value: fields[fieldIndex][1] }]);
        setFieldIndex(prev => prev + 1);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setPhase('tampering');
    }
  }, [phase, fieldIndex, apiData]);

  // Animate tampering checks from API response
  useEffect(() => {
    if (phase !== 'tampering' || !apiData) return;
    const checks = apiData.tampering_analysis;
    if (tamperIndex < checks.length) {
      const timer = setTimeout(() => {
        setTamperChecks(prev => [...prev, checks[tamperIndex]]);
        setTamperIndex(prev => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setPhase('complete');
      setTimeout(() => onComplete(), 2000);
    }
  }, [phase, tamperIndex, onComplete, apiData]);

  const fieldLabels = {
    name: 'Full Name',
    passportNo: 'Passport No.',
    dob: 'Date of Birth',
    expiry: 'Expiry Date',
    nationality: 'Nationality',
    issuePlace: 'Place of Issue',
    gender: 'Gender',
    mrz: 'MRZ Line',
  };

  const passportDisplayData = apiData?.extracted_fields || {};

  return (
    <div className="grid grid-cols-2 gap-5 h-full">
      {/* Left: Camera viewport */}
      <div className="flex flex-col gap-4">
        <ScanViewport
          label="PASSPORT SCANNER — ICAO 9303 COMPLIANT"
          isScanning={phase === 'scanning' || phase === 'loading'}
          scanComplete={phase === 'complete' || phase === 'tampering'}
        >
          {phase === 'idle' && (
            <div className="flex flex-col items-center gap-3">
              <FileText className="w-16 h-16 text-[#334155]" strokeWidth={1} />
              <p className="text-[11px] font-mono text-[#475569]">PLACE PASSPORT ON SCANNER</p>
            </div>
          )}
          {phase === 'loading' && (
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-12 h-12 text-[#22D3EE]" />
              </motion.div>
              <p className="text-[11px] font-mono text-[#22D3EE] animate-pulse">
                PROCESSING DOCUMENT VIA API...
              </p>
            </div>
          )}
          {(phase === 'scanning' || phase === 'tampering' || phase === 'complete') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-[75%] h-[70%] rounded-lg border border-[#22D3EE]/30 bg-gradient-to-br from-[#0F172A] to-[#1a2744] flex items-center justify-center relative overflow-hidden"
            >
              <div className="text-center">
                <div className="w-16 h-20 mx-auto mb-2 rounded bg-[#1e293b] border border-[#334155] flex items-center justify-center">
                  <Fingerprint className="w-8 h-8 text-[#22D3EE]/40" />
                </div>
                <p className="text-[10px] font-mono text-[#64748B]">REPUBLIC OF INDIA</p>
                <p className="text-[11px] font-mono text-[#94A3B8] font-bold mt-0.5">{passportDisplayData.name}</p>
                <p className="text-[9px] font-mono text-[#475569] mt-1">{passportDisplayData.passportNo}</p>
              </div>
              {/* MRZ zone at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#0a0f1a]/80 px-2 py-1 border-t border-[#22D3EE]/20">
                <p className="text-[7px] font-mono text-[#22D3EE]/50 truncate">{passportDisplayData.mrz}</p>
              </div>
            </motion.div>
          )}
        </ScanViewport>

        {phase === 'idle' && (
          <motion.button
            onClick={startScan}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-[#22D3EE] text-[#0F172A] rounded-lg font-bold text-sm tracking-wider font-mono hover:bg-[#06b6d4] transition-all flex items-center justify-center gap-2"
          >
            <ScanLine className="w-4 h-4" />
            INITIATE PASSPORT SCAN
          </motion.button>
        )}
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 justify-center py-2 bg-[#022c22] border border-[#10B981]/30 rounded-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span className="text-xs font-mono text-[#10B981] font-bold tracking-wider">
              PASSPORT SCAN COMPLETE — ADVANCING...
            </span>
          </motion.div>
        )}

        {/* Backend status indicator + processing time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {backendStatus === true ? (
              <Wifi className="w-3 h-3 text-[#10B981]" />
            ) : backendStatus === false ? (
              <WifiOff className="w-3 h-3 text-[#f59e0b]" />
            ) : null}
            <span className="text-[9px] font-mono text-[#94A3B8]">
              {backendStatus === true ? 'BACKEND: ONLINE' : backendStatus === false ? 'BACKEND: OFFLINE (MOCK MODE)' : ''}
            </span>
          </div>
          {processingTime && (
            <span className="text-[9px] font-mono text-[#22D3EE]">
              {processingTime.toFixed(1)}ms
            </span>
          )}
        </div>
      </div>

      {/* Right: Extracted Data & Tampering Checks */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-1">
        {/* OCR Extraction Panel */}
        <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#e2e8f0]">
            <div className="w-2 h-2 rounded-full bg-[#22D3EE]"></div>
            <span className="text-[11px] font-mono font-bold text-[#0F172A] tracking-wider">
              OCR DATA EXTRACTION
            </span>
            {extractedFields.length > 0 && (
              <span className="ml-auto text-[10px] font-mono text-[#64748B]">
                {extractedFields.length}/{apiData ? Object.keys(apiData.extracted_fields).length : 8} FIELDS
              </span>
            )}
          </div>
          <div className="p-3">
            {extractedFields.length === 0 && phase === 'idle' && (
              <p className="text-[11px] text-[#94A3B8] font-mono text-center py-4">
                AWAITING DOCUMENT INPUT...
              </p>
            )}
            {phase === 'loading' && (
              <div className="flex items-center justify-center gap-2 py-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-[#22D3EE] border-t-transparent rounded-full"
                />
                <p className="text-[11px] text-[#22D3EE] font-mono animate-pulse">
                  RUNNING OCR ENGINE...
                </p>
              </div>
            )}
            <AnimatePresence>
              {extractedFields.map((field) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between py-1.5 border-b border-[#f1f5f9] last:border-0"
                >
                  <span className="text-[10px] font-mono text-[#64748B] uppercase w-28 flex-shrink-0">
                    {fieldLabels[field.key] || field.key}
                  </span>
                  <span className={`text-[11px] font-mono font-bold text-right ${
                    field.key === 'mrz' ? 'text-[#22D3EE] text-[8px] break-all' : 'text-[#0F172A]'
                  }`}>
                    {field.key === 'mrz' ? field.value.slice(0, 44) + '...' : field.value}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Tampering Analysis Panel */}
        <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#e2e8f0]">
            <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
            <span className="text-[11px] font-mono font-bold text-[#0F172A] tracking-wider">
              TAMPERING ANALYSIS
            </span>
            {apiData?.mrz_valid !== undefined && phase !== 'loading' && (
              <span className={`ml-auto text-[9px] font-mono font-bold ${apiData.mrz_valid ? 'text-[#10B981]' : 'text-[#DC2626]'}`}>
                MRZ: {apiData.mrz_valid ? 'VALID' : 'INVALID'}
              </span>
            )}
          </div>
          <div className="p-3">
            {tamperChecks.length === 0 && (
              <p className="text-[11px] text-[#94A3B8] font-mono text-center py-4">
                {phase === 'idle' ? 'PENDING SCAN...' : phase === 'loading' ? 'AWAITING API RESPONSE...' : 'EXTRACTING DATA...'}
              </p>
            )}
            <AnimatePresence>
              {tamperChecks.map((check, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-2 py-2 border-b border-[#f1f5f9] last:border-0"
                >
                  {check.status === 'pass' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                  ) : check.status === 'fail' ? (
                    <AlertTriangle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-mono font-bold text-[#0F172A]">{check.label}</p>
                      {check.score != null && (
                        <span className="text-[9px] font-mono font-bold text-[#64748B]">{check.score}%</span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-[#64748B]">{check.detail}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
