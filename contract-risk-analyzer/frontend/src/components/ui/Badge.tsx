import React from 'react';

export type BadgeTier = 'high' | 'medium' | 'low' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tier?: BadgeTier;
  size?: BadgeSize;
  index?: string;
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
}

const TIER_COLORS: Record<BadgeTier, string> = {
  high:    '#DC2626',  // red
  medium:  '#EAB308',  // amber
  low:     '#16A34A',  // green
  neutral: 'var(--color-ink, #2B2B2B)',
};

export const Badge: React.FC<BadgeProps> = ({
  tier = 'neutral',
  size = 'md',
  index,
  interactive = false,
  children,
  className = '',
  ...props
}) => {
  const tierColor = TIER_COLORS[tier];

  return (
    <div
      className={`
        inline-flex items-center gap-[6px]
        rounded-[2px] bg-transparent
        border border-[var(--color-ink,#12181A)]
        text-[var(--color-ink,#12181A)]
        uppercase text-[11px] font-medium tracking-[0.08em]
        transition-colors duration-150 ease-in-out
        ${size === 'sm' ? 'py-1 px-2' : 'py-[6px] px-[10px]'}
        ${
          interactive
            ? 'cursor-pointer hover:border-[var(--tier-color)] hover:bg-[color-mix(in_srgb,var(--tier-color)_4%,transparent)]'
            : ''
        }
        ${className}
      `}
      style={
        {
          '--tier-color': tierColor,
          fontFamily: '"IBM Plex Mono", monospace',
          ...props.style,
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Colored Square */}
      <span
        className="w-[4px] h-[4px] shrink-0"
        style={{ backgroundColor: tierColor }}
      />
      
      {/* Label & Index */}
      <span className="flex items-center gap-1 leading-none pt-[1px]">
        {index && (
          <span className="opacity-60">
            {index}
          </span>
        )}
        <span>{children}</span>
      </span>
    </div>
  );
};
