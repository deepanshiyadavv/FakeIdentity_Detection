import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, FastForward, SkipForward, ChevronLeft, ChevronRight,
  AlertTriangle, ShieldCheck, HelpCircle
} from 'lucide-react';
import Header from './components/Header';
import PassportScan from './components/PassportScan';
import NationalIdScan from './components/NationalIdScan';
import DrivingLicenseScan from './components/DrivingLicenseScan';
import FaceDetection from './components/FaceDetection';
import ThreatAssessment from './components/ThreatAssessment';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [riskMode, setRiskMode] = useState('low'); // 'low', 'medium', 'high'

  const goToStep = useCallback((step) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  }, [currentStep]);

  const nextStep = useCallback(() => {
    if (currentStep < 4) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const restart = useCallback(() => {
    setDirection(-1);
    setCurrentStep(0);
  }, []);

  const autoRunAll = useCallback(() => {
    setDirection(1);
    setCurrentStep(0);
    // Auto advance through all steps with delays
    setTimeout(() => { setDirection(1); setCurrentStep(1); }, 4500);
    setTimeout(() => { setDirection(1); setCurrentStep(2); }, 9000);
    setTimeout(() => { setDirection(1); setCurrentStep(3); }, 13500);
    setTimeout(() => { setDirection(1); setCurrentStep(4); }, 19000);
  }, []);

  const stepLabels = [
    'PASSPORT SCAN',
    'NATIONAL ID SCAN',
    'DRIVING LICENSE',
    'FACE DETECTION',
    'THREAT ASSESSMENT',
  ];

  return (
    <div className="min-h-screen bg-[#EAEFF2] flex flex-col">
      <Header currentStep={currentStep} />

      {/* Main content area */}
      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Step title + controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#0F172A] text-white px-3 py-1 rounded-md">
              <span className="text-[10px] font-mono font-bold tracking-wider">
                STEP {currentStep + 1} OF 5
              </span>
            </div>
            <h2 className="text-sm font-mono font-bold text-[#0F172A] tracking-wider">
              {stepLabels[currentStep]}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Demo control buttons */}
            <div className="flex items-center gap-1 bg-white rounded-lg border border-[#CBD5E1] p-1 shadow-sm">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="p-1.5 rounded hover:bg-[#f1f5f9] disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-[#0F172A]" />
              </button>
              <button
                onClick={nextStep}
                disabled={currentStep === 4}
                className="p-1.5 rounded hover:bg-[#f1f5f9] disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-[#0F172A]" />
              </button>
              <div className="w-px h-5 bg-[#e2e8f0] mx-1" />
              <button
                onClick={() => goToStep(4)}
                className="p-1.5 rounded hover:bg-[#f1f5f9] transition-all"
                title="Skip to Assessment"
              >
                <SkipForward className="w-4 h-4 text-[#0F172A]" />
              </button>
            </div>

            {/* Risk mode selector - for demo */}
            <div className="flex items-center gap-1 bg-white rounded-lg border border-[#CBD5E1] p-1 shadow-sm">
              <button
                onClick={() => setRiskMode('low')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-all ${
                  riskMode === 'low' ? 'bg-[#10B981] text-white' : 'text-[#64748B] hover:bg-[#f1f5f9]'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                CLEAR
              </button>
              <button
                onClick={() => setRiskMode('medium')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-all ${
                  riskMode === 'medium' ? 'bg-[#f59e0b] text-white' : 'text-[#64748B] hover:bg-[#f1f5f9]'
                }`}
              >
                <HelpCircle className="w-3 h-3" />
                REVIEW
              </button>
              <button
                onClick={() => setRiskMode('high')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-all ${
                  riskMode === 'high' ? 'bg-[#DC2626] text-white' : 'text-[#64748B] hover:bg-[#f1f5f9]'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                DETAIN
              </button>
            </div>
          </div>
        </div>

        {/* Slide container */}
        <div className="flex-1 relative overflow-hidden rounded-xl">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0"
            >
              {currentStep === 0 && <PassportScan onComplete={nextStep} />}
              {currentStep === 1 && <NationalIdScan onComplete={nextStep} />}
              {currentStep === 2 && <DrivingLicenseScan onComplete={nextStep} />}
              {currentStep === 3 && <FaceDetection onComplete={nextStep} />}
              {currentStep === 4 && <ThreatAssessment riskMode={riskMode} onRestart={restart} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#CBD5E1]">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-mono text-[#94A3B8]">
              ENCRYPTION: AES-256 // PROTOCOL: TLS 1.3
            </span>
            <span className="text-[9px] font-mono text-[#94A3B8]">
              SESSION: {Math.random().toString(36).substring(2, 10).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-mono text-[#94A3B8]">
              AI ENGINE v4.2.1 // MODEL: SSB-DOCNET-2026
            </span>
            <span className="text-[9px] font-mono text-[#94A3B8]">
              © 2026 SASHASTRA SEEMA BAL — CLASSIFIED
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
