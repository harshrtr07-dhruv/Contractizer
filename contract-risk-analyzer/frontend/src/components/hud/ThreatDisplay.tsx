import React, { useEffect, useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type RiskCategory = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ThreatDisplayProps {
  score: number;
  riskCategory: RiskCategory;
}

const CHARS = '0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

// Custom hook for scrambling text
const useScrambleText = (finalValue: string, duration: number = 1000) => {
  const prefersReducedMotion = useReducedMotion();
  const [text, setText] = useState(prefersReducedMotion ? finalValue : '');

  useEffect(() => {
    if (prefersReducedMotion) {
      setText(finalValue);
      return;
    }

    let startTime: number;
    let animationFrame: number;
    // We want the scramble to look mechanical, so we throttle it slightly
    let lastUpdate = 0;
    
    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (progress < duration) {
        if (timestamp - lastUpdate > 30) {
          let scrambled = '';
          for (let i = 0; i < finalValue.length; i++) {
            scrambled += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
          setText(scrambled);
          lastUpdate = timestamp;
        }
        animationFrame = requestAnimationFrame(tick);
      } else {
        setText(finalValue);
      }
    };
    
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [finalValue, duration, prefersReducedMotion]);
  
  return text;
};

const ThreatDisplay: React.FC<ThreatDisplayProps> = ({ score, riskCategory }) => {
  const prefersReducedMotion = useReducedMotion();
  const scoreStr = `${Math.round(score)}%`;
  const displayedScore = useScrambleText(scoreStr, 1200);

  // Status mappings — semantic risk colours (results page)
  let solidColor = '#16A34A'; // green — LOW
  let sweepColor = 'rgba(22, 163, 74, 0.35)';
  if (riskCategory === 'MEDIUM') {
    solidColor = '#EAB308';  // amber — MEDIUM
    sweepColor = 'rgba(234, 179, 8, 0.4)';
  } else if (riskCategory === 'HIGH') {
    solidColor = '#DC2626';  // red — HIGH
    sweepColor = 'rgba(220, 38, 38, 0.4)';
  }

  // Generate deterministic blips
  const blips = useMemo(() => {
    const generatedBlips = [];
    let seed = score * 1337;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    
    const numBlips = riskCategory === 'HIGH' ? 12 : riskCategory === 'MEDIUM' ? 7 : 3;
    
    for (let i = 0; i < numBlips; i++) {
      const angle = random() * Math.PI * 2; // 0 to 2PI
      const distance = 18 + random() * 24; // 18% to 42% from center
      
      // x, y from center, with 0 angle at top, clockwise
      const x = 50 + distance * Math.sin(angle);
      const y = 50 - distance * Math.cos(angle);
      
      const angleDeg = (angle * 180) / Math.PI;
      // Subtract a tiny fraction so the blip lights up exactly as the gradient edge hits it
      const delay = (angleDeg / 360) * 4; 
      
      generatedBlips.push({ id: i, x, y, size: 2 + random() * 4, delay });
    }
    return generatedBlips;
  }, [score, riskCategory]);

  return (
    <div className="relative w-full max-w-[320px] mx-auto flex flex-col items-center">
      {/* RADAR */}
      <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
        
        {/* Base Grid */}
        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 100 100">
          {/* Crosshairs */}
          <line x1="50" y1="5" x2="50" y2="95" stroke="var(--color-ink, #12181A)" strokeWidth="0.3" opacity="0.4" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="var(--color-ink, #12181A)" strokeWidth="0.3" opacity="0.4" />
          
          {/* Concentric rings */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-ink, #12181A)" strokeWidth="0.5" opacity="0.5" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="var(--color-ink, #12181A)" strokeWidth="0.3" strokeDasharray="1 2" opacity="0.5" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="var(--color-ink, #12181A)" strokeWidth="0.3" opacity="0.3" />
        </svg>

        {/* Sweeping Radar Conic Gradient */}
        {!prefersReducedMotion && (
          <motion.div 
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 0deg, transparent 60%, ${sweepColor} 100%)`,
              clipPath: 'circle(45% at 50% 50%)',
              transformOrigin: '50% 50%'
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          />
        )}

        {/* Radar Blips */}
        {blips.map(blip => (
          <motion.div
            key={blip.id}
            className="absolute rounded-none"
            style={{
              left: `${blip.x}%`,
              top: `${blip.y}%`,
              width: `${blip.size}px`,
              height: `${blip.size}px`,
              backgroundColor: solidColor,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 0.5 } : { opacity: [0, 1, 0] }}
            transition={prefersReducedMotion ? {} : { 
              repeat: Infinity, 
              duration: 4, 
              delay: blip.delay, 
              times: [0, 0.05, 0.4], 
              ease: "linear" 
            }}
          />
        ))}

        {/* Center Readout Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-full p-2">
            <div
              className="font-bold text-[48px] leading-none tracking-tight flex items-center justify-center w-[120px]"
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                color: 'var(--color-ink,#12181A)',
              }}
            >
              {displayedScore}
            </div>
          </div>
        </div>
      </div>

      {/* Status Line */}
      <div
        className="mt-4 text-[14px] uppercase font-semibold tracking-[0.05em] text-center"
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          color: solidColor,
        }}
      >
        THREAT LEVEL: {riskCategory}
      </div>
    </div>
  );
};

export default ThreatDisplay;
