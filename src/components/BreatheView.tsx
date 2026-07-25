import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft, Heart, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { sounds } from "../lib/sounds";

interface BreatheViewProps {
  onBack?: () => void;
}

type TechniqueId = "box" | "relaxing" | "calming";

interface Technique {
  id: TechniqueId;
  name: string;
  description: string;
  pattern: {
    inhale: number;
    hold1: number;
    exhale: number;
    hold2: number;
  };
}

const TECHNIQUES: Technique[] = [
  {
    id: "box",
    name: "Box Breathing (4-4-4-4)",
    description: "Equal-ratio square breathing used by Navy SEALs and athletes to restore instant composure.",
    pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  },
  {
    id: "relaxing",
    name: "4-7-8 Relaxing Breath",
    description: "Dr. Andrew Weil's natural tranquilizer for the nervous system to ease anxiety and promote sleep.",
    pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  },
  {
    id: "calming",
    name: "Deep Calm (4-6)",
    description: "Extended exhalation pattern that signals the vagus nerve to rapidly lower heart rate.",
    pattern: { inhale: 4, hold1: 0, exhale: 6, hold2: 0 },
  },
];

type Phase = "inhale" | "hold1" | "exhale" | "hold2";

export const BreatheView: React.FC<BreatheViewProps> = ({ onBack }) => {
  const [selectedTechnique, setSelectedTechnique] = useState<Technique>(TECHNIQUES[0]);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [timeLeft, setTimeLeft] = useState<number>(TECHNIQUES[0].pattern.inhale);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(!sounds.getMuteState());

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Restart session when technique changes
  const handleSelectTechnique = (tech: Technique) => {
    sounds.playClick();
    setSelectedTechnique(tech);
    setIsActive(false);
    setPhase("inhale");
    setTimeLeft(tech.pattern.inhale);
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.setMuted(!nextState);
    if (nextState) {
      sounds.playClick();
    }
  };

  // Main breathing timer tick
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Transition to next phase
        const pat = selectedTechnique.pattern;
        let nextPhase: Phase = "inhale";
        let nextTime = pat.inhale;

        if (phase === "inhale") {
          if (pat.hold1 > 0) {
            nextPhase = "hold1";
            nextTime = pat.hold1;
          } else {
            nextPhase = "exhale";
            nextTime = pat.exhale;
          }
        } else if (phase === "hold1") {
          nextPhase = "exhale";
          nextTime = pat.exhale;
        } else if (phase === "exhale") {
          if (pat.hold2 > 0) {
            nextPhase = "hold2";
            nextTime = pat.hold2;
          } else {
            nextPhase = "inhale";
            nextTime = pat.inhale;
            setCompletedCycles((c) => c + 1);
          }
        } else if (phase === "hold2") {
          nextPhase = "inhale";
          nextTime = pat.inhale;
          setCompletedCycles((c) => c + 1);
        }

        setPhase(nextPhase);
        if (soundEnabled) {
          sounds.playBreathingCue();
        }
        return nextTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase, selectedTechnique]);

  const handleReset = () => {
    sounds.playClick();
    setIsActive(false);
    setPhase("inhale");
    setTimeLeft(selectedTechnique.pattern.inhale);
  };

  const toggleActive = () => {
    sounds.playClick();
    setIsActive(!isActive);
  };

  // Helper text and styles per phase
  const getPhaseInfo = () => {
    switch (phase) {
      case "inhale":
        return {
          label: "Inhale Slowly",
          sub: "Fill your lungs through your nose",
          color: "text-cyan-300",
          scale: "scale-125 md:scale-150",
          glow: "shadow-[0_0_80px_rgba(0,212,255,0.45)] border-cyan-400",
          bgGradient: "from-cyan-500/30 to-teal-500/20",
        };
      case "hold1":
        return {
          label: "Hold & Rest",
          sub: "Keep air soft in your lungs",
          color: "text-teal-300",
          scale: "scale-125 md:scale-150",
          glow: "shadow-[0_0_90px_rgba(0,184,169,0.5)] border-teal-300",
          bgGradient: "from-teal-500/35 to-emerald-500/20",
        };
      case "exhale":
        return {
          label: "Exhale Gently",
          sub: "Release all tension through mouth",
          color: "text-indigo-300",
          scale: "scale-75 md:scale-90",
          glow: "shadow-[0_0_40px_rgba(99,102,241,0.3)] border-indigo-400",
          bgGradient: "from-indigo-500/20 to-cyan-500/10",
        };
      case "hold2":
        return {
          label: "Pause at Empty",
          sub: "Rest in calm stillness before next breath",
          color: "text-slate-300",
          scale: "scale-75 md:scale-90",
          glow: "shadow-[0_0_30px_rgba(148,163,184,0.2)] border-slate-400",
          bgGradient: "from-slate-700/20 to-slate-900/30",
        };
    }
  };

  const phaseInfo = getPhaseInfo();
  const currentTotalPhaseTime = selectedTechnique.pattern[phase] || 1;
  const progressPercent = Math.max(0, Math.min(100, ((currentTotalPhaseTime - timeLeft) / currentTotalPhaseTime) * 100));

  return (
    <div id="breathe-view-root" className="space-y-8 pb-24 text-slate-100 max-w-3xl mx-auto px-4 animate-fade-in">
      {/* HEADER & NAV BAR */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
            title={soundEnabled ? "Mute ambient cues" : "Unmute ambient cues"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* TITLE & DESCRIPTION */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-medium">
          <Sparkles size={13} className="animate-pulse" />
          <span>Rhythmic Nervous System Regulation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Breath &amp; Grounding Sanctum
        </h1>
        <p className="text-body text-secondary-50 max-w-lg mx-auto">
          Paced breathing slows your resting heart rate, signals safety to your nervous system, and restores calm focus within 2 minutes. Breathe with us.
        </p>
      </div>

      {/* TECHNIQUE SELECTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TECHNIQUES.map((tech) => {
          const isSelected = selectedTechnique.id === tech.id;
          return (
            <button
              key={tech.id}
              onClick={() => handleSelectTechnique(tech)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900/90 border-cyan-400/80 shadow-lg shadow-cyan-500/10 text-white scale-[1.02]"
                  : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <div>
                <span className={`text-[10px] font-mono font-bold uppercase block mb-1 ${isSelected ? "text-cyan-300" : "text-slate-500"}`}>
                  {tech.id === "box" ? "4-4-4-4 Square" : tech.id === "relaxing" ? "4-7-8 Sleep & Calm" : "4-6 Vagus Rest"}
                </span>
                <h3 className="text-sm font-bold leading-snug">{tech.name}</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed font-sans">
                {tech.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* BREATHING CIRCLE STAGE */}
      <div className="wellness-card p-8 bg-slate-900/80 border border-slate-800 backdrop-blur-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[420px] shadow-2xl">
        {/* Background ambient radial glow */}
        <div className={`absolute inset-0 bg-gradient-to-b ${phaseInfo.bgGradient} opacity-50 blur-3xl transition-all duration-1000 pointer-events-none`} />

        {/* TOP STATUS BAR: CYCLES COMPLETED */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-xs font-mono text-slate-400 z-10">
          <div className="flex items-center gap-1.5">
            <Heart size={14} className="text-rose-400 animate-pulse" />
            <span>Target: 3 min (12 cycles)</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-teal-300 font-bold">
            Cycles Completed: <span className="text-white text-sm">{completedCycles}</span>
          </div>
        </div>

        {/* SMOOTH ANIMATED SCALING BREATHING CIRCLES */}
        <div className="relative my-12 flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
          {/* Outer Ripple Wave */}
          <div
            className={`absolute inset-0 rounded-full border-2 border-cyan-500/20 transition-all duration-[4000ms] cubic-bezier(0.4,0,0.2,1) ${
              isActive ? phaseInfo.scale : "scale-100"
            }`}
          />

          {/* Secondary Pulse Glow Ring */}
          <div
            className={`absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-teal-400/40 transition-all duration-[4000ms] cubic-bezier(0.4,0,0.2,1) ${
              phaseInfo.glow
            } ${isActive ? phaseInfo.scale : "scale-100"}`}
          />

          {/* Core Interactive Glowing Circle */}
          <div
            className={`w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-cyan-500/20 via-teal-400/30 to-indigo-500/20 border-2 ${
              phaseInfo.glow
            } flex flex-col items-center justify-center text-center p-4 transition-all duration-[4000ms] cubic-bezier(0.4,0,0.2,1) z-10 ${
              isActive ? phaseInfo.scale : "scale-100"
            }`}
          >
            <span className="text-xs uppercase font-mono tracking-widest text-slate-300 mb-1 font-semibold">
              {isActive ? phaseInfo.label : "Ready"}
            </span>
            <span className="text-4xl sm:text-5xl font-mono font-bold text-white drop-shadow-md">
              {isActive ? timeLeft : selectedTechnique.pattern.inhale}
            </span>
            <span className="text-[10px] text-cyan-200 mt-1 font-medium max-w-[120px] leading-tight opacity-90">
              {isActive ? phaseInfo.sub : "Press Play to Begin"}
            </span>
          </div>
        </div>

        {/* PROGRESS BAR FOR CURRENT PHASE */}
        {isActive && (
          <div className="w-full max-w-md bg-slate-950/80 rounded-full h-2 border border-slate-800 overflow-hidden mb-6 z-10">
            <div
              className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full transition-all duration-300 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* PLAY / PAUSE / RESET CONTROLS */}
        <div className="flex items-center gap-4 z-10">
          <button
            onClick={toggleActive}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all cursor-pointer shadow-xl ${
              isActive
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                : "bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 shadow-cyan-500/30 scale-105"
            }`}
          >
            {isActive ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            <span>{isActive ? "Pause Session" : "Start Breathing"}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
            title="Reset Breathing Session"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* PHYSIOLOGICAL BENEFIT INFOCARD */}
      <div className="wellness-card p-6 bg-slate-900/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-950 border border-teal-800/60 text-teal-300 shrink-0">
            <Zap size={18} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-1">Vagus Stimulation</h4>
            <p className="text-slate-400 leading-relaxed">
              Exhalations longer than 4 seconds stimulate the vagus nerve, immediately slowing down your resting heart rate.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-300 shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-1">Cortisol Reduction</h4>
            <p className="text-slate-400 leading-relaxed">
              Four continuous box breathing cycles flush excess adrenaline and restore cognitive clarity during high stress.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-300 shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-1">Somatic Reset</h4>
            <p className="text-slate-400 leading-relaxed">
              Box breathing is used across clinical, tactical, and mindful disciplines as the gold standard for stress first-aid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
