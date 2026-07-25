import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Bot, MessageCircle } from "lucide-react";
import { sounds } from "../lib/sounds";
import { storage } from "../lib/storage";

interface BreathMode {
  id: "box" | "478" | "calm";
  name: string;
  description: string;
  phases: { label: "Breathe in..." | "Hold..." | "Breathe out..."; duration: number }[];
}

const BREATH_MODES: BreathMode[] = [
  {
    id: "box",
    name: "Box Breathing (4-4-4-4)",
    description: "Used by athletes and first responders to quickly reset stress and steady focus.",
    phases: [
      { label: "Breathe in...", duration: 4 },
      { label: "Hold...", duration: 4 },
      { label: "Breathe out...", duration: 4 },
      { label: "Hold...", duration: 4 },
    ],
  },
  {
    id: "478",
    name: "4-7-8 Sleep Rhythm",
    description: "A natural tranquilizer for the nervous system designed to help you fall asleep.",
    phases: [
      { label: "Breathe in...", duration: 4 },
      { label: "Hold...", duration: 7 },
      { label: "Breathe out...", duration: 8 },
    ],
  },
  {
    id: "calm",
    name: "Calm Down (5-5)",
    description: "A gentle, slow 5-second inhale and exhale to bring immediate somatic relief.",
    phases: [
      { label: "Breathe in...", duration: 5 },
      { label: "Breathe out...", duration: 5 },
    ],
  },
];

export const BreatheView: React.FC = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<BreathMode>(BREATH_MODES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeftInPhase, setSecondsLeftInPhase] = useState(activeMode.phases[0].duration);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [breathsCompleted, setBreathsCompleted] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when changing mode
  const handleSelectMode = (mode: BreathMode) => {
    sounds.playClick();
    setIsRunning(false);
    setActiveMode(mode);
    setPhaseIndex(0);
    setSecondsLeftInPhase(mode.phases[0].duration);
  };

  const toggleRun = () => {
    sounds.playClick();
    if (!isRunning && soundOn) {
      sounds.playBreathingCue();
    }
    setIsRunning(!isRunning);
  };

  const resetSession = () => {
    sounds.playClick();
    setIsRunning(false);
    setPhaseIndex(0);
    setSecondsLeftInPhase(activeMode.phases[0].duration);
    setTotalSeconds(0);
    setBreathsCompleted(0);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTotalSeconds((prev) => prev + 1);

        setSecondsLeftInPhase((prevSec) => {
          if (prevSec <= 1) {
            // Move to next phase
            const nextPhaseIdx = (phaseIndex + 1) % activeMode.phases.length;
            setPhaseIndex(nextPhaseIdx);

            if (soundOn) {
              sounds.playBreathingCue();
            }

            // If we wrapped around to phase 0, one full breath cycle completed
            if (nextPhaseIdx === 0) {
              setBreathsCompleted((prevBreaths) => {
                const nextB = prevBreaths + 1;
                if (nextB === 5 || nextB === 10) {
                  storage.logActivity("breathe", `Completed ${nextB} breaths`, activeMode.name);
                }
                return nextB;
              });
            }

            return activeMode.phases[nextPhaseIdx].duration;
          }
          return prevSec - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, phaseIndex, activeMode, soundOn]);

  const currentPhase = activeMode.phases[phaseIndex];

  // Circle animation scale based on current phase
  const getCircleScale = () => {
    if (!isRunning) return "scale-100 opacity-80";
    if (currentPhase.label === "Breathe in...") return "scale-150 opacity-100 duration-[4000ms] ease-out";
    if (currentPhase.label === "Hold...") return "scale-140 opacity-90 duration-[1000ms] ease-in-out";
    return "scale-75 opacity-70 duration-[5000ms] ease-in";
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12 pb-28 md:pb-12 animate-page-in text-center relative overflow-hidden">
      {/* Calm gradient background that pulses subtly */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#00d4ff]/10 via-transparent to-[#00b8a9]/10 rounded-3xl blur-3xl pointer-events-none animate-soft-pulse -z-10" />

      {/* Header */}
      <div className="space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-xs font-semibold">
          <Wind className="w-3.5 h-3.5" />
          <span>Paced Respiration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Guided Breathing
        </h1>
        <p className="text-sm sm:text-base text-white/60">
          Let&apos;s take a few breaths together. No rush. Select a rhythm below.
        </p>
      </div>

      {/* 3 Modes Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {BREATH_MODES.map((mode) => {
          const active = activeMode.id === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => handleSelectMode(mode)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                active
                  ? "bg-[#00d4ff]/15 border-[#00d4ff] shadow-lg shadow-[#00d4ff]/20 scale-105"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div>
                <h3 className="text-sm font-bold text-white">{mode.name}</h3>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">{mode.description}</p>
              </div>
              {active && (
                <span className="text-[10px] font-bold text-[#00d4ff] uppercase tracking-wider mt-3 block">
                  Active Rhythm &bull;
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Large Animated Breathing Circle Section */}
      <div className="py-12 sm:py-16 flex flex-col items-center justify-center relative min-h-[380px]">
        {/* Outer Glow Ring */}
        <div 
          className={`absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-[#00d4ff]/30 bg-gradient-to-tr from-[#00d4ff]/20 to-[#00b8a9]/20 transition-all ${getCircleScale()}`}
        />

        {/* Inner Solid Circle with Phase Cues */}
        <div 
          className={`w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-[#1A2338] border-2 border-[#00d4ff]/60 shadow-[0_0_50px_rgba(0,212,255,0.3)] flex flex-col items-center justify-center p-6 text-center z-10 transition-all ${
            isRunning ? "shadow-[0_0_80px_rgba(0,212,255,0.5)]" : ""
          }`}
        >
          <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {isRunning ? currentPhase.label : "Ready?"}
          </span>
          <span className="text-3xl sm:text-4xl font-mono font-bold text-[#00d4ff] mt-2">
            {isRunning ? secondsLeftInPhase : activeMode.phases[0].duration}s
          </span>
          {!isRunning && (
            <span className="text-xs text-white/50 mt-2">Tap Start below</span>
          )}
        </div>
      </div>

      {/* Controls & Metrics */}
      <div className="max-w-md mx-auto space-y-8">
        {/* Start / Pause & Reset Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleRun}
            className="flex-1 py-4 px-8 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00d4ff]/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{totalSeconds > 0 ? "Resume" : "Start Breathing"}</span>
              </>
            )}
          </button>

          <button
            onClick={resetSession}
            aria-label="Reset timer"
            title="Reset timer"
            className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setSoundOn(!soundOn);
            }}
            aria-label={soundOn ? "Mute singing bowl bells" : "Unmute singing bowl bells"}
            title={soundOn ? "Mute bells" : "Unmute bells"}
            className={`p-4 rounded-full border transition-all cursor-pointer ${
              soundOn
                ? "bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
            }`}
          >
            {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Metrics Bar: Timer & Breaths */}
        <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="text-center">
            <span className="text-xs text-white/50 block">Session Timer</span>
            <span className="text-lg font-mono font-bold text-white">{formatTime(totalSeconds)}</span>
          </div>
          <div className="text-center border-l border-white/10">
            <span className="text-xs text-white/50 block">Breaths Completed</span>
            <span className="text-lg font-mono font-bold text-[#00d4ff]">{breathsCompleted}</span>
          </div>
        </div>

        {/* AI Reflection Button when breaths are completed */}
        {breathsCompleted > 0 && (
          <div className="pt-2 animate-fade-in">
            <button
              onClick={() => {
                sounds.playClick();
                navigate("/app/chat", {
                  state: {
                    initialPrompt: `I just finished ${breathsCompleted} breath cycles of ${activeMode.name}. How do you feel after that session, and how can I hold onto this calm?`
                  }
                });
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#131C31] to-[#00d4ff]/20 hover:from-[#1A2338] hover:to-[#00d4ff]/30 border border-[#00d4ff]/40 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00d4ff]/15 transition-all group cursor-pointer"
            >
              <Bot className="w-4 h-4 text-[#00d4ff] group-hover:scale-110 transition-transform" />
              <span>How do you feel after that session? Talk with AI</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
