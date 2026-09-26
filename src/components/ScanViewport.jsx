import { useRef, useEffect, useState } from 'react';
import { Camera, Maximize2, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScanViewport({ label, isScanning, scanComplete, children }) {
  const [showLaser, setShowLaser] = useState(false);

  useEffect(() => {
    if (isScanning) {
      setShowLaser(true);
    } else {
      setShowLaser(false);
    }
  }, [isScanning]);

  return (
    <div className="relative bg-[#0a0f1a] rounded-xl overflow-hidden border border-[#1e293b]">
      {/* Camera header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0F172A] border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#22D3EE]" />
          <span className="text-[11px] font-mono font-bold text-[#94A3B8] tracking-wider">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 ${isScanning ? '' : ''}`}>
            <div className={`w-2 h-2 rounded-full ${
              scanComplete ? 'bg-[#10B981]' : isScanning ? 'bg-[#f59e0b] animate-pulse' : 'bg-[#ef4444]'
            }`}></div>
            <span className="text-[10px] font-mono text-[#64748B]">
              {scanComplete ? 'CAPTURED' : isScanning ? 'SCANNING' : 'STANDBY'}
            </span>
          </div>
          <Maximize2 className="w-3.5 h-3.5 text-[#475569]" />
        </div>
      </div>

      {/* Camera viewport area */}
      <div className="relative aspect-video bg-gradient-to-br from-[#0a0f1a] to-[#111827] camera-grid">
        {/* Corner brackets */}
        <div className="corner-bracket tl"></div>
        <div className="corner-bracket tr"></div>
        <div className="corner-bracket bl"></div>
        <div className="corner-bracket br"></div>

        {/* Center crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Crosshair className={`w-16 h-16 transition-colors duration-300 ${
            isScanning ? 'text-[#22D3EE]/30' : 'text-[#1e293b]'
          }`} strokeWidth={0.5} />
        </div>

        {/* Scanning laser line */}
        {showLaser && (
          <motion.div
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent scan-laser z-10"
            style={{ boxShadow: '0 0 15px rgba(34,211,238,0.6), 0 0 30px rgba(34,211,238,0.3)' }}
          />
        )}

        {/* Document placeholder / content area */}
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>

        {/* Timestamp overlay */}
        <div className="absolute bottom-2 left-3 text-[9px] font-mono text-[#475569]">
          CAM-01 // {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
        </div>
        <div className="absolute bottom-2 right-3 text-[9px] font-mono text-[#475569]">
          1920×1080 @ 30FPS
        </div>
      </div>
    </div>
  );
}
