import React, { useEffect, useState, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { HudButton } from '../components/hud/HudButton';
import ThreatDisplay from '../components/hud/ThreatDisplay';
import ClauseCard, { Clause } from '../components/hud/ClauseCard';
import { initScrollReveal } from '../motion/scrollAnimations';
import api from '../services/api';

// ── Types ────────────────────────────────────────────────────────────────────
type ReportStatus = 'loading' | 'processing' | 'done' | 'failed' | 'error';

interface ReportData {
  status: string;
  contract_id: string;
  filename: string;
  overall_risk_score: number;   // 1.0 – 10.0
  contract_type: string;
  total_clauses: number;
  clauses: Array<{
    id: string;
    clause_type: string;
    original_text: string;
    plain_english: string;
    risk_score: number;
    risk_category: string;
    page_number: number;
  }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
/** Convert backend 1-10 risk score to 0-100 display score */
const scoreToPercent = (score: number): number =>
  Math.round(Math.min(100, Math.max(0, (score / 10) * 100)));

/** Map backend risk_category string to ClauseCard tier */
const toRiskCategory = (cat: string): 'HIGH' | 'MEDIUM' | 'LOW' => {
  const upper = cat.toUpperCase();
  if (upper === 'HIGH') return 'HIGH';
  if (upper === 'MEDIUM') return 'MEDIUM';
  return 'LOW';
};

// ── Main Component ────────────────────────────────────────────────────────────
const ResultsPage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { contractId } = useParams<{ contractId: string }>();

  const [pageStatus, setPageStatus] = useState<ReportStatus>('loading');
  const [report, setReport] = useState<ReportData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // ── Fetch report (with polling) ────────────────────────────────────────────
  const fetchReport = useCallback(async () => {
    if (!contractId || contractId === 'fallback-id') {
      setPageStatus('error');
      setErrorMsg('No valid contract ID. Please upload a contract from the dashboard.');
      return;
    }

    try {
      const res = await api.get(`/report/${contractId}`);
      const data: ReportData = res.data;

      if (data.status === 'pending' || data.status === 'processing') {
        setPageStatus('processing');
        // Poll again in 2.5 seconds
        setTimeout(fetchReport, 2500);
        return;
      }

      if (data.status === 'failed') {
        setPageStatus('failed');
        setErrorMsg(data.message ?? 'Analysis failed. The PDF may be unreadable.');
        return;
      }

      // status === 'done'
      setReport(data);
      setPageStatus('done');
    } catch (err: any) {
      console.error('Report fetch error:', err);
      setPageStatus('error');
      setErrorMsg(
        err?.response?.data?.detail ?? 'Could not load report. Please try again.'
      );
    }
  }, [contractId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    if (pageStatus !== 'done' || prefersReducedMotion) return;
    const cleanup = initScrollReveal('.clause-card', { stagger: 0.08 });
    return () => cleanup();
  }, [pageStatus, prefersReducedMotion]);

  // ── Map backend clauses → ClauseCard shape ────────────────────────────────
  const mappedClauses: Clause[] = (report?.clauses ?? []).map((cl, idx) => ({
    id: String(idx + 1).padStart(2, '0'),
    type: cl.clause_type,
    score: Math.round(cl.risk_score * 10),           // 1-10 → 10-100
    riskCategory: toRiskCategory(cl.risk_category),
    originalText: cl.original_text,
  }));

  const displayScore = report ? scoreToPercent(report.overall_risk_score) : 0;
  const displayCategory = report
    ? toRiskCategory(
        report.overall_risk_score >= 7.5
          ? 'HIGH'
          : report.overall_risk_score >= 4.5
          ? 'MEDIUM'
          : 'LOW'
      )
    : 'LOW';

  // ── Loading / Processing State ────────────────────────────────────────────
  if (pageStatus === 'loading' || pageStatus === 'processing') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center w-full"
        style={{ backgroundColor: 'var(--color-paper, #DCEEEA)' }}
      >
        <Navbar
          isAuthed={true}
          user={{ name: 'Flight Commander', role: 'ADMIN' }}
          navLinks={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Reports', href: '/analytics' },
            { label: 'Settings', href: '/settings' },
          ]}
        />
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {/* Animated radar pulse */}
          <div className="relative w-16 h-16">
            <span className="absolute inset-0 rounded-full border-2 border-[var(--color-ink,#12181A)] animate-ping opacity-30" />
            <span className="absolute inset-2 rounded-full border-2 border-[var(--color-ink,#12181A)] animate-ping opacity-20" style={{ animationDelay: '0.4s' }} />
            <span className="absolute inset-4 rounded-full border-2 border-[var(--color-clearance-pink,#E63993)]" />
          </div>
          <p
            className="text-[12px] uppercase tracking-[0.2em] font-bold animate-pulse"
            style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#12181A)' }}
          >
            {pageStatus === 'loading' ? 'FETCHING TELEMETRY...' : 'AI ANALYSIS IN PROGRESS...'}
          </p>
          <p
            className="text-[10px] opacity-50 uppercase tracking-widest"
            style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#12181A)' }}
          >
            CONTRACT ID: {contractId}
          </p>
        </div>
      </div>
    );
  }

  // ── Error / Failed State ──────────────────────────────────────────────────
  if (pageStatus === 'failed' || pageStatus === 'error') {
    return (
      <div
        className="min-h-screen flex flex-col w-full"
        style={{ backgroundColor: 'var(--color-paper, #DCEEEA)' }}
      >
        <Navbar
          isAuthed={true}
          user={{ name: 'Flight Commander', role: 'ADMIN' }}
          navLinks={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Reports', href: '/analytics' },
            { label: 'Settings', href: '/settings' },
          ]}
        />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          <p
            className="text-[11px] uppercase tracking-[0.15em] font-bold text-[var(--color-clearance-pink,#E63993)]"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            ⚠ MISSION ABORT
          </p>
          <p
            className="text-[14px] text-center max-w-md opacity-80"
            style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#12181A)' }}
          >
            {errorMsg}
          </p>
          <HudButton variant="primary" onClick={() => navigate('/dashboard')} className="mt-4">
            ← RETURN TO PIT
          </HudButton>
        </div>
      </div>
    );
  }

  // ── Done — render real results ────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col w-full"
      style={{ backgroundColor: 'var(--color-paper, #DCEEEA)' }}
    >
      <Navbar
        isAuthed={true}
        user={{ name: 'Flight Commander', role: 'ADMIN' }}
        navLinks={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports', href: '/analytics' },
          { label: 'Settings', href: '/settings' },
        ]}
      />

      <main className="flex-1 flex flex-col items-center w-full max-w-[1200px] mx-auto px-6 py-12 lg:py-20">
        
        <div className="w-full flex justify-start mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
            style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#12181A)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            BACK
          </button>
        </div>

        {/* ── Hero: Threat Display ── */}
        <section className="w-full flex flex-col items-center mb-24">
          <h1
            className="text-[28px] sm:text-[36px] font-bold uppercase tracking-tight mb-3 text-center"
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              color: 'var(--color-ink,#12181A)',
            }}
          >
            Telemetry Analysis Complete
          </h1>
          <p
            className="text-[12px] opacity-60 uppercase mb-2 tracking-[0.05em] text-center"
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              color: 'var(--color-ink,#12181A)',
            }}
          >
            DOCUMENT ID: {report?.filename?.toUpperCase() ?? contractId}
          </p>
          <p
            className="text-[11px] opacity-40 uppercase mb-16 tracking-[0.05em] text-center"
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              color: 'var(--color-ink,#12181A)',
            }}
          >
            {report?.contract_type} · {report?.total_clauses ?? 0} CLAUSES ANALYZED
          </p>

          <ThreatDisplay score={displayScore} riskCategory={displayCategory} />

          {/* Return to Pit CTA */}
          <HudButton
            id="return-to-pit-btn"
            variant="primary"
            onClick={() => navigate('/dashboard')}
            className="mt-10 gap-3"
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className="rotate-180" aria-hidden="true"
            >
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
            RETURN TO PIT
          </HudButton>
        </section>

        {/* ── Clauses List ── */}
        <section className="w-full max-w-[800px] mx-auto flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-8 border-b border-[var(--color-ink,#12181A)] pb-4">
            <h2
              className="text-[20px] font-bold uppercase tracking-tight"
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                color: 'var(--color-ink,#12181A)',
              }}
            >
              Detected Liabilities
            </h2>
            <div
              className="text-[10px] uppercase font-bold opacity-50 tracking-[0.05em]"
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                color: 'var(--color-ink,#12181A)',
              }}
            >
              {mappedClauses.length} CLAUSES FLAGGED
            </div>
          </div>

          {mappedClauses.length === 0 ? (
            <div
              className="w-full text-center py-16 opacity-50 text-[12px] uppercase tracking-widest"
              style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#12181A)' }}
            >
              NO RISKY CLAUSES DETECTED — DOCUMENT CLEARED
            </div>
          ) : (
            <div className="w-full flex flex-col border-t border-[var(--color-ink,#12181A)]">
              {mappedClauses.map((clause) => (
                <ClauseCard key={clause.id} clause={clause} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer
        links={[
          { label: 'Privacy Protocol', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
          { label: 'System Status', href: '/status' },
        ]}
      />
    </div>
  );
};

export default ResultsPage;
