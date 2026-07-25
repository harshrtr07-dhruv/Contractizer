import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { HudButton } from '../components/hud/HudButton';
import { Badge } from '../components/ui/Badge';

const STEPS = [
  {
    phase: '01',
    title: 'Upload Your Contract',
    detail: 'Drag & drop or click to upload any PDF contract up to 20 MB. Our secure ingestion pipeline encrypts your file in transit and at rest.',
    items: ['PDF support up to 20 MB', 'TLS 1.3 encrypted upload', 'Instant text extraction', 'Multi-page document support'],
  },
  {
    phase: '02',
    title: 'AI Scans Every Clause',
    detail: 'Our hybrid engine runs two passes: a fast keyword rule-classifier catches obvious patterns, then a transformer model handles nuanced legalese.',
    items: ['13 clause categories detected', 'Parallel processing — sub-2s', 'Keyword + zero-shot AI hybrid', 'Up to 15 paragraphs analysed'],
  },
  {
    phase: '03',
    title: 'Risk Is Scored & Explained',
    detail: 'Each clause gets a 1–10 risk score based on base severity, confidence, and contextual modifiers (mutual terms reduce risk, uncapped liability raises it).',
    items: ['1–10 weighted risk index', 'HIGH / MEDIUM / LOW tiers', 'Context-aware scoring (mutual terms)', 'Plain-English clause explanation'],
  },
  {
    phase: '04',
    title: 'Review Your Threat HUD',
    detail: 'The results page renders an animated radar threat display showing overall document risk, followed by a sorted list of every detected liability.',
    items: ['Radar risk visualisation', 'Clauses sorted by severity', 'Expandable clause text', 'Return-to-dashboard flow'],
  },
];

const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col w-full" style={{ backgroundColor: 'var(--color-paper,#FFFFFF)' }}>
      <Navbar
        isAuthed={false}
        navLinks={[
          { label: 'Platform',     href: '/platform' },
          { label: 'How It Works', href: '/how-it-works' },
          { label: 'Security',     href: '/security' },
        ]}
      />

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-6 py-20">

        {/* Hero */}
        <div className="mb-24">
          <Badge tier="neutral" className="mb-6">OPERATIONAL PROTOCOL</Badge>
          <h1
            className="text-[40px] sm:text-[56px] font-extrabold uppercase tracking-tight leading-[1.05] mb-6"
            style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
          >
            From upload to
            <br />insight in seconds.
          </h1>
          <p
            className="text-[18px] max-w-2xl opacity-75 leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
          >
            Four phases. No legal training required. Results you can act on immediately.
          </p>
        </div>

        {/* Steps — alternating layout */}
        <div className="flex flex-col gap-0">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.phase}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`flex flex-col lg:flex-row ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''} border-t-2 border-[var(--color-ink,#2B2B2B)] py-16 gap-12 items-start`}
            >
              {/* Phase number */}
              <div className="lg:w-[140px] shrink-0 flex items-start">
                <span
                  className="text-[80px] font-extrabold leading-none select-none"
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    color: 'var(--color-ink,#2B2B2B)',
                    opacity: 0.55,
                    letterSpacing: '-0.04em',
                    textShadow: '2px 2px 0px rgba(43,43,43,0.08)',
                  }}
                >
                  {step.phase}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <p
                  className="text-[11px] uppercase tracking-[0.18em] font-extrabold opacity-40 mb-3"
                  style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
                >
                  PHASE {step.phase}
                </p>
                <h2
                  className="text-[28px] sm:text-[34px] font-extrabold uppercase tracking-tight mb-5"
                  style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
                >
                  {step.title}
                </h2>
                <p
                  className="text-[15px] leading-relaxed opacity-70 mb-8 max-w-xl"
                  style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
                >
                  {step.detail}
                </p>

                {/* Checklist */}
                <ul className="flex flex-col gap-3">
                  {step.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-[13px] font-bold"
                      style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
                    >
                      <span
                        className="w-[18px] h-[18px] border-2 border-[var(--color-ink,#2B2B2B)] flex items-center justify-center shrink-0 text-[9px]"
                      >
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}

          {/* Final border */}
          <div className="border-t-2 border-[var(--color-ink,#2B2B2B)]" />
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center text-center mt-24 gap-6">
          <h2
            className="text-[32px] font-extrabold uppercase tracking-tight"
            style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
          >
            Try it now — free.
          </h2>
          <p
            className="text-[14px] opacity-60 max-w-md"
            style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
          >
            Upload your first contract and get a full risk report in under 5 seconds.
          </p>
          <HudButton variant="primary" onClick={() => navigate('/register')}>
            GET STARTED
          </HudButton>
        </div>
      </main>

      <Footer links={[
        { label: 'Privacy Protocol', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'System Status',    href: '/status' },
      ]} />
    </div>
  );
};

export default HowItWorksPage;
