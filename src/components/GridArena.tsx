import React from 'react';
import { Zap, Star, AlertTriangle, ShieldCheck } from 'lucide-react';

export type NodeType = 'data' | 'gold' | 'hazard' | null;

interface GridArenaProps {
  activeNodeIndex: number | null;
  activeNodeType: NodeType;
  onNodeClick: (index: number) => void;
  isBotStunned: boolean;
  isQteActive: boolean;
  lastMissIndex: number | null;
}

export const GridArena: React.FC<GridArenaProps> = ({
  activeNodeIndex,
  activeNodeType,
  onNodeClick,
  isBotStunned,
  isQteActive,
  lastMissIndex,
}) => {
  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto p-3 sm:p-4 bg-slate-900/60 rounded-3xl border border-slate-800/90 shadow-2xl backdrop-blur-sm">
      {/* Bot Stunned Banner Indicator */}
      {isBotStunned && !isQteActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>BOT FROZEN · FREE CAPTURES!</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 w-full h-full">
        {Array.from({ length: 9 }).map((_, index) => {
          const isActive = activeNodeIndex === index;
          const isMiss = lastMissIndex === index;

          let nodeStyle = 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700/80';
          let content = null;

          if (isActive) {
            if (activeNodeType === 'data') {
              nodeStyle =
                'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20 scale-[1.03] animate-pulse';
              content = (
                <div className="flex flex-col items-center justify-center gap-1">
                  <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 fill-cyan-400/40" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-300">
                    DATA
                  </span>
                </div>
              );
            } else if (activeNodeType === 'gold') {
              nodeStyle =
                'bg-amber-500/20 border-amber-400 text-amber-300 shadow-xl shadow-amber-500/30 scale-[1.05] animate-bounce';
              content = (
                <div className="flex flex-col items-center justify-center gap-1">
                  <Star className="w-8 h-8 sm:w-9 sm:h-9 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] font-black tracking-wider uppercase text-amber-300">
                    +SUPER
                  </span>
                </div>
              );
            } else if (activeNodeType === 'hazard') {
              nodeStyle =
                'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/25';
              content = (
                <div className="flex flex-col items-center justify-center gap-1">
                  <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-rose-400 animate-pulse" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-rose-400">
                    HAZARD
                  </span>
                </div>
              );
            }
          } else if (isMiss) {
            nodeStyle = 'bg-rose-950/40 border-rose-500/80 text-rose-400 shake-animation';
          }

          return (
            <button
              key={index}
              onClick={() => onNodeClick(index)}
              disabled={isQteActive}
              aria-label={`Grid node ${index + 1}`}
              className={`relative rounded-2xl border-2 transition-all duration-100 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden active:scale-95 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${nodeStyle}`}
            >
              {/* Subtle Keyboard Index in top corner */}
              <span className="absolute top-1.5 left-2 text-[10px] font-mono text-slate-600 font-medium">
                {index + 1}
              </span>

              {content || (
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80 transition-colors group-hover:bg-slate-700" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
