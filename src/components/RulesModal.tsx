import React from 'react';
import { Zap, AlertTriangle, Star, ShieldAlert, Cpu, Sparkles, X } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOrResume: () => void;
  isGameActive: boolean;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  onStartOrResume,
  isGameActive,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close rules"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">How to Play</h2>
            <p className="text-xs text-slate-400">Beat the Bot in the Tug-of-War Mainframe Duel</p>
          </div>
        </div>

        {/* Objective */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-5 text-sm leading-relaxed">
          <span className="font-semibold text-cyan-300">Objective:</span> Race against the bot to seize 100% control of the mainframe core. Every node captured pulls the energy meter in your direction. If the bot drags the core to 0%, your system crashes!
        </div>

        {/* Node Types */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tactical Grid Elements</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/40 border border-cyan-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm mb-1">
                <Zap className="w-4 h-4 shrink-0" />
                <span>Data Node</span>
              </div>
              <p className="text-xs text-slate-300">Click swiftly before the bot snatches it. Boosts score & combo.</p>
            </div>

            <div className="bg-slate-800/40 border border-amber-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1">
                <Star className="w-4 h-4 shrink-0" />
                <span>Supercell</span>
              </div>
              <p className="text-xs text-slate-300">Rare high-yield power cell! Gives big points and +35% EMP charge.</p>
            </div>

            <div className="bg-slate-800/40 border border-rose-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Hazard Decoy</span>
              </div>
              <p className="text-xs text-slate-300">Do not click! Siphons your energy. The bot can occasionally trip on it.</p>
            </div>
          </div>
        </div>

        {/* Special Mechanics */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Surprise & Special Powers</h3>
          
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2.5 p-2.5 bg-slate-950/40 rounded-lg border border-slate-800">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300">Surprise Bot Overdrive:</strong> The bot can suddenly launch a full-screen mainframe breach! Rapidly mash the counter-firewall button to reflect the attack and stun the bot.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-slate-950/40 rounded-lg border border-slate-800">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300">EMP Disruptor:</strong> Build charge to 100% by securing nodes. Unleash it (button or <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-white">Space</kbd>) to freeze the bot for 4.5 seconds!
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Controls */}
        <div className="mb-6 p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 text-slate-400">
          <span>Keyboard shortcuts:</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-300"><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">1</kbd>–<kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">9</kbd> Grid Nodes</span>
            <span>·</span>
            <span className="text-slate-300"><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">Space</kbd> EMP / Mash</span>
          </div>
        </div>

        <button
          onClick={onStartOrResume}
          className="w-full py-3.5 px-6 rounded-xl font-bold font-display text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] transition-all shadow-lg shadow-cyan-500/20 text-center"
        >
          {isGameActive ? 'Resume Match' : 'Start Battle'}
        </button>
      </div>
    </div>
  );
};
