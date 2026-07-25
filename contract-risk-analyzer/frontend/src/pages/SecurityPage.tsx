import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { HudButton } from '../components/hud/HudButton';
import { HudPanel } from '../components/hud/HudPanel';
import { Badge } from '../components/ui/Badge';

// ── SVG icon components ───────────────────────────────────────────────────────
const S = 20; // icon size

const IconLock = () => (
  <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
);

const IconTrash = () => (
  <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconShield = () => (
  <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconKey = () => (
  <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="M21 2L13 10" />
    <path d="M18 5l-2.5 2.5" />
    <path d="M21 2l-1 1" />
    <line x1="13" y1="10" x2="15" y2="12" />
  </svg>
);

const IconClipboard = () => (
  <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

const IconGlobe = () => (
  <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const PILLARS = [
  {
    Icon: IconLock,
    title: 'Encrypted in Transit & at Rest',
    desc: 'All files are transferred over TLS 1.3. Documents are encrypted at rest using AES-256. Your contracts never leave secure infrastructure.',
  },
  {
    Icon: IconTrash,
    title: 'Zero Retention Policy',
    desc: 'We never train models on your data. Raw PDF bytes are discarded after analysis. Only structured clause data is retained for your report.',
  },
  {
    Icon: IconShield,
    title: 'Role-Based Access Control',
    desc: 'Every report is scoped to the authenticated user who uploaded it. No cross-account data leakage — enforced at the database query level.',
  },
  {
    Icon: IconKey,
    title: 'Google OAuth 2.0 Only',
    desc: 'We never store passwords. Authentication is handled entirely by Google OAuth 2.0 with short-lived JWT access tokens.',
  },
  {
    Icon: IconClipboard,
    title: 'Full Audit Trail',
    desc: 'Every upload, analysis run, and report view is logged with timestamp and user identity. Audit logs are immutable and available on request.',
  },
  {
    Icon: IconGlobe,
    title: 'GDPR-Aligned Infrastructure',
    desc: 'Data processing is aligned with GDPR principles. Users can request deletion of all their data at any time from their account settings.',
  },
];

const SecurityPage: React.FC = () => {
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
        <div className="mb-20">
          <Badge tier="neutral" className="mb-6">SECURITY CLEARANCE</Badge>
          <h1
            className="text-[40px] sm:text-[56px] font-extrabold uppercase tracking-tight leading-[1.05] mb-6"
            style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
          >
            Your contracts.
            <br />Your eyes only.
          </h1>
          <p
            className="text-[18px] max-w-2xl opacity-75 leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
          >
            We built Contractizer with a security-first mindset. Every layer of
            the stack — from file upload to report delivery — is hardened against
            unauthorised access and data leakage.
          </p>
        </div>

        {/* Status banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 p-5 border-2 border-[var(--color-risk-low,#16A34A)] mb-16"
        >
          <span className="w-3 h-3 rounded-full bg-[var(--color-risk-low,#16A34A)] animate-pulse shrink-0" />
          <p
            className="text-[12px] font-extrabold uppercase tracking-[0.14em]"
            style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-risk-low,#16A34A)' }}
          >
            ALL SYSTEMS OPERATIONAL · SECURITY STATUS: CLEARED
          </p>
        </motion.div>

        {/* Security pillars grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
            >
              <HudPanel className="pt-3 px-8 pb-8 flex flex-col gap-3 h-full !bg-[#0D1113] hover:-translate-y-[2px] !border-[rgba(255,255,255,0.1)] shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.6)] transition-all duration-300 group" accentColor="var(--color-paper,#FFFFFF)">
                <div
                  className="w-9 h-9 flex items-center justify-center border-2 border-[rgba(255,255,255,0.2)] shrink-0 mb-1 transition-colors group-hover:border-white group-hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  <p.Icon />
                </div>
                <h3
                  className="text-[18px] font-extrabold uppercase tracking-tight group-hover:text-white transition-colors"
                  style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'rgba(255,255,255,0.9)' }}
                >
                  {p.title}
                </h3>
                <p
                  className="text-[14px] leading-relaxed transition-colors group-hover:text-[rgba(255,255,255,0.9)]"
                  style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.6)' }}
                >
                  {p.desc}
                </p>
              </HudPanel>
            </motion.div>
          ))}
        </div>

        {/* Responsible Disclosure */}
        <div
          className="p-10 border-2 border-[var(--color-ink,#2B2B2B)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-20"
        >
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.16em] font-extrabold opacity-40 mb-2"
              style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
            >
              RESPONSIBLE DISCLOSURE
            </p>
            <h2
              className="text-[22px] font-extrabold uppercase tracking-tight mb-2"
              style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
            >
              Found a vulnerability?
            </h2>
            <p
              className="text-[13px] opacity-60 max-w-md"
              style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
            >
              We take security reports seriously. Please report findings to our security team and we'll respond within 48 hours.
            </p>
          </div>
          <a
            href="mailto:security@contractizer.io"
            className="shrink-0"
          >
            <HudButton variant="primary">
              REPORT A VULNERABILITY
            </HudButton>
          </a>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center text-center gap-6">
          <h2
            className="text-[28px] font-extrabold uppercase tracking-tight"
            style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
          >
            Start analysing securely.
          </h2>
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

export default SecurityPage;
