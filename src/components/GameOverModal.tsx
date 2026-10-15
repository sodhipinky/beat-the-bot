import React, { useState } from 'react';
import { Trophy, Skull, RotateCcw, Zap, Target, Gauge, Copy, Check } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  isVictory: boolean;
  score: number;
  highScore: number;
  isNewHigh: boolean;
  maxCombo: number;
  avgReactionTimeMs: number;
  nodesCaptured: number;
  nodesMissedOrHazards: number;
  difficulty: 'rookie' | 'challenger' | 'overclocked';
  onChangeDifficulty: (diff: 'rookie' | 'challenger' | 'overclocked') => void;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isVictory,
  score,
  highScore,
  isNewHigh,
  maxCombo,
  avgReactionTimeMs,
  nodesCaptured,
  nodesMissedOrHazards,
  difficulty,
  onChangeDifficulty,
  onRestart,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalInteractions = nodesCaptured + nodesMissedOrHazards;
  const accuracy = totalInteractions > 0 ? Math.round((nodesCaptured / totalInteractions) * 100) : 100;

  const handleCopyShare = () => {
    const text = `🎮 I scored ${score} pts in Beat the Bot (${isVictory ? 'VICTORY 🏆' : 'DEFEATED 🤖'}) on ${difficulty} difficulty with a ${maxCombo}x combo!`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Banner Icon */}
        <div
          className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg ${
            isVictory
              ? 'bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
              : 'bg-rose-500/10 border-2 border-rose-500/40 text-rose-400 shadow-rose-500/10'
          }`}
        >
          {isVictory ? <Trophy className="w-8 h-8" /> : <Skull className="w-8 h-8" />}
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mb-1">
          {isVictory ? 'You Beat the Bot!' : 'Mainframe Overtaken'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          {isVictory
            ? 'C.O.R.E. AI succumbed to your human reaction latency.'
            : 'The computer seized total control of the terminal.'}
        </p>

        {/* Primary Score Board */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 mb-5">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            Final Battle Score
          </div>
          <div className="text-4xl font-extrabold font-display text-white tracking-tight tabular-nums">
            {score.toLocaleString()}
          </div>

          {isNewHigh && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>New Personal Record!</span>
            </div>
          )}
          {!isNewHigh && (
            <div className="text-xs text-slate-400 mt-1">
              Personal Best: <span className="font-semibold text-slate-200">{highScore.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Battle Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-left">
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>Accuracy</span>
            </div>
            <div className="text-lg font-bold font-display text-white tabular-nums">
              {accuracy}%
            </div>
            <div className="text-[10px] text-slate-400">
              {nodesCaptured} hits
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>Avg Latency</span>
            </div>
            <div className="text-lg font-bold font-display text-white tabular-nums">
              {avgReactionTimeMs > 0 ? `${avgReactionTimeMs}ms` : '--'}
            </div>
            <div className="text-[10px] text-slate-400">
              Response time
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Max Streak</span>
            </div>
            <div className="text-lg font-bold font-display text-white tabular-nums">
              {maxCombo}x
            </div>
            <div className="text-[10px] text-slate-400">
              Combo multiplier
            </div>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Next Match Difficulty
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            {(['rookie', 'challenger', 'overclocked'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => onChangeDifficulty(diff)}
                className={`py-1.5 text-xs font-semibold capitalize rounded-lg transition-colors ${
                  difficulty === diff
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onRestart}
            className="w-full py-3.5 px-6 rounded-xl font-bold font-display text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={handleCopyShare}
            className="w-full py-2 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Battle Summary!' : 'Copy Result'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
