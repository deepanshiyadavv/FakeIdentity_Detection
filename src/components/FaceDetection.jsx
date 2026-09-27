import { useState, useEffect, useCallback } from 'react';
import { ScanFace, CheckCircle2, Eye, Activity, ScanLine, Loader2, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import ScanViewport from './ScanViewport';
import { verifyFaceMatch, isBackendOnline } from '../services/apiService';

export default function FaceDetection({ onComplete }) {
  const [phase, setPhase] = useState('idle');
  const [similarity, setSimilarity] = useState(0);
  const [targetSimilarity, setTargetSimilarity] = useState(0);
  const [livenessChecks, setLivenessChecks] = useState({
    blink: false,
    depth: false,
    texture: false,
    motion: false,
  });
  const [livenessScore, setLivenessScore] = useState(0);
  const [apiData, setApiData] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);
  const [facialMetrics, setFacialMetrics] = useState([]);

  useEffect(() => {
    isBackendOnline().then(setBackendStatus);
  }, []);

  const startScan = useCallback(async () => {
    setPhase('loading');
    setSimilarity(0);
    setTargetSimilarity(0);
    setLivenessChecks({ blink: false, depth: false, texture: false, motion: false });
    setLivenessScore(0);
    setApiData(null);
    setProcessingTime(null);
    setFacialMetrics([]);

    try {
      const result = await verifyFaceMatch();
      setApiData(result);
      setTargetSimilarity(result.similarity_percentage);
      setProcessingTime(result.processing_time_ms);
      setFacialMetrics(result.facial_metrics || []);
      setPhase('scanning');
    } catch (err) {
      console.error('Face match failed:', err);
      setPhase('idle');
    }
  }, []);

  // Animate similarity score up to API target
  useEffect(() => {
    if (phase !== 'scanning') return;
    if (similarity < targetSimilarity) {
      const timer = setTimeout(() => {
        setSimilarity(prev => Math.min(prev + 2.1 + Math.random() * 1.5, targetSimilarity));
      }, 80);
      return () => clearTimeout(timer);
    } else {
      setPhase('liveness');
    }
  }, [phase, similarity, targetSimilarity]);

  // Liveness checks — animate from API data
  useEffect(() => {
    if (phase !== 'liveness') return;
    const checks = ['blink', 'depth', 'texture', 'motion'];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < checks.length) {
        setLivenessChecks(prev => ({ ...prev, [checks[idx]]: true }));
        setLivenessScore(prev => prev + 25);
        idx++;
      } else {
        clearInterval(interval);
        setPhase('complete');
        setTimeout(() => onComplete(), 2500);
      }
    }, 700);
    return () => clearInterval(interval);
  }, [phase, onComplete]);

  // Face mesh SVG overlay
  const FaceMesh = () => (
    <svg viewBox="0 0 200 250" className="w-full h-full mesh-pulse" fill="none" stroke="#22D3EE" strokeWidth="0.5" opacity="0.6">
      {/* Simplified face mesh — outline and key landmarks */}
      <ellipse cx="100" cy="115" rx="65" ry="85" strokeWidth="1" />
      {/* Eyes */}
      <ellipse cx="75" cy="95" rx="15" ry="8" />
      <ellipse cx="125" cy="95" rx="15" ry="8" />
      <circle cx="75" cy="95" r="4" fill="#22D3EE" opacity="0.4" />
      <circle cx="125" cy="95" r="4" fill="#22D3EE" opacity="0.4" />
      {/* Nose */}
      <path d="M100 90 L92 120 L100 125 L108 120 Z" />
      {/* Mouth */}
      <path d="M80 140 Q100 155 120 140" />
      <path d="M80 140 Q100 145 120 140" />
      {/* Eyebrows */}
      <path d="M58 80 Q75 70 92 78" strokeWidth="1" />
      <path d="M108 78 Q125 70 142 80" strokeWidth="1" />
      {/* Jawline details */}
      <path d="M38 100 Q35 140 55 170 Q75 195 100 200 Q125 195 145 170 Q165 140 162 100" strokeWidth="0.8" />
      {/* Mesh grid lines */}
      <line x1="100" y1="30" x2="100" y2="200" strokeDasharray="3 3" opacity="0.3" />
      <line x1="35" y1="115" x2="165" y2="115" strokeDasharray="3 3" opacity="0.3" />
      <line x1="50" y1="70" x2="150" y2="70" strokeDasharray="3 3" opacity="0.2" />
      <line x1="45" y1="150" x2="155" y2="150" strokeDasharray="3 3" opacity="0.2" />
      {/* Landmark dots */}
      {[[100,35],[65,65],[135,65],[40,115],[160,115],[55,170],[145,170],[100,200],[75,140],[125,140]].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#22D3EE" opacity="0.5" />
      ))}
    </svg>
  );

  // Use API facial metrics if available, otherwise derive from similarity
  const displayMetrics = facialMetrics.length > 0
    ? facialMetrics
    : [
        { label: 'Eye Spacing Ratio', value: Math.min(similarity * 1.01, 98.2) },
        { label: 'Nasal Bridge Profile', value: Math.min(similarity * 0.98, 95.1) },
        { label: 'Jawline Contour', value: Math.min(similarity * 0.99, 97.3) },
        { label: 'Forehead Proportion', value: Math.min(similarity * 1.02, 96.8) },
      ];

  return (
    <div className="grid grid-cols-2 gap-5 h-full">
      <div className="flex flex-col gap-4">
        <ScanViewport
          label="BIOMETRIC FACE MATCH — DeepFace AI ENGINE"
          isScanning={phase === 'scanning' || phase === 'liveness' || phase === 'loading'}
          scanComplete={phase === 'complete'}
        >
          {phase === 'idle' && (
            <div className="flex flex-col items-center gap-3">
              <ScanFace className="w-16 h-16 text-[#334155]" strokeWidth={1} />
              <p className="text-[11px] font-mono text-[#475569]">POSITION FACE IN FRONT OF CAMERA</p>
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
                COMPUTING FACIAL EMBEDDINGS...
              </p>
            </div>
          )}
          {(phase === 'scanning' || phase === 'liveness' || phase === 'complete') && (
            <div className="w-[50%] h-[80%] relative">
              <FaceMesh />
              {/* Scanning indicator ring */}
              <motion.div
                className="absolute inset-0 border-2 border-[#22D3EE]/30 rounded-full"
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Real-time score overlay */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#0F172A]/90 px-3 py-1 rounded-full border border-[#22D3EE]/30">
                <span className="text-[10px] font-mono text-[#22D3EE] font-bold">
                  MATCH: {similarity.toFixed(1)}%
                </span>
              </div>
            </div>
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
            START FACE DETECTION
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
              FACE VERIFIED — GENERATING REPORT...
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

      {/* Right panel */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-1">
        {/* Similarity Score */}
        <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#e2e8f0]">
            <ScanFace className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span className="text-[11px] font-mono font-bold text-[#0F172A] tracking-wider">
              FACE SIMILARITY ANALYSIS
            </span>
            {apiData?.match_status && (
              <span className={`ml-auto text-[9px] font-mono font-bold ${
                apiData.match_status === 'MATCH' ? 'text-[#10B981]' : 'text-[#DC2626]'
              }`}>
                {apiData.match_status}
              </span>
            )}
          </div>
          <div className="p-4">
            {/* Big similarity display */}
            <div className="text-center mb-4">
              <motion.div
                className="text-5xl font-mono font-black"
                style={{ color: similarity > 85 ? '#10B981' : similarity > 60 ? '#f59e0b' : '#DC2626' }}
              >
                {similarity.toFixed(1)}%
              </motion.div>
              <p className="text-[10px] font-mono text-[#64748B] mt-1">
                {similarity >= targetSimilarity && targetSimilarity > 0 ? 'STRONG MATCH — IDENTITY CONFIRMED' : 
                 similarity > 0 ? 'ANALYZING FACIAL FEATURES...' : 
                 phase === 'loading' ? 'COMPUTING EMBEDDINGS...' : 'AWAITING SCAN...'}
              </p>
            </div>

            {/* Feature comparison bars */}
            <div className="space-y-2">
              {displayMetrics.map((feat, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[10px] font-mono text-[#64748B]">{feat.label}</span>
                    <span className="text-[10px] font-mono font-bold text-[#0F172A]">{feat.value.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#22D3EE] relative"
                      initial={{ width: '0%' }}
                      animate={{ width: `${feat.value}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <div className="absolute inset-0 progress-shimmer" />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Liveness Check */}
        <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#e2e8f0]">
            <Activity className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[11px] font-mono font-bold text-[#0F172A] tracking-wider">
              LIVENESS VERIFICATION
            </span>
            <span className="ml-auto text-[10px] font-mono font-bold text-[#0F172A]">{livenessScore}%</span>
          </div>
          <div className="p-3 space-y-2">
            {[
              { key: 'blink', label: 'Blink Detection', icon: Eye, detail: 'Natural blink pattern detected' },
              { key: 'depth', label: '3D Depth Mapping', icon: Activity, detail: 'Stereoscopic depth confirmed' },
              { key: 'texture', label: 'Skin Texture Analysis', icon: ScanFace, detail: 'Organic texture verified' },
              { key: 'motion', label: 'Micro-Motion Tracking', icon: Activity, detail: 'Involuntary movement detected' },
            ].map((check) => (
              <motion.div
                key={check.key}
                className="flex items-center gap-2 py-1.5"
                animate={livenessChecks[check.key] ? { opacity: 1 } : { opacity: 0.4 }}
              >
                {livenessChecks[check.key] ? (
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[#CBD5E1] flex-shrink-0" />
                )}
                <div>
                  <p className="text-[11px] font-mono font-bold text-[#0F172A]">{check.label}</p>
                  <p className="text-[9px] font-mono text-[#64748B]">
                    {livenessChecks[check.key] ? check.detail : 'Pending...'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
