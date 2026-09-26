import { useState, useEffect } from 'react';
import { Shield, Clock, User, Wifi, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ currentStep }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d) => {
    return d.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (d) => {
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  const steps = ['PASSPORT', 'NATIONAL ID', 'DL', 'FACE MATCH', 'ASSESSMENT'];

  return (
    <header className="bg-[#0F172A] text-white border-b-2 border-[#1e293b]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="w-10 h-10 text-[#22D3EE]" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-[#22D3EE] rounded-full opacity-50"></div>
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] text-white leading-tight">
              SASHASTRA SEEMA BAL (SSB)
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-[#94A3B8] font-medium">
              NATIONAL DOCUMENT SCREENING PORTAL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Operator ID */}
          <div className="flex items-center gap-2 bg-[#1e293b] rounded-lg px-3 py-1.5">
            <User className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="text-[11px] font-mono text-[#94A3B8]">OPR-</span>
            <span className="text-[11px] font-mono text-white font-semibold">SSB-4927</span>
          </div>

          {/* Clock */}
          <div className="flex items-center gap-2 bg-[#1e293b] rounded-lg px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 text-[#22D3EE]" />
            <div className="flex flex-col">
              <span className="text-xs font-mono text-white font-bold tracking-wider">{formatTime(time)}</span>
              <span className="text-[9px] font-mono text-[#64748B] tracking-wider">{formatDate(time)}</span>
            </div>
          </div>

          {/* System Status */}
          <div className="flex items-center gap-2 bg-[#022c22] border border-[#10B981]/30 rounded-lg px-3 py-1.5">
            <div className="relative">
              <Wifi className="w-3.5 h-3.5 text-[#10B981]" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#10B981] rounded-full step-ping"></div>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#10B981] glow-green tracking-wider">
              SYSTEM ON-GRID
            </span>
          </div>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center justify-center gap-1 px-6 py-2 bg-[#0c1322] border-t border-[#1e293b]">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <motion.div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono border-2 transition-all duration-300 ${
                  i < currentStep
                    ? 'bg-[#10B981] border-[#10B981] text-white'
                    : i === currentStep
                    ? 'bg-[#22D3EE] border-[#22D3EE] text-[#0F172A]'
                    : 'bg-transparent border-[#334155] text-[#475569]'
                }`}
                animate={i === currentStep ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {i < currentStep ? '✓' : i + 1}
              </motion.div>
              <span className={`text-[10px] font-mono font-semibold tracking-wider ${
                i <= currentStep ? 'text-white' : 'text-[#475569]'
              }`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className={`w-3.5 h-3.5 mx-2 ${
                i < currentStep ? 'text-[#10B981]' : 'text-[#334155]'
              }`} />
            )}
          </div>
        ))}
      </div>
    </header>
  );
}
