import React from 'react';

export interface HudPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 
   * Overrides the default border and bracket color. 
   * Accepts CSS variables (e.g. 'var(--color-clearance-pink)') or hex.
   */
  accentColor?: string;
  /**
   * Optional text rendered in a top-left cutout chip.
   */
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export const HudPanel = React.forwardRef<HTMLDivElement, HudPanelProps>(
  (
    {
      accentColor = 'var(--color-ink, #12181A)',
      label,
      children,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          relative border rounded-[2px]
          bg-[var(--color-surface,#F5FBFA)]
          border-[var(--hud-accent)]
          text-[var(--color-ink,#12181A)]
          p-5
          ${className}
        `}
        style={
          {
            '--hud-accent': accentColor,
            fontFamily: 'Inter, sans-serif',
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {/* Top Left Bracket */}
        <svg
          className="absolute -top-[1px] -left-[1px] w-3 h-3 text-[var(--hud-accent)] pointer-events-none"
          fill="none"
          viewBox="0 0 12 12"
        >
          <path
            d="M 12 0.75 L 0.75 0.75 L 0.75 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>

        {/* Top Right Bracket */}
        <svg
          className="absolute -top-[1px] -right-[1px] w-3 h-3 text-[var(--hud-accent)] pointer-events-none"
          fill="none"
          viewBox="0 0 12 12"
        >
          <path
            d="M 0 0.75 L 11.25 0.75 L 11.25 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>

        {/* Bottom Right Bracket */}
        <svg
          className="absolute -bottom-[1px] -right-[1px] w-3 h-3 text-[var(--hud-accent)] pointer-events-none"
          fill="none"
          viewBox="0 0 12 12"
        >
          <path
            d="M 0 11.25 L 11.25 11.25 L 11.25 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>

        {/* Bottom Left Bracket */}
        <svg
          className="absolute -bottom-[1px] -left-[1px] w-3 h-3 text-[var(--hud-accent)] pointer-events-none"
          fill="none"
          viewBox="0 0 12 12"
        >
          <path
            d="M 12 11.25 L 0.75 11.25 L 0.75 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>

        {/* Label Chip */}
        {label && (
          <div
            className="
              absolute -top-[8px] left-4 px-2 h-[16px]
              bg-inherit
              text-[var(--hud-accent)]
              uppercase font-medium text-[10px] tracking-[0.08em]
              flex items-center justify-center pointer-events-none
            "
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {label}
          </div>
        )}

        {/* Content Container */}
        <div className="relative z-10 h-full w-full">{children}</div>
      </div>
    );
  }
);

HudPanel.displayName = 'HudPanel';
