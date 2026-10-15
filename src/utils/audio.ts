/**
 * Zero-dependency Web Audio API synthesizer for Beat the Bot.
 * Generates all sound effects dynamically without external asset dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check localStorage for saved sound preference
    try {
      const saved = localStorage.getItem('beat_the_bot_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch {
      // ignore
    }
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('beat_the_bot_muted', String(this.isMuted));
    } catch {
      // ignore
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, endFreq?: number, vol = 0.15) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      }

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // ignore audio context glitches
    }
  }

  // Sound: Player tapped data node
  public playPlayerHit() {
    this.playTone(600, 'sine', 0.08, 920, 0.18);
  }

  // Sound: Bot captured a node
  public playBotCapture() {
    this.playTone(320, 'sawtooth', 0.14, 160, 0.14);
  }

  // Sound: Golden node claimed
  public playGoldClaim() {
    const notes = [659.25, 830.61, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.15, freq * 1.05, 0.14);
      }, idx * 55);
    });
  }

  // Sound: Hazard clicked (error)
  public playHazardHit() {
    this.playTone(180, 'square', 0.22, 60, 0.22);
  }

  // Sound: EMP Superweapon fired
  public playEmpShockwave() {
    this.playTone(120, 'sawtooth', 0.6, 900, 0.25);
    setTimeout(() => {
      this.playTone(450, 'sine', 0.4, 80, 0.2);
    }, 150);
  }

  // Sound: Surprise Hack Overdrive Alarm
  public playAlarmKlaxon() {
    this.playTone(850, 'sawtooth', 0.16, 550, 0.2);
    setTimeout(() => {
      this.playTone(950, 'sawtooth', 0.16, 600, 0.2);
    }, 180);
  }

  // Sound: Counter-mash click during QTE
  public playQteClick(step: number) {
    const baseFreq = 400 + step * 80;
    this.playTone(baseFreq, 'sine', 0.06, baseFreq + 120, 0.18);
  }

  // Sound: Bot stunned
  public playBotStunned() {
    [700, 450, 600, 300].forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 0.08, freq * 0.7, 0.12);
      }, idx * 60);
    });
  }

  // Sound: Victory
  public playVictory() {
    const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    melody.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.25, undefined, 0.22);
      }, idx * 120);
    });
  }

  // Sound: Defeat
  public playDefeat() {
    const melody = [440, 392, 349.23, 261.63];
    melody.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.28, freq * 0.9, 0.18);
      }, idx * 160);
    });
  }
}

export const sound = new SoundEngine();
