import { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, RotateCcw, Printer,
  FileText, Clock, CheckCircle2, XCircle, Gauge, Download, Loader2, Wifi, WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateThreat, isBackendOnline } from '../services/apiService';

export default function ThreatAssessment({ riskMode, onRestart }) {
  const [phase, setPhase] = useState('idle'); // idle, loading, complete
  const [overallRisk, setOverallRisk] = useState(0);
  const [targetRisk, setTargetRisk] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  
  const [apiData, setApiData] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);

  useEffect(() => {
    isBackendOnline().then(setBackendStatus);
  }, []);

  // Fetch threat assessment on mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchAssessment = async () => {
      setPhase('loading');
      try {
        const payload = {
          risk_mode: riskMode,
          passport_score: 95.0,
          national_id_status: 'CLEAR',
          dl_verification: 'VERIFIED',
          face_similarity: 96.7,
          liveness_score: 100.0
        };
        const result = await calculateThreat(payload);
        if (!isMounted) return;
        
        setApiData(result);
        setTargetRisk(result.composite_score);
        setProcessingTime(result.processing_time_ms);
        setPhase('complete');
      } catch (err) {
        console.error('Threat assessment failed:', err);
        if (isMounted) setPhase('idle');
      }
    };
    
    fetchAssessment();
    return () => { isMounted = false; };
  }, [riskMode]);

  // Animate risk score once data is loaded
  useEffect(() => {
    if (phase !== 'complete') return;
    
    if (overallRisk < targetRisk) {
      const timer = setTimeout(() => {
        setOverallRisk(prev => Math.min(prev + 1, targetRisk));
      }, 30);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setShowBreakdown(true), 500);
      setTimeout(() => setShowAudit(true), 1200);
    }
  }, [phase, overallRisk, targetRisk]);

  const getRiskColor = (val) => {
    if (val <= 25) return '#10B981';
    if (val <= 65) return '#f59e0b';
    return '#DC2626';
  };

  const riskColor = getRiskColor(overallRisk);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallRisk / 100) * circumference;

  const breakdownData = apiData?.breakdown || [];
  const auditLog = apiData?.audit_trail || [];
  const subjectSummary = apiData?.subject_summary || {};
  const riskLabel = apiData?.risk_classification || 'COMPUTING...';

  return (
    <div className="grid grid-cols-5 gap-5 h-full">
      {/* Left: Gauge + Status (3 cols) */}
      <div className="col-span-3 flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="w-4 h-4 text-[#0F172A]" />
            <span className="text-[11px] font-mono font-bold text-[#0F172A] tracking-wider">
              COMPOSITE THREAT ASSESSMENT
            </span>
          </div>

          {phase === 'loading' ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-12 h-12 text-[#22D3EE] mb-4" />
              </motion.div>
              <p className="text-[11px] font-mono font-bold text-[#64748B] tracking-wider animate-pulse">
                COMPILING THREAT VECTORS...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-8">
                {/* Circular Gauge */}
                <div className="relative flex-shrink-0">
                  <svg width="220" height="220" viewBox="0 0 220 220">
                    <circle cx="110" cy="110" r={radius} stroke="#e2e8f0" strokeWidth="12" fill="none" />
                    <circle
                      cx="110" cy="110" r={radius}
                      stroke={riskColor} strokeWidth="12" fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round" transform="rotate(-90 110 110)"
                      className="gauge-circle"
                      style={{ filter: `drop-shadow(0 0 8px ${riskColor}80)` }}
                    />
                    <circle cx="110" cy="110" r="70" stroke="#f1f5f9" strokeWidth="1" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span className="text-5xl font-mono font-black" style={{ color: riskColor }}>
                      {overallRisk}
                    </motion.span>
                    <span className="text-[10px] font-mono text-[#64748B]">/ 100</span>
                    <span className="text-[9px] font-mono font-bold mt-1 tracking-wider" style={{ color: riskColor }}>
                      RISK SCORE
                    </span>
                  </div>
                </div>

                {/* Risk label & status alert */}
                <div className="flex-1">
                  <p className="text-xs font-mono text-[#64748B] mb-2">RISK CLASSIFICATION</p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`px-4 py-3 rounded-lg border-2 font-mono text-sm font-bold tracking-wider text-center ${
                      overallRisk <= 25
                        ? 'bg-[#022c22] border-[#10B981] text-[#10B981]'
                        : overallRisk <= 65
                        ? 'bg-[#451a03] border-[#f59e0b] text-[#f59e0b]'
                        : 'bg-[#450a0a] border-[#DC2626] text-[#DC2626] glow-red'
                    }`}
                  >
                    {riskLabel}
                  </motion.div>

                  {/* Dynamic status alert */}
                  <AnimatePresence>
                    {overallRisk >= 66 && showBreakdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center gap-2 bg-[#DC2626] text-white px-4 py-2.5 rounded-lg glow-red"
                      >
                        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-mono font-bold tracking-wider">DETAINMENT PROTOCOL TRIGGERED</p>
                          <p className="text-[10px] font-mono opacity-80">Alert dispatched to command center</p>
                        </div>
                      </motion.div>
                    )}
                    {overallRisk <= 25 && showBreakdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center gap-2 bg-[#10B981] text-white px-4 py-2.5 rounded-lg"
                      >
                        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-mono font-bold tracking-wider">IDENTITY VERIFIED — CLEARED</p>
                          <p className="text-[10px] font-mono opacity-80">Subject may proceed</p>
                        </div>
                      </motion.div>
                    )}
                    {overallRisk > 25 && overallRisk <= 65 && showBreakdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center gap-2 bg-[#f59e0b] text-[#0F172A] px-4 py-2.5 rounded-lg"
                      >
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-mono font-bold tracking-wider">MANUAL REVIEW REQUIRED</p>
                          <p className="text-[10px] font-mono opacity-80">Escalate to senior officer</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-4">
                    <motion.button
                      onClick={onRestart}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-[11px] font-mono font-bold tracking-wider hover:bg-[#1e293b] transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      RESTART SCAN
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#e2e8f0] text-[#0F172A] rounded-lg text-[11px] font-mono font-bold tracking-wider hover:bg-[#CBD5E1] transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      EXPORT REPORT
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Breakdown Progress Bars */}
              <AnimatePresence>
                {showBreakdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-4 border-t border-[#e2e8f0]"
                  >
                    <p className="text-[10px] font-mono font-bold text-[#64748B] tracking-wider mb-3">
                      PARAMETER BREAKDOWN
                    </p>
                    <div className="space-y-3">
                      {breakdownData.map((item, i) => {
                        return (
                          <div key={i}>
                            <div className="flex justify-between mb-1">
                              <span className="text-[10px] font-mono text-[#64748B]">{item.label}</span>
                              <span className="text-[10px] font-mono font-bold" style={{ color: item.color }}>
                                {item.value}%
                              </span>
                            </div>
                            <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full relative"
                                style={{ backgroundColor: item.color }}
                                initial={{ width: '0%' }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ duration: 0.8, delay: i * 0.15 }}
                              >
                                <div className="absolute inset-0 progress-shimmer" />
                              </motion.div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* Right: Audit trail (2 cols) */}
      <div className="col-span-2 flex flex-col gap-4">
        {/* Subject Summary Card */}
        <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span className="text-[11px] font-mono font-bold text-[#0F172A] tracking-wider">SUBJECT SUMMARY</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {phase === 'complete' ? (
              [
                ['Name', subjectSummary.name],
                ['Passport', subjectSummary.passport],
                ['Aadhaar', subjectSummary.aadhaar],
                ['DL', subjectSummary.dl],
                ['DOB', subjectSummary.dob],
                ['Nationality', subjectSummary.nationality],
                ['Face Match', subjectSummary.face_match],
                ['Liveness', subjectSummary.liveness],
              ].map(([k, v], i) => (
                <div key={i} className="flex justify-between py-0.5">
                  <span className="text-[9px] font-mono text-[#64748B]">{k}</span>
                  <span className="text-[9px] font-mono font-bold text-[#0F172A]">{v}</span>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center py-4 text-[#94A3B8] text-[10px] font-mono">
                GENERATING SUMMARY...
              </div>
            )}
          </div>
        </div>

        {/* Digital Audit Trail */}
        <AnimatePresence>
          {showAudit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm flex-1 flex flex-col"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#e2e8f0]">
                <Clock className="w-3.5 h-3.5 text-[#0F172A]" />
                <span className="text-[11px] font-mono font-bold text-[#0F172A] tracking-wider">
                  DIGITAL AUDIT TRAIL
                </span>
                <span className="ml-auto text-[9px] font-mono text-[#64748B]">
                  {auditLog.length} EVENTS
                </span>
              </div>
              <div className="p-3 overflow-y-auto flex-1 space-y-1">
                {auditLog.map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2 py-1 border-b border-[#f8fafc] last:border-0"
                  >
                    <span className="text-[8px] font-mono text-[#22D3EE] font-bold flex-shrink-0 w-14">
                      {entry.time}
                    </span>
                    <span className="text-[9px] font-mono text-[#64748B] leading-tight">
                      {entry.event}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Status bar */}
        <div className="flex items-center justify-between px-1">
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
    </div>
  );
}
