import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Zap, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  RotateCcw, 
  Play, 
  Pause, 
  Sparkles, 
  Flame, 
  Trophy,
  ShieldAlert
} from 'lucide-react';
import { sound } from './utils/audio';
import { BotFace, BotMood } from './components/BotFace';
import { CoreTugBar } from './components/CoreTugBar';
import { GridArena, NodeType } from './components/GridArena';
import { RulesModal } from './components/RulesModal';
import { SurpriseHackModal } from './components/SurpriseHackModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryParticles } from './components/VictoryParticles';

type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
type Difficulty = 'rookie' | 'challenger' | 'overclocked';

const BOT_QUOTES = {
  idle: [
    "Processing human reaction latency...",
    "Calculated 99.4% probability of your defeat.",
    "Are your biological neurons firing at full speed?",
    "Terminal uplink stable. Prepare for data wipe.",
  ],
  playerHit: [
    "Lucky click, human.",
    "Rerouting auxiliary processor cycles...",
    "Micro-variance in my optical sensor!",
    "That minor gain won't save your system.",
  ],
  botHit: [
    "Too slow, fleshbag!",
    "Core bandwidth annexed!",
    "Reaction speed: 280ms. Optimal.",
    "Downloaded another chunk of the mainframe!",
  ],
  hazardHitPlayer: [
    "Targeting error! You clicked corrupted memory!",
    "Human pattern recognition failed miserably!",
    "Enjoy that system feedback loop!",
  ],
  hazardHitBot: [
    "Syntax error! That node was poisoned!",
    "Memory fault! Recalibrating logic gates...",
    "Glitched packet absorbed! Grrr!",
  ],
  empStunned: [
    "EM SHOCKWAVE DETECTED! BUS FREEZE!",
    "KERNEL PANIC! COPROCESSORS UNRESPONSIVE!",
    "ERROR 0xDEADBEEF: BOT COMPOSURE LOST!",
  ],
  qteWin: [
    "ATTACK DEFLECTED?! Core backfire overload!",
    "Firewall breached in reverse! How did you mash that fast?!",
    "Overdrive purged! Core emergency rebooting!",
  ],
  qteFail: [
    "SYSTEM BREACH COMPLETE! Thanks for the root access!",
    "Firewall disintegrated! Mainframe siphoned!",
  ],
};

export default function App() {
  // Game lifecycle states
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [difficulty, setDifficulty] = useState<Difficulty>('challenger');
  const [coreProgress, setCoreProgress] = useState<number>(50);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const val = localStorage.getItem('beat_the_bot_highscore');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [empCharge, setEmpCharge] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [showRules, setShowRules] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  // Bot states
  const [botMood, setBotMood] = useState<BotMood>('neutral');
  const [botDialogue, setBotDialogue] = useState<string>("Initializing mainframe challenge. Ready when you are!");
  const [botStunnedUntil, setBotStunnedUntil] = useState<number>(0);
  const [stunSecondsLeft, setStunSecondsLeft] = useState<number>(0);

  // Grid node states
  const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);
  const [activeNodeType, setActiveNodeType] = useState<NodeType>(null);
  const [lastMissIndex, setLastMissIndex] = useState<number | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  // Analytics & Stats
  const [nodesCaptured, setNodesCaptured] = useState<number>(0);
  const [nodesMissedOrHazards, setNodesMissedOrHazards] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const nodeSpawnTimeRef = useRef<number>(0);

  // Surprise Hack QTE states
  const [qteActive, setQteActive] = useState<boolean>(false);
  const [qteClicksRemaining, setQteClicksRemaining] = useState<number>(5);
  const [qteTimeLeft, setQteTimeLeft] = useState<number>(2.5);

  // Timers Refs
  const nodeSpawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const botActionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const qteIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stunIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger screen shake utility
  const triggerShake = useCallback(() => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 320);
  }, []);

  // Update Bot dialogue helper
  const speakBot = useCallback((quoteList: string[]) => {
    const quote = quoteList[Math.floor(Math.random() * quoteList.length)];
    setBotDialogue(quote);
  }, []);

  // Clear current active node safely
  const clearActiveNode = useCallback(() => {
    setActiveNodeIndex(null);
    setActiveNodeType(null);
    if (nodeSpawnTimerRef.current) clearTimeout(nodeSpawnTimerRef.current);
    if (botActionTimerRef.current) clearTimeout(botActionTimerRef.current);
  }, []);

  // Trigger game over
  const triggerEndGame = useCallback((won: boolean) => {
    setGameState('GAME_OVER');
    setIsVictory(won);
    clearActiveNode();

    if (qteIntervalRef.current) clearInterval(qteIntervalRef.current);
    setQteActive(false);

    if (won) {
      sound.playVictory();
      setBotMood('shocked');
      setBotDialogue("FATAL SYSTEM SHUTDOWN. Impossible human throughput...");
    } else {
      sound.playDefeat();
      setBotMood('smug');
      setBotDialogue("Mainframe purged. Humanity was simply too slow.");
    }

    setScore((prev) => {
      if (prev > highScore) {
        setHighScore(prev);
        setIsNewHigh(true);
        try {
          localStorage.setItem('beat_the_bot_highscore', prev.toString());
        } catch {
          // ignore
        }
      }
      return prev;
    });
  }, [clearActiveNode, highScore]);

  // Adjust Core energy with bound checking
  const adjustCore = useCallback((delta: number) => {
    setCoreProgress((prev) => {
      const next = Math.max(0, Math.min(100, prev + delta));
      if (next >= 100) {
        setTimeout(() => triggerEndGame(true), 50);
      } else if (next <= 0) {
        setTimeout(() => triggerEndGame(false), 50);
      }
      return next;
    });
  }, [triggerEndGame]);

  // Handle Surprise Overdrive QTE Launch
  const triggerSurpriseQTE = useCallback(() => {
    setQteActive(true);
    clearActiveNode();
    sound.playAlarmKlaxon();
    triggerShake();

    const requiredMashes = difficulty === 'overclocked' ? 7 : difficulty === 'challenger' ? 5 : 4;
    setQteClicksRemaining(requiredMashes);

    let currentSeconds = difficulty === 'overclocked' ? 2.2 : 2.5;
    setQteTimeLeft(currentSeconds);

    if (qteIntervalRef.current) clearInterval(qteIntervalRef.current);

    qteIntervalRef.current = setInterval(() => {
      currentSeconds -= 0.1;
      if (currentSeconds <= 0) {
        if (qteIntervalRef.current) clearInterval(qteIntervalRef.current);
        setQteActive(false);
        sound.playHazardHit();
        triggerShake();
        adjustCore(-18);
        setCombo(0);
        setBotMood('smug');
        speakBot(BOT_QUOTES.qteFail);
        scheduleNextNode();
      } else {
        setQteTimeLeft(Math.max(0, currentSeconds));
      }
    }, 100);
  }, [adjustCore, clearActiveNode, difficulty, triggerShake, speakBot]);

  // Schedule Bot reaction
  const scheduleBotReaction = useCallback((nodeIndex: number, type: NodeType, lifetime: number) => {
    const isStunned = Date.now() < botStunnedUntil;
    if (isStunned) return;

    // Difficulty-tuned Bot reaction speed
    let baseDelay = 580;
    let jitter = 280;
    let hazardFallChance = 0.15;

    if (difficulty === 'rookie') {
      baseDelay = 750;
      jitter = 320;
      hazardFallChance = 0.32;
    } else if (difficulty === 'overclocked') {
      baseDelay = 380;
      jitter = 140;
      hazardFallChance = 0.05;
    }

    // Bot tries harder if losing
    const playerAdvantage = coreProgress > 50 ? (coreProgress - 50) / 50 : 0;
    baseDelay = Math.max(260, baseDelay - playerAdvantage * 140);

    // If gold, bot responds faster
    if (type === 'gold') baseDelay -= 70;

    // If hazard, bot usually recognizes it
    if (type === 'hazard') {
      if (Math.random() >= hazardFallChance) {
        return; // Bot avoids hazard
      }
    }

    const calculatedDelay = Math.max(250, Math.min(lifetime - 50, baseDelay + Math.random() * jitter));

    botActionTimerRef.current = setTimeout(() => {
      setActiveNodeIndex((currIndex) => {
        if (currIndex !== nodeIndex) return currIndex;

        // Bot captures the node!
        if (type === 'data') {
          sound.playBotCapture();
          adjustCore(-7);
          setCombo(0);
          setBotMood('smug');
          speakBot(BOT_QUOTES.botHit);
        } else if (type === 'gold') {
          sound.playBotCapture();
          adjustCore(-11);
          setCombo(0);
          setBotMood('smug');
          speakBot(BOT_QUOTES.botHit);
        } else if (type === 'hazard') {
          sound.playHazardHit();
          adjustCore(8); // Bot penalty
          setBotMood('shocked');
          speakBot(BOT_QUOTES.hazardHitBot);
        }

        clearActiveNode();
        nodeSpawnTimerRef.current = setTimeout(spawnNode, 240);
        return null;
      });
    }, calculatedDelay);
  }, [botStunnedUntil, difficulty, coreProgress, adjustCore, speakBot, clearActiveNode]);

  // Spawn Next Node
  const spawnNode = useCallback(() => {
    if (gameState !== 'PLAYING' || qteActive) return;

    clearActiveNode();

    // Chance to trigger surprise QTE event (10% chance if bot is not stunned)
    const isStunned = Date.now() < botStunnedUntil;
    if (!isStunned && Math.random() < 0.11) {
      triggerSurpriseQTE();
      return;
    }

    // Pick random node index 0-8
    const randomIndex = Math.floor(Math.random() * 9);
    setActiveNodeIndex(randomIndex);

    // Determine type: 65% Data, 20% Hazard, 15% Gold
    const randType = Math.random();
    let type: NodeType = 'data';
    let lifetime = 1050;

    if (difficulty === 'rookie') lifetime = 1250;
    if (difficulty === 'overclocked') lifetime = 820;

    if (randType < 0.20) {
      type = 'hazard';
      lifetime += 200;
    } else if (randType < 0.35) {
      type = 'gold';
      lifetime -= 100;
    }

    setActiveNodeType(type);
    nodeSpawnTimeRef.current = Date.now();

    // Schedule bot
    scheduleBotReaction(randomIndex, type, lifetime);

    // Auto-expire if neither clicked
    nodeSpawnTimerRef.current = setTimeout(() => {
      clearActiveNode();
      nodeSpawnTimerRef.current = setTimeout(spawnNode, 180);
    }, lifetime);
  }, [gameState, qteActive, botStunnedUntil, triggerSurpriseQTE, clearActiveNode, difficulty, scheduleBotReaction]);

  const scheduleNextNode = useCallback(() => {
    if (nodeSpawnTimerRef.current) clearTimeout(nodeSpawnTimerRef.current);
    nodeSpawnTimerRef.current = setTimeout(spawnNode, 250);
  }, [spawnNode]);

  // Bot Stun countdown monitor
  useEffect(() => {
    if (stunIntervalRef.current) clearInterval(stunIntervalRef.current);

    stunIntervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now < botStunnedUntil) {
        setStunSecondsLeft(Math.max(0, (botStunnedUntil - now) / 1000));
      } else {
        setStunSecondsLeft(0);
      }
    }, 100);

    return () => {
      if (stunIntervalRef.current) clearInterval(stunIntervalRef.current);
    };
  }, [botStunnedUntil]);

  // Node Clicked by player
  const handleNodeClick = (index: number) => {
    sound.init();

    if (gameState !== 'PLAYING' || qteActive) return;

    if (activeNodeIndex !== index) {
      // Misclick on wrong node
      sound.playHazardHit();
      setLastMissIndex(index);
      setTimeout(() => setLastMissIndex(null), 250);
      setCombo(0);
      setNodesMissedOrHazards((c) => c + 1);
      return;
    }

    // Valid hit on active node!
    const reactionTime = Date.now() - nodeSpawnTimeRef.current;
    if (reactionTime > 0) {
      setReactionTimes((prev) => [...prev, reactionTime]);
    }

    if (activeNodeType === 'data') {
      sound.playPlayerHit();
      setNodesCaptured((c) => c + 1);

      setCombo((prev) => {
        const next = prev + 1;
        setMaxCombo((m) => Math.max(m, next));
        const pts = 100 * next;
        setScore((s) => s + pts);
        return next;
      });

      setEmpCharge((prev) => Math.min(100, prev + 12));
      adjustCore(6 + Math.min(combo, 4));
      setBotMood('angry');
      speakBot(BOT_QUOTES.playerHit);

    } else if (activeNodeType === 'gold') {
      sound.playGoldClaim();
      setNodesCaptured((c) => c + 1);

      setCombo((prev) => {
        const next = prev + 2;
        setMaxCombo((m) => Math.max(m, next));
        const pts = 300 * next;
        setScore((s) => s + pts);
        return next;
      });

      setEmpCharge((prev) => Math.min(100, prev + 35));
      adjustCore(12);
      setBotMood('shocked');
      speakBot(["Whoa! My supercell capacitor!", "Hey! That energy was tagged for me!"]);

    } else if (activeNodeType === 'hazard') {
      sound.playHazardHit();
      triggerShake();
      setNodesMissedOrHazards((c) => c + 1);
      setCombo(0);
      adjustCore(-12);
      setBotMood('smug');
      speakBot(BOT_QUOTES.hazardHitPlayer);
    }

    clearActiveNode();
    scheduleNextNode();
  };

  // Trigger EMP Superweapon
  const triggerEmp = useCallback(() => {
    if (empCharge < 100 || gameState !== 'PLAYING') return;

    sound.init();
    sound.playEmpShockwave();
    triggerShake();

    setEmpCharge(0);
    const stunDurationMs = 4500;
    setBotStunnedUntil(Date.now() + stunDurationMs);
    setBotMood('shocked');
    speakBot(BOT_QUOTES.empStunned);

    // Direct energy push
    adjustCore(12);
    setScore((s) => s + 500);
  }, [empCharge, gameState, triggerShake, adjustCore, speakBot]);

  // Handle QTE Mash Button
  const handleQteMash = useCallback(() => {
    if (!qteActive) return;
    sound.init();

    setQteClicksRemaining((prev) => {
      const next = prev - 1;
      sound.playQteClick(6 - next);

      if (next <= 0) {
        // Player defeated the surprise hack!
        if (qteIntervalRef.current) clearInterval(qteIntervalRef.current);
        setQteActive(false);
        sound.playGoldClaim();

        // Stun Bot & Award heavy core push
        setBotStunnedUntil(Date.now() + 3800);
        adjustCore(16);
        setScore((s) => s + 800);
        setBotMood('shocked');
        speakBot(BOT_QUOTES.qteWin);
        scheduleNextNode();
      }
      return next;
    });
  }, [qteActive, adjustCore, speakBot, scheduleNextNode]);

  // Keyboard shortcut listener (1-9 for grid, Space for EMP/QTE, Esc for pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space key for QTE mash or EMP trigger
      if (e.code === 'Space') {
        e.preventDefault();
        if (qteActive) {
          handleQteMash();
        } else if (empCharge >= 100 && gameState === 'PLAYING') {
          triggerEmp();
        }
        return;
      }

      // Number keys 1-9 (or Numpad 1-9)
      if (e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key, 10) - 1;
        if (num >= 0 && num <= 8) {
          e.preventDefault();
          handleNodeClick(num);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qteActive, handleQteMash, empCharge, gameState, triggerEmp]);

  // Start / Reset match
  const startNewGame = useCallback(() => {
    sound.init();
    clearActiveNode();
    if (qteIntervalRef.current) clearInterval(qteIntervalRef.current);

    setCoreProgress(50);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setEmpCharge(0);
    setBotStunnedUntil(0);
    setStunSecondsLeft(0);
    setQteActive(false);
    setIsVictory(false);
    setIsNewHigh(false);
    setNodesCaptured(0);
    setNodesMissedOrHazards(0);
    setReactionTimes([]);

    setBotMood('neutral');
    setBotDialogue("System online. Prepare yourself, human operator!");
    setGameState('PLAYING');

    setTimeout(() => {
      spawnNode();
    }, 400);
  }, [clearActiveNode, spawnNode]);

  // Sound toggle handler
  const handleToggleSound = () => {
    sound.init();
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Compute average reaction time
  const avgReactionTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const isBotStunned = Date.now() < botStunnedUntil;

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-between p-3 sm:p-6 cyber-grid-bg transition-colors ${isScreenShaking ? 'shake-animation' : ''}`}>
      {/* Victory Particles when player wins */}
      {gameState === 'GAME_OVER' && isVictory && <VictoryParticles />}

      {/* Top Application Header */}
      <header className="w-full max-w-2xl flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold font-display tracking-tight text-white flex items-center gap-2">
              Beat the Bot
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
                v1.0
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Difficulty badge */}
          <div className="hidden sm:flex items-center text-xs font-mono text-slate-400 gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400">MODE:</span>
            <span className="text-cyan-400 font-bold uppercase">{difficulty}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Rules button */}
          <button
            onClick={() => setShowRules(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            aria-label="Game rules and instructions"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>
        </div>
      </header>

      {/* Main Game Shell Container */}
      <main className="w-full max-w-2xl my-auto py-4 flex flex-col gap-4">
        {/* Bot Station Panel */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center gap-3 sm:gap-4">
          <BotFace
            mood={botMood}
            isStunned={isBotStunned}
            stunSecondsLeft={stunSecondsLeft}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold font-display text-white tracking-wide">
                  C.O.R.E. AI
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded">
                  OPPONENT
                </span>
              </div>

              {isBotStunned && (
                <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  CPU FROZEN
                </span>
              )}
            </div>

            {/* Speech Bubble */}
            <div className="relative bg-slate-950/70 border border-slate-800/90 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 italic min-h-[38px] flex items-center">
              <span className="truncate sm:whitespace-normal">"{botDialogue}"</span>
            </div>
          </div>
        </section>

        {/* Tug-of-War Core Bar */}
        <CoreTugBar progress={coreProgress} />

        {/* Live Score & Metrics HUD */}
        <section className="grid grid-cols-4 gap-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 text-center shadow-lg">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</div>
            <div className="text-base sm:text-xl font-bold font-display text-white tabular-nums">
              {score.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <span>Combo</span>
              {combo > 2 && <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />}
            </div>
            <div className={`text-base sm:text-xl font-bold font-display tabular-nums ${combo > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {combo}x
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EMP Charge</div>
            <div className={`text-base sm:text-xl font-bold font-display tabular-nums ${empCharge >= 100 ? 'text-cyan-400 animate-pulse' : 'text-slate-300'}`}>
              {empCharge}%
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3 text-slate-400" />
              <span>High</span>
            </div>
            <div className="text-base sm:text-xl font-bold font-display text-slate-300 tabular-nums">
              {highScore.toLocaleString()}
            </div>
          </div>
        </section>

        {/* Interactive 3x3 Arena or Title Screen */}
        <div className="relative min-h-[380px] sm:min-h-[420px] flex items-center justify-center">
          {gameState === 'PLAYING' && (
            <div className="relative w-full">
              <GridArena
                activeNodeIndex={activeNodeIndex}
                activeNodeType={activeNodeType}
                onNodeClick={handleNodeClick}
                isBotStunned={isBotStunned}
                isQteActive={qteActive}
                lastMissIndex={lastMissIndex}
              />

              {/* Surprise QTE Hack Overlay */}
              <SurpriseHackModal
                isActive={qteActive}
                clicksRemaining={qteClicksRemaining}
                totalRequired={difficulty === 'overclocked' ? 7 : difficulty === 'challenger' ? 5 : 4}
                timeLeft={qteTimeLeft}
                onMash={handleQteMash}
              />
            </div>
          )}

          {gameState === 'TITLE' && (
            <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mb-2 tracking-tight">
                Beat the Bot
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
                Tug-of-war reflex battle against an adaptive computer opponent. Overload the mainframe core to 100% to claim victory!
              </p>

              {/* Difficulty Selection */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select Bot Difficulty
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                  {(['rookie', 'challenger', 'overclocked'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 text-xs font-semibold capitalize rounded-lg transition-colors ${
                        difficulty === diff
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startNewGame}
                className="w-full py-4 px-6 rounded-2xl font-bold font-display text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 text-base"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Start Battle</span>
              </button>

              <button
                onClick={() => setShowRules(true)}
                className="mt-3 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
              >
                Read instructions & shortcuts
              </button>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <footer className="w-full flex items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl shadow-lg">
          {/* EMP Disruptor Button */}
          <button
            onClick={triggerEmp}
            disabled={empCharge < 100 || gameState !== 'PLAYING'}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold font-display flex items-center justify-center gap-2 transition-all ${
              empCharge >= 100 && gameState === 'PLAYING'
                ? 'bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/30 scale-[1.02] cursor-pointer'
                : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>EMP DISRUPTOR {empCharge >= 100 ? '(READY)' : `(${empCharge}%)`}</span>
            {empCharge >= 100 && (
              <kbd className="hidden sm:inline px-1.5 py-0.5 bg-slate-950/40 rounded text-[10px] text-slate-950 font-mono">
                Space
              </kbd>
            )}
          </button>

          {/* Quick Restart or Pause */}
          {gameState === 'PLAYING' && (
            <button
              onClick={startNewGame}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1.5 shrink-0"
              title="Restart current duel"
              aria-label="Restart match"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Restart</span>
            </button>
          )}
        </footer>
      </main>

      {/* Footer Meta */}
      <div className="w-full max-w-2xl text-center pt-2 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Beat the Bot · Cyber Arcade Reflex Duel</span>
        <span>Keyboard: 1-9 (Nodes) · Space (EMP / Deflect)</span>
      </div>

      {/* Rules Modal */}
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        onStartOrResume={() => {
          setShowRules(false);
          if (gameState === 'TITLE') {
            startNewGame();
          }
        }}
        isGameActive={gameState === 'PLAYING'}
      />

      {/* Game Over / Victory Modal */}
      <GameOverModal
        isOpen={gameState === 'GAME_OVER'}
        isVictory={isVictory}
        score={score}
        highScore={highScore}
        isNewHigh={isNewHigh}
        maxCombo={maxCombo}
        avgReactionTimeMs={avgReactionTime}
        nodesCaptured={nodesCaptured}
        nodesMissedOrHazards={nodesMissedOrHazards}
        difficulty={difficulty}
        onChangeDifficulty={(diff) => setDifficulty(diff)}
        onRestart={startNewGame}
      />
    </div>
  );
}
