import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, ArrowLeft, RefreshCw, AlertCircle, ShieldAlert, Filter } from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import ClauseCard from '../components/ClauseCard';
import api from '../services/api';

const ResultsPage = () => {
  const { contractId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [downloading, setDownloading] = useState(false);

  const fetchReport = async () => {
    try {
      const response = await api.get(`/report/${contractId}`);
      setReport(response.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timerId;

    const loadReport = async () => {
      try {
        const response = await api.get(`/report/${contractId}`);
        setReport(response.data);
        setLoading(false);

        // Keep polling if still processing
        if (response.data?.status === 'pending' || response.data?.status === 'processing') {
          timerId = setTimeout(loadReport, 1500);
        }
      } catch (err) {
        console.error('Failed to fetch report:', err);
        setLoading(false);
      }
    };

    loadReport();

    return () => clearTimeout(timerId);
  }, [contractId]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/report/${contractId}/download`);
      if (res.data?.download_url) {
        window.open(res.data.download_url, '_blank');
      }
    } catch (err) {
      alert('Failed to generate download link.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 animate-pulse">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-white">Fetching Risk Report...</h2>
      </div>
    );
  }

  if (report?.status === 'pending' || report?.status === 'processing') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 animate-bounce">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Analyzing Contract Clauses...</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Running Legal-BERT zero-shot classification across document paragraphs. This usually takes 5-10 seconds.
        </p>
      </div>
    );
  }

  if (report?.status === 'failed') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Analysis Failed</h2>
        <p className="text-xs text-slate-400 mt-1">{report.message}</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const clauses = report?.clauses || [];
  const filteredClauses = clauses.filter((c) => {
    if (filter === 'HIGH') return c.risk_category === 'High';
    if (filter === 'MEDIUM') return c.risk_category === 'Medium';
    if (filter === 'LOW') return c.risk_category === 'Low';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-400 mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{report?.filename}</h1>
          <p className="text-xs text-slate-400 mt-1">Status: Done • {report?.total_clauses} risky clauses detected</p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20 w-fit"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Preparing Download...' : 'Download Original PDF'}</span>
        </button>
      </div>

      <RiskGauge score={report?.overall_risk_score} />

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-white">Detected Risk Clauses ({filteredClauses.length})</h2>

          <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800 w-fit">
            <span className="text-xs font-medium text-slate-400 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {report?.overall_risk_score <= 4.0 && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold text-emerald-300">No Significant Predatory Risks Found</p>
              <p className="text-xs text-emerald-400/80 mt-0.5">This contract contains standard, reciprocal terms with no unfair or un-capped financial liabilities.</p>
            </div>
          </div>
        )}

        {filteredClauses.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
            <p className="text-sm text-slate-400">No significant risks found matching the selected filter.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredClauses.map((clause) => (
              <ClauseCard key={clause.id} clause={clause} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
