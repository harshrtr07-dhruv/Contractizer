import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';

export interface PilotBadgeProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  name: string;
  photoUrl?: string;
  role: string;
}

export const PilotBadge = React.forwardRef<HTMLButtonElement, PilotBadgeProps>(
  ({ name, photoUrl, role, onClick, className = '', ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    // Extract initials (up to 2 letters)
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <button
        ref={ref}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          group flex items-center gap-3
          text-left bg-transparent border-none outline-none
          hover:opacity-90 transition-opacity cursor-pointer
          ${className}
        `}
        {...props}
      >
        {/* Avatar Frame */}
        <div
          className="
            relative flex-shrink-0 w-[36px] h-[36px] rounded-[2px] overflow-hidden 
            border-[2px] border-[var(--color-ink,#12181A)] 
            flex items-center justify-center 
            bg-[var(--color-signal-yellow,#F2E900)] 
            text-[var(--color-ink,#12181A)]
          "
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-full h-full object-cover relative z-10"
            />
          ) : (
            <span
              className="relative z-10 font-bold text-[14px]"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              {initials}
            </span>
          )}

          {/* Hover Scan-line Effect */}
          <motion.div
            className="absolute left-0 right-0 h-[2px] bg-white/80 z-20 pointer-events-none"
            initial={{ top: '-10%', opacity: 0 }}
            animate={
              isHovered
                ? { top: '110%', opacity: 1 }
                : { top: '-10%', opacity: 0 }
            }
            transition={
              isHovered
                ? { top: { duration: 0.6, ease: 'linear' }, opacity: { duration: 0.1 } }
                : { duration: 0 }
            }
          />
        </div>

        {/* Text Details */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex flex-col items-start leading-none gap-[2px]">
            <span
              className="text-[9px] uppercase opacity-60 tracking-[0.08em]"
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                color: 'var(--color-ink,#12181A)',
              }}
            >
              PILOT
            </span>
            <span
              className="text-[13px] font-bold uppercase tracking-[-0.01em]"
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                color: 'var(--color-ink,#12181A)',
              }}
            >
              {name}
            </span>
          </div>

          <Badge tier="neutral" size="sm">
            CLEARANCE: {role}
          </Badge>
        </div>
      </button>
    );
  }
);

PilotBadge.displayName = 'PilotBadge';
