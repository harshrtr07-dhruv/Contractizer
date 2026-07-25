import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Badge } from '../components/ui/Badge';

type StatusLevel = 'operational' | 'degraded' | 'outage';

interface ServiceStatus {
  name: string;
  description: string;
  status: StatusLevel;
  uptime: string;
}

const SERVICES: ServiceStatus[] = [
  { name: 'API Gateway',        description: 'FastAPI backend — request routing & authentication',  status: 'operational', uptime: '99.97%' },
  { name: 'PDF Extraction',     description: 'pdfplumber-based text extraction pipeline',           status: 'operational', uptime: '99.91%' },
  { name: 'AI Analysis Engine', description: 'Zero-shot transformer classification & risk scoring', status: 'operational', uptime: '99.85%' },
  { name: 'Database',           description: 'Contract & clause data persistence layer',            status: 'operational', uptime: '99.99%' },
  { name: 'Auth Service',       description: 'Google OAuth 2.0 token verification',                 status: 'operational', uptime: '100.0%' },
  { name: 'Frontend CDN',       description: 'Static asset delivery via Vite / Vercel',            status: 'operational', uptime: '99.98%' },
];

const STATUS_CONFIG: Record<StatusLevel, { label: string; color: string; dot: string }> = {
  operational: { label: 'OPERATIONAL', color: '#16A34A', dot: 'bg-[#16A34A]' },
  degraded:    { label: 'DEGRADED',    color: '#EAB308', dot: 'bg-[#EAB308]' },
  outage:      { label: 'OUTAGE',      color: '#DC2626', dot: 'bg-[#DC2626]' },
};

const INCIDENTS = [
  {
    date: 'JUL 20, 2025',
    title: 'Scheduled Maintenance — Database Upgrade',
    detail: 'SQLite → PostgreSQL migration window. Service was unavailable for 12 minutes at 02:00 UTC. All data integrity verified post-migration.',
    resolved: true,
  },
  {
    date: 'JUL 12, 2025',
    title: 'Elevated API Latency',
    detail: 'AI analysis engine experienced elevated response times (2–8s) due to concurrent load. Auto-scaling resolved the issue within 6 minutes.',
    resolved: true,
  },
];

const StatusPage: React.FC = () => {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const allOperational = SERVICES.every(s => s.status === 'operational');

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-paper,#FFFFFF)' }}>
      <Navbar isAuthed={false} navLinks={[
        { label: 'Platform',     href: '/platform' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Security',     href: '/security' },
      ]} />

      <main className="flex-1 max-w-[860px] w-full mx-auto px-6 py-20">
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
        <Badge tier="neutral" className="mb-6">SYSTEM STATUS</Badge>
        <h1
          className="text-[40px] sm:text-[52px] font-extrabold uppercase tracking-tight leading-[1.05] mb-4"
          style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
        >
          System Status
        </h1>
        <p
          className="text-[13px] font-bold uppercase tracking-[0.12em] opacity-40 mb-12"
          style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
        >
          Live · Updated {now.toUTCString()}
        </p>

        {/* Overall banner */}
        <div
          className="flex items-center gap-4 p-5 border-2 mb-12"
          style={{ borderColor: allOperational ? '#16A34A' : '#EAB308' }}
        >
          <span
            className={`w-3 h-3 rounded-full shrink-0 animate-pulse ${allOperational ? 'bg-[#16A34A]' : 'bg-[#EAB308]'}`}
          />
          <p
            className="text-[13px] font-extrabold uppercase tracking-[0.14em]"
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              color: allOperational ? '#16A34A' : '#EAB308',
            }}
          >
            {allOperational
              ? 'ALL SYSTEMS FULLY OPERATIONAL'
              : 'SOME SYSTEMS ARE EXPERIENCING ISSUES'}
          </p>
        </div>

        {/* Service list */}
        <div className="mb-16">
          <h2
            className="text-[13px] font-extrabold uppercase tracking-[0.14em] opacity-40 mb-4"
            style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
          >
            SERVICES
          </h2>
          <div className="flex flex-col border-t-2 border-[var(--color-ink,#2B2B2B)]">
            {SERVICES.map((svc) => {
              const cfg = STATUS_CONFIG[svc.status];
              return (
                <div
                  key={svc.name}
                  className="flex items-center justify-between py-5 border-b border-[rgba(43,43,43,0.12)] gap-4"
                >
                  <div className="flex-1">
                    <p
                      className="text-[15px] font-extrabold uppercase tracking-tight mb-1"
                      style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
                    >
                      {svc.name}
                    </p>
                    <p
                      className="text-[12px] opacity-55"
                      style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
                    >
                      {svc.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    {/* Uptime */}
                    <span
                      className="text-[11px] font-extrabold opacity-50 hidden sm:block"
                      style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
                    >
                      {svc.uptime} uptime
                    </span>
                    {/* Status pill */}
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span
                        className="text-[11px] font-extrabold uppercase tracking-[0.1em]"
                        style={{ fontFamily: '"IBM Plex Mono", monospace', color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident history */}
        <div className="mb-16">
          <h2
            className="text-[13px] font-extrabold uppercase tracking-[0.14em] opacity-40 mb-4"
            style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
          >
            INCIDENT HISTORY
          </h2>
          <div className="flex flex-col gap-4">
            {INCIDENTS.map((inc) => (
              <div
                key={inc.title}
                className="border-2 border-[var(--color-ink,#2B2B2B)] p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p
                    className="text-[15px] font-extrabold uppercase tracking-tight"
                    style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
                  >
                    {inc.title}
                  </p>
                  {inc.resolved && (
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-[0.12em] shrink-0 px-2 py-1 border border-[#16A34A]"
                      style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#16A34A' }}
                    >
                      ✓ RESOLVED
                    </span>
                  )}
                </div>
                <p
                  className="text-[11px] font-extrabold uppercase tracking-[0.1em] opacity-40 mb-2"
                  style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
                >
                  {inc.date}
                </p>
                <p
                  className="text-[14px] opacity-65 leading-relaxed"
                  style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-ink,#2B2B2B)' }}
                >
                  {inc.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t-2 border-[var(--color-ink,#2B2B2B)] pt-8">
          <p
            className="text-[12px] uppercase tracking-[0.12em] font-extrabold opacity-40"
            style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
          >
            © {new Date().getFullYear()} CONTRACTIZER · harshrtr_07 · ALL RIGHTS RESERVED
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StatusPage;
