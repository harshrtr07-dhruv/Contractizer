import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Badge } from '../components/ui/Badge';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-t-2 border-[var(--color-ink,#2B2B2B)] pt-8 pb-10">
    <h2
      className="text-[18px] font-extrabold uppercase tracking-tight mb-4"
      style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
    >
      {title}
    </h2>
    <div
      className="text-[15px] leading-relaxed opacity-75 space-y-3"
      style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
    >
      {children}
    </div>
  </div>
);

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-paper,#FFFFFF)' }}>
      <Navbar isAuthed={false} navLinks={[
        { label: 'Platform',     href: '/platform' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Security',     href: '/security' },
      ]} />

      <main className="flex-1 max-w-[800px] w-full mx-auto px-6 py-20">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity mb-8"
          style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          BACK
        </button>
        <Badge tier="neutral" className="mb-6">LEGAL · PRIVACY</Badge>
        <h1
          className="text-[40px] sm:text-[52px] font-extrabold uppercase tracking-tight leading-[1.05] mb-4"
          style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
        >
          Privacy Protocol
        </h1>
        <p
          className="text-[13px] font-bold uppercase tracking-[0.12em] opacity-40 mb-16"
          style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
        >
          Last updated: July 2025 · Effective immediately
        </p>

        <div className="flex flex-col gap-0">
          <Section title="1. Information We Collect">
            <p>When you use Contractizer, we collect only what is strictly necessary to deliver the service:</p>
            <ul className="list-none space-y-2 mt-3">
              {[
                'Your name and email address via Google OAuth 2.0 (no password ever stored)',
                'Contract files you choose to upload for analysis (PDF format)',
                'Structured clause-level data extracted from your contracts',
                'Usage metadata: timestamps of uploads and report views',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 w-[6px] h-[6px] rounded-none border-2 border-[var(--color-ink,#2B2B2B)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="2. How We Use Your Data">
            <p>Your data is used solely to provide and improve the Contractizer service:</p>
            <ul className="list-none space-y-2 mt-3">
              {[
                'To authenticate you and associate reports with your account',
                'To run AI-based risk analysis on the contracts you upload',
                'To display your analysis history in the dashboard',
                'We do NOT use your data to train machine learning models',
                'We do NOT sell, share, or license your data to third parties',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 w-[6px] h-[6px] rounded-none border-2 border-[var(--color-ink,#2B2B2B)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="3. Data Retention">
            <p>
              Raw PDF files are deleted from our servers immediately after analysis is complete.
              Extracted clause data and your risk report are retained as long as your account is active.
              You may request permanent deletion of all your data at any time by contacting us.
            </p>
          </Section>

          <Section title="4. Data Security">
            <p>
              All data is transmitted over TLS 1.3 and stored with AES-256 encryption at rest.
              Access to your reports is enforced at the database level — no other user can access your data.
              We operate on GDPR-aligned infrastructure with full audit logging.
            </p>
          </Section>

          <Section title="5. Your Rights">
            <p>Under GDPR and applicable data protection laws, you have the right to:</p>
            <ul className="list-none space-y-2 mt-3">
              {[
                'Access the personal data we hold about you',
                'Request correction of inaccurate data',
                'Request deletion of your account and all associated data',
                'Object to or restrict processing of your data',
                'Data portability — export your clause report data',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 w-[6px] h-[6px] rounded-none border-2 border-[var(--color-ink,#2B2B2B)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="6. Contact">
            <p>
              For any privacy-related requests or questions, please contact us at{' '}
              <a href="mailto:privacy@contractizer.io" className="underline font-bold">
                privacy@contractizer.io
              </a>.
              We aim to respond to all requests within 48 hours.
            </p>
          </Section>

          <div className="border-t-2 border-[var(--color-ink,#2B2B2B)] pt-8">
            <p
              className="text-[12px] uppercase tracking-[0.12em] font-extrabold opacity-40"
              style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
            >
              © {new Date().getFullYear()} CONTRACTIZER · harshrtr_07 · ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
