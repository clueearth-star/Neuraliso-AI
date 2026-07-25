import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Check, Heart, Wind, Moon, Compass, Smile } from "lucide-react";
import { storage } from "../lib/storage";
import { sounds } from "../lib/sounds";

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<"calm" | "sleep" | "focus" | "explore" | "">("");

  const handleNextFrom1 = () => {
    sounds.playClick();
    setStep(2);
  };

  const handleNextFrom2 = () => {
    sounds.playClick();
    setStep(3);
  };

  const handleFinish = () => {
    sounds.playSuccess();
    storage.saveOnboarding({
      completed: true,
      name: name.trim(),
      goal,
    });
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md wellness-card p-8 sm:p-10 text-center space-y-8 animate-page-in relative overflow-hidden">
        {/* Subtle Top Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#00d4ff]/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#00b8a9]/20 rounded-full blur-2xl" />

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? "w-8 bg-[#00d4ff]" : s < step ? "w-4 bg-[#00b8a9]" : "w-4 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Screen 1: Hi. We're glad you're here. */}
        {step === 1 && (
          <div className="space-y-6 animate-page-in">
            <div className="w-16 h-16 rounded-3xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff] mx-auto">
              <Smile className="w-8 h-8" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Hi. We&apos;re glad you&apos;re here.
              </h2>
              <p className="text-sm text-white/60">
                A quiet space for your mind. What should we call you? (Optional)
              </p>
            </div>

            <div className="pt-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name or nickname..."
                className="w-full text-center text-base py-3.5 bg-white/5 border-white/15 focus:border-[#00d4ff] rounded-2xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNextFrom1();
                }}
              />
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleNextFrom1}
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00d4ff]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{name.trim() ? `Continue as ${name.trim()}` : "Continue"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextFrom1}
                className="text-xs text-white/40 hover:text-white/70 transition-colors py-1 cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Screen 2: What are you hoping to find? */}
        {step === 2 && (
          <div className="space-y-6 animate-page-in">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                What are you hoping to find?
              </h2>
              <p className="text-sm text-white/60">
                Choose a focus area so we can tailor your daily check-in tools.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-left pt-2">
              {[
                { id: "calm", label: "Calm", desc: "Reduce stress & anxiety", icon: <Wind className="w-5 h-5 text-[#00d4ff]" /> },
                { id: "sleep", label: "Sleep", desc: "Fall asleep faster", icon: <Moon className="w-5 h-5 text-indigo-400" /> },
                { id: "focus", label: "Focus", desc: "Clear mental fog", icon: <Sparkles className="w-5 h-5 text-amber-400" /> },
                { id: "explore", label: "Just exploring", desc: "Browse daily wellness", icon: <Compass className="w-5 h-5 text-teal-400" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playClick();
                    setGoal(item.id as any);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all space-y-2 cursor-pointer ${
                    goal === item.id
                      ? "bg-[#00d4ff]/15 border-[#00d4ff] shadow-md shadow-[#00d4ff]/10 scale-[1.02]"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {item.icon}
                    {goal === item.id && <Check className="w-4 h-4 text-[#00d4ff]" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">{item.label}</span>
                    <span className="text-xs text-white/50 block">{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-6">
              <button
                onClick={() => {
                  sounds.playClick();
                  setStep(1);
                }}
                className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextFrom2}
                disabled={!goal}
                className={`flex-1 py-3.5 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  goal
                    ? "bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] shadow-lg shadow-[#00d4ff]/20 hover:scale-105 active:scale-95"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 3: We'll check in with you gently. No pressure. */}
        {step === 3 && (
          <div className="space-y-6 animate-page-in">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto animate-soft-pulse">
              <Heart className="w-8 h-8 fill-current" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                We&apos;ll check in with you gently. No pressure.
              </h2>
              <p className="text-sm text-white/60 leading-relaxed max-w-sm mx-auto">
                No streaks that make you feel guilty. No sign-ups or cloud passwords required. Just your private space to pause and reflect.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 space-y-2 text-left">
              <div className="flex items-center gap-2 text-[#00b8a9] font-bold">
                <Check className="w-4 h-4" />
                <span>100% Private &amp; Offline-Ready</span>
              </div>
              <p>
                All check-ins and journal entries are stored directly on your device. You can export or erase your data anytime.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => {
                  sounds.playClick();
                  setStep(2);
                }}
                className="px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-4 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00d4ff]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start your journey</span>
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
