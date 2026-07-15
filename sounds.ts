/**
 * Neuraliso AI - Procedural Sound Synthesis Engine
 * Generates pristine, organic sound effects dynamically using Web Audio API.
 * Bypasses network asset loading entirely for instantaneous response.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private soundLog: Array<{ id: string; name: string; timestamp: string }> = [];

  constructor() {
    // Load mute state from localStorage
    const savedMute = localStorage.getItem("neuraliso_sounds_muted");
    this.isMuted = savedMute === "true";
  }

  private init() {
    if (!this.ctx) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      } catch (e) {
        console.warn("Web Audio API is not supported in this browser environment.", e);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem("neuraliso_sounds_muted", muted ? "true" : "false");
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.35, this.ctx.currentTime, 0.05);
    }
  }

  public getLogs() {
    return this.soundLog;
  }

  private logSound(name: string) {
    const log = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    this.soundLog = [log, ...this.soundLog].slice(0, 30);
  }

  /**
   * Play a clean, subtle click sound for buttons and nav.
   */
  public playClick() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    this.logSound("Button Touch - Click");

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    // Quick pitch envelope going down
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  /**
   * Play a bubble pop/bloop sound for message updates.
   */
  public playBloop() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    this.logSound("Acoustic Bloop - Bubble");

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  /**
   * Play a warm harmonic arpeggio for high-vibe milestones/successes.
   */
  public playSuccess() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    this.logSound("Somatic Harmonic - Success Chime");

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 major chords
    
    notes.forEach((freq, index) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.5);
    });
  }

  /**
   * Play a gentle shimmering sound for micro-interaction transitions or oracle draws.
   */
  public playShimmer() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    this.logSound("Aetheric Shimmer - Sparkle");

    const now = this.ctx.currentTime;
    // Play 5 random ultra-high frequency delicate tones to sound like starlight sparkles
    for (let i = 0; i < 7; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 1200 + Math.random() * 800;
      const delay = i * 0.04;

      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, now + delay);
      
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.05, now + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + delay);
      osc.stop(now + delay + 0.2);
    }
  }

  /**
   * Play a deep focus bell with warm sub harmonics for ending meditation or calming.
   */
  public playFocusBell() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    this.logSound("Vagus Nerve Resonance - Deep Gong");

    const now = this.ctx.currentTime;
    
    // Fundamental frequency (136.1 Hz - OM frequency)
    const fundamental = 136.1;
    const partials = [1, 2, 3, 4.2, 5.4]; // Harmonics and non-harmonics of Tibetan bowl

    partials.forEach((mult, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(fundamental * mult, now);
      
      const volumeScale = idx === 0 ? 0.25 : 0.15 / mult;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volumeScale, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.0);
    });
  }
}

export const sounds = new SoundEngine();
