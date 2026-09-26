import { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, RotateCcw, Printer,
  FileText, Clock, CheckCircle2, XCircle, Gauge, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BREAKDOWN = [
  { label: 'Document Tampering Score', value: 12, max: 100, color: '#10B981' },
  { label: 'Impersonation Level', value: 3, max: 100, color: '#10B981' },
  { label: 'Expiry Validity', value: 100, max: 100, color: '#10B981', inverted: true },
  { label: 'Database Blacklist Status', value: 0, max: 100, color: '#10B981' },
  { label: 'MRZ Consistency Score', value: 98, max: 100, color: '#10B981', inverted: true },
];

const AUDIT_LOG = [
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
];

export default function ThreatAssessment({ riskMode, onRestart }) {
  const [overallRisk, setOverallRisk] = useState(0);
  const [targetRisk, setTargetRisk] = useState(riskMode === 'high' ? 87 : riskMode === 'medium' ? 48 : 8);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  const breakdownData = riskMode === 'high' ? [
    { label: 'Document Tampering Score', value: 82, max: 100, color: '#DC2626' },
    { label: 'Impersonation Level', value: 91, max: 100, color: '#DC2626' },
    { label: 'Expiry Validity', value: 0, max: 100, color: '#DC2626', inverted: true },
    { label: 'Database Blacklist Status', value: 95, max: 100, color: '#DC2626' },
    { label: 'MRZ Consistency Score', value: 22, max: 100, color: '#DC2626', inverted: true },
  ] : riskMode === 'medium' ? [
    { label: 'Document Tampering Score', value: 38, max: 100, color: '#f59e0b' },
    { label: 'Impersonation Level', value: 25, max: 100, color: '#f59e0b' },
    { label: 'Expiry Validity', value: 60, max: 100, color: '#f59e0b', inverted: true },
    { label: 'Database Blacklist Status', value: 0, max: 100, color: '#10B981' },
    { label: 'MRZ Consistency Score', value: 72, max: 100, color: '#f59e0b', inverted: true },
  ] : BREAKDOWN;

  // Animate risk score
  useEffect(() => {
    if (overallRisk < targetRisk) {
      const timer = setTimeout(() => {
        setOverallRisk(prev => Math.min(prev + 1, targetRisk));
      }, 30);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setShowBreakdown(true), 500);
      setTimeout(() => setShowAudit(true), 1200);
    }
  }, [overallRisk, targetRisk]);

  const getRiskColor = (val) => {
    if (val <= 25) return '#10B981';
    if (val <= 65) return '#f59e0b';
    return '#DC2626';
  };

  const getRiskLabel = (val) => {
    if (val <= 25) return 'LOW RISK — CLEAR';
    if (val <= 65) return 'MEDIUM RISK — MANUAL CHECK';
    return 'HIGH RISK — FAKE / TAMPERED';
  };

  const riskColor = getRiskColor(overallRisk);

  // SVG gauge calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallRisk / 100) * circumference;

  return (
    <div className="grid grid-cols-5 gap-5 h-full">
      {/* Left: Gauge + Status (3 cols) */}
      <div className="col-span-3 flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm p-6 flex-1">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="w-4 h-4 text-[#0F172A]" />
            <span className="text-[11px] font-mono font-bold text-[#0F172A] tracking-wider">
              COMPOSITE THREAT ASSESSMENT
            </span>
          </div>

          <div className="flex items-center gap-8">
            {/* Circular Gauge */}
            <div className="relative flex-shrink-0">
              <svg width="220" height="220" viewBox="0 0 220 220">
                {/* Background circle */}
                <circle
                  cx="110" cy="110" r={radius}
                  stroke="#e2e8f0" strokeWidth="12" fill="none"
                />
                {/* Colored segments guide */}
                <circle
                  cx="110" cy="110" r={radius}
                  stroke={riskColor}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 110 110)"
                  className="gauge-circle"
                  style={{ filter: `drop-shadow(0 0 8px ${riskColor}80)` }}
                />
                {/* Inner decorative ring */}
                <circle
                  cx="110" cy="110" r="70"
                  stroke="#f1f5f9" strokeWidth="1" fill="none"
                />
              </svg>
              {/* Center score */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-5xl font-mono font-black"
                  style={{ color: riskColor }}
                >
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
                {getRiskLabel(overallRisk)}
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
                    const displayVal = item.inverted ? item.value : item.value;
                    const barColor = item.inverted
                      ? (item.value >= 80 ? '#10B981' : item.value >= 40 ? '#f59e0b' : '#DC2626')
                      : (item.value <= 25 ? '#10B981' : item.value <= 60 ? '#f59e0b' : '#DC2626');
                    return (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-mono text-[#64748B]">{item.label}</span>
                          <span className="text-[10px] font-mono font-bold" style={{ color: barColor }}>
                            {displayVal}%
                          </span>
                        </div>
                        <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full relative"
                            style={{ backgroundColor: barColor }}
                            initial={{ width: '0%' }}
                            animate={{ width: `${displayVal}%` }}
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
            {[
              ['Name', 'ARJUN K. SHARMA'],
              ['Passport', 'N8472916'],
              ['Aadhaar', 'XXXX-7842'],
              ['DL', 'DL-0420190184729'],
              ['DOB', '15-MAR-1988'],
              ['Nationality', 'INDIAN'],
              ['Face Match', '96.7%'],
              ['Liveness', '100%'],
            ].map(([k, v], i) => (
              <div key={i} className="flex justify-between py-0.5">
                <span className="text-[9px] font-mono text-[#64748B]">{k}</span>
                <span className="text-[9px] font-mono font-bold text-[#0F172A]">{v}</span>
              </div>
            ))}
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
                  {AUDIT_LOG.length} EVENTS
                </span>
              </div>
              <div className="p-3 overflow-y-auto flex-1 space-y-1">
                {AUDIT_LOG.map((entry, i) => (
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
      </div>
    </div>
  );
}
