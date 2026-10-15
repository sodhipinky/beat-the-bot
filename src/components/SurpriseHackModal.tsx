import React from 'react';
import { ShieldAlert, Zap } from 'lucide-react';

interface SurpriseHackModalProps {
  isActive: boolean;
  clicksRemaining: number;
  totalRequired: number;
  timeLeft: number;
  onMash: () => void;
}

export const SurpriseHackModal: React.FC<SurpriseHackModalProps> = ({
  isActive,
  clicksRemaining,
  totalRequired,
  timeLeft,
  onMash,
}) => {
  if (!isActive) return null;

  const progressPct = ((totalRequired - clicksRemaining) / totalRequired) * 100;

  return (
    <div className="absolute inset-0 z-40 bg-rose-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-150">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 mb-3 animate-bounce">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="inline-block px-3 py-1 bg-rose-500/20 border border-rose-500/50 rounded-full text-rose-300 font-mono text-xs font-bold tracking-widest uppercase mb-2">
        Overdrive Protocol Alert
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mb-2">
        BOT EMERGENCY BREACH!
      </h2>

      <p className="text-sm text-rose-200 max-w-sm mb-4">
        The bot is overloading your security nodes. Mash the purge button or tap <kbd className="px-2 py-0.5 bg-rose-900 border border-rose-700 rounded text-xs text-white">Space</kbd> before time expires!
      </p>

      {/* Countdown timer */}
      <div className="text-3xl sm:text-4xl font-mono font-black text-rose-300 mb-4 tracking-wider">
        {Math.max(0, timeLeft).toFixed(1)}s
      </div>

      {/* Progress Track */}
      <div className="w-full max-w-xs h-3 bg-slate-900/80 rounded-full overflow-hidden border border-rose-500/40 mb-6">
        <div
          className="h-full bg-linear-to-r from-amber-400 to-rose-400 transition-all duration-75"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Big Action Mash Button */}
      <button
        onClick={onMash}
        className="w-full max-w-xs py-4 px-8 bg-white hover:bg-slate-100 active:scale-95 text-slate-950 font-display font-extrabold text-lg rounded-2xl shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 transition-transform select-none"
      >
        <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
        <span>PURGE FIREWALL ({clicksRemaining})</span>
      </button>

      <span className="text-[11px] text-rose-300/80 mt-3 font-mono">
        Tip: You can also tap the Spacebar repeatedly!
      </span>
    </div>
  );
};
