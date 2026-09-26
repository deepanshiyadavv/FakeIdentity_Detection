import { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle2, AlertTriangle, Fingerprint, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScanViewport from './ScanViewport';

const PASSPORT_DATA = {
  name: 'ARJUN KUMAR SHARMA',
  passportNo: 'N8472916',
  dob: '15-MAR-1988',
  expiry: '22-JAN-2029',
  nationality: 'INDIAN',
  issuePlace: 'NEW DELHI',
  gender: 'MALE',
  mrz: 'P<INDSHARMA<<ARJUN<KUMAR<<<<<<<<<<<<<<<<<<<<<N84729164IND8803155M2901227<<<<<<<<<<<<<<04',
};

const TAMPERING_CHECKS = [
  { label: 'Photo Replacement Detection', status: 'pass', detail: 'No splicing artifacts detected' },
  { label: 'MRZ Checksum Validation', status: 'pass', detail: 'All check digits valid (MOD 10)' },
  { label: 'Font Consistency Analysis', status: 'pass', detail: 'OCR-B font pattern matched' },
  { label: 'UV Watermark Verification', status: 'pass', detail: 'Ashoka emblem pattern verified' },
  { label: 'Microprint Integrity', status: 'warn', detail: 'Minor degradation — within threshold' },
];

export default function PassportScan({ onComplete }) {
  const [phase, setPhase] = useState('idle');
  const [extractedFields, setExtractedFields] = useState([]);
  const [tamperChecks, setTamperChecks] = useState([]);
  const [fieldIndex, setFieldIndex] = useState(0);
  const [tamperIndex, setTamperIndex] = useState(0);

  const startScan = useCallback(() => {
    setPhase('scanning');
    setExtractedFields([]);
    setTamperChecks([]);
    setFieldIndex(0);
    setTamperIndex(0);
  }, []);

  // Simulate OCR extraction field by field
  useEffect(() => {
    if (phase !== 'scanning') return;
    const fields = Object.entries(PASSPORT_DATA);
    if (fieldIndex < fields.length) {
      const timer = setTimeout(() => {
        setExtractedFields(prev => [...prev, { key: fields[fieldIndex][0], value: fields[fieldIndex][1] }]);
        setFieldIndex(prev => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setPhase('tampering');
    }
  }, [phase, fieldIndex]);

  // Simulate tampering checks
  useEffect(() => {
    if (phase !== 'tampering') return;
    if (tamperIndex < TAMPERING_CHECKS.length) {
      const timer = setTimeout(() => {
        setTamperChecks(prev => [...prev, TAMPERING_CHECKS[tamperIndex]]);
        setTamperIndex(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPhase('complete');
      setTimeout(() => onComplete(), 2000);
    }
  }, [phase, tamperIndex, onComplete]);

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

  return (
    <div className="grid grid-cols-2 gap-5 h-full">
      {/* Left: Camera viewport */}
      <div className="flex flex-col gap-4">
        <ScanViewport
          label="PASSPORT SCANNER — ICAO 9303 COMPLIANT"
          isScanning={phase === 'scanning'}
          scanComplete={phase === 'complete' || phase === 'tampering'}
        >
          {phase === 'idle' && (
            <div className="flex flex-col items-center gap-3">
              <FileText className="w-16 h-16 text-[#334155]" strokeWidth={1} />
              <p className="text-[11px] font-mono text-[#475569]">PLACE PASSPORT ON SCANNER</p>
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
                <p className="text-[11px] font-mono text-[#94A3B8] font-bold mt-0.5">{PASSPORT_DATA.name}</p>
                <p className="text-[9px] font-mono text-[#475569] mt-1">{PASSPORT_DATA.passportNo}</p>
              </div>
              {/* MRZ zone at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#0a0f1a]/80 px-2 py-1 border-t border-[#22D3EE]/20">
                <p className="text-[7px] font-mono text-[#22D3EE]/50 truncate">{PASSPORT_DATA.mrz}</p>
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
            SIMULATE PASSPORT SCAN
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
                {extractedFields.length}/{Object.keys(PASSPORT_DATA).length} FIELDS
              </span>
            )}
          </div>
          <div className="p-3">
            {extractedFields.length === 0 && phase === 'idle' && (
              <p className="text-[11px] text-[#94A3B8] font-mono text-center py-4">
                AWAITING DOCUMENT INPUT...
              </p>
            )}
            <AnimatePresence>
              {extractedFields.map((field, i) => (
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
          </div>
          <div className="p-3">
            {tamperChecks.length === 0 && (
              <p className="text-[11px] text-[#94A3B8] font-mono text-center py-4">
                {phase === 'idle' ? 'PENDING SCAN...' : 'EXTRACTING DATA...'}
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
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-[11px] font-mono font-bold text-[#0F172A]">{check.label}</p>
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
