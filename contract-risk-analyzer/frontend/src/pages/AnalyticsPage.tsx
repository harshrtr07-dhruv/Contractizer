import React, { useEffect, useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { HudPanel } from '../components/hud/HudPanel';
import { Badge } from '../components/ui/Badge';
import { useHoverTilt } from '../motion/interactions';
import { initScrollReveal } from '../motion/scrollAnimations';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Fallback mock for clauses since /report/ doesn't return all clauses yet
const TOP_CLAUSES = [
  { name: 'Indemnity', count: 42 },
  { name: 'Termination', count: 35 },
  { name: 'Liability', count: 28 },
  { name: 'Privacy', count: 22 },
  { name: 'IP Rights', count: 18 },
];

// --- STAT CARD COMPONENT ---
const StatCard: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => {
  const { ref, props } = useHoverTilt(4);
  return (
    <motion.div ref={ref} {...props} className="w-full">
      <HudPanel className="w-full !p-0 flex flex-col items-start !bg-[#0D1113] h-full justify-between gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.6)] hover:-translate-y-[2px] transition-all duration-300 !border-[rgba(255,255,255,0.1)] group cursor-pointer" accentColor="var(--color-paper,#FFFFFF)">
        
        <div className="absolute top-0 left-0 right-0 h-[3px] opacity-70 group-hover:opacity-100 group-hover:h-[4px] transition-all duration-300 z-0 rounded-t-[2px]" style={{ backgroundColor: 'var(--color-paper,#FFFFFF)', boxShadow: `0 0 12px rgba(255,255,255,0.5)` }} />
        
        <div className="p-6 flex flex-col justify-center gap-1 relative z-10 pt-8 w-full">
          <div
            className="text-[11px] uppercase font-bold tracking-tight opacity-40 group-hover:opacity-70 transition-opacity"
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              color: 'var(--color-paper,#FFFFFF)',
            }}
          >
            {label}
          </div>
          <div
            className="text-[40px] sm:text-[48px] font-bold leading-none tracking-tighter group-hover:text-white transition-colors"
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            {value}
          </div>
        </div>
      </HudPanel>
    </motion.div>
  );
};

// --- CUSTOM TOOLTIP FOR RECHARTS ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-3 border border-[rgba(255,255,255,0.1)] !bg-[#0D1113] shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        style={{ fontFamily: '"IBM Plex Mono", monospace' }}
      >
        <p className="text-[10px] uppercase font-bold mb-2 opacity-60 text-white">
          {label || payload[0].name}
        </p>
        <p className="text-[14px] font-bold text-white">
          VALUE: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

// --- MAIN PAGE COMPONENT ---
const AnalyticsPage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<'30d' | '7d' | 'all'>('30d');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium'>('all');
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/report/').then(res => setContracts(res.data)).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const cleanup = initScrollReveal('.analytics-section', { stagger: 0.1 });
    return () => cleanup();
  }, [prefersReducedMotion, contracts]);

  const cycleTimeFilter = () => {
    if (timeFilter === '30d') setTimeFilter('7d');
    else if (timeFilter === '7d') setTimeFilter('all');
    else setTimeFilter('30d');
  };

  const toggleHighRisk = () => {
    setRiskFilter(prev => prev === 'high' ? 'all' : 'high');
  };

  const toggleMediumRisk = () => {
    setRiskFilter(prev => prev === 'medium' ? 'all' : 'medium');
  };

  // --- DERIVED DATA ---
  const filteredRiskData = useMemo(() => {
    let high = 0, medium = 0, low = 0;
    contracts.forEach(c => {
      const score = c.overall_risk_score || 0;
      if (score >= 7.5) high++;
      else if (score >= 4.5) medium++;
      else low++;
    });
    
    let data = [
      { name: 'HIGH', value: Math.max(0.1, high), color: '#E63993' },
      { name: 'MEDIUM', value: Math.max(0.1, medium), color: '#F2E900' },
      { name: 'LOW', value: Math.max(0.1, low), color: '#4F8F82' },
    ];
    if (riskFilter === 'high') data = data.filter(d => d.name === 'HIGH');
    if (riskFilter === 'medium') data = data.filter(d => d.name === 'MEDIUM');
    return data;
  }, [contracts, riskFilter]);

  const filteredContractsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    contracts.forEach(c => {
      const type = c.contract_type || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [contracts]);

  const filteredTopClauses = useMemo(() => {
    return TOP_CLAUSES;
  }, []);

  const filteredVolumeData = useMemo(() => {
    const counts: Record<string, number> = {};
    contracts.forEach(c => {
      const date = new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([date, volume]) => ({ date, volume })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [contracts]);

  const totalContracts = contracts.length;
  const criticalLiabilities = filteredRiskData.find(d => d.name === 'HIGH')?.value || 0;
  const avgProcessingTime = contracts.length > 0 ? 842 : 0; // Mock until backend tracks processing time
  const riskIndex = contracts.length > 0 ? (criticalLiabilities > 5 ? 8.4 : 3.2) : 0;

  return (
    <div
      className="min-h-screen flex flex-col w-full bg-[var(--color-paper,#DCEEEA)]"
    >
      <Navbar
        isAuthed={true}
        user={{ name: user?.name || user?.email || 'Pilot', role: 'USER' }}
        navLinks={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports', href: '/analytics' },
          { label: 'Settings', href: '/settings' },
        ]}
      />

      <main className="flex-1 flex flex-col w-full max-w-[1440px] mx-auto px-6 py-12 lg:py-16">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1
              className="text-[32px] sm:text-[40px] font-bold uppercase tracking-tight mb-2"
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                color: 'var(--color-ink,#12181A)',
              }}
            >
              System Analytics
            </h1>
            <p
              className="text-[12px] opacity-60 uppercase tracking-[0.05em]"
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                color: 'var(--color-ink,#12181A)',
              }}
            >
              GLOBAL TELEMETRY & RISK DISTRIBUTION
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-[10px] uppercase font-bold opacity-50 mr-2"
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                color: 'var(--color-ink,#12181A)',
              }}
            >
              FILTERS:
            </span>
            <Badge 
              tier="neutral" 
              size="sm" 
              interactive={true} 
              className="cursor-pointer select-none"
              onClick={cycleTimeFilter}
            >
              {timeFilter === '30d' ? 'LAST 30 DAYS' : timeFilter === '7d' ? 'LAST 7 DAYS' : 'ALL TIME'}
            </Badge>
            <Badge 
              tier="high" 
              size="sm" 
              interactive={true} 
              className={`cursor-pointer select-none transition-opacity ${riskFilter === 'medium' ? 'opacity-30' : 'opacity-100'}`}
              onClick={toggleHighRisk}
            >
              HIGH RISK ONLY
            </Badge>
            <Badge 
              tier="medium" 
              size="sm" 
              interactive={true} 
              className={`cursor-pointer select-none transition-opacity ${riskFilter === 'high' ? 'opacity-30' : 'opacity-100'}`}
              onClick={toggleMediumRisk}
            >
              MEDIUM RISK ONLY
            </Badge>
          </div>
        </div>

        {/* Top Summary Stats */}
        <section className="analytics-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 perspective-1000">
          <StatCard label="Total Contracts Analyzed" value={totalContracts} />
          <StatCard label="Critical Liabilities" value={criticalLiabilities} />
          <StatCard label="Avg Processing Time (ms)" value={avgProcessingTime} />
          <StatCard label="Overall Risk Index" value={riskIndex} />
        </section>

        {/* Charts Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          {/* Chart 1: Risk Tier Distribution */}
          <div className="analytics-section w-full h-[400px]">
            <HudPanel label="RISK_DISTRIBUTION" className="w-full h-full !p-0 !bg-[#0D1113] !border-[rgba(255,255,255,0.1)] shadow-[0_4px_30px_rgba(0,0,0,0.2)] transition-all duration-500 hover:shadow-[0_4px_40px_rgba(0,0,0,0.4)] hover:border-[rgba(255,255,255,0.2)]" accentColor="var(--color-paper,#FFFFFF)">
              <div className="w-full h-full flex flex-col p-6">
                <h3
                  className="text-[16px] font-bold uppercase tracking-tight mb-6 flex-shrink-0"
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    color: 'var(--color-paper,#FFFFFF)',
                  }}
                >
                  Risk Tier Distribution
                </h3>
                <div className="flex-1 w-full min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                      <Pie
                        data={filteredRiskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="#0D1113"
                        strokeWidth={3}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelStyle={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace' }}
                      >
                        {filteredRiskData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px', fontWeight: 'bold', paddingLeft: '4px' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </HudPanel>
          </div>

          {/* Chart 2: Volume Over Time */}
          <div className="analytics-section w-full h-[400px]">
            <HudPanel label="VOLUME_TELEMETRY" className="w-full h-full !p-0 !bg-[#0D1113] !border-[rgba(255,255,255,0.1)] shadow-[0_4px_30px_rgba(0,0,0,0.2)] transition-all duration-500 hover:shadow-[0_4px_40px_rgba(0,0,0,0.4)] hover:border-[rgba(255,255,255,0.2)]" accentColor="var(--color-paper,#FFFFFF)">
              <div className="w-full h-full flex flex-col p-6">
                <h3
                  className="text-[16px] font-bold uppercase tracking-tight mb-6 flex-shrink-0"
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    color: 'var(--color-paper,#FFFFFF)',
                  }}
                >
                  Scan Volume Over Time
                </h3>
                <div className="flex-1 w-full min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" strokeOpacity={1} vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace' }} 
                        tickLine={false} 
                        axisLine={{ stroke: 'rgba(255,255,255,0.2)', strokeOpacity: 1 }}
                      />
                      <YAxis 
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace' }} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="stepAfter" 
                        dataKey="volume" 
                        stroke="var(--color-paper,#FFFFFF)" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: 'var(--color-signal-yellow,#F2E900)', stroke: '#0D1113', strokeWidth: 1.5 }} 
                        activeDot={{ r: 6, fill: 'var(--color-clearance-pink,#E63993)', stroke: '#0D1113', strokeWidth: 1.5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </HudPanel>
          </div>

          {/* Chart 3: Contracts By Type */}
          <div className="analytics-section w-full h-[400px]">
            <HudPanel label="DOC_CLASSIFICATION" className="w-full h-full !p-0 !bg-[#0D1113] !border-[rgba(255,255,255,0.1)] shadow-[0_4px_30px_rgba(0,0,0,0.2)] transition-all duration-500 hover:shadow-[0_4px_40px_rgba(0,0,0,0.4)] hover:border-[rgba(255,255,255,0.2)]" accentColor="var(--color-paper,#FFFFFF)">
              <div className="w-full h-full flex flex-col p-6">
                <h3
                  className="text-[16px] font-bold uppercase tracking-tight mb-6 flex-shrink-0"
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    color: 'var(--color-paper,#FFFFFF)',
                  }}
                >
                  Contracts by Type
                </h3>
                <div className="flex-1 w-full min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredContractsByType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" strokeOpacity={1} vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace' }} 
                        tickLine={false} 
                        axisLine={{ stroke: 'rgba(255,255,255,0.2)', strokeOpacity: 1 }}
                      />
                      <YAxis 
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace' }} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)', opacity: 1 }} />
                      <Bar 
                        dataKey="count" 
                        fill="var(--color-cleared-teal,#4F8F82)" 
                        stroke="#0D1113" 
                        strokeWidth={1} 
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </HudPanel>
          </div>

          {/* Chart 4: Top Flagged Clauses */}
          <div className="analytics-section w-full h-[400px]">
            <HudPanel label="LIABILITY_HOTSPOTS" className="w-full h-full !p-0 !bg-[#0D1113] !border-[rgba(255,255,255,0.1)] shadow-[0_4px_30px_rgba(0,0,0,0.2)] transition-all duration-500 hover:shadow-[0_4px_40px_rgba(0,0,0,0.4)] hover:border-[rgba(255,255,255,0.2)]" accentColor="var(--color-paper,#FFFFFF)">
              <div className="w-full h-full flex flex-col p-6">
                <h3
                  className="text-[16px] font-bold uppercase tracking-tight mb-6 flex-shrink-0"
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    color: 'var(--color-paper,#FFFFFF)',
                  }}
                >
                  Top Flagged Clause Types
                </h3>
                <div className="flex-1 w-full min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredTopClauses} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" strokeOpacity={1} horizontal={false} />
                      <XAxis 
                        type="number"
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace' }} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        type="category"
                        dataKey="name" 
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace' }} 
                        tickLine={false} 
                        axisLine={{ stroke: 'rgba(255,255,255,0.2)', strokeOpacity: 1 }}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)', opacity: 1 }} />
                      <Bar 
                        dataKey="count" 
                        fill="var(--color-signal-yellow,#F2E900)" 
                        stroke="#0D1113" 
                        strokeWidth={1} 
                        radius={[0, 2, 2, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </HudPanel>
          </div>
          
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

export default AnalyticsPage;
