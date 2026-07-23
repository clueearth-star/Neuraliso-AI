import React from "react";
import { HeartPulse, Wind, Moon, Brain, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

interface HowItWorksSectionProps {
  onStartNow?: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStartNow }) => {
  return (
    <div className="w-full bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 space-y-20 border-t border-slate-900">
      {/* 1. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-6xl mx-auto space-y-12 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-teal-400 bg-teal-950/80 px-3.5 py-1 rounded-full border border-teal-800/50">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif italic font-bold tracking-tight text-white">
            How Neuraliso Works
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            A quiet space designed to give you instant relief and build lasting daily mindfulness habits.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 space-y-4 hover:border-teal-500/40 transition-all duration-300 shadow-xl relative group">
            <div className="w-12 h-12 rounded-xl bg-teal-950 border border-teal-800/60 flex items-center justify-center text-teal-300 font-bold text-lg group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="text-lg font-serif font-bold text-white group-hover:text-teal-300 transition-colors">
              Check in with yourself
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Track your daily mood, stress levels, and emotional state in seconds using simple, supportive prompts.
            </p>
            <div className="pt-2 text-teal-400/80 text-[11px] font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Takes under 1 minute</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 space-y-4 hover:border-teal-500/40 transition-all duration-300 shadow-xl relative group">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-300 font-bold text-lg group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="text-lg font-serif font-bold text-white group-hover:text-teal-300 transition-colors">
              Find the right tool
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Access personalized breathing exercises, calm thought-reframing prompts, and ambient sleep audio.
            </p>
            <div className="pt-2 text-cyan-400/80 text-[11px] font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Instant stress first-aid</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 space-y-4 hover:border-teal-500/40 transition-all duration-300 shadow-xl relative group">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-300 font-bold text-lg group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="text-lg font-serif font-bold text-white group-hover:text-teal-300 transition-colors">
              Build a daily habit
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Stay consistent with gentle reminders, track your weekly momentum, and build lifelong emotional resilience.
            </p>
            <div className="pt-2 text-emerald-400/80 text-[11px] font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Private & self-paced</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES PREVIEW SECTION */}
      <section id="features" className="max-w-6xl mx-auto space-y-12 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-3.5 py-1 rounded-full border border-cyan-800/50">
            Wellness Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif italic font-bold tracking-tight text-white">
            Designed for Your Peace of Mind
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Everything you need for guided breathing, mood tracking, and peaceful rest—all in one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Mood Tracking */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-teal-500/50 transition-all duration-300 group shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-white group-hover:text-teal-300 transition-colors">
              Mood Check-ins
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Log daily feelings with simple prompts to discover patterns and understand your emotional rhythms.
            </p>
          </div>

          {/* Card 2: Guided Breathing */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-cyan-500/50 transition-all duration-300 group shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
              <Wind className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-white group-hover:text-cyan-300 transition-colors">
              Breathing Exercises
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Paced box breathing, 4-7-8 relaxation cycles, and grounding routines to calm acute stress.
            </p>
          </div>

          {/* Card 3: Calming Sounds */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-indigo-500/50 transition-all duration-300 group shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
              <Moon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-white group-hover:text-indigo-300 transition-colors">
              Calming Sounds & Sleep
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Ambient audio tracks, gentle rain waves, and soothing soundscapes for sleep and relaxation.
            </p>
          </div>

          {/* Card 4: Thought Reframing */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-emerald-500/50 transition-all duration-300 group shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-white group-hover:text-emerald-300 transition-colors">
              Thought Reframing
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Interactive reflection journals to reframe stressful thoughts into compassionate perspectives.
            </p>
          </div>
        </div>

        {/* Call to action bar */}
        <div id="about" className="bg-gradient-to-r from-slate-900 via-teal-950/60 to-slate-900 border border-teal-500/30 rounded-3xl p-8 sm:p-10 text-center space-y-5 shadow-2xl relative overflow-hidden scroll-mt-24">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-serif italic font-bold text-white">
              A Quiet Space for Your Mind
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Your privacy matters. We keep your data safe and private so you can focus on feeling better every day.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={onStartNow}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-full shadow-lg shadow-teal-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Start your first check-in</span>
              <ArrowRight className="w-4 h-4 text-slate-950 ml-1" />
            </button>
          </div>

          <div className="pt-3 flex items-center justify-center gap-2 text-[11px] text-teal-300/80 font-mono">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Your privacy matters. We keep your data safe.</span>
          </div>
        </div>
      </section>
    </div>
  );
};
