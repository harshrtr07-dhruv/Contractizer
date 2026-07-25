import React, { useEffect, useState } from 'react';
import { animate, motion } from 'framer-motion';

/**
 * HudTickerText - Fighter-jet cockpit status ticker text
 * Types out character by character over 500ms using Framer Motion
 * 
 * @param {Object} props
 * @param {string} [props.text] - Text string to animate
 * @param {React.ReactNode} [props.children] - Fallback text if text prop is omitted
 * @param {number} [props.duration=500] - Total animation duration in milliseconds
 * @param {string} [props.accentColor='paper'] - Token color ('paper', 'signal-yellow', 'clearance-pink', 'cleared-teal', 'ink')
 * @param {boolean} [props.showCursor=true] - Whether to show tactical blinking cursor
 * @param {string} [props.className] - Additional CSS classes
 */
const HudTickerText = ({
  text,
  children,
  duration = 500,
  accentColor = 'paper',
  showCursor = true,
  className = '',
  ...rest
}) => {
  const contentString = typeof text === 'string' ? text : typeof children === 'string' ? children : '';
  const [displayedLength, setDisplayedLength] = useState(0);

  useEffect(() => {
    if (!contentString) {
      setDisplayedLength(0);
      return;
    }

    setDisplayedLength(0);
    const controls = animate(0, contentString.length, {
      duration: duration / 1000,
      ease: 'linear',
      onUpdate: (latest) => {
        setDisplayedLength(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [contentString, duration]);

  const colorClasses = {
    paper: 'text-slate-100',
    ink: 'text-slate-300',
    'signal-yellow': 'text-amber-400',
    'clearance-pink': 'text-pink-400',
    'cleared-teal': 'text-teal-400',
  };

  const currentColorClass = colorClasses[accentColor] || colorClasses.paper;

  return (
    <span
      className={`inline-flex items-center font-mono uppercase tracking-wider text-xs font-semibold ${currentColorClass} ${className}`}
      {...rest}
    >
      <span>{contentString.slice(0, displayedLength)}</span>
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-[6px] h-[14px] bg-current ml-1 align-middle opacity-80"
          aria-hidden="true"
        />
      )}
    </span>
  );
};

export default HudTickerText;
