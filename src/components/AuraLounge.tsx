import React, { useState, useEffect, useRef } from "react";
import { Play, Square, Volume2, Sparkles, Activity, CloudRain, ShieldCheck, HeartPulse } from "lucide-react";

type SoundPreset = "solfeggio" | "rain" | "binaural";

export const AuraLounge: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<SoundPreset>("solfeggio");
  const [volume, setVolume] = useState<number>(0.5);
  const [modSpeed, setModSpeed] = useState<number>(0.3); // Slow wave breathing
  
  // Web Audio Hook node references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<any[]>([]);
  const breathingIntervalRef = useRef<any>(null);
  const visualTimerRef = useRef<number | null>(null);

  const [wavePhase, setWavePhase] = useState<number>(0);

  // Live visual waves simulation
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setWavePhase((prev) => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Clean up sounds on unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    };
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      // Create new AudioContext
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
      
      // Master gain node
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.setValueAtTime(volume * 0.4, audioCtxRef.current.currentTime);
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const stopAllSounds = () => {
    sourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (e) {
        // Safe fail
      }
    });
    sourcesRef.current = [];
    setIsPlaying(false);
  };

  const playSolfeggio = (ctx: AudioContext, destination: AudioNode) => {
    // 528Hz Transform frequency (The frequency of repair/love)
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(528, ctx.currentTime);

    // Warm carrier base at 264Hz (harmonic minor octave)
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(264, ctx.currentTime);

    // Minor third accent at 660Hz (solfeggio perfect balance)
    const osc3 = ctx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(660, ctx.currentTime);

    // Beautiful breathing volume sweeps
    const gainSweep = ctx.createGain();
    gainSweep.gain.setValueAtTime(0.12, ctx.currentTime);

    osc1.connect(gainSweep);
    osc2.connect(gainSweep);
    osc3.connect(gainSweep);
    gainSweep.connect(destination);

    osc1.start();
    osc2.start();
    osc3.start();

    // Store for stopper
    sourcesRef.current.push(osc1, osc2, osc3);

    // Create a slow automatic breathing swelling (LFO)
    let count = 0;
    if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    breathingIntervalRef.current = setInterval(() => {
      if (!audioCtxRef.current || audioCtxRef.current.state === "suspended") return;
      count += 0.05 * modSpeed;
      // swell gain between 0.04 and 0.16
      const swell = 0.10 + Math.sin(count) * 0.06;
      try {
        gainSweep.gain.setTargetAtTime(swell, ctx.currentTime, 0.4);
      } catch (err) {}
    }, 100);
  };

  const playBinauralTheta = (ctx: AudioContext, destination: AudioNode) => {
    // Left ear carrier oscillator (120Hz)
    const oscLeft = ctx.createOscillator();
    oscLeft.type = "sine";
    oscLeft.frequency.setValueAtTime(120, ctx.currentTime);

    // Right ear carrier offset oscillator (126Hz -> creates a profound 6Hz Theta Brain Wave)
    const oscRight = ctx.createOscillator();
    oscRight.type = "sine";
    oscRight.frequency.setValueAtTime(126, ctx.currentTime);

    // Panners to direct channel balance
    const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);

    if (pannerLeft && pannerRight) {
      pannerLeft.pan.setValueAtTime(-1, ctx.currentTime);
      pannerRight.pan.setValueAtTime(1, ctx.currentTime);

      oscLeft.connect(pannerLeft).connect(gainNode);
      oscRight.connect(pannerRight).connect(gainNode);
    } else {
      // Fallback if Panner is not supported
      oscLeft.connect(gainNode);
      oscRight.connect(gainNode);
    }

    gainNode.connect(destination);

    oscLeft.start();
    oscRight.start();

    sourcesRef.current.push(oscLeft, oscRight);
  };

  const playRainNoise = (ctx: AudioContext, destination: AudioNode) => {
    // Procedural Brown Rain noise generation using math buffers
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Filter white noise to deep rich brownian rumbles
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 4.5; // Compensate for filter attenuation
    }

    const whiteNoiseSource = ctx.createBufferSource();
    whiteNoiseSource.buffer = noiseBuffer;
    whiteNoiseSource.loop = true;

    // Filter to resemble soft soothing heavy rain
    const biquadFilter = ctx.createBiquadFilter();
    biquadFilter.type = "lowpass";
    biquadFilter.frequency.setValueAtTime(450, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.35, ctx.currentTime);

    whiteNoiseSource.connect(biquadFilter);
    biquadFilter.connect(gainNode);
    gainNode.connect(destination);

    whiteNoiseSource.start();

    sourcesRef.current.push(whiteNoiseSource);

    // Slowly fluctuate filter frequency to mimic gust of wind and wave ocean washes
    let count = 0;
    if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    breathingIntervalRef.current = setInterval(() => {
      if (!audioCtxRef.current) return;
      count += 0.04 * modSpeed;
      const freq = 420 + Math.sin(count) * 160;
      try {
        biquadFilter.frequency.setTargetAtTime(freq, ctx.currentTime, 0.5);
      } catch (err) {}
    }, 120);
  };

  const startSound = (preset: SoundPreset) => {
    initAudio();
    stopAllSounds();

    if (!audioCtxRef.current || !masterGainRef.current) return;

    if (preset === "solfeggio") {
      playSolfeggio(audioCtxRef.current, masterGainRef.current);
    } else if (preset === "binaural") {
      playBinauralTheta(audioCtxRef.current, masterGainRef.current);
    } else if (preset === "rain") {
      playRainNoise(audioCtxRef.current, masterGainRef.current);
    }

    setIsPlaying(true);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopAllSounds();
    } else {
      startSound(activePreset);
    }
  };

  const handlePresetChange = (preset: SoundPreset) => {
    setActivePreset(preset);
    if (isPlaying) {
      startSound(preset);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (masterGainRef.current && audioCtxRef.current) {
      // scale down master slightly so it remains highly gentle
      masterGainRef.current.gain.setTargetAtTime(val * 0.4, audioCtxRef.current.currentTime, 0.1);
    }
  };

  const handleModSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModSpeed(parseFloat(e.target.value));
  };

  const presetDetails = {
    solfeggio: {
      title: "528Hz DNA Alchemy Frequencies",
      desc: "An ancient pure tone scale formulated to quiet biological anxiety, alleviate psychological tension, and encourage natural restoration.",
      benefits: "Cellular rejuvenation • Rapid cortisol drop • Deep ambient calm",
      accent: "text-amber-600 border-amber-200/50 bg-amber-500/5"
    },
    binaural: {
      title: "6Hz Theta Binaural Healing",
      desc: "Precise offset frequencies generating a psychophysical 6Hz pulse. Prompts cerebral slow-down resembling deep twilight dream sleep.",
      benefits: "Requires headphones • Slows racing cognitive loops • Deep rest",
      accent: "text-blue-600 border-blue-200/50 bg-blue-500/5"
    },
    rain: {
      title: "Ancient Forest Weather Rumble",
      desc: "A rich Brownian procedural storm simulator. Fluctuating filters replicate heavy thermal rain and whispering ancient pine winds.",
      benefits: "Bypasses external distracting noise • Focus anchor • Anxiety shield",
      accent: "text-emerald-700 border-emerald-200/50 bg-emerald-500/5"
    }
  };

  return (
    <div id="aura-sound-lounge" className="wellness-card p-6 relative overflow-hidden bg-gradient-to-br from-white to-amber-50/10">
      <div className="absolute top-0 right-0 p-4">
        <span className="text-[10px] text-amber-700 bg-amber-100 border border-amber-200/60 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
          ★ VIP Luxury Tier
        </span>
      </div>

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="p-2 bg-amber-100/60 text-amber-600 rounded-2xl shadow-inner">
            <Activity className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="font-serif italic font-bold text-dark-text text-xl">The Aura Sanctuary</h3>
            <p className="text-xs text-muted-text">High-fidelity procedural sound therapy synthesizer</p>
          </div>
        </div>

        {/* Live Audio Visualizer Canvas Container */}
        <div className="relative w-full h-24 rounded-2xl bg-slate-900 border border-slate-950 flex items-center justify-center overflow-hidden shadow-inner">
          {isPlaying ? (
            <div className="absolute inset-0 flex items-center justify-around px-8 opacity-90">
              {Array.from({ length: 24 }).map((_, idx) => {
                const modifier = Math.sin((wavePhase + idx * 15) * (Math.PI / 180));
                // scale magnitude depending on active preset
                const baseHeight = activePreset === "solfeggio" ? 32 : activePreset === "binaural" ? 20 : 48;
                const h = Math.abs(modifier) * baseHeight + 6;
                return (
                  <div
                    key={idx}
                    style={{ height: `${h}px` }}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      activePreset === "solfeggio"
                        ? "bg-gradient-to-t from-amber-500 to-amber-300"
                        : activePreset === "binaural"
                        ? "bg-gradient-to-t from-blue-500 to-cyan-400"
                        : "bg-gradient-to-t from-emerald-600 to-green-300"
                    }`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400 font-mono flex flex-col items-center gap-1">
              <Sparkles className="w-4 h-4 opacity-75 text-amber-400 animate-pulse-slow" />
              <span>Aura Synthesizer Idle • Click Play to Activate</span>
            </div>
          )}
          {/* Accent light decoration */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent blur-xs pointer-events-none" />
        </div>

        {/* Preset selections */}
        <div className="grid grid-cols-3 gap-2.5">
          {(["solfeggio", "binaural", "rain"] as SoundPreset[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePresetChange(p)}
              className={`p-3.5 rounded-2xl text-center active:scale-95 transition-all text-xs font-bold ${
                activePreset === p
                  ? "bg-amber-150 border-amber-300 text-amber-900 shadow-sm font-bold"
                  : "neu-flat-sm text-muted-text hover:text-dark-text"
              }`}
            >
              {p === "solfeggio" && "✨ Solfeggio"}
              {p === "binaural" && "🌀 Theta Beat"}
              {p === "rain" && "🌧️ Forest Rain"}
            </button>
          ))}
        </div>

        {/* Selected Preset details card */}
        <div className={`p-4 rounded-2xl border transition-all ${presetDetails[activePreset].accent}`}>
          <h4 className="font-serif italic font-bold text-dark-text text-sm">
            {presetDetails[activePreset].title}
          </h4>
          <p className="text-xs text-muted-text mt-1.5 leading-relaxed">
            {presetDetails[activePreset].desc}
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-mono uppercase tracking-wide">
            <span className="font-bold text-dark-text">Target Outcome:</span>
            <span className="font-semibold">{presetDetails[activePreset].benefits}</span>
          </div>
        </div>

        {/* Controls Layout */}
        <div className="p-4 rounded-2xl neu-inset space-y-4">
          <div className="flex items-center justify-between gap-4">
            {/* Play Button */}
            <button
              onClick={togglePlayback}
              className={`py-3.5 px-6 rounded-full font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isPlaying
                  ? "bg-slate-800 text-white hover:bg-slate-900 shadow-inner"
                  : "bg-amber-600 text-white hover:bg-amber-700 shadow-md shadow-amber-600/25"
              }`}
            >
              {isPlaying ? (
                <>
                  <Square size={14} fill="white" />
                  <span>Pause Resonance</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="white" />
                  <span>Begin Sound Therapy</span>
                </>
              )}
            </button>

            {/* Micro details indicators */}
            <div className="text-right">
              <span className="text-[9px] text-muted-text uppercase font-mono block">Wave Status</span>
              <span className="text-xs font-bold text-dark-text font-mono">
                {isPlaying ? "ACTIVATED (32-BIT)" : "OFFLINE"}
              </span>
            </div>
          </div>

          {/* Dials for sliders */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/40">
            {/* Master Volume */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-muted-text">
                <span className="flex items-center gap-1"><Volume2 size={10} /> Resonance Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-amber-600 bg-slate-200 h-1 rounded-lg appearance-none"
              />
            </div>

            {/* Modulation Breathing Speed */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-muted-text">
                <span className="flex items-center gap-1"><HeartPulse size={10} /> Breathing Sweep</span>
                <span>{Math.round(modSpeed * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={modSpeed}
                onChange={handleModSpeedChange}
                className="w-full accent-amber-600 bg-slate-200 h-1 rounded-lg appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Medical disclaimer note */}
        <p className="text-[9px] text-muted-text text-center italic">
          *Procedural acoustics are generated dynamically via mathematical waveforms. Wear stereophonic headphones for optimal neural phase-locking effects.
        </p>
      </div>
    </div>
  );
};
