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

  private activeSleepSource: AudioNode[] = [];
  private activeSleepGain: GainNode | null = null;
  private currentSleepType: string | null = null;

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

  public startSleepSound(type: "rain" | "white" | "brown" | "binaural", volume: number = 0.5) {
    this.init();
    this.stopSleepSound();
    if (!this.ctx || !this.masterGain) return;

    this.currentSleepType = type;
    this.activeSleepGain = this.ctx.createGain();
    this.activeSleepGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.activeSleepGain.gain.linearRampToValueAtTime(volume * (this.isMuted ? 0 : 0.6), this.ctx.currentTime + 1.5);
    this.activeSleepGain.connect(this.masterGain);

    if (type === "white" || type === "brown" || type === "rain") {
      const bufferSize = 2 * this.ctx.sampleRate; // 2 seconds buffer
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (type === "white") {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      } else if (type === "brown" || type === "rain") {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // boost volume
        }
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      if (type === "rain") {
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(850, this.ctx.currentTime);
        whiteNoise.connect(filter);
        filter.connect(this.activeSleepGain);
      } else {
        whiteNoise.connect(this.activeSleepGain);
      }

      whiteNoise.start();
      this.activeSleepSource.push(whiteNoise);
    } else if (type === "binaural") {
      // 432 Hz fundamental theta wave binaural beat (Left: 216Hz, Right: 222Hz = 6Hz theta frequency)
      const merger = this.ctx.createChannelMerger(2);
      
      const oscLeft = this.ctx.createOscillator();
      oscLeft.type = "sine";
      oscLeft.frequency.setValueAtTime(216, this.ctx.currentTime);
      oscLeft.connect(merger, 0, 0);

      const oscRight = this.ctx.createOscillator();
      oscRight.type = "sine";
      oscRight.frequency.setValueAtTime(222, this.ctx.currentTime);
      oscRight.connect(merger, 0, 1);

      // Add a warm sub-drone at 108Hz
      const subOsc = this.ctx.createOscillator();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(108, this.ctx.currentTime);
      const subGain = this.ctx.createGain();
      subGain.gain.value = 0.3;
      subOsc.connect(subGain);
      subGain.connect(this.activeSleepGain);

      merger.connect(this.activeSleepGain);

      oscLeft.start();
      oscRight.start();
      subOsc.start();
      this.activeSleepSource.push(oscLeft, oscRight, subOsc);
    }
  }

  public setSleepVolume(volume: number) {
    if (this.activeSleepGain && this.ctx) {
      this.activeSleepGain.gain.setTargetAtTime(volume * (this.isMuted ? 0 : 0.6), this.ctx.currentTime, 0.1);
    }
  }

  public stopSleepSound() {
    this.activeSleepSource.forEach((src) => {
      try {
        if ("stop" in src) (src as any).stop();
        src.disconnect();
      } catch {}
    });
    this.activeSleepSource = [];
    if (this.activeSleepGain) {
      try {
        this.activeSleepGain.disconnect();
      } catch {}
      this.activeSleepGain = null;
    }
    this.currentSleepType = null;
  }

  public getActiveSleepSound(): string | null {
    return this.currentSleepType;
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
   * Play a clean, soft low-frequency pop for buttons and nav (spa atmosphere).
   */
  public playClick() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    this.logSound("Button Touch - Soft Pop");

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    // Soft low-frequency pop going smoothly down
    osc.frequency.setValueAtTime(280, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
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
    osc.frequency.setValueAtTime(240, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  /**
   * Play a warm ascending chime for high-vibe milestones/successes (spa resonance).
   */
  public playSuccess() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    this.logSound("Warm Ascending Chime - Success");

    const now = this.ctx.currentTime;
    // Ascending warm pentatonic frequencies (A3, C#4, E4, A4, B4)
    const notes = [220.00, 277.18, 329.63, 440.00, 493.88];
    
    notes.forEach((freq, index) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * 0.09);

      gain.gain.setValueAtTime(0, now + index * 0.09);
      gain.gain.linearRampToValueAtTime(0.09, now + index * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.09 + 0.65);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + index * 0.09);
      osc.stop(now + index * 0.09 + 0.7);
    });
  }

  /**
   * Play a gentle singing bowl bell for breathing phase cues.
   */
  public playBreathingCue() {
    this.init();
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    this.logSound("Gentle Breathing Bell");

    const now = this.ctx.currentTime;
    const fundamental = 256.0; // Root C singing bowl
    const partials = [1, 1.98, 2.95];

    partials.forEach((mult, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(fundamental * mult, now);
      
      const volumeScale = idx === 0 ? 0.18 : 0.08 / mult;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volumeScale, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 2.5);
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
