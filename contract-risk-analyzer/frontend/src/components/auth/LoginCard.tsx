import React, { useState } from 'react';
import { HudInput } from '../hud/HudInput';
import { HudButton } from '../hud/HudButton';

export interface LoginCardProps {
  onGoogleLogin: () => void;
  loading?: boolean;
  error?: string;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  onGoogleLogin,
  loading = false,
  error,
}) => {


  return (
    <div className="relative w-full max-w-[400px] border border-[rgba(255,255,255,0.1)] !bg-[#0D1113] shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.6)] transition-shadow duration-300 rounded-[2px] p-8 sm:p-10">
      {/* Top Left Tag */}
      <div
        className="absolute -top-[10px] left-6 px-2 py-[2px] !bg-[#0D1113] border border-[rgba(255,255,255,0.1)] text-white uppercase text-[10px] tracking-[0.08em] font-bold leading-tight flex items-center"
        style={{ fontFamily: '"IBM Plex Mono", monospace' }}
      >
        CREDENTIAL CHECK
      </div>

      {/* Heading */}
      <h2
        className="text-[22px] sm:text-[24px] font-bold text-white tracking-tight uppercase mb-8"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
      >
        Authenticate
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
            {loading ? 'AUTHENTICATING...' : 'SIGN IN WITH GOOGLE'}
          </HudButton>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-8 text-center">
        <a
          href="/register"
          className="text-[11px] font-medium opacity-60 hover:opacity-100 hover:text-white hover:underline transition-all"
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          No clearance yet? Request access
        </a>
      </div>
    </div>
  );
};

export default LoginCard;
