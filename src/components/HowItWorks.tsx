import React from "react";
import { Smile, Sparkles, TrendingUp } from "lucide-react";

export const HowItWorks: React.FC = () => {
  return (
    <section 
      id="how-it-works" 
      aria-labelledby="how-it-works-heading" 
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#111A2E]/60 border-y border-white/10 relative scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-xs font-bold uppercase tracking-wider">
            <span>Simple 3-Step Routine</span>
          </div>
          <h2 id="how-it-works-heading" className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            How it works
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            Quiet relief in under a minute with zero learning curve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Step 1 */}
          <div className="wellness-card p-6 sm:p-7 space-y-4 relative border border-white/10 hover:border-[#00d4ff]/40 transition-all bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div 
                aria-hidden="true" 
                className="w-12 h-12 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff]"
              >
                <Smile className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-[#00d4ff] border border-white/10">
                Step 1
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">1. Check in</h3>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                Log your mood in 10 seconds.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="wellness-card p-6 sm:p-7 space-y-4 relative border border-white/10 hover:border-[#00b8a9]/40 transition-all bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div 
                aria-hidden="true" 
                className="w-12 h-12 rounded-2xl bg-[#00b8a9]/15 border border-[#00b8a9]/30 flex items-center justify-center text-[#00b8a9]"
              >
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-[#00b8a9] border border-white/10">
                Step 2
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">2. Pick a tool</h3>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                Breathing, sleep sounds, or CBT journal.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="wellness-card p-6 sm:p-7 space-y-4 relative border border-white/10 hover:border-emerald-400/40 transition-all bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div 
                aria-hidden="true" 
                className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400"
              >
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-emerald-400 border border-white/10">
                Step 3
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">3. See patterns</h3>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                Track progress privately in your browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
