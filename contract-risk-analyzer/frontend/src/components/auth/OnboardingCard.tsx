import React, { useState } from 'react';
import { HudInput } from '../hud/HudInput';
import { HudButton } from '../hud/HudButton';

export interface OnboardingCardProps {
  onSubmit: (name: string, age: string) => void;
  loading?: boolean;
  error?: string;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  onSubmit,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData.name, formData.age);
  };

  return (
    <div className="relative w-full max-w-[400px] border border-[var(--color-ink,#12181A)] bg-[var(--color-surface,#F5FBFA)] rounded-[2px] p-8 sm:p-10">
      {/* Top Left Tag */}
      <div
        className="absolute -top-[10px] left-6 px-2 py-[2px] bg-[var(--color-surface,#F5FBFA)] border border-[var(--color-ink,#12181A)] text-[var(--color-ink,#12181A)] uppercase text-[10px] tracking-[0.08em] font-medium leading-tight flex items-center"
        style={{ fontFamily: '"IBM Plex Mono", monospace' }}
      >
        PROFILE SETUP
      </div>

      {/* Heading */}
      <h2
        className="text-[22px] sm:text-[24px] font-bold text-[var(--color-ink,#12181A)] tracking-tight uppercase mb-8"
        style={{ fontFamily: '"Space Grotesk", sans-serif' }}
      >
        Complete Profile
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <HudInput
          label="NAME"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />
        <HudInput
          label="AGE"
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          placeholder="30"
          required
        />

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
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'PROCESSING...' : 'COMPLETE SETUP'}
          </HudButton>
        </div>
      </form>
    </div>
  );
};

export default OnboardingCard;
