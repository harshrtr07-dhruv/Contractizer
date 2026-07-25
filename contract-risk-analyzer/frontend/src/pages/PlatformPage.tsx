import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { HudButton } from '../components/hud/HudButton';
import { HudPanel } from '../components/hud/HudPanel';
import { Badge } from '../components/ui/Badge';

const FEATURES = [
  {
    id: '01',
    title: 'Zero-Shot AI Classification',
    desc: 'Our engine uses state-of-the-art transformer models to classify contract clauses across 13 legal categories — with no training data required from your firm.',
    tag: 'CORE ENGINE',
  },
  {
    id: '02',
    title: 'Context-Aware Risk Scoring',
    desc: 'Every clause is scored on a 1–10 risk scale using a weighted algorithm that accounts for mutual vs. one-sided terms, jurisdiction, and contract type.',
    tag: 'INTELLIGENCE',
  },
  {
    id: '03',
    title: 'Plain-English Explanations',
    desc: 'Each detected liability is translated into plain English — so your team understands exactly what the risk is and why it matters, without a law degree.',
    tag: 'READABILITY',
  },
  {
    id: '04',
    title: 'Multi-Format PDF Ingestion',
    desc: 'Upload any scanned or digital PDF up to 20 MB. Our extraction pipeline handles multi-column layouts, headers, footers, and embedded legal tables.',
    tag: 'INGESTION',
  },
  {
    id: '05',
    title: 'Instant Threat HUD',
    desc: 'Results are rendered as a live tactical HUD — a radar display showing overall risk score, threat level, and a sortable breakdown of every flagged clause.',
    tag: 'DISPLAY',
  },
  {
    id: '06',
    title: 'Audit-Ready Reports',
    desc: 'Every analysis is stored and retrievable. Generate PDF export-ready reports for legal review, compliance records, or deal negotiation preparation.',
    tag: 'REPORTING',
  },
];

const PlatformPage: React.FC = () => {
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

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-20">

        {/* Hero */}
        <div className="mb-20">
          <Badge tier="neutral" className="mb-6">PLATFORM OVERVIEW</Badge>
          <h1
            className="text-[40px] sm:text-[56px] font-extrabold uppercase tracking-tight leading-[1.05] mb-6"
            style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
          >
            Built for legal
            <br />precision at scale.
          </h1>
          <p
            className="text-[18px] max-w-2xl opacity-75 leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
          >
            Contractizer combines transformer-based NLP with deterministic rule
            engines to deliver sub-second contract risk analysis that your legal
            and ops teams can trust.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {FEATURES.map((f) => (
            <HudPanel
              key={f.id}
              label={f.tag}
              className="p-8 flex flex-col gap-4 !bg-[#0D1113] hover:-translate-y-[2px] !border-[rgba(255,255,255,0.1)] shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.6)] transition-all duration-300 group cursor-default"
              accentColor="var(--color-paper,#FFFFFF)"
            >
              <div
                className="text-[11px] font-extrabold tracking-[0.15em] uppercase transition-colors group-hover:text-[rgba(255,255,255,0.7)]"
                style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'rgba(255,255,255,0.3)' }}
              >
                {f.id}
              </div>
              <h3
                className="text-[20px] font-extrabold uppercase tracking-tight group-hover:text-white transition-colors"
                style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'rgba(255,255,255,0.9)' }}
              >
                {f.title}
              </h3>
              <p
                className="text-[14px] leading-relaxed transition-colors group-hover:text-[rgba(255,255,255,0.9)]"
                style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.6)' }}
              >
                {f.desc}
              </p>
            </HudPanel>
          ))}
        </div>

        {/* CTA strip */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-6 p-10 border-2 border-[var(--color-ink,#2B2B2B)]"
        >
          <div>
            <p
              className="text-[22px] font-extrabold uppercase tracking-tight mb-1"
              style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
            >
              Ready to analyse your first contract?
            </p>
            <p
              className="text-[13px] opacity-60"
              style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
            >
              Free to start · No credit card required
            </p>
          </div>
          <HudButton variant="primary" onClick={() => navigate('/register')}>
            REQUEST ACCESS
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

export default PlatformPage;
