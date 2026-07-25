import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Crosshair, Hexagon } from 'lucide-react';
import { useHoverTilt } from '../../motion/variants';

export const NovaBadge = ({ className = '' }) => {
  const tilt = useHoverTilt(10);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      {...(!shouldReduceMotion ? tilt : {})}
      className={`relative inline-flex items-center justify-center p-4 border-2 border-ink bg-surface shadow-[4px_4px_0px_#12181A] transition-all hover:bg-signal-yellow group cursor-default ${className}`}
    >
      <div className="absolute inset-1 border border-ink/20 border-dashed" />
      <div className="relative z-10 flex flex-col items-center gap-1 text-ink">
        <Crosshair className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
        <span className="font-['TT_Lakes_Neue','Space_Grotesk'] font-extrabold text-lg tracking-tighter uppercase leading-none mt-1">NOVA</span>
        <span className="font-mono text-[10px] font-bold tracking-widest bg-ink text-surface px-1.5 py-0.5">001</span>
      </div>
    </motion.div>
  );
};

export const AccessNodeTag = ({ node = "04", status = "ONLINE", className = '' }) => {
  return (
    <div className={`inline-flex items-center border border-ink bg-paper shadow-[2px_2px_0px_#12181A] ${className}`}>
      <div className="px-2 py-1 bg-ink text-surface font-mono font-bold text-[10px] tracking-widest uppercase flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${status === 'ONLINE' ? 'bg-signal-yellow animate-pulse' : 'bg-clearance-pink'}`} />
        NODE
      </div>
      <div className="px-2 py-1 font-['TT_Lakes_Neue','Space_Grotesk'] font-bold text-xs text-ink tracking-tight">
        {node}
      </div>
    </div>
  );
};

export const CrestMark = ({ className = '' }) => {
  const tilt = useHoverTilt(15);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      {...(!shouldReduceMotion ? tilt : {})}
      className={`relative inline-flex items-center justify-center w-12 h-14 border border-ink bg-surface shadow-[3px_3px_0px_#12181A] ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-8 h-8 text-ink fill-current">
        <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" stroke="currentColor" strokeWidth="4" fill="none" />
        <path d="M30 40 L50 60 L70 40" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="square" />
        <circle cx="50" cy="80" r="3" />
      </svg>
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-signal-yellow border border-ink" />
    </motion.div>
  );
};
