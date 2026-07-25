import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface HudInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const HudInput = React.forwardRef<HTMLInputElement, HudInputProps>(
  (
    { label, error, type = 'text', className = '', onFocus, onBlur, ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    const inkColor = 'var(--color-ink, #12181A)';
    const focusColor = 'var(--color-signal-yellow, #F2E900)';
    const errorColor = 'var(--color-clearance-pink, #E63993)';

    const baseBorderColor = error ? errorColor : inkColor;
    const baseBorderOpacity = error ? 1 : 0.4;
    const activeBorderColor = error ? errorColor : focusColor;

    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {/* Label */}
        {label && (
          <label
            className="text-[10px] uppercase tracking-[0.08em] opacity-60 font-medium"
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              color: inkColor,
            }}
          >
            {label}
          </label>
        )}

        {/* Input Wrapper */}
        <div className="relative flex items-center">
          <input
            ref={ref}
            type={type}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`
              w-full bg-transparent outline-none py-1
              text-[14px]
              placeholder:text-[var(--color-ink,#12181A)] placeholder:opacity-40
            `}
            style={{
              fontFamily: 'Inter, sans-serif',
              color: inkColor,
            }}
            {...props}
          />

          {/* Resting Border */}
          <span
            className="absolute bottom-0 left-0 right-0 h-[1.5px] z-0 transition-colors duration-200 pointer-events-none"
            style={{
              backgroundColor: baseBorderColor,
              opacity: baseBorderOpacity,
            }}
          />

          {/* Animated Focus Border */}
          <motion.span
            className="absolute bottom-0 left-0 right-0 h-[1.5px] origin-center z-10 pointer-events-none"
            style={{ backgroundColor: activeBorderColor }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: isFocused ? 1 : 0,
              opacity: isFocused ? 1 : 0,
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="text-[10px] mt-1 font-medium leading-tight"
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              color: errorColor,
            }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

HudInput.displayName = 'HudInput';
