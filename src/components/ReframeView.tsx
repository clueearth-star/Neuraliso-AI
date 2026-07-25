import React, { useState, useEffect } from "react";
import { RefreshCw, Check, ArrowRight, ShieldCheck, Clock, Trash2, Sparkles, HelpCircle } from "lucide-react";
import { storage } from "../lib/storage";
import { sounds } from "../lib/sounds";
import { ReframeEntry } from "../types";

export const ReframeView: React.FC = () => {
  const [reframes, setReframes] = useState<ReframeEntry[]>([]);
  
  // Form state
  const [situation, setSituation] = useState("");
  const [automaticThought, setAutomaticThought] = useState("");
  const [beliefPercent, setBeliefPercent] = useState<number>(75);
  const [balancedThought, setBalancedThought] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const reloadData = () => {
    setReframes(storage.getReframes());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!automaticThought.trim() || !balancedThought.trim()) return;

    sounds.playSuccess();
    storage.saveReframe({
      situation: situation.trim() || "Unspecified situation",
      automaticThought: automaticThought.trim(),
      beliefPercent,
      balancedThought: balancedThought.trim(),
    });

    setSituation("");
    setAutomaticThought("");
    setBeliefPercent(75);
    setBalancedThought("");
    setShowSuccess(true);
    reloadData();

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleDelete = (id: string) => {
    sounds.playClick();
    const updated = reframes.filter((r) => r.id !== id);
    localStorage.setItem("neuraliso_reframes_v2", JSON.stringify(updated));
    reloadData();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12 pb-28 md:pb-12 animate-page-in text-left">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Cognitive Behavioral Therapy (CBT)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Thought Reframe
        </h1>
        <p className="text-sm sm:text-base text-white/60">
          When we feel overwhelmed, our minds often jump to extreme conclusions. Use this 4-step exercise to gently challenge unhelpful thoughts.
        </p>
      </div>

      {/* 4-Step Reframe Form */}
      <div className="wellness-card p-6 sm:p-10 space-y-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Step 1: What happened? */}
          <div className="space-y-3">
            <label htmlFor="situation-input" className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#00d4ff]/20 text-[#00d4ff] flex items-center justify-center text-xs font-mono font-bold">1</span>
                <span>What happened?</span>
              </span>
              <span className="text-xs font-normal text-white/40">The situation or trigger</span>
            </label>
            <textarea
              id="situation-input"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="e.g. My friend didn't reply to my message for several hours..."
              rows={2}
              className="w-full text-sm leading-relaxed"
            />
          </div>

          {/* Step 2: What thought came up? */}
          <div className="space-y-3">
            <label htmlFor="automatic-thought" className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#00b8a9]/20 text-[#00b8a9] flex items-center justify-center text-xs font-mono font-bold">2</span>
                <span>What thought came up?</span>
              </span>
              <span className="text-xs font-normal text-rose-300">Required</span>
            </label>
            <textarea
              id="automatic-thought"
              required
              value={automaticThought}
              onChange={(e) => setAutomaticThought(e.target.value)}
              placeholder="e.g. They must be angry with me or I did something wrong..."
              rows={3}
              className="w-full text-sm leading-relaxed border-rose-500/30 focus:border-rose-400"
            />
          </div>

          {/* Step 3: How true does that feel? (0-100%) */}
          <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5">
            <label htmlFor="belief-slider" className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">3</span>
                <span>How true does that feel right now? (0-100%)</span>
              </span>
              <span className="text-base font-mono font-bold text-amber-400">{beliefPercent}%</span>
            </label>
            <input
              id="belief-slider"
              type="range"
              min="0"
              max="100"
              step="5"
              value={beliefPercent}
              onChange={(e) => setBeliefPercent(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-white/40">
              <span>0% (Not true at all)</span>
              <span>50% (Uncertain)</span>
              <span>100% (Completely certain)</span>
            </div>
          </div>

          {/* Step 4: What's a more balanced thought? */}
          <div className="space-y-3">
            <label htmlFor="balanced-thought" className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">4</span>
                <span>What&apos;s a more balanced, realistic perspective?</span>
              </span>
              <span className="text-xs font-normal text-emerald-300">Required</span>
            </label>
            <textarea
              id="balanced-thought"
              required
              value={balancedThought}
              onChange={(e) => setBalancedThought(e.target.value)}
              placeholder="e.g. They are probably busy at work or driving. My value as a friend is not determined by instantaneous text replies..."
              rows={3}
              className="w-full text-sm leading-relaxed border-emerald-500/30 focus:border-emerald-400"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!automaticThought.trim() || !balancedThought.trim()}
              className={`w-full py-4 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                automaticThought.trim() && balancedThought.trim()
                  ? "bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] shadow-lg shadow-[#00d4ff]/25 hover:scale-105 active:scale-95"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              <span>Save Reframe Entry</span>
              <Sparkles className="w-5 h-5" />
            </button>
          </div>

          {showSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-page-in">
              <Check className="w-4 h-4" />
              <span>Thought reframe logged successfully! Your mind is becoming more flexible.</span>
            </div>
          )}
        </form>
      </div>

      {/* History List of Past Reframes */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-400" />
            <span>Past Reframes</span>
          </h2>
          <span className="text-xs font-bold text-white/50 bg-white/5 px-3 py-1 rounded-full">
            {reframes.length} {reframes.length === 1 ? "entry" : "entries"} saved
          </span>
        </div>

        {reframes.length === 0 ? (
          <div className="wellness-card p-12 text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-white/30 mx-auto" />
            <h3 className="text-base font-bold text-white">No reframes recorded yet.</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              Whenever you notice automatic anxious or self-critical thoughts, use the 4 steps above to practice cognitive flexibility.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reframes.map((item) => (
              <div key={item.id} className="wellness-card p-6 space-y-4 relative group">
                <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white/40 block">{item.date}</span>
                    <h4 className="text-sm font-bold text-white">Situation: &quot;{item.situation}&quot;</h4>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete reframe entry"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Automatic Thought */}
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Automatic Thought</span>
                      <span className="text-xs font-mono text-rose-300 font-bold">{item.beliefPercent}% true</span>
                    </div>
                    <p className="text-xs text-white/90 leading-relaxed italic">
                      &quot;{item.automaticThought}&quot;
                    </p>
                  </div>

                  {/* Balanced Thought */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Balanced Perspective</span>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-white/90 leading-relaxed font-semibold">
                      &quot;{item.balancedThought}&quot;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
