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

const TermsPage: React.FC = () => {
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
        <Badge tier="neutral" className="mb-6">LEGAL · TERMS</Badge>
      <h1
        className="text-[40px] sm:text-[52px] font-extrabold uppercase tracking-tight leading-[1.05] mb-4"
        style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
      >
        Terms of Service
      </h1>
      <p
        className="text-[13px] font-bold uppercase tracking-[0.12em] opacity-40 mb-16"
        style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
      >
        Last updated: July 2025 · By using Contractizer you agree to these terms
      </p>

      <div className="flex flex-col gap-0">
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using Contractizer ("the Service"), you agree to be bound by these Terms of Service.
            If you do not agree, you may not access the Service. These terms apply to all users, including
            visitors, registered users, and contributors.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            Contractizer is an AI-powered contract risk analysis platform. It extracts, classifies, and
            scores clauses in uploaded PDF contracts to surface legal risks. The Service is provided for
            informational purposes only and does not constitute legal advice. Always consult a qualified
            legal professional before making decisions based on any analysis.
          </p>
        </Section>

        <Section title="3. Permitted Use">
          <p>You agree to use the Service only for lawful purposes. You must not:</p>
          <ul className="list-none space-y-2 mt-3">
            {[
              'Upload contracts you do not have the right to analyse',
              'Attempt to reverse-engineer or exploit the AI models',
              'Use the platform to process confidential third-party data without consent',
              'Interfere with the availability or integrity of the Service',
              'Use automated scripts or bots to access or abuse the API',
            ].map(item => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 w-[6px] h-[6px] rounded-none border-2 border-[var(--color-ink,#2B2B2B)] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="4. Intellectual Property">
          <p>
            All platform code, UI, brand assets, and AI model outputs are the exclusive intellectual
            property of Contractizer and its creator (harshrtr_07). You may not reproduce, distribute,
            or create derivative works without explicit written permission. Content generated from your
            uploaded contracts belongs to you — we claim no ownership over your documents or reports.
          </p>
        </Section>

        <Section title="5. Disclaimer of Warranties">
          <p>
            The Service is provided "as is" without warranties of any kind, express or implied.
            We do not warrant that analysis results are accurate, complete, or legally sufficient.
            AI-based analysis may miss clauses or misclassify risk levels. We expressly disclaim
            all implied warranties of merchantability and fitness for a particular purpose.
          </p>
        </Section>

        <Section title="6. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, Contractizer and its creator shall not be liable for
            any indirect, incidental, special, or consequential damages arising from your use of the Service,
            including but not limited to lost profits, data loss, or business interruption, even if advised
            of the possibility of such damages.
          </p>
        </Section>

        <Section title="7. Termination">
          <p>
            We reserve the right to suspend or terminate your access to the Service at any time, with or
            without notice, for violation of these terms or for any other reason at our sole discretion.
            You may close your account at any time by contacting us.
          </p>
        </Section>

        <Section title="8. Governing Law">
          <p>
            These Terms are governed by and construed in accordance with applicable law. Any disputes
            arising from these Terms or use of the Service shall be resolved through good-faith negotiation,
            or, failing that, binding arbitration.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions about these Terms? Reach us at{' '}
            <a href="mailto:legal@contractizer.io" className="underline font-bold">
              legal@contractizer.io
            </a>.
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

export default TermsPage;
