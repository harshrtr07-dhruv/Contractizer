import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, FileText, Info } from 'lucide-react';

const ClauseCard = ({ clause }) => {
  const [expanded, setExpanded] = useState(false);

  const getRiskStyle = (score) => {
    if (score >= 7.5) {
      return {
        badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        border: 'border-l-4 border-l-rose-500'
      };
    }
    if (score >= 4.5) {
      return {
        badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        border: 'border-l-4 border-l-amber-500'
      };
    }
    return {
      badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      border: 'border-l-4 border-l-emerald-500'
    };
  };

  const style = getRiskStyle(clause.risk_score);

  return (
    <div className={`rounded-xl bg-slate-900/40 border border-slate-800 ${style.border} overflow-hidden transition-all duration-200 hover:border-slate-700`}>
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${style.badge}`}>
              {clause.risk_category} Risk ({clause.risk_score})
            </span>
            <span className="text-sm font-semibold text-slate-200">{clause.clause_type}</span>
          </div>
          {clause.page_number && (
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">
              <FileText className="w-3 h-3" /> Page {clause.page_number}
            </span>
          )}
        </div>

        {/* Plain English Summary */}
        <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">Plain English Insight</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{clause.plain_english}</p>
          </div>
        </div>

        {/* Expandable Original Clause Text */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span>{expanded ? 'Hide Original Contract Text' : 'View Original Contract Text'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="mt-3 p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
              "{clause.original_text}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClauseCard;
