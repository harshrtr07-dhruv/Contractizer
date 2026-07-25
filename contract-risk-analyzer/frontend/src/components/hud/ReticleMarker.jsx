import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * ReticleMarker - Fighter-jet HUD targeting reticle
 * 
 * @param {Object} props
 * @param {Object} props.clause - Clause details (id, risk_category, clause_type)
 * @param {boolean} [props.isLocked=false] - Whether target lock has resolved
 * @param {Object} props.position - Inline position { left: string, top: string }
 */
const ReticleMarker = ({ clause, isLocked = false, position }) => {
  const shouldReduceMotion = useReducedMotion();
  const [hasFiredImpact, setHasFiredImpact] = useState(false);

  useEffect(() => {
    if (isLocked && !hasFiredImpact) {
      setHasFiredImpact(true);
    }
  }, [isLocked, hasFiredImpact]);

  // Color mapping by tier
  const getTierDetails = (category) => {
    if (category === 'High') {
      return {
        colorClass: 'text-pink-400',
        borderClass: 'border-pink-500',
        strokeColor: '#ec4899',
        bgClass: 'bg-pink-500/20',
      };
    }
    if (category === 'Medium') {
      return {
        colorClass: 'text-amber-400',
        borderClass: 'border-amber-400',
        strokeColor: '#eab308',
        bgClass: 'bg-amber-500/20',
      };
    }
    return {
      colorClass: 'text-teal-400',
      borderClass: 'border-teal-400',
      strokeColor: '#14b8a6',
      bgClass: 'bg-teal-500/20',
    };
  };

  const tier = getTierDetails(clause?.risk_category);
  const labelText = isLocked
    ? (clause?.clause_type || 'HAZARD DETECTED').toUpperCase()
    : 'ACQUIRING...';

  // Corner bracket distances (Idle = 20px, Locked = 10px)
  const offset = isLocked ? 10 : 20;

  return (
    <motion.div
      style={position}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={
        shouldReduceMotion
          ? { opacity: 1, scale: 1 }
          : isLocked
          ? { opacity: 1, scale: [1, 1.15, 1] }
          : { opacity: 0.85, scale: 1 }
      }
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex flex-col items-center justify-center"
    >
      {/* Visual Impact Ring (Fires once on lock) */}
      <AnimatePresence>
        {isLocked && hasFiredImpact && !shouldReduceMotion && (
          <motion.div
            key="impact-ring"
            initial={{ scale: 0.8, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`absolute w-12 h-12 rounded-full border-2 ${tier.borderClass} pointer-events-none`}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Rotating / Solid Outer Ring (SVG) */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <motion.svg
          viewBox="0 0 50 50"
          className="w-12 h-12 absolute inset-0"
          animate={
            shouldReduceMotion || isLocked
              ? { rotate: 0 }
              : { rotate: 360 }
          }
          transition={
            shouldReduceMotion || isLocked
              ? { duration: 0 }
              : { rotate: { repeat: Infinity, duration: 6, ease: 'linear' } }
          }
        >
          <circle
            cx="25"
            cy="25"
            r="21"
            fill="none"
            stroke={isLocked ? tier.strokeColor : '#475569'}
            strokeWidth="1.5"
            strokeDasharray={isLocked ? 'none' : '6 4'}
          />
        </motion.svg>

        {/* Center Target Point */}
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            isLocked ? tier.bgClass : 'bg-slate-400'
          }`}
        />

        {/* 4 Inward Snapping Corner Brackets (150ms ease-out) */}
        {/* Top-Left */}
        <motion.span
          animate={{ x: -offset, y: -offset }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`absolute w-2.5 h-2.5 border-t-2 border-l-2 ${
            isLocked ? tier.borderClass : 'border-slate-300'
          }`}
        />
        {/* Top-Right */}
        <motion.span
          animate={{ x: offset, y: -offset }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`absolute w-2.5 h-2.5 border-t-2 border-r-2 ${
            isLocked ? tier.borderClass : 'border-slate-300'
          }`}
        />
        {/* Bottom-Left */}
        <motion.span
          animate={{ x: -offset, y: offset }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`absolute w-2.5 h-2.5 border-b-2 border-l-2 ${
            isLocked ? tier.borderClass : 'border-slate-300'
          }`}
        />
        {/* Bottom-Right */}
        <motion.span
          animate={{ x: offset, y: offset }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`absolute w-2.5 h-2.5 border-b-2 border-r-2 ${
            isLocked ? tier.borderClass : 'border-slate-300'
          }`}
        />
      </div>

      {/* Target Label */}
      <motion.div
        className="mt-2 text-center"
        animate={{ opacity: isLocked ? 1 : [0.5, 1, 0.5] }}
        transition={
          isLocked
            ? { duration: 0.2 }
            : { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
        }
      >
        <span
          className={`font-mono text-[9px] font-bold tracking-widest uppercase px-1 py-0.5 rounded-[1px] bg-slate-950/80 border ${
            isLocked
              ? `${tier.borderClass} ${tier.colorClass}`
              : 'border-slate-700 text-slate-300'
          }`}
        >
          {labelText}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default ReticleMarker;
