import React from 'react';
import { AlertTriangle, CheckCircle, Flame } from 'lucide-react';

const RiskGauge = ({ score = 1.0 }) => {
  const roundedScore = Number(score).toFixed(1);

  let category = 'Low Risk';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  let ringColor = 'stroke-emerald-500';
  let Icon = CheckCircle;

  if (score >= 7.5) {
    category = 'High Risk';
    badgeBg = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    ringColor = 'stroke-rose-500';
    Icon = Flame;
  } else if (score >= 4.5) {
    category = 'Medium Risk';
    badgeBg = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    ringColor = 'stroke-amber-500';
    Icon = AlertTriangle;
  }

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  return (
    <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
      <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            className={`${ringColor} transition-all duration-1000 ease-out`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">{roundedScore}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Out of 10</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold w-fit ${badgeBg}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{category}</span>
        </div>
        <h3 className="text-xl font-bold text-white">Overall Contract Risk</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
          Calculated using Legal-BERT zero-shot classification and weighted clause impact metrics.
        </p>
      </div>
    </div>
  );
};

export default RiskGauge;
