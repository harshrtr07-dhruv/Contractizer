import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, AlertTriangle, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import UploadCard from '../components/UploadCard';
import api from '../services/api';

const DashboardPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchContracts = async () => {
    try {
      const response = await api.get('/report/');
      setContracts(response.data);
    } catch (err) {
      console.error('Failed to fetch contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleUploadSuccess = (data) => {
    fetchContracts();
    if (data.contract_id) {
      navigate(`/results/${data.contract_id}`);
    }
  };

  const getStatusBadge = (status, score) => {
    if (status === 'pending' || status === 'processing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 animate-pulse">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Analyzing</span>
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertTriangle className="w-3 h-3" />
          <span>Failed</span>
        </span>
      );
    }

    if (score >= 7.5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertTriangle className="w-3 h-3" />
          <span>High Risk ({score})</span>
        </span>
      );
    }
    if (score >= 4.5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <AlertTriangle className="w-3 h-3" />
          <span>Med Risk ({score})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
        <CheckCircle className="w-3 h-3" />
        <span>Low Risk ({score || '1.0'})</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Contract Risk Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Upload commercial PDFs to automatically classify risk clauses with Legal-BERT.</p>
      </div>

      <UploadCard onUploadSuccess={handleUploadSuccess} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Recent Contracts</span>
          </h2>
          <button
            onClick={fetchContracts}
            className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading contract history...</div>
        ) : contracts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/60">
            <p className="text-slate-400 text-sm">No contracts uploaded yet.</p>
            <p className="text-xs text-slate-600 mt-1">Upload your first PDF contract above to see risk analysis.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                onClick={() => navigate(`/results/${contract.id}`)}
                className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 hover:text-indigo-300 transition-colors">
                      {contract.filename}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>{contract.contract_type || 'General Contract'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(contract.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(contract.status, contract.overall_risk_score)}
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
