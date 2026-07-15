import React, { useState, useEffect } from "react";
import { BreathingIcon, GroundingIcon, AffirmationIcon } from "./Icons";

interface SOSViewProps {
  onTriggerCrisis?: (triggered: boolean) => void;
  onBackToDashboard?: () => void;
}

export const SOSView: React.FC<SOSViewProps> = ({
  onTriggerCrisis,
  onBackToDashboard
}) => {
  // Screen tracking: 1 = Emergency Calm, 2 = 5-4-3-2-1 Grounding, 3 = Recovery Check
  const [screenIndex, setScreenIndex] = useState<1 | 2 | 3>(1);
  
  // Custom audio/voice pacing simulation states
  const [voiceAssistance, setVoiceAssistance] = useState(true);
  const [isPlayingBreath, setIsPlayingBreath] = useState(true);

  // Breathing variables
  const [breathingPreset, setBreathingPreset] = useState<"4-7-8" | "box">("4-7-8");
  const [breathState, setBreathState] = useState<"Inhale" | "Hold" | "Exhale" | "Rest_Hold">("Inhale");
  const [breathCounter, setBreathCounter] = useState(4);

  // 5-4-3-2-1 sensory inputs state (Screen 2)
  const [groundingInputs, setGroundingInputs] = useState({
    see: ["", "", "", "", ""],
    touch: ["", "", "", ""],
    hear: ["", "", ""],
    smell: ["", ""],
    taste: [""]
  });

  // Preservation of EMDR & Vagus nerve alternative features for maximum premium scope
  const [showEMDRModule, setShowEMDRModule] = useState(false);
  const [emdrActive, setEmdrActive] = useState(false);
  const [emdrSpeed, setEmdrSpeed] = useState<number>(1);
  const [emdrX, setEmdrX] = useState<number>(50);

  // Active breathing simulation loop effect
  useEffect(() => {
    if (!isPlayingBreath) return;

    const interval = setInterval(() => {
      setBreathCounter((prev) => {
        if (prev <= 1) {
          if (breathingPreset === "4-7-8") {
            // 4-7-8 loop sequence: Inhale (4s) -> Hold (7s) -> Exhale (8s) -> Inhale...
            if (breathState === "Inhale") {
              setBreathState("Hold");
              return 7;
            } else if (breathState === "Hold") {
              setBreathState("Exhale");
              return 8;
            } else {
              setBreathState("Inhale");
              return 4;
            }
          } else {
            // Box breathing loop sequence: Inhale (4s) -> Hold (4s) -> Exhale (4s) -> Rest Hold (4s)
            if (breathState === "Inhale") {
              setBreathState("Hold");
              return 4;
            } else if (breathState === "Hold") {
              setBreathState("Exhale");
              return 4;
            } else if (breathState === "Exhale") {
              setBreathState("Rest_Hold");
              return 4;
            } else {
              setBreathState("Inhale");
              return 4;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlayingBreath, breathState, breathingPreset]);

  // EMDR Horizontal ball pacer loop
  useEffect(() => {
    if (!emdrActive) return;
    let direction = 1;
    let currentX = 50;
    const stepAmount = 1.8 * emdrSpeed; 

    const timer = setInterval(() => {
      currentX += direction * stepAmount;
      if (currentX >= 95) {
        currentX = 95;
        direction = -1;
      } else if (currentX <= 5) {
        currentX = 5;
        direction = 1;
      }
      setEmdrX(currentX);
    }, 30);

    return () => clearInterval(timer);
  }, [emdrActive, emdrSpeed]);

  const handleChooseBetter = () => {
    // Return to dashboard
    alert("Wonderful! Savoring this peaceful release. Directing you home.");
    if (onBackToDashboard) onBackToDashboard();
  };

  const handleChooseSame = () => {
    // Retry, loop back to breathing
    setScreenIndex(1);
    setBreathState("Inhale");
    setBreathCounter(4);
    setIsPlayingBreath(true);
  };

  const handleChooseWorse = () => {
    // Trigger severe distress takeover overlay immediately
    if (onTriggerCrisis) {
      onTriggerCrisis(true);
    } else {
      alert("Crisis indicators triggered. Opening resource contacts dialer.");
    }
  };

  // Helper voice transcript texts
  const getVoiceInstructionText = () => {
    if (breathState === "Inhale") {
      return "Slowly draw cool, fresh air into the very bottom of your lungs. Fill your stomach.";
    }
    if (breathState === "Hold") {
      return "Hold that space. Let the oxygen gently saturate your nervous cells. Relax your neck.";
    }
    if (breathState === "Exhale") {
      return "Now, partition your cheeks. Release with a soft whoosh. Let every ounce of tension drain.";
    }
    return "Acknowledge the quiet void in your chest before the next inhalation.";
  };

  return (
    <div id="sos-panic-view" className="pb-24 space-y-6 max-w-xl mx-auto px-1 animate-fade-in">
      
      {/* 🚨 SCREEN 1: EMERGENCY CALM INTERFACE */}
      {screenIndex === 1 && (
        <div className="space-y-6">
          <div className="text-center space-y-1 mt-3">
            <span className="text-[10px] bg-red-500/10 border border-red-500/20 px-3 py-1 text-danger-red font-mono font-bold uppercase rounded-full animate-pulse-slow">
              🔴 EMERGENCY CALM INTERFACE ACTIVE
            </span>
            <h2 className="text-3xl font-serif italic text-dark-text pt-2">Breathe With Me</h2>
            <p className="text-xs text-muted-text max-w-md mx-auto leading-relaxed">
              All distractions are minimized. Follow the expanding sphere to realign your cardiovascular telemetry.
            </p>
          </div>

          {/* BREATHING PRESENTS TRAY */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <button
              onClick={() => {
                setBreathingPreset("4-7-8");
                setBreathState("Inhale");
                setBreathCounter(4);
              }}
              className={`p-3 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                breathingPreset === "4-7-8"
                  ? "bg-slate-900 border-slate-950 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-650"
              }`}
            >
              🌬️ 4-7-8 Sleep Preset
            </button>
            <button
              onClick={() => {
                setBreathingPreset("box");
                setBreathState("Inhale");
                setBreathCounter(4);
              }}
              className={`p-3 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                breathingPreset === "box"
                  ? "bg-slate-900 border-slate-950 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-650"
              }`}
            >
              📦 Box Breathing Preset
            </button>
          </div>

          {/* MAIN CIRCLE VISUALIZER CARD */}
          <div className="wellness-card p-6 flex flex-col items-center justify-center space-y-6 relative overflow-hidden bg-white">
            
            {/* Cardiac calming wave visualizer (Line in backdrop) */}
            <div className="absolute top-4 left-0 w-full h-8 opacity-25 flex items-center justify-center pointer-events-none">
              <svg viewBox="0 0 100 20" className="w-1/2 stroke-primary-sage stroke-2 fill-none animate-pulse-slow">
                <path d="M 0 10 L 30 10 L 35 3 L 40 17 L 45 10 L 70 10 L 74 6 L 78 14 L 82 10 L 100 10" />
              </svg>
            </div>

            {/* EXPANDING BUBBLE MECHANISM */}
            <div className="relative flex items-center justify-center w-52 h-52 mt-4">
              <div 
                className={`absolute inset-0 rounded-full bg-soft-green/20 border-2 border-primary-sage/15 transition-all duration-[4000ms] ease-in-out ${
                  breathState === "Inhale" ? "scale-115 opacity-100" :
                  breathState === "Hold" ? "scale-115 opacity-80" : "scale-75 opacity-25"
                }`}
              />
              
              <div 
                className={`flex flex-col items-center justify-center w-36 h-36 rounded-full text-white font-serif transition-transform duration-[4000ms] ease-in-out shadow-lg ${
                  breathState === "Inhale" ? "bg-primary-sage scale-105" :
                  breathState === "Hold" ? "bg-amber-600 scale-105" :
                  "bg-blue-800 scale-75"
                }`}
              >
                <span className="text-xl font-bold tracking-wide italic capitalize">{breathState === "Rest_Hold" ? "Hold Empty" : breathState}</span>
                <span className="text-3xl font-mono mt-1 font-bold">{breathCounter}s</span>
              </div>
            </div>

            {/* Timing segments display */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-sm text-center text-[10px] font-medium font-sans">
              <div className={`p-1.5 rounded-xl border ${breathState === "Inhale" ? "bg-slate-50 border-primary-sage font-bold" : "text-slate-400 border-transparent"}`}>
                <span className="block font-bold">4s</span> Inhale
              </div>
              <div className={`p-1.5 rounded-xl border ${breathState === "Hold" ? "bg-slate-50 border-amber-500 font-bold" : "text-slate-400 border-transparent"}`}>
                <span className="block font-bold">{breathingPreset === "4-7-8" ? "7s" : "4s"}</span> Hold
              </div>
              <div className={`p-1.5 rounded-xl border ${breathState === "Exhale" ? "bg-slate-50 border-blue-500 font-bold" : "text-slate-400 border-transparent"}`}>
                <span className="block font-bold">{breathingPreset === "4-7-8" ? "8s" : "4s"}</span> Exhale
              </div>
              <div className={`p-1.5 rounded-xl border ${breathState === "Rest_Hold" ? "bg-slate-50 border-emerald-500 font-bold" : "text-slate-400 border-transparent"}`}>
                <span className="block font-bold">{breathingPreset === "box" ? "4s" : "0s"}</span> Rest Hold
              </div>
            </div>

            {/* Smart simulated auditory/voice instructions */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl w-full text-center">
              <span className="text-[8.5px] font-bold text-deep-sage tracking-wider uppercase block mb-1">🎧 Voice Coach Audio Instructions:</span>
              <p className="text-[11px] text-slate-700 italic leading-snug">"{getVoiceInstructionText()}"</p>
            </div>
          </div>

          {/* ACTIVE DISRUPTERS DEVIATION CORNER */}
          <div className="flex justify-between items-center px-2">
            <button
              onClick={() => {
                setIsPlayingBreath(!isPlayingBreath);
              }}
              className="text-xs text-muted-text hover:text-dark-text underline"
            >
              {isPlayingBreath ? "⏸ Pause Breathing Guide" : "▶ Resume Breathing Guide"}
            </button>
            <button
              onClick={() => setShowEMDRModule(!showEMDRModule)}
              className="text-xs text-primary-sage font-bold hover:underline"
            >
              {showEMDRModule ? "Hide EMDR Bar" : "🔓 Try EMDR Bilateral Simulator"}
            </button>
          </div>

          {/* DYNAMIC EMDR INTEGRATION */}
          {showEMDRModule && (
            <div className="p-5 wellness-card bg-white border border-slate-150 rounded-3xl space-y-3">
              <span className="text-xs font-bold text-teal-900 block">👁️ Eye Movement Bilateral Sweep</span>
              <p className="text-[10px] text-muted-text leading-tight">Keep neck still and tracks the turquoise dot with your pupils.</p>
              
              <div className="h-8 bg-slate-900 border rounded-xl relative flex items-center overflow-hidden">
                <div 
                  className="w-4.5 h-4.5 rounded-full bg-teal-400 shadow absolute"
                  style={{ left: `${emdrX}%`, transform: "translateX(-50%)" }}
                />
              </div>

              <div className="flex justify-between items-center pt-1.5">
                <div className="flex gap-1.5">
                  {[1, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setEmdrSpeed(s)}
                      className={`text-[9px] px-2 py-0.5 border rounded ${emdrSpeed === s ? "bg-teal-700 text-white font-bold" : "bg-slate-50"}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setEmdrActive(!emdrActive)}
                  className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-mono"
                >
                  {emdrActive ? "PAUSE EMDR" : "START EMDR"}
                </button>
              </div>
            </div>
          )}

          {/* PRIMARY FLOW BUTTON NAVIGATION */}
          <button
            onClick={() => {
              setIsPlayingBreath(false);
              setScreenIndex(2);
            }}
            className="w-full bg-slate-950 text-white py-4 font-bold rounded-2xl text-xs uppercase tracking-widest text-center block"
          >
            Slowing Down: Proceed to 5-4-3-2-1 Grounding →
          </button>
        </div>
      )}

      {/* 🧘‍♀️ SCREEN 2: 5-4-3-2-1 GROUNDING SYSTEM */}
      {screenIndex === 2 && (
        <div className="space-y-6 text-left">
          <div className="text-center space-y-1 mt-3">
            <span className="text-[10px] bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-blue-800 font-mono font-bold uppercase rounded-full animate-drift">
              🧘‍♀️ STEP 2: 5-4-3-2-1 SOMATIC SENSORY TRACKER
            </span>
            <h2 className="text-3xl font-serif italic text-dark-text pt-2">Anchor Your Mind</h2>
            <p className="text-xs text-muted-text max-w-sm mx-auto leading-relaxed">
              Observe your active room. Type down these concrete facts to anchor your anxiety receptors in physical reality.
            </p>
          </div>

          <div className="wellness-card p-6 bg-white border space-y-4 max-h-[50vh] overflow-y-auto">
            
            {/* SEE checklist */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-800 block uppercase">1. SEE (5 objects):</span>
              <div className="grid grid-cols-1 gap-1">
                {groundingInputs.see.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const copy = [...groundingInputs.see];
                      copy[idx] = e.target.value;
                      setGroundingInputs((p) => ({ ...p, see: copy }));
                    }}
                    placeholder={`Name object ${idx + 1}...`}
                    className="p-2 text-xs border border-slate-200 rounded-lg bg-slate-50/70"
                  />
                ))}
              </div>
            </div>

            {/* TOUCH checklist */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-slate-800 block uppercase">2. FEEL (4 textures):</span>
              <div className="grid grid-cols-1 gap-1">
                {groundingInputs.touch.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const copy = [...groundingInputs.touch];
                      copy[idx] = e.target.value;
                      setGroundingInputs((p) => ({ ...p, touch: copy }));
                    }}
                    placeholder={`Describe texture/surface ${idx + 1}...`}
                    className="p-2 text-xs border border-slate-200 rounded-lg bg-slate-50/70"
                  />
                ))}
              </div>
            </div>

            {/* HEAR Checklist */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-slate-800 block uppercase">3. HEAR (3 sounds):</span>
              <div className="grid grid-cols-1 gap-1">
                {groundingInputs.hear.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const copy = [...groundingInputs.hear];
                      copy[idx] = e.target.value;
                      setGroundingInputs((p) => ({ ...p, hear: copy }));
                    }}
                    placeholder={`Name unique sound ${idx + 1}...`}
                    className="p-2 text-xs border border-slate-200 rounded-lg bg-slate-50/70"
                  />
                ))}
              </div>
            </div>

            {/* SMELL */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-slate-800 block uppercase">4. SMELL (2 scents):</span>
              <div className="grid grid-cols-1 gap-1">
                {groundingInputs.smell.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const copy = [...groundingInputs.smell];
                      copy[idx] = e.target.value;
                      setGroundingInputs((p) => ({ ...p, smell: copy }));
                    }}
                    placeholder={`Name scent/odor ${idx + 1}...`}
                    className="p-2 text-xs border border-slate-200 rounded-lg bg-slate-50/70"
                  />
                ))}
              </div>
            </div>

            {/* TASTE */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-slate-800 block uppercase">5. TASTE (1 feeling):</span>
              <input
                type="text"
                value={groundingInputs.taste[0]}
                onChange={(e) => {
                  setGroundingInputs((p) => ({ ...p, taste: [e.target.value] }));
                }}
                placeholder="Observe tongue/saliva taste..."
                className="p-2 w-full text-xs border border-slate-200 rounded-lg bg-slate-50/70"
              />
            </div>

          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setScreenIndex(1)}
              className="px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs text-slate-650 uppercase font-bold"
            >
              Back
            </button>
            <button
              onClick={() => setScreenIndex(3)}
              className="flex-1 bg-slate-900 text-white rounded-xl py-3 font-semibold text-center text-xs uppercase"
            >
              Proceed to Recovery Check →
            </button>
          </div>
        </div>
      )}

      {/* 💓 SCREEN 3: RECOVERY CHECK */}
      {screenIndex === 3 && (
        <div className="space-y-6 text-center">
          <div className="text-center space-y-1 mt-3">
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-emerald-800 font-mono font-bold uppercase rounded-full">
              💓 RETREAT PROGRESS ASSESSMENT
            </span>
            <h2 className="text-3xl font-serif italic text-dark-text pt-2">Recovery Verification</h2>
            <p className="text-xs text-muted-text max-w-sm mx-auto leading-relaxed">
              Checking in on your neural static after these somatic exercises. Please select your honest response below.
            </p>
          </div>

          <div className="wellness-card p-6 bg-white border max-w-sm mx-auto space-y-4">
            <span className="text-sm font-bold text-slate-800 text-center block uppercase mt-2">How are you feeling now?</span>
            
            <div className="space-y-3 pt-2">
              <button
                onClick={handleChooseBetter}
                className="w-full p-4.5 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-between transition-all font-bold text-xs uppercase text-emerald-950 text-left active:scale-95 cursor-pointer"
              >
                <div>
                  <span className="block text-[13px]">😊 Much Better / At Peace</span>
                  <span className="text-[9.5px] font-normal text-slate-500 block font-mono">Tension decreased, ready to return.</span>
                </div>
                <span>→</span>
              </button>

              <button
                onClick={handleChooseSame}
                className="w-full p-4.5 bg-slate-50 hover:bg-slate-100 border border-slate-350 rounded-2xl flex items-center justify-between transition-all font-bold text-xs uppercase text-slate-800 text-left active:scale-95 cursor-pointer"
              >
                <div>
                  <span className="block text-[13px]">😐 Feeling The Same</span>
                  <span className="text-[9.5px] font-normal text-slate-500 block font-mono">Need to try breathing pacing again.</span>
                </div>
                <span>↺</span>
              </button>

              <button
                onClick={handleChooseWorse}
                className="w-full p-4.5 bg-red-50 hover:bg-red-100 border border-red-300 rounded-2xl flex items-center justify-between transition-all font-bold text-xs uppercase text-danger-red text-left active:scale-95 cursor-pointer animate-pulse"
              >
                <div>
                  <span className="block text-[13px]">😰 Feeling Worse / Unstable</span>
                  <span className="text-[9.5px] font-normal text-red-650 block font-mono">Escalate safety support channels.</span>
                </div>
                <span>⚠️</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setScreenIndex(1)}
            className="text-[10px] text-muted-text font-mono uppercase underline hover:text-dark-text block mx-auto text-center cursor-pointer"
          >
            ← Return to breathing trainer screen
          </button>
        </div>
      )}

    </div>
  );
};
