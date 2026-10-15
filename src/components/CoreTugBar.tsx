import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

interface CoreTugBarProps {
  progress: number; // 0 to 100
}

export const CoreTugBar: React.FC<CoreTugBarProps> = ({ progress }) => {
  const isPlayerWinning = progress > 50;
  const isBotWinning = progress < 50;
  const isCriticalDanger = progress <= 20;
  const isDominating = progress >= 80;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between text-xs font-bold mb-2 tracking-wide">
        <div className="flex items-center gap-1.5 text-rose-400">
          <Cpu className="w-3.5 h-3.5" />
          <span>BOT CONTROL ({Math.round(100 - progress)}%)</span>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          {isCriticalDanger && (
            <span className="text-rose-400 font-bold animate-pulse">WARNING: CORE COLLAPSE</span>
          )}
          {isDominating && (
            <span className="text-cyan-400 font-bold">OVERHEAT IMMINENT</span>
          )}
          {!isCriticalDanger && !isDominating && (
            <span>TUG-OF-WAR CORE</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-cyan-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PLAYER ({Math.round(progress)}%)</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-4 sm:h-5 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
        {/* Dynamic Gradient Bar */}
        <div
          className={`h-full transition-all duration-200 ease-out ${
            progress > 65
              ? 'bg-linear-to-r from-rose-500 via-cyan-500 to-emerald-400'
              : progress < 35
              ? 'bg-linear-to-r from-rose-600 via-rose-500 to-amber-500'
              : 'bg-linear-to-r from-rose-500 via-purple-500 to-cyan-400'
          }`}
          style={{ width: `${progress}%` }}
        />

        {/* Center Line 50% Marker */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40 -translate-x-1/2 pointer-events-none" />
      </div>

      <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400 font-mono">
        <span>0% · Bot Wins</span>
        <span>50% Neutral</span>
        <span>100% · Player Wins</span>
      </div>
    </div>
  );
};
