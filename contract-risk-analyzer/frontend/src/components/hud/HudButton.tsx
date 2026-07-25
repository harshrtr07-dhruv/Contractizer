import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type HudButtonVariant = 'primary' | 'caution' | 'critical' | 'ghost';
export type HudButtonSize = 'default' | 'sm';

export interface HudButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: HudButtonVariant;
  size?: HudButtonSize;
}

const VARIANT_CONFIG: Record<
  HudButtonVariant,
  { base: string; hoverBg: string; hoverText: string }
> = {
  primary: {
    base:      'var(--color-ink, #2B2B2B)',
    hoverBg:   'var(--color-ink, #2B2B2B)',
    hoverText: 'var(--color-paper, #FFFFFF)',
  },
  caution: {
    base:      'var(--color-risk-medium, #EAB308)',
    hoverBg:   'var(--color-risk-medium, #EAB308)',
    hoverText: 'var(--color-ink, #2B2B2B)',
  },
  critical: {
    base:      'var(--color-risk-high, #DC2626)',
    hoverBg:   'var(--color-risk-high, #DC2626)',
    hoverText: '#FFFFFF',
  },
  ghost: {
    base:      'transparent',
    hoverBg:   'rgba(255,255,255,0.1)',
    hoverText: 'var(--color-paper, #FFFFFF)',
  }
};

export const HudButton = React.forwardRef<HTMLButtonElement, HudButtonProps>(
  (
    {
      variant = 'primary',
      size = 'default',
      disabled = false,
      onClick,
      children,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const config = VARIANT_CONFIG[variant];

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        onClick={onClick}
        onHoverStart={() => !disabled && setIsHovered(true)}
        onHoverEnd={() => { setIsHovered(false); setIsPressed(false); }}
        onTapStart={() => !disabled && setIsPressed(true)}
        onTap={() => !disabled && setIsPressed(false)}
        onTapCancel={() => !disabled && setIsPressed(false)}
        animate={{
          y: disabled ? 0 : isPressed ? 0 : isHovered ? -3 : 0,
          boxShadow: isHovered && !disabled && !isPressed
            ? '0 8px 28px rgba(43,43,43,0.18)'
            : '0 0px 0px rgba(43,43,43,0)',
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        className={`
          relative inline-flex items-center justify-center
          overflow-hidden rounded-none bg-transparent
          border-2 border-[var(--base-color)]
          text-[var(--base-color)]
          uppercase font-extrabold tracking-[0.12em]
          ${size === 'sm' ? 'text-[11px] py-[8px] px-[16px]' : 'text-[12px] py-[12px] px-[22px]'}
          disabled:opacity-40 disabled:cursor-not-allowed
          ${className}
        `}
        style={
          {
            '--base-color':       config.base,
            '--hover-bg-color':   config.hoverBg,
            '--hover-text-color': config.hoverText,
            fontFamily: '"IBM Plex Mono", monospace',
            color: isHovered && !disabled ? config.hoverText : config.base,
            transition: 'color 0.22s ease',
            ...style,
          } as React.CSSProperties
        }
        {...(props as any)}
      >
        {/* Solid fill slides up from bottom on hover */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: 'var(--hover-bg-color)' }}
          initial={{ y: '101%' }}
          animate={{ y: isHovered && !disabled ? '0%' : '101%' }}
          transition={{ type: 'tween', duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Press flash */}
        <AnimatePresence>
          {isPressed && (
            <motion.div
              initial={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute inset-0 bg-white pointer-events-none z-10"
            />
          )}
        </AnimatePresence>

        {/* Content */}
        <span className="relative z-20 flex items-center gap-2 leading-none pt-[1px]">
          {children}
        </span>
      </motion.button>
    );
  }
);

HudButton.displayName = 'HudButton';
