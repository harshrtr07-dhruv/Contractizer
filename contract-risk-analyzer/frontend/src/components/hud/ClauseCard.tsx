import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { useHoverTilt } from '../../motion/interactions';

export interface Clause {
  id: string;
  type: string;
  score: number;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
  originalText: string;
}

interface ClauseCardProps {
  clause: Clause;
}

export const ClauseCard: React.FC<ClauseCardProps> = ({ clause }) => {
  const [expanded, setExpanded] = useState(false);
  const { ref, props } = useHoverTilt(3);

  let riskColor = 'var(--color-ink, #2B2B2B)';
  if (clause.riskCategory === 'LOW')    riskColor = '#16A34A'; // green
  if (clause.riskCategory === 'MEDIUM') riskColor = '#EAB308'; // amber
  if (clause.riskCategory === 'HIGH')   riskColor = '#DC2626'; // red

  const tier = clause.riskCategory.toLowerCase() as 'high' | 'medium' | 'low' | 'neutral';

  return (
    <motion.div
      ref={ref}
      {...props}
      className="clause-card relative w-full border-b border-[var(--color-ink,#12181A)] first:border-t bg-[var(--color-paper,#DCEEEA)] p-6 sm:p-8 flex flex-col gap-6"
    >
      {/* 6px colored vertical slab on far right edge */}
      <div
        className="absolute right-0 top-[-1px] bottom-[-1px] w-[6px]"
        style={{ backgroundColor: riskColor }}
      />

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 w-full pr-6">
        <div className="flex flex-col items-start gap-3">
          {/* Index Tag */}
          <div
            className="px-2 py-[2px] border border-[var(--color-ink,#12181A)] bg-[var(--color-surface,#F5FBFA)] text-[10px] uppercase font-bold"
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              color: 'var(--color-ink,#12181A)',
            }}
          >
            {clause.id}
          </div>
          {/* Headline */}
          <h3
            className="text-[20px] sm:text-[24px] font-bold uppercase tracking-tight"
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              color: 'var(--color-ink,#12181A)',
            }}
          >
            {clause.type}
          </h3>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4">
          <div
            className="text-[28px] font-bold leading-none tracking-tight flex items-start"
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              color: 'var(--color-ink,#12181A)',
            }}
          >
            {clause.score}
            <span className="text-[14px] opacity-70 mt-1">%</span>
          </div>
          <Badge tier={tier} size="md">
            RISK: {clause.riskCategory}
          </Badge>
        </div>
      </div>

      {/* Collapsible "Original Text" Section */}
      <div
        className="relative w-full border border-[rgba(255,255,255,0.1)] !bg-[#0D1113] cursor-pointer overflow-hidden transition-colors hover:opacity-90 mr-6 max-w-[calc(100%-12px)]"
        onClick={() => setExpanded(!expanded)}
      >
        <AnimatePresence initial={false} mode="wait">
          {expanded ? (
            <motion.div
              key="expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="p-6"
            >
              <div
                className="text-[10px] font-bold uppercase mb-4 opacity-50"
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  color: 'var(--color-paper,#FFFFFF)',
                }}
              >
                ORIGINAL TEXT
              </div>
              <p
                className="text-[14px] leading-[1.6]"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                {clause.originalText}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-[60px] flex items-center justify-center relative"
            >
              {/* Halftone dot-grid texture */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, var(--color-paper, #FFFFFF) 1.5px, transparent 1.5px)',
                  backgroundSize: '12px 12px',
                }}
              />
              <span
                className="relative z-10 text-[11px] font-bold uppercase tracking-[0.1em] pointer-events-none"
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                TAP TO REVEAL
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ClauseCard;
