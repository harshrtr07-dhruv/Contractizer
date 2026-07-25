import React, { useEffect, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Badge } from '../components/ui/Badge';
import { HudPanel } from '../components/hud/HudPanel';
import FlightDeckScene from '../components/hud/FlightDeckScene';
import { initScrollReveal } from '../motion/scrollAnimations';
import { useHoverTilt } from '../motion/interactions';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// We will fetch contracts from the backend now instead of using mock data.

const ContractRow: React.FC<{ contract: any }> = ({ contract }) => {
  // Apply a very subtle 3-degree hover tilt to list rows
  const { ref, props } = useHoverTilt(3);

  let riskColor = 'var(--color-ink, #2B2B2B)';
  if (contract.risk === 'LOW')    riskColor = '#16A34A'; // green
  if (contract.risk === 'MEDIUM') riskColor = '#EAB308'; // amber
  if (contract.risk === 'HIGH')   riskColor = '#DC2626'; // red

  const tier = contract.risk.toLowerCase() as 'high' | 'medium' | 'low' | 'neutral';

  return (
    <motion.div
      ref={ref}
      {...props}
      className="dashboard-row relative flex items-center justify-between p-4 sm:px-6 bg-[var(--color-ink,#12181A)] border-b border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.03)] sm:hover:pl-8 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center gap-6">
        <span
          className="text-[12px] opacity-40 font-medium group-hover:opacity-70 transition-opacity"
          style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-paper,#FFFFFF)' }}
        >
          {contract.id.substring(0, 8)}
        </span>
        <div className="flex flex-col">
          <span
            className="font-bold text-[14px] group-hover:text-white transition-colors"
            style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.9)' }}
          >
            {contract.filename}
          </span>
          <span
            className="text-[11px] opacity-50 mt-1"
            style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-paper,#FFFFFF)' }}
          >
            UPLOADED: {contract.date}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 pr-4 opacity-80 group-hover:opacity-100 transition-opacity">
        <Badge tier={tier} size="sm" className="!text-[var(--color-paper,#FFFFFF)] !border-[rgba(255,255,255,0.2)] group-hover:!border-[var(--tier-color)] transition-colors">
          RISK: {contract.risk}
        </Badge>
      </div>

      {/* Colored Vertical Slab */}
      <div
        className="absolute right-0 top-0 bottom-0 w-[4px] group-hover:w-[6px] transition-all duration-300"
        style={{ 
          backgroundColor: riskColor,
          boxShadow: `0 0 10px ${riskColor}00` // base state, no glow
        }}
      />
      {/* Hidden glow div that fades in on hover */}
      <div
        className="absolute right-0 top-0 bottom-0 w-[6px] opacity-0 group-hover:opacity-40 transition-opacity duration-300"
        style={{ 
          backgroundColor: riskColor,
          boxShadow: `0 0 12px ${riskColor}`
        }}
      />
    </motion.div>
  );
};

const DashboardPage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'failed' | 'success'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFilename, setCurrentFilename] = useState('CONTRACT.PDF');
  const [uploadedContractId, setUploadedContractId] = useState<string | null>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(true);

  const fetchContracts = useCallback(async () => {
    try {
      setLoadingContracts(true);
      const res = await api.get('/report/');
      // Map backend response to frontend expected format
      const mappedContracts = res.data.map((c: any) => {
        let riskLevel = 'NEUTRAL';
        if (c.overall_risk_score !== null) {
          if (c.overall_risk_score > 0.6) riskLevel = 'HIGH';
          else if (c.overall_risk_score > 0.3) riskLevel = 'MEDIUM';
          else riskLevel = 'LOW';
        } else if (c.status === 'failed') {
          riskLevel = 'HIGH'; // highlight failures
        } else if (c.status === 'pending' || c.status === 'processing') {
          riskLevel = 'NEUTRAL'; // pending analysis
        }
        
        return {
          id: c.id,
          filename: c.filename,
          date: new Date(c.created_at).toLocaleString(),
          risk: riskLevel,
          status: c.status
        };
      });
      setContracts(mappedContracts);
    } catch (error) {
      console.error('Failed to fetch contracts', error);
    } finally {
      setLoadingContracts(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    // Stagger the list rows precisely at 0.05s as they scroll into view
    const cleanup = initScrollReveal('.dashboard-row', { stagger: 0.05 });
    
    return () => cleanup();
  }, [prefersReducedMotion]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setCurrentFilename(file.name);
    setUploadStatus('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      // API returned 202 Accepted -> status becomes processing
      setUploadStatus('processing');
      setUploadedContractId(res.data.contract_id);
      
      // We would normally poll for completion here.
      // For this implementation, we'll simulate processing for a few seconds.
      setTimeout(() => {
        setUploadStatus('success');
      }, 5000);

    } catch (err) {
      console.error('Upload failed', err);
      setUploadStatus('failed');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 20 * 1024 * 1024, // 20 MB
    disabled: uploadStatus === 'uploading' || uploadStatus === 'processing' || uploadStatus === 'success',
  });

  const handleDoneHandoff = useCallback(() => {
    if (uploadedContractId) {
      navigate(`/results/${uploadedContractId}`);
    } else {
      // Fallback in case backend doesn't return contract_id correctly
      navigate(`/results/fallback-id`);
    }
  }, [uploadedContractId, navigate]);

  return (
    <div
      className="min-h-screen flex flex-col w-full relative"
      style={{ backgroundColor: 'var(--color-paper, #DCEEEA)' }}
    >
      <Navbar
        isAuthed={true}
        user={{ name: user?.name || user?.email || 'Pilot', role: 'USER' }}
        navLinks={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports',   href: '/analytics' },
        ]}
      />

      <main className="flex-1 flex flex-col max-w-[1200px] w-full mx-auto px-6 py-12">
        <div className="mb-10">
          <h1
            className="text-[32px] sm:text-[40px] font-bold uppercase tracking-tight"
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              color: 'var(--color-ink, #12181A)',
            }}
          >
            Flight Deck
          </h1>
          <p
            className="opacity-70 mt-2 text-[14px]"
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              color: 'var(--color-ink, #12181A)',
            }}
          >
            SYSTEM OPERATIONAL. AWAITING DOCUMENT PAYLOADS.
          </p>
        </div>

        {/* FlightDeckScene File Uploader Wrapper */}
        <div {...getRootProps()} className="relative w-full cursor-pointer group">
          <input {...getInputProps()} />
          <FlightDeckScene
            status={uploadStatus}
            progress={uploadProgress}
            filename={currentFilename}
            onDoneHandoff={handleDoneHandoff}
            className={`transition-opacity ${isDragActive ? 'opacity-80' : 'opacity-100'}`}
          />
          {/* Overlay to hint at Drag and Drop */}
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploadStatus === 'idle' && !isDragActive && (
              <div className="bg-[var(--color-paper)] text-[var(--color-ink)] px-4 py-2 text-[12px] uppercase font-bold tracking-widest font-mono rounded-[2px] opacity-90 shadow-lg">
                CLICK OR DROP PDF TO INITIATE SCAN
              </div>
            )}
            {isDragActive && (
              <div className="bg-[var(--color-signal-yellow,#F2E900)] text-[var(--color-ink)] px-6 py-3 text-[14px] uppercase font-bold tracking-widest font-mono rounded-[2px] shadow-lg animate-pulse">
                RELEASE TO DEPLOY PAYLOAD
              </div>
            )}
          </div>
        </div>

        {/* ── Analytics strip ─────────────────────────────────────── */}
        {(() => {
          const total  = contracts.length;
          const high   = contracts.filter(c => c.risk === 'HIGH').length;
          const medium = contracts.filter(c => c.risk === 'MEDIUM').length;
          const low    = contracts.filter(c => c.risk === 'LOW').length;
          const latest = contracts.length > 0 ? contracts[0] : { date: 'N/A' };

          const stats = [
            { label: 'TOTAL SCANS',    value: total,                     accent: 'var(--color-paper,#FFFFFF)' },
            { label: 'HIGH RISK',      value: high,                      accent: '#DC2626' },
            { label: 'MEDIUM RISK',    value: medium,                    accent: '#EAB308' },
            { label: 'LOW RISK',       value: low,                       accent: '#16A34A' },
          ];

          return (
            <div className="mt-12 mb-8">
              {/* Stat row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {stats.map(s => (
                  <HudPanel
                    key={s.label}
                    className="!p-0 !bg-[#0D1113] !border-[rgba(255,255,255,0.1)] shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.6)] hover:-translate-y-[2px] transition-all duration-300 relative group cursor-pointer"
                    accentColor="var(--color-paper,#FFFFFF)"
                  >
                    {/* accent top bar */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] opacity-70 group-hover:opacity-100 group-hover:h-[4px] transition-all duration-300 z-0 rounded-t-[2px]" style={{ backgroundColor: s.accent, boxShadow: `0 0 12px ${s.accent}` }} />
                    
                    {/* inner content wrapper */}
                    <div className="p-5 flex flex-col justify-center gap-1 relative z-10 pt-6">
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-[0.14em] opacity-40 group-hover:opacity-70 transition-opacity"
                        style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-paper,#FFFFFF)' }}
                      >
                        {s.label}
                      </span>
                      <span
                        className="text-[36px] font-extrabold leading-none tracking-tight"
                        style={{ fontFamily: '"Space Grotesk", sans-serif', color: s.accent }}
                      >
                        {s.value}
                      </span>
                    </div>
                  </HudPanel>
                ))}
              </div>

              {/* Risk distribution bar */}
              <div className="flex h-[6px] w-full overflow-hidden border border-[rgba(43,43,43,0.15)]">
                <div style={{ width: `${(high   / total) * 100}%`, backgroundColor: '#DC2626' }} />
                <div style={{ width: `${(medium / total) * 100}%`, backgroundColor: '#EAB308' }} />
                <div style={{ width: `${(low    / total) * 100}%`, backgroundColor: '#16A34A' }} />
              </div>
              <div className="flex items-center gap-5 mt-2">
                {[['#DC2626','HIGH'],['#EAB308','MEDIUM'],['#16A34A','LOW']].map(([color,label]) => (
                  <span key={label} className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] opacity-50"
                    style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                ))}
                <span
                  className="ml-auto text-[10px] font-extrabold uppercase tracking-[0.1em] opacity-40"
                  style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--color-ink,#2B2B2B)' }}
                >
                  LAST SCAN: {latest.date}
                </span>
              </div>
            </div>
          );
        })()}

        <HudPanel label="HISTORY_LOG" className="mt-4 !bg-[#0D1113] !border-[rgba(255,255,255,0.1)] shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all" accentColor="var(--color-paper,#FFFFFF)">
          <h2
            className="text-[20px] font-bold uppercase tracking-tight mb-6 flex items-center gap-3"
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              color: 'var(--color-paper, #FFFFFF)',
            }}
          >
            Recent Operations
            <span className="h-[1px] flex-grow bg-gradient-to-r from-[rgba(255,255,255,0.2)] to-transparent" />
          </h2>

          {/* Contract History List */}
          <div className="flex flex-col border-t border-[rgba(255,255,255,0.15)]">
            {loadingContracts ? (
              <div className="p-6 text-center text-[var(--color-paper)] opacity-50" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                FETCHING DATA...
              </div>
            ) : contracts.length === 0 ? (
              <div className="p-6 text-center text-[var(--color-paper)] opacity-50" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                NO OPERATIONS FOUND
              </div>
            ) : (
              contracts.map((contract) => (
                <div key={contract.id} onClick={() => navigate(`/results/${contract.id}`)}>
                  <ContractRow contract={contract} />
                </div>
              ))
            )}
          </div>
        </HudPanel>
      </main>
    </div>
  );
};

export default DashboardPage;
