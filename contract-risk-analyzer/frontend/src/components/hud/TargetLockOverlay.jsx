import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import ReticleMarker from './ReticleMarker';

/**
 * Deterministic pseudo-random position calculation avoiding center 33% jet area
 */
const getDeterministicPosition = (id, index) => {
  let hash = 0;
  const str = String(id || index);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const norm1 = Math.abs(hash % 1000) / 1000;
  const norm2 = Math.abs((hash >> 3) % 1000) / 1000;

  const isLeft = index % 2 === 0;
  const leftPct = isLeft ? 12 + norm1 * 20 : 68 + norm1 * 20; // Left (12%-32%), Right (68%-88%)
  const topPct = 18 + norm2 * 60; // Top (18%-78%)

  return { left: `${leftPct.toFixed(1)}%`, top: `${topPct.toFixed(1)}%` };
};

/**
 * TargetLockOverlay - Fighter-jet HUD Target Lock Overlay
 * 
 * @param {Object} props
 * @param {Array} [props.clauses=[]] - Array of detected contract clauses
 * @param {boolean} [props.isAnalyzing=true] - Whether analysis is currently in progress
 * @param {function} [props.onComplete] - Callback fired 600ms after all targets lock
 * @param {string} [props.className] - Additional CSS classes
 */
const TargetLockOverlay = ({
  clauses = [],
  isAnalyzing = true,
  onComplete,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [lockedIds, setLockedIds] = useState(new Set());
  const [counterPulse, setCounterPulse] = useState(0);
  const completedFiredRef = useRef(false);

  const total = clauses.length;

  // Sequentially lock targets as clauses arrive / resolve
  useEffect(() => {
    if (total === 0) return;

    clauses.forEach((c, idx) => {
      const id = c.id || idx;
      if (!lockedIds.has(id)) {
        const timer = setTimeout(() => {
          setLockedIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
          });
          setCounterPulse((prev) => prev + 1);
        }, (idx + 1) * 300);

        return () => clearTimeout(timer);
      }
    });
  }, [clauses, total]);

  const lockedCount = lockedIds.size;
  const isAllLocked = total > 0 ? lockedCount >= total : true;

  // Completion handoff trigger (600ms delay after all targets lock)
  useEffect(() => {
    if (isAllLocked && !completedFiredRef.current && onComplete) {
      completedFiredRef.current = true;
      const timer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isAllLocked, onComplete]);

  return (
    <div className={`absolute inset-0 z-20 pointer-events-none overflow-hidden ${className}`}>
      {/* Top-Right Persistent Counter Badge */}
      <div className="absolute top-3 right-3 z-30">
        <motion.div
          key={counterPulse}
          animate={
            shouldReduceMotion
              ? { scale: 1 }
              : { scale: [1, 1.18, 1] }
          }
          transition={{ duration: 0.2 }}
          className={`px-3 py-1.5 rounded-[2px] border bg-slate-950/90 shadow-lg font-['Space_Grotesk',sans-serif] tracking-wider uppercase flex items-center gap-2 ${
            isAllLocked
              ? 'border-teal-500/80 text-teal-400'
              : 'border-amber-500/80 text-amber-400'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span className="font-extrabold text-xs sm:text-sm">
            {isAllLocked && total > 0
              ? 'SCAN COMPLETE'
              : `TARGETS LOCKED: ${lockedCount} / ${total}`}
          </span>
        </motion.div>
      </div>

      {/* Reticles Render */}
      {total === 0 ? (
        /* Empty Risk State - Single Centered Marker */
        <ReticleMarker
          clause={{ risk_category: 'Low', clause_type: 'NO THREATS DETECTED' }}
          isLocked={true}
          position={{ left: '50%', top: '50%' }}
        />
      ) : (
        /* Multiple Clause Target Reticles */
        clauses.map((clause, idx) => {
          const id = clause.id || idx;
          const pos = getDeterministicPosition(id, idx);
          const isLocked = lockedIds.has(id);

          return (
            <ReticleMarker
              key={id}
              clause={clause}
              isLocked={isLocked}
              position={pos}
            />
          );
        })
      )}
    </div>
  );
};

export default TargetLockOverlay;
