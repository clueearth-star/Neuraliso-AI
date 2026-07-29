import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Moon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  CloudRain,
  Radio,
  Disc,
  Sparkles,
  Bot,
  MessageCircle,
  Sliders,
  Square,
  Wand2,
  X
} from "lucide-react";
import { sounds } from "../lib/sounds";
import { storage } from "../lib/storage";
import { useSubscription } from "../contexts/SubscriptionContext";

type SoundId = "rain" | "white" | "brown" | "binaural" | "ocean" | "forest";

interface SoundItem {
  id: SoundId;
  name: string;
  description: string;
  icon: React.ReactNode;
  isPro?: boolean;
}

const SLEEP_SOUNDS: SoundItem[] = [
  {
    id: "rain",
    name: "Gentle Rain & Thunder",
    description: "Soft synthesized raindrops filtered through pink noise for continuous acoustic shelter. Always free.",
    icon: <CloudRain className="w-6 h-6 text-cyan-400" />,
    isPro: false,
  },
  {
    id: "white",
    name: "Pure White Noise",
    description: "Full-spectrum acoustic masking that blocks sudden background room noises and distractions.",
    icon: <Radio className="w-6 h-6 text-slate-300" />,
    isPro: true,
  },
  {
    id: "brown",
    name: "Deep Brown Noise",
    description: "A warm, deep low-frequency ocean rumble that soothes executive brain chatter.",
    icon: <Disc className="w-6 h-6 text-amber-500" />,
    isPro: true,
  },
  {
    id: "binaural",
    name: "432Hz Theta Binaural Beats",
    description: "6Hz difference frequency (216Hz/222Hz) designed to encourage slow-wave relaxation and sleep.",
    icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
    isPro: true,
  },
  {
    id: "ocean",
    name: "Pacific Ocean Surf",
    description: "Rhythmic rolling waves that synchronize respiratory rate with natural coastal tides.",
    icon: <Radio className="w-6 h-6 text-teal-400" />,
    isPro: true,
  },
  {
    id: "forest",
    name: "Midnight Forest Wind",
    description: "Gentle breeze rustling through pine needles with subtle nocturnal ambient acoustics.",
    icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
    isPro: true,
  },
];

interface SoundPreset {
  name: string;
  icon: string;
  tracks: Partial<Record<SoundId, number>>;
}

const MIX_PRESETS: SoundPreset[] = [
  {
    name: "Stormy Shelter",
    icon: "🌧️",
    tracks: { rain: 0.8, brown: 0.4 },
  },
  {
    name: "Deep Delta Sleep",
    icon: "🧘",
    tracks: { binaural: 0.7, white: 0.3 },
  },
  {
    name: "Coastal Forest",
    icon: "🌊",
    tracks: { ocean: 0.75, forest: 0.5 },
  },
];

export const SleepSoundsView: React.FC = () => {
  const navigate = useNavigate();
  const { isPro, openUpgradeModal } = useSubscription();

  // Active track volumes map: { [soundId]: volume }
  const [activeTracks, setActiveTracks] = useState<Partial<Record<SoundId, number>>>({});
  const [masterVolume, setMasterVolume] = useState<number>(0.7);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null); // null = all night
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state on mount if audio is already playing
  useEffect(() => {
    const existingActive = sounds.getActiveSleepTracks();
    if (existingActive.length > 0) {
      const initialMap: Partial<Record<SoundId, number>> = {};
      existingActive.forEach((id) => {
        initialMap[id] = 0.6;
      });
      setActiveTracks(initialMap);
    }
  }, []);

  const hasActiveTracks = Object.keys(activeTracks).length > 0;

  const handleToggleTrack = (id: SoundId) => {
    const item = SLEEP_SOUNDS.find((s) => s.id === id);
    if (item?.isPro && !isPro) {
      openUpgradeModal(`Unlock ${item.name} and all 6 restorative ambient sleep soundscapes.`);
      return;
    }

    sounds.playClick();

    if (activeTracks[id] !== undefined) {
      // Track is playing -> stop it
      sounds.stopSleepTrack(id);
      setActiveTracks((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      // Start track
      const defaultVol = 0.6;
      sounds.startSleepTrack(id, defaultVol);
      setActiveTracks((prev) => ({
        ...prev,
        [id]: defaultVol,
      }));
      storage.logActivity("sleep", `Playing ${id} sound`, "Sleep ambient audio track added");
    }
  };

  const handleTrackVolumeChange = (id: SoundId, newVol: number) => {
    sounds.setSleepTrackVolume(id, newVol);
    setActiveTracks((prev) => ({
      ...prev,
      [id]: newVol,
    }));
  };

  const handleMasterVolumeChange = (newVal: number) => {
    setMasterVolume(newVal);
    sounds.setSleepVolume(newVal);
  };

  const handleStopAll = () => {
    sounds.playClick();
    sounds.stopSleepSound();
    setActiveTracks({});
  };

  const handleApplyPreset = (preset: SoundPreset) => {
    sounds.playClick();

    // Check pro requirements
    const requiresPro = Object.keys(preset.tracks).some((id) => {
      const item = SLEEP_SOUNDS.find((s) => s.id === id);
      return item?.isPro && !isPro;
    });

    if (requiresPro) {
      openUpgradeModal(`Unlock Plus to experience multi-sound ambient presets.`);
      return;
    }

    // Stop existing sound
    sounds.stopSleepSound();

    // Start each track in preset
    const nextMap: Partial<Record<SoundId, number>> = {};
    Object.entries(preset.tracks).forEach(([idStr, vol]) => {
      const id = idStr as SoundId;
      const v = vol || 0.6;
      sounds.startSleepTrack(id, v);
      nextMap[id] = v;
    });

    setActiveTracks(nextMap);
    storage.logActivity("sleep", `Applied ${preset.name} ambient mix`, "Multi-track sleep audio preset activated");
  };

  const handleSelectTimer = (mins: number | null) => {
    sounds.playClick();
    setTimerMinutes(mins);
    if (mins === null) {
      setSecondsRemaining(null);
    } else {
      setSecondsRemaining(mins * 60);
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (secondsRemaining !== null && secondsRemaining > 0 && hasActiveTracks) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev !== null && prev <= 1) {
            // Timer expired! Stop audio
            sounds.stopSleepSound();
            setActiveTracks({});
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [secondsRemaining, hasActiveTracks]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      sounds.stopSleepSound();
    };
  }, []);

  const formatTimerDisplay = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s remaining`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 pb-28 md:pb-12 animate-page-in text-left">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Moon className="w-3.5 h-3.5" />
          <span>Multi-Track Sound Mixer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Sleep Sound Mixer &amp; Stories
        </h1>
        <p className="text-sm sm:text-base text-white/60">
          Combine multiple ambient soundscapes simultaneously with custom volume levels. Real-time procedural Web Audio.
        </p>
      </div>

      {/* Main Control Panel: Presets, Master Volume, & Timer */}
      <div className="wellness-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-6">
          {/* Master Volume Slider */}
          <div className="space-y-2 w-full md:w-1/2">
            <div className="flex items-center justify-between text-xs font-bold text-white/80">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#00d4ff]" />
                <span>Master Sound Engine Volume</span>
              </span>
              <span className="font-mono text-[#00d4ff]">{Math.round(masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00d4ff]"
            />
          </div>

          {/* Timer Status */}
          <div className="flex items-center gap-3 bg-black/30 px-4 py-3 rounded-2xl border border-white/10 w-full md:w-auto">
            <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="text-xs text-white/50 block">Sleep Auto-Stop Timer</span>
              <span className="text-sm font-bold text-white">
                {secondsRemaining !== null && hasActiveTracks
                  ? formatTimerDisplay(secondsRemaining)
                  : timerMinutes === null
                  ? "All night (Continuous)"
                  : `${timerMinutes} minutes`}
              </span>
            </div>
          </div>
        </div>

        {/* Preset Soundscapes & Timer Duration Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Quick Soundscape Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multi-Track Soundscape Presets:</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {MIX_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-indigo-500/20 hover:border-indigo-400/50 text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Timer Duration Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70 block">Auto-Stop Timer Preset:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "15 min", value: 15 },
                { label: "30 min", value: 30 },
                { label: "1 hour", value: 60 },
                { label: "All night", value: null },
              ].map((preset) => {
                const selected = timerMinutes === preset.value;
                return (
                  <button
                    key={preset.label}
                    onClick={() => handleSelectTimer(preset.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selected
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105"
                        : "bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Active Sound Mixer Toolbar (Shows when 1 or more tracks are playing) */}
      {hasActiveTracks && (
        <div className="p-5 rounded-3xl bg-indigo-950/40 border border-indigo-500/30 backdrop-blur-md space-y-4 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00d4ff]" />
              <h3 className="text-sm font-bold text-white">
                Active Sound Mix ({Object.keys(activeTracks).length} Track{Object.keys(activeTracks).length > 1 ? "s" : ""} Layered)
              </h3>
            </div>
            <button
              onClick={handleStopAll}
              className="px-3 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop All</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(activeTracks).map(([idStr, vol]) => {
              const id = idStr as SoundId;
              const sound = SLEEP_SOUNDS.find((s) => s.id === id);
              if (!sound) return null;
              const trackVolume = typeof vol === "number" ? vol : 0.6;
              return (
                <div
                  key={id}
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                        {sound.icon}
                      </div>
                      <span className="text-xs font-bold text-white">{sound.name}</span>
                    </div>
                    <button
                      onClick={() => handleToggleTrack(id)}
                      className="p-1 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove from mix"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-white/60 font-mono">
                      <span>Track Volume</span>
                      <span className="text-[#00d4ff]">{Math.round(trackVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={trackVolume}
                      onChange={(e) => handleTrackVolumeChange(id, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00d4ff]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6 Sound Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SLEEP_SOUNDS.map((sound) => {
          const isPlaying = activeTracks[sound.id] !== undefined;
          const trackVol = activeTracks[sound.id] ?? 0.6;
          const locked = sound.isPro && !isPro;

          return (
            <div
              key={sound.id}
              className={`wellness-card p-6 sm:p-8 space-y-6 flex flex-col justify-between transition-all relative ${
                isPlaying
                  ? "border-[#00d4ff] bg-[#00d4ff]/5 shadow-xl shadow-[#00d4ff]/10"
                  : locked
                  ? "border-white/10 opacity-80 hover:opacity-100 hover:border-[#FFD700]/40"
                  : ""
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isPlaying ? "bg-[#00d4ff]/20 border-[#00d4ff]" : "bg-white/5 border-white/10"
                      }`}
                    >
                      {sound.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                          {sound.name}
                        </h3>
                        {locked && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 shrink-0 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> PRO
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-white/50">Procedural Web Audio</span>
                    </div>
                  </div>

                  {/* Waveform Animation when playing */}
                  {isPlaying && (
                    <div className="flex items-center gap-1 h-6 px-3 py-1 rounded-full bg-[#00d4ff]/20 border border-[#00d4ff]/30 shrink-0">
                      <span
                        className="w-1 h-4 bg-[#00d4ff] rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-1 h-2 bg-[#00d4ff] rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1 h-5 bg-[#00d4ff] rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                      <span
                        className="w-1 h-3 bg-[#00d4ff] rounded-full animate-bounce"
                        style={{ animationDelay: "450ms" }}
                      />
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-white/70 leading-relaxed min-h-[40px]">
                  {sound.description}
                </p>
              </div>

              {/* Individual Track Volume Slider when Active */}
              {isPlaying ? (
                <div className="p-3 rounded-2xl bg-black/30 border border-[#00d4ff]/30 space-y-1.5 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                    <span className="flex items-center gap-1 text-[#00d4ff]">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Individual Track Volume</span>
                    </span>
                    <span className="font-mono text-[#00d4ff]">{Math.round(trackVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={trackVol}
                    onChange={(e) => handleTrackVolumeChange(sound.id, parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00d4ff]"
                  />
                </div>
              ) : null}

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/40">
                  {isPlaying ? "Active in Mix" : locked ? "Plus Feature" : "Ready to Mix"}
                </span>

                <button
                  onClick={() => handleToggleTrack(sound.id)}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                    isPlaying
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 hover:bg-rose-600"
                      : locked
                      ? "bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 text-[#FFD700] border border-[#FFD700]/40 hover:bg-[#FFD700]/30"
                      : "bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] shadow-md shadow-[#00d4ff]/20 hover:scale-105"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Remove Track</span>
                    </>
                  ) : locked ? (
                    <>
                      <Sparkles className="w-4 h-4 text-[#FFD700]" />
                      <span>Unlock Plus</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Add to Mix</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sleep Story AI Banner Card */}
      <div
        onClick={() => {
          sounds.playClick();
          navigate("/app/chat", {
            state: {
              initialPrompt: "Tell me a calming sleep story to help me drift off peacefully tonight.",
            },
          });
        }}
        className="wellness-card p-6 sm:p-8 bg-gradient-to-r from-[#131C31] via-[#1A2338] to-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-indigo-400 transition-all duration-300 group cursor-pointer shadow-xl max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
            <Bot className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Want a soothing bedtime narrative?
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Ask your AI companion to generate a personalized, tranquil sleep story.
            </p>
          </div>
        </div>

        <div className="px-5 py-2.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500 border border-indigo-500/40 text-indigo-300 hover:text-white font-extrabold text-xs transition-all flex items-center gap-2 shrink-0">
          <MessageCircle className="w-4 h-4" />
          <span>Tell Me a Sleep Story</span>
        </div>
      </div>
    </div>
  );
};

