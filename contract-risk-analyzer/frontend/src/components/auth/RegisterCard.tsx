import React, { useState } from 'react';
import { HudInput } from '../hud/HudInput';
import { HudButton } from '../hud/HudButton';

export interface RegisterCardProps {
  onGoogleLogin: () => void;
  loading?: boolean;
  error?: string;
}

export const RegisterCard: React.FC<RegisterCardProps> = ({
  onGoogleLogin,
  loading = false,
  error,
}) => {


  return (
    <div className="relative w-full max-w-[400px] border border-[var(--color-ink,#12181A)] bg-[var(--color-surface,#F5FBFA)] rounded-[2px] p-8 sm:p-10">
      {/* Top Left Tag */}
      <div
        className="absolute -top-[10px] left-6 px-2 py-[2px] bg-[var(--color-surface,#F5FBFA)] border border-[var(--color-ink,#12181A)] text-[var(--color-ink,#12181A)] uppercase text-[10px] tracking-[0.08em] font-medium leading-tight flex items-center"
        style={{ fontFamily: '"IBM Plex Mono", monospace' }}
      >
        ACCESS REQUEST
      </div>

      {/* Heading */}
      <h2
        className="text-[22px] sm:text-[24px] font-bold text-[var(--color-ink,#12181A)] tracking-tight uppercase mb-8"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
      >
        Issue Credential
      </h2>

      <div className="flex flex-col gap-5">
        {error && (
          <div
            className="text-[10px] mt-1 font-medium leading-tight text-center"
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              color: 'var(--color-clearance-pink, #E63993)',
            }}
          >
            ERROR: {error}
          </div>
        )}

        <div className="mt-2 flex flex-col gap-3">
          <HudButton
            type="button"
            variant="primary"
            disabled={loading}
            className="w-full"
            onClick={onGoogleLogin}
          >
            {loading ? 'AUTHENTICATING...' : 'CONTINUE WITH GOOGLE'}
          </HudButton>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-8 text-center">
        <a
          href="/login"
          className="text-[11px] font-medium opacity-80 hover:opacity-100 hover:underline transition-opacity"
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            color: 'var(--color-ink,#12181A)',
          }}
        >
          Already cleared? Sign in
        </a>
      </div>
    </div>
  );
};

export default RegisterCard;
