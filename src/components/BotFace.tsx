import React from 'react';

export type BotMood = 'neutral' | 'smug' | 'angry' | 'shocked' | 'glitched';

interface BotFaceProps {
  mood: BotMood;
  isStunned: boolean;
  stunSecondsLeft: number;
}

export const BotFace: React.FC<BotFaceProps> = ({ mood, isStunned, stunSecondsLeft }) => {
  // Eye styling by mood
  const renderEyes = () => {
    if (isStunned) {
      return (
        <g stroke="#f43f5e" strokeWidth="3" strokeLinecap="round">
          {/* X Eyes for stunned state */}
          <line x1="30" y1="40" x2="42" y2="52" />
          <line x1="42" y1="40" x2="30" y2="52" />
          <line x1="58" y1="40" x2="70" y2="52" />
          <line x1="70" y1="40" x2="58" y2="52" />
        </g>
      );
    }

    switch (mood) {
      case 'smug':
        return (
          <g fill="#06b6d4">
            {/* Smug half-closed eyes */}
            <path d="M 28 48 Q 36 40 44 48 Z" />
            <path d="M 56 48 Q 64 40 72 48 Z" />
          </g>
        );
      case 'angry':
        return (
          <g fill="#f43f5e">
            {/* Angled fierce eyes */}
            <polygon points="28,42 44,48 44,52 28,48" />
            <polygon points="72,42 56,48 56,52 72,48" />
          </g>
        );
      case 'shocked':
        return (
          <g fill="#fbbf24">
            {/* Wide alert circles */}
            <circle cx="36" cy="46" r="8" />
            <circle cx="64" cy="46" r="8" />
            <circle cx="36" cy="46" r="3" fill="#0f172a" />
            <circle cx="64" cy="46" r="3" fill="#0f172a" />
          </g>
        );
      case 'glitched':
        return (
          <g stroke="#a855f7" strokeWidth="3">
            <polyline points="28,44 34,50 42,42 46,48" fill="none" />
            <polyline points="54,48 58,42 66,50 72,44" fill="none" />
          </g>
        );
      default: // neutral
        return (
          <g fill="#06b6d4">
            <rect x="29" y="42" width="14" height="10" rx="3" />
            <rect x="57" y="42" width="14" height="10" rx="3" />
          </g>
        );
    }
  };

  // Mouth rendering
  const renderMouth = () => {
    if (isStunned) {
      return (
        <path
          d="M 36 68 Q 50 62 64 68"
          stroke="#f43f5e"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      );
    }

    switch (mood) {
      case 'smug':
        return (
          <path
            d="M 38 66 Q 54 72 66 63"
            stroke="#06b6d4"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        );
      case 'angry':
        return (
          <path
            d="M 36 68 Q 50 62 64 68"
            stroke="#f43f5e"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        );
      case 'shocked':
        return (
          <ellipse
            cx="50"
            cy="66"
            rx="6"
            ry="7"
            fill="#fbbf24"
          />
        );
      case 'glitched':
        return (
          <polyline
            points="35,66 42,62 48,68 54,63 65,66"
            stroke="#a855f7"
            strokeWidth="3"
            fill="none"
          />
        );
      default:
        return (
          <line
            x1="36"
            y1="66"
            x2="64"
            y2="66"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
    }
  };

  const getBorderColor = () => {
    if (isStunned) return 'border-rose-500 shadow-rose-500/30';
    switch (mood) {
      case 'angry': return 'border-rose-500/80 shadow-rose-500/20';
      case 'shocked': return 'border-amber-400/80 shadow-amber-400/20';
      case 'smug': return 'border-cyan-400/80 shadow-cyan-400/20';
      case 'glitched': return 'border-purple-400/80 shadow-purple-400/20';
      default: return 'border-slate-700';
    }
  };

  return (
    <div className="relative">
      <div
        className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-900/90 border-2 transition-all duration-200 flex items-center justify-center shadow-lg ${getBorderColor()} ${
          isStunned ? 'shake-animation' : ''
        }`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5 overflow-visible">
          {/* Antenna */}
          <line x1="50" y1="20" x2="50" y2="8" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <circle
            cx="50"
            cy="7"
            r="4.5"
            fill={isStunned ? '#f43f5e' : mood === 'angry' ? '#f43f5e' : '#06b6d4'}
            className="animate-pulse"
          />

          {/* Robot Head Outer Frame */}
          <rect
            x="16"
            y="20"
            width="68"
            height="62"
            rx="14"
            fill="#0f172a"
            stroke={isStunned ? '#f43f5e' : '#334155'}
            strokeWidth="3"
          />

          {/* Visor Screen Area */}
          <rect
            x="22"
            y="28"
            width="56"
            height="48"
            rx="8"
            fill="#020617"
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* Eye elements */}
          {renderEyes()}

          {/* Mouth elements */}
          {renderMouth()}

          {/* Stun lightning sparks if stunned */}
          {isStunned && (
            <g stroke="#fbbf24" strokeWidth="2" fill="none">
              <path d="M 12 18 L 18 24 L 14 28" />
              <path d="M 88 18 L 82 24 L 86 28" />
            </g>
          )}
        </svg>
      </div>

      {isStunned && (
        <div className="absolute -top-2 -right-2 bg-rose-600 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
          {stunSecondsLeft.toFixed(1)}s STUN
        </div>
      )}
    </div>
  );
};
