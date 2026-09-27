import { useState, useEffect, useCallback } from 'react';
import { CreditCard, CheckCircle2, XCircle, Database, ScanLine, Loader2, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScanViewport from './ScanViewport';
import { scanNationalId, isBackendOnline } from '../services/apiService';

export default function NationalIdScan({ onComplete }) {
  const [phase, setPhase] = useState('idle');
  const [extractedFields, setExtractedFields] = useState([]);
  const [dbChecks, setDbChecks] = useState([]);
  const [fieldIndex, setFieldIndex] = useState(0);
  const [dbIndex, setDbIndex] = useState(0);
  const [apiData, setApiData] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);

  useEffect(() => {
    isBackendOnline().then(setBackendStatus);
  }, []);

  const startScan = useCallback(async () => {
    setPhase('loading');
    setExtractedFields([]);
    setDbChecks([]);
    setFieldIndex(0);
    setDbIndex(0);
    setApiData(null);
    setProcessingTime(null);

    try {
      const result = await scanNationalId();
      setApiData(result);
      setProcessingTime(result.processing_time_ms);
      setPhase('scanning');
    } catch (err) {
      console.error('National ID scan failed:', err);
      setPhase('idle');
    }
  }, []);

  // Animate field extraction
  useEffect(() => {
    if (phase !== 'scanning' || !apiData) return;
    const fields = Object.entries(apiData.extracted_fields);
    if (fieldIndex < fields.length) {
      const timer = setTimeout(() => {
        setExtractedFields(prev => [...prev, { key: fields[fieldIndex][0], value: fields[fieldIndex][1] }]);
        setFieldIndex(prev => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setPhase('verifying');
    }
  }, [phase, fieldIndex, apiData]);

  // Animate DB checks
  useEffect(() => {
    if (phase !== 'verifying' || !apiData) return;
    const checks = apiData.database_checks;
    if (dbIndex < checks.length) {
      const timer = setTimeout(() => {
        setDbChecks(prev => [...prev, checks[dbIndex]]);
        setDbIndex(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPhase('complete');
      setTimeout(() => onComplete(), 2000);
    }
  }, [phase, dbIndex, onComplete, apiData]);

  const fieldLabels = {
    name: 'Full Name',
    idType: 'ID Type',
    idNumber: 'ID Number',
    dob: 'Date of Birth',
    address: 'Address',
    gender: 'Gender',
    issueDate: 'Issue Date',
  };

  const idDisplayData = apiData?.extracted_fields || {};

  return (
    <div className="grid grid-cols-2 gap-5 h-full">
      <div className="flex flex-col gap-4">
        <ScanViewport
          label="NATIONAL ID SCANNER — UID / EPIC COMPATIBLE"
          isScanning={phase === 'scanning' || phase === 'loading'}
          scanComplete={phase === 'complete' || phase === 'verifying'}
        >
          {phase === 'idle' && (
            <div className="flex flex-col items-center gap-3">
              <CreditCard className="w-16 h-16 text-[#334155]" strokeWidth={1} />
              <p className="text-[11px] font-mono text-[#475569]">PLACE NATIONAL ID ON SCANNER</p>
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
                QUERYING UID DATABASE...
              </p>
            </div>
          )}
          {(phase === 'scanning' || phase === 'verifying' || phase === 'complete') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-[75%] h-[65%] rounded-lg border border-[#22D3EE]/30 bg-gradient-to-br from-[#0F172A] to-[#1a2744] p-4 relative"
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-16 rounded bg-[#1e293b] border border-[#334155] flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-7 h-7 text-[#22D3EE]/40" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-mono text-[#22D3EE]/70">भारत सरकार | GOVT. OF INDIA</p>
                  <p className="text-[10px] font-mono text-[#94A3B8] font-bold mt-0.5">{idDisplayData.name}</p>
                  <p className="text-[9px] font-mono text-[#475569] mt-0.5">{idDisplayData.idNumber}</p>
                  <p className="text-[8px] font-mono text-[#475569] mt-1 truncate">{idDisplayData.address}</p>
                </div>
              </div>
              <div className="absolute bottom-2 right-2">
                <div className="w-10 h-10 rounded border border-[#334155] bg-[#0a0f1a] flex items-center justify-center">
                  <div className="w-6 h-6 bg-[#1e293b] rounded-sm"></div>
                </div>
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
            INITIATE NATIONAL ID SCAN
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
              NATIONAL ID VERIFIED — ADVANCING...
            </span>
          </motion.div>
        )}

        {/* Status bar */}
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

      <div className="flex flex-col gap-4 overflow-y-auto pr-1">
        {/* Extracted Fields */}
        <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#e2e8f0]">
            <div className="w-2 h-2 rounded-full bg-[#22D3EE]"></div>
            <span className="text-[11px] font-mono font-bold text-[#0F172A] tracking-wider">
              OCR DATA EXTRACTION
            </span>
            {extractedFields.length > 0 && (
              <span className="ml-auto text-[10px] font-mono text-[#64748B]">
                {extractedFields.length}/{apiData ? Object.keys(apiData.extracted_fields).length : 7} FIELDS
              </span>
            )}
          </div>
          <div className="p-3">
            {extractedFields.length === 0 && phase === 'idle' && (
              <p className="text-[11px] text-[#94A3B8] font-mono text-center py-4">AWAITING DOCUMENT INPUT...</p>
            )}
            {phase === 'loading' && (
              <div className="flex items-center justify-center gap-2 py-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-[#22D3EE] border-t-transparent rounded-full"
                />
                <p className="text-[11px] text-[#22D3EE] font-mono animate-pulse">RUNNING OCR ENGINE...</p>
              </div>
            )}
            <AnimatePresence>
              {extractedFields.map((field) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between py-1.5 border-b border-[#f1f5f9] last:border-0"
                >
                  <span className="text-[10px] font-mono text-[#64748B] uppercase w-24 flex-shrink-0">
                    {fieldLabels[field.key] || field.key}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#0F172A] text-right">
                    {field.value}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Database Verification Panel */}
        <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#e2e8f0]">
            <Database className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span className="text-[11px] font-mono font-bold text-[#0F172A] tracking-wider">
              DATABASE CROSS-VERIFICATION
            </span>
            {apiData && phase !== 'loading' && phase !== 'scanning' && (
              <span className={`ml-auto text-[9px] font-mono font-bold ${
                apiData.verification_status === 'CLEAR' ? 'text-[#10B981]' : 'text-[#DC2626]'
              }`}>
                {apiData.verification_status}
              </span>
            )}
          </div>
          <div className="p-3">
            {dbChecks.length === 0 && (
              <div className="flex items-center justify-center gap-2 py-4">
                {(phase === 'scanning' || phase === 'loading') && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-[#22D3EE] border-t-transparent rounded-full"
                  />
                )}
                <p className="text-[11px] text-[#94A3B8] font-mono">
                  {phase === 'idle' ? 'PENDING SCAN...' : 'QUERYING DATABASES...'}
                </p>
              </div>
            )}
            <AnimatePresence>
              {dbChecks.map((check, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 py-2 border-b border-[#f1f5f9] last:border-0"
                >
                  {check.status === 'clear' || check.status === 'pass' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
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
