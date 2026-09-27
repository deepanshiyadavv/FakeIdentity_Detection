import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Eye, EyeOff, ShieldAlert, Terminal, ShieldCheck, CheckCircle2, Lock, User, Plane } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [officerId, setOfficerId] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [isScanningBiometric, setIsScanningBiometric] = useState(false);
  const [isBiometricVerified, setIsBiometricVerified] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Blinking cursor effect
  useEffect(() => {
    const blink = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(blink);
  }, []);

  const handleBiometricScan = () => {
    if (isScanningBiometric || isBiometricVerified || isAuthenticating) return;
    setError('');
    setIsScanningBiometric(true);
    setTimeout(() => {
      setIsScanningBiometric(false);
      setIsBiometricVerified(true);
    }, 2000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!officerId || !encryptionKey) {
      setError('ENTER OFFICER ID (OFF-224) & ENCRYPTION KEY (Delta224)');
      return;
    }
    if (officerId !== 'OFF-224' || encryptionKey !== 'Delta224') {
      setError('INVALID CREDENTIALS // ENTER OFF-224 & Delta224');
      return;
    }
    if (!isBiometricVerified) {
      setError('BIOMETRIC HASH NOT VERIFIED // CLICK FINGERPRINT SCANNER');
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => { onLogin(); }, 1200);
  };

  const bootLogs = [
    '> INIT SECURE KERNEL v9.2.1',
    '> LOADING CRYPTOGRAPHIC MODULES... [OK]',
    '> ESTABLISHING UPLINK TO COMMAND... [OK]',
    '> VERIFYING INTEGRITY SIGNATURES... [OK]',
    '> SYSTEM READY. WAITING FOR AUTH...',
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden font-mono select-none"
      style={{ background: 'linear-gradient(135deg, #dfe6ec 0%, #eaeff2 40%, #e2e8ee 100%)' }}
    >
      {/* ── Background Airplane Animation ── */}
      <style>{`
        @keyframes flightPath {
          from {
            transform: translate(-10vw, 110vh);
          }
          to {
            transform: translate(110vw, -10vh);
          }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute"
          style={{
            animation: 'flightPath 18s linear infinite',
            opacity: 0.2,
            color: '#10B981',
          }}
        >
          <div className="relative flex items-center justify-center">
            {/* Trail */}
            <svg
              className="absolute pointer-events-none"
              style={{
                width: '400px',
                height: '400px',
                top: '50%',
                left: '50%',
                transform: 'translate(-100%, 0)', // Positions trail behind the plane
                overflow: 'visible',
              }}
            >
              <line
                x1="0"
                y1="400"
                x2="400"
                y2="0"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
            </svg>
            {/* Plane Icon */}
            <Plane className="w-16 h-16 relative z-10" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* ── Top-left info ── */}
      <div className="absolute top-5 left-6 text-xs tracking-widest font-bold hidden md:block z-20">
        <p className="text-[#334155]">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#10B981] mr-1.5 align-middle" />
          BORDER-NODE-78 // SECURE
        </p>
      </div>

      {/* ── Top-right info ── */}
      <div className="absolute top-5 right-6 text-right text-xs tracking-widest font-bold hidden md:block z-20">
        <p className="text-[#0F172A]">
          {currentTime.toLocaleTimeString('en-US', { hour12: false })}
        </p>
        <p className="text-[#475569]">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#10B981] mr-1 align-middle" />
          UPTIME: ONLINE
        </p>
        <p className="text-[#475569]">TLS 1.3 // AES-256-GCM</p>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN CARD – Full-height vertical glassmorphism panel
         ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[600px] flex flex-col items-center z-10 px-4"
        style={{
          minHeight: 'calc(100vh - 64px)',
          margin: '32px 0',
        }}
      >
        {/* Glassmorphism card inner container */}
        <div
          className="relative w-full flex-1 flex flex-col items-center rounded-2xl border border-white/60 overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow:
              '0 8px 60px rgba(16, 185, 129, 0.08), 0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#10B981]" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#10B981]" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#10B981]" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#10B981]" />

          {/* ─── Content wrapper with justified spacing ─── */}
          <div className="w-full flex-1 flex flex-col items-center justify-between px-8 md:px-16 py-10 md:py-14">

            {/* ═══ TOP SECTION: Shield + Title + Status ═══ */}
            <div className="flex flex-col items-center w-full">
              {/* Shield icon */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 border border-[#10B981]/50"
                style={{
                  background: 'rgba(236, 253, 245, 0.7)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 12px rgba(16, 185, 129, 0.15)',
                }}
              >
                <ShieldCheck className="w-8 h-8 text-[#10B981]" strokeWidth={1.8} />
              </div>

              {/* Title */}
              <h1
                className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-[0.18em] text-center"
                style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" }}
              >
                ALPHA METRICS
              </h1>

              {/* Subtitle */}
              <p className="text-xs md:text-sm text-[#475569] font-semibold tracking-[0.22em] text-center mt-3 uppercase">
                BORDER SECURITY IDENTITY SCREENING SYSTEM
              </p>

              {/* Status line with blinking cursor */}
              <div className="mt-5 mb-2">
                <span
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold tracking-wider rounded-md border"
                  style={{
                    color: '#059669',
                    background: 'rgba(236, 253, 245, 0.6)',
                    borderColor: 'rgba(167, 243, 208, 0.7)',
                  }}
                >
                  &gt; {isAuthenticating
                    ? 'AUTHENTICATING_UPLINK...'
                    : isBiometricVerified
                      ? 'CREDENTIALS_&_BIOMETRIC_READY'
                      : 'AWAITING_AUTHORIZED_CREDENTIALS_'}
                  <span
                    className="inline-block w-[7px] h-[16px] ml-0.5"
                    style={{
                      backgroundColor: cursorVisible ? '#059669' : 'transparent',
                      transition: 'background-color 0.08s',
                    }}
                  />
                </span>
              </div>
            </div>

            {/* ═══ MIDDLE SECTION: Form fields ═══ */}
            <form onSubmit={handleLogin} className="w-full flex flex-col items-center gap-6 mt-6 mb-2 flex-1 justify-center max-w-[460px]">

              {/* Officer ID */}
              <div className="w-full">
                <label className="flex items-center gap-2 text-sm font-bold text-[#1E293B] mb-2 tracking-widest uppercase">
                  <User className="w-4 h-4 text-[#10B981]" />
                  OFFICER_ID_CODE
                </label>
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="> e.g. OFF-224"
                  disabled={isAuthenticating}
                  className="w-full rounded-lg px-5 py-3.5 text-base font-mono text-[#0F172A] border border-[#CBD5E1]/80 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/30 transition-all placeholder:text-[#64748B]"
                  style={{
                    background: 'rgba(241, 245, 249, 0.6)',
                    backdropFilter: 'blur(4px)',
                  }}
                />
              </div>

              {/* Encryption Key */}
              <div className="w-full">
                <label className="flex items-center gap-2 text-sm font-bold text-[#1E293B] mb-2 tracking-widest uppercase">
                  <Lock className="w-4 h-4 text-[#10B981]" />
                  ENCRYPTION_KEY
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={encryptionKey}
                    onChange={(e) => setEncryptionKey(e.target.value)}
                    placeholder="> ••••••••"
                    disabled={isAuthenticating}
                    className="w-full rounded-lg pl-5 pr-12 py-3.5 text-base font-mono text-[#0F172A] border border-[#CBD5E1]/80 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/30 transition-all placeholder:text-[#64748B]"
                    style={{
                      background: 'rgba(241, 245, 249, 0.6)',
                      backdropFilter: 'blur(4px)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] transition-colors"
                    disabled={isAuthenticating}
                  >
                    {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="w-full flex items-center gap-2.5 text-[#DC2626] p-3 rounded-lg border border-[#FECACA] text-xs font-bold tracking-wider"
                    style={{ background: 'rgba(254, 242, 242, 0.75)' }}
                  >
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Biometric Scanner ─── */}
              <div className="flex flex-col items-center pt-2">
                <button
                  type="button"
                  onClick={handleBiometricScan}
                  disabled={isScanningBiometric || isBiometricVerified || isAuthenticating}
                  className={`
                    w-36 h-36 rounded-xl relative flex items-center justify-center
                    cursor-pointer transition-all duration-300 group border-2
                    ${isBiometricVerified
                      ? 'border-[#10B981]'
                      : isScanningBiometric
                        ? 'border-[#10B981] animate-pulse'
                        : 'border-[#CBD5E1]/70 hover:border-[#10B981]'
                    }
                  `}
                  style={{
                    background: isBiometricVerified
                      ? 'rgba(236, 253, 245, 0.5)'
                      : 'rgba(248, 250, 252, 0.5)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: isBiometricVerified
                      ? '0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 15px rgba(16, 185, 129, 0.05)'
                      : '0 2px 12px rgba(0,0,0,0.04)',
                  }}
                  title="Click to scan fingerprint"
                >
                  {/* Corner brackets */}
                  <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#10B981]" />
                  <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#10B981]" />
                  <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#10B981]" />
                  <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#10B981]" />

                  <div className="relative flex items-center justify-center">
                    <Fingerprint
                      className={`w-20 h-20 transition-all duration-300 ${
                        isBiometricVerified
                          ? 'text-[#10B981]'
                          : isScanningBiometric
                            ? 'text-[#10B981]'
                            : 'text-[#94A3B8] group-hover:text-[#10B981]'
                      }`}
                      strokeWidth={1.2}
                      style={isBiometricVerified ? { filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.5))' } : {}}
                    />
                    {isBiometricVerified && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-md"
                      >
                        <CheckCircle2 className="w-6 h-6 text-[#10B981] fill-[#ECFDF5]" />
                      </motion.div>
                    )}
                  </div>

                  {/* Scanning laser */}
                  {isScanningBiometric && (
                    <motion.div
                      animate={{ top: ['8%', '88%', '8%'] }}
                      transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-2 right-2 h-0.5 bg-[#10B981] rounded-full"
                      style={{ boxShadow: '0 0 10px #10B981, 0 0 4px #10B981' }}
                    />
                  )}
                </button>

                {/* Biometric label */}
                <button
                  type="button"
                  onClick={handleBiometricScan}
                  disabled={isScanningBiometric || isBiometricVerified || isAuthenticating}
                  className="mt-4 focus:outline-none"
                >
                  {isScanningBiometric ? (
                    <p className="text-xs font-bold text-[#10B981] tracking-widest uppercase animate-pulse">
                      ⚡ SCANNING BIOMETRIC HASH...
                    </p>
                  ) : isBiometricVerified ? (
                    <p className="text-xs font-bold text-[#059669] tracking-widest uppercase flex items-center gap-1.5">
                      ✓ BIOMETRIC HASH VERIFIED
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-[#475569] hover:text-[#10B981] tracking-widest uppercase transition-colors flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-sm border border-[#94A3B8] mr-0.5" />
                      AWAITING BIOMETRIC HASH
                    </p>
                  )}
                </button>
              </div>

              {/* ─── Submit Button ─── */}
              <div className="w-full pt-2">
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-4 rounded-xl text-base font-bold tracking-[0.22em] transition-all disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
                  style={{
                    background: isAuthenticating
                      ? '#059669'
                      : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.35)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isAuthenticating) e.currentTarget.style.boxShadow = '0 6px 28px rgba(16, 185, 129, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.35)';
                  }}
                >
                  {isAuthenticating ? (
                    <span className="animate-pulse">AUTHENTICATING & DECRYPTING UPLINK...</span>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>INITIALIZE SECURE UPLINK</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-[#64748B] font-medium mt-4 tracking-wider uppercase">
                  HINT: ID = OFF-224  •  KEY = Delta224  •  SCAN FINGERPRINT
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>

      {/* ── Bottom-left: Boot log ── */}
      <div className="absolute bottom-14 left-6 w-72 hidden md:block z-20">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#10B981]" />
          <Terminal className="w-3.5 h-3.5 text-[#0F172A]" />
          <span className="text-xs font-bold text-[#0F172A] tracking-wider">
            SYSTEM BOOT LOG // SECURE CHANNEL
          </span>
        </div>
        <div
          className="rounded-lg p-3 text-xs space-y-1 border border-[#CBD5E1]/50"
          style={{
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(12px)',
            color: '#475569',
          }}
        >
          {bootLogs.map((log, i) => (
            <p key={i} className="font-mono leading-relaxed">{log}</p>
          ))}
        </div>
      </div>

      {/* ── Bottom footer warning ── */}
      <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none px-4 z-20">
        <p
          className="text-xs md:text-sm font-bold text-[#DC2626] tracking-[0.12em] inline-block px-5 py-2 rounded-full border border-[#FECACA]/70"
          style={{ background: 'rgba(254, 242, 242, 0.7)', backdropFilter: 'blur(6px)' }}
        >
          &gt; UNAUTHORIZED ACCESS IS A CLASS 3 FEDERAL OFFENSE // LOGGED IP: 192.168.0.12 // ALL ACTIVITY IS MONITORED
        </p>
      </div>
    </div>
  );
}
