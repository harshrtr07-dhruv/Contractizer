import React, { useEffect, useRef, useState } from 'react';

// ─── Animated SVG document-scan icon ────────────────────────────────────────
const ScanIcon = ({ pulsing = false }) => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={pulsing ? 'animate-pulse' : ''}
    aria-hidden="true"
  >
    {/* Document body */}
    <rect x="10" y="4" width="36" height="46" rx="2" stroke="var(--color-paper,#FFFFFF)" strokeWidth="2" />
    {/* Folded corner */}
    <path d="M36 4 L46 14 L36 14 Z" stroke="var(--color-paper,#FFFFFF)" strokeWidth="2" strokeLinejoin="round" />
    {/* Text lines */}
    <line x1="17" y1="24" x2="39" y2="24" stroke="var(--color-paper,#FFFFFF)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="17" y1="31" x2="39" y2="31" stroke="var(--color-paper,#FFFFFF)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="17" y1="38" x2="30" y2="38" stroke="var(--color-paper,#FFFFFF)" strokeWidth="1.5" strokeLinecap="round" />
    {/* Upload arrow */}
    <line x1="50" y1="44" x2="50" y2="60" stroke="var(--color-paper,#FFFFFF)" strokeWidth="2" strokeLinecap="round" />
    <polyline points="44,50 50,44 56,50" stroke="var(--color-paper,#FFFFFF)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Scanning beam line (processing state) ───────────────────────────────────
const ScanBeam = () => (
  <div className="absolute inset-x-0 pointer-events-none overflow-hidden" style={{ top: 0, bottom: 0 }}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, var(--color-signal-yellow,#F2E900) 40%, var(--color-clearance-pink,#E63993) 60%, transparent 100%)',
        animation: 'scan-sweep 1.8s ease-in-out infinite',
        boxShadow: '0 0 12px 2px var(--color-signal-yellow,#F2E900)',
      }}
    />
  </div>
);

// ─── Circular radar / progress ring ─────────────────────────────────────────
const RadarRing = ({ progress = 0, spinning = false }) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = spinning ? circ * 0.25 : (progress / 100) * circ;
  const gap = circ - dash;

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
      {/* Track */}
      <circle cx="50" cy="50" r={r} stroke="var(--color-paper,#FFFFFF)" strokeWidth="1.5" fill="none" opacity="0.15" />
      {/* Active arc */}
      <circle
        cx="50"
        cy="50"
        r={r}
        stroke="var(--color-paper,#FFFFFF)"
        strokeWidth="2"
        fill="none"
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={spinning ? { animation: 'spin 1.2s linear infinite', transformOrigin: '50px 50px' } : { transition: 'stroke-dasharray 0.4s ease' }}
      />
      {/* Inner reticle cross */}
      <line x1="50" y1="24" x2="50" y2="30" stroke="var(--color-paper,#FFFFFF)" strokeWidth="1" opacity="0.4" />
      <line x1="50" y1="70" x2="50" y2="76" stroke="var(--color-paper,#FFFFFF)" strokeWidth="1" opacity="0.4" />
      <line x1="24" y1="50" x2="30" y2="50" stroke="var(--color-paper,#FFFFFF)" strokeWidth="1" opacity="0.4" />
      <line x1="70" y1="50" x2="76" y2="50" stroke="var(--color-paper,#FFFFFF)" strokeWidth="1" opacity="0.4" />
    </svg>
  );
};

// ─── Success checkmark ────────────────────────────────────────────────────────
const SuccessMark = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="32" cy="32" r="28" stroke="var(--color-cleared-teal,#4F8F82)" strokeWidth="2" />
    <polyline
      points="18,33 27,42 46,22"
      stroke="var(--color-cleared-teal,#4F8F82)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ strokeDasharray: 40, strokeDashoffset: 0, animation: 'draw-check 0.4s ease forwards' }}
    />
  </svg>
);

// ─── Failed X mark ────────────────────────────────────────────────────────────
const FailMark = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="32" cy="32" r="28" stroke="var(--color-clearance-pink,#E63993)" strokeWidth="2" />
    <line x1="20" y1="20" x2="44" y2="44" stroke="var(--color-clearance-pink,#E63993)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="44" y1="20" x2="20" y2="44" stroke="var(--color-clearance-pink,#E63993)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// ─── Corner brackets (HUD frame decoration) ──────────────────────────────────
const CornerBrackets = ({ active = false }) => {
  const col = active ? 'var(--color-paper,#FFFFFF)' : 'var(--color-paper,#FFFFFF)';
  const op = active ? 1 : 0.25;
  const L = 18;
  const T = 2;
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      {/* TL */}
      <polyline points={`${T+L},${T} ${T},${T} ${T},${T+L}`} stroke={col} strokeWidth="2" fill="none" opacity={op} />
      {/* TR */}
      <polyline points={`calc(100% - ${T+L}),${T} calc(100% - ${T}),${T} calc(100% - ${T}),${T+L}`} stroke={col} strokeWidth="2" fill="none" opacity={op} />
      {/* BL */}
      <polyline points={`${T+L},calc(100% - ${T}) ${T},calc(100% - ${T}) ${T},calc(100% - ${T+L})`} stroke={col} strokeWidth="2" fill="none" opacity={op} />
      {/* BR */}
      <polyline points={`calc(100% - ${T+L}),calc(100% - ${T}) calc(100% - ${T}),calc(100% - ${T}) calc(100% - ${T}),calc(100% - ${T+L})`} stroke={col} strokeWidth="2" fill="none" opacity={op} />
    </svg>
  );
};

// ─── Keyframe injection ───────────────────────────────────────────────────────
const KEYFRAMES = `
@keyframes scan-sweep {
  0%   { top: 8%; opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { top: 92%; opacity: 0; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes draw-check {
  from { stroke-dashoffset: 40; }
  to   { stroke-dashoffset: 0; }
}
@keyframes float-up {
  0%   { transform: translateY(0px);  opacity: 1; }
  60%  { transform: translateY(-14px); opacity: 0.5; }
  100% { transform: translateY(0px);  opacity: 1; }
}
@keyframes blink-caret {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
`;

// ─── Typewriter label ─────────────────────────────────────────────────────────
const TypewriterLabel = ({ text }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(text.slice(0, ++i));
      if (i >= text.length) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [text]);

  return (
    <span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
      {displayed}
      <span style={{ animation: 'blink-caret 0.8s step-end infinite' }}>▮</span>
    </span>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const FlightDeckScene = ({
  status = 'idle',
  progress = 0,
  filename = 'CONTRACT.PDF',
  onDoneHandoff,
  className = '',
}) => {
  // Trigger handoff after success animation settles
  useEffect(() => {
    if (status === 'success' || status === 'done') {
      const t = setTimeout(() => { if (onDoneHandoff) onDoneHandoff(); }, 1800);
      return () => clearTimeout(t);
    }
  }, [status, onDoneHandoff]);

  // ── derive display values ──────────────────────────────────────────────────
  const isIdle       = status === 'idle';
  const isUploading  = status === 'uploading';
  const isProcessing = status === 'processing';
  const isSuccess    = status === 'success' || status === 'done';
  const isFailed     = status === 'failed';

  const statusLabel = {
    idle:       'AWAITING PAYLOAD',
    uploading:  `UPLOADING — ${progress}%`,
    processing: 'ANALYZING CONTRACT...',
    success:    'ANALYSIS COMPLETE',
    done:       'ANALYSIS COMPLETE',
    failed:     'MISSION ABORT',
  }[status] ?? status.toUpperCase();

  const truncatedName = filename.length > 28
    ? filename.slice(0, 26) + '..'
    : filename;

  return (
    <>
      {/* Inject keyframes once */}
      <style>{KEYFRAMES}</style>

      <div
        className={`relative w-full overflow-hidden select-none bg-[#0D1113] border border-[rgba(255,255,255,0.1)] group-hover:border-[rgba(255,255,255,0.3)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.06)] shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-500 ${className}`}
        style={{
          height: '360px',
          borderRadius: '2px',
        }}
      >
        {/* Corner bracket decoration */}
        <CornerBrackets active={!isIdle} />

        {/* Scan beam overlay during processing */}
        {isProcessing && <ScanBeam />}

        {/* ── Centre stage ───────────────────────────────────────────────── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">

          {/* Icon / indicator */}
          <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>

            {/* Radar ring (uploading → progress arc, processing → spinning) */}
            {(isUploading || isProcessing) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <RadarRing progress={progress} spinning={isProcessing} />
              </div>
            )}

            {/* Core icon */}
            <div style={{ animation: isIdle ? 'float-up 3s ease-in-out infinite' : 'none' }}>
              {isIdle       && <ScanIcon />}
              {isUploading  && <ScanIcon pulsing />}
              {isProcessing && (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  {/* CPU / chip icon */}
                  <rect x="12" y="12" width="24" height="24" stroke="var(--color-paper,#FFFFFF)" strokeWidth="2" rx="2" />
                  <rect x="18" y="18" width="12" height="12" fill="var(--color-paper,#FFFFFF)" opacity="0.15" rx="1" />
                  {[14,22,30].map(y => (
                    <React.Fragment key={y}>
                      <line x1="6"  y1={y} x2="12" y2={y} stroke="var(--color-paper,#FFFFFF)" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="36" y1={y} x2="42" y2={y} stroke="var(--color-paper,#FFFFFF)" strokeWidth="1.5" strokeLinecap="round" />
                    </React.Fragment>
                  ))}
                  {[14,22,30].map(x => (
                    <React.Fragment key={x}>
                      <line x1={x} y1="6"  x2={x} y2="12" stroke="var(--color-paper,#FFFFFF)" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1={x} y1="36" x2={x} y2="42" stroke="var(--color-paper,#FFFFFF)" strokeWidth="1.5" strokeLinecap="round" />
                    </React.Fragment>
                  ))}
                </svg>
              )}
              {isSuccess    && <SuccessMark />}
              {isFailed     && <FailMark />}
            </div>
          </div>

          {/* Upload progress bar */}
          {isUploading && (
            <div style={{ width: 260 }}>
              <div
                style={{
                  height: '3px',
                  background: 'var(--color-paper,#FFFFFF)',
                  opacity: 0.12,
                  borderRadius: '2px',
                }}
              />
              <div
                style={{
                  height: '3px',
                  marginTop: '-3px',
                  width: `${progress}%`,
                  background: 'var(--color-paper,#FFFFFF)',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          )}

          {/* Filename tag */}
          {!isIdle && (
            <div
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'var(--color-ink,#12181A)',
                background: 'var(--color-signal-yellow,#F2E900)',
                padding: '3px 10px',
                border: '1px solid var(--color-ink,#12181A)',
                textTransform: 'uppercase',
              }}
            >
              {truncatedName.toUpperCase()}
            </div>
          )}
        </div>

        {/* ── Top HUD bar ─────────────────────────────────────────────────── */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 pointer-events-none"
          style={{
            borderBottom: '1px solid var(--color-paper,#FFFFFF)',
            borderBottomOpacity: 0.12,
          }}
        >
          <span
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--color-paper,#FFFFFF)',
              opacity: 0.5,
              textTransform: 'uppercase',
            }}
          >
            FLIGHT DECK · UPLOAD ZONE
          </span>

          {/* Live status pill */}
          <span
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '2px 8px',
              border: '1px solid var(--color-paper,#FFFFFF)',
              color: isSuccess
                ? 'var(--color-cleared-teal,#4F8F82)'
                : isFailed
                ? 'var(--color-clearance-pink,#E63993)'
                : 'var(--color-paper,#FFFFFF)',
              borderColor: isSuccess
                ? 'var(--color-cleared-teal,#4F8F82)'
                : isFailed
                ? 'var(--color-clearance-pink,#E63993)'
                : 'var(--color-paper,#FFFFFF)',
              opacity: isIdle ? 0.35 : 1,
            }}
          >
            {isIdle ? 'STANDBY' : isSuccess ? '● DONE' : isFailed ? '✕ FAILED' : '● LIVE'}
          </span>
        </div>

        {/* ── Bottom status bar ────────────────────────────────────────────── */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 pointer-events-none"
          style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
        >
          <span
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: isSuccess
                ? 'var(--color-cleared-teal,#4F8F82)'
                : isFailed
                ? 'var(--color-clearance-pink,#E63993)'
                : 'var(--color-paper,#FFFFFF)',
            }}
          >
            {isIdle
              ? 'CLICK OR DROP PDF TO INITIATE SCAN'
              : <TypewriterLabel text={statusLabel} />
            }
          </span>

          {isUploading && (
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-paper,#FFFFFF)',
              }}
            >
              {progress}%
            </span>
          )}
        </div>

        {/* Drag-active tint overlay — applied externally via className */}
      </div>
    </>
  );
};

export default FlightDeckScene;
