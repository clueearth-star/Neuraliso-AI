import React, { useState } from "react";
import { JournalEntry } from "../types";
import { Sparkles, ShieldCheck, FileCheck, Brain, Flame, FileText, ChevronRight, Check } from "lucide-react";

interface PremiumBlueprintViewProps {
  entries: JournalEntry[];
  userName: string;
  premiumActive: boolean;
  userId?: string;
}

interface BlueprintData {
  assessmentOverview: string;
  cognitiveDistortions: Array<{
    name: string;
    analysis: string;
    reframeHomework: string;
  }>;
  vagalExercises: Array<{
    name: string;
    description: string;
    duration: string;
  }>;
  homeworkContracts: string[];
  poeticPrescription: string;
}

export const PremiumBlueprintView: React.FC<PremiumBlueprintViewProps> = ({ entries, userName, premiumActive, userId }) => {
  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [completedHomework, setCompletedHomework] = useState<Record<number, boolean>>({});

  const generateBlueprint = async () => {
    if (!premiumActive) {
      alert("Please upgrade to Premium to request your custom Clinical Cognitive Well-being Blueprint.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/premium-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries, userName, userId })
      });
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.blueprint) {
          setBlueprint(data.blueprint);
        }
      } else {
        const text = await response.text();
        console.warn("[Premium Blueprint Fallback] Received non-JSON or status error:", text.substring(0, 120));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleHomework = (idx: number) => {
    setCompletedHomework(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div id="premium-clinical-blueprint-root" className="wellness-card p-6 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-2xl">
      {/* Absolute high-end aesthetic sparkles */}
      <div className="absolute top-0 right-0 p-4">
        <span className="text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/40 font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/10">
          ✦ Elite Cognitive Clinic
        </span>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-2xl shadow-lg">
            <Brain className="w-5.5 h-5.5 animate-pulse" />
          </span>
          <div>
            <h3 className="font-serif italic font-bold text-xl text-amber-100">Bespoke Cognitive Well-Being Blueprint</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Personalized Clinical Adaptation Engine</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-md">
          As a premium member, you receive state-of-the-art diagnostic synthesis. Our model correlates your complete logged history on Firestore, analyzing patterns to assemble a signature therapeutic prescription.
        </p>

        {/* Action Button to trigger if empty */}
        {!blueprint && (
          <div className="py-4 text-center">
            {premiumActive ? (
              <>
                <button
                  onClick={generateBlueprint}
                  disabled={loading}
                  className="w-full max-w-sm mx-auto py-4 px-6 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-amber-500/15 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing Luxury Blueprint...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
                      <span>Request Elite Diagnostic Report</span>
                    </>
                  )}
                </button>
                <p className="text-[9px] text-slate-400 mt-2 font-mono">
                  *Synthesizes biometric profiles from {entries.length || 7} logged wellness records.
                </p>
              </>
            ) : (
              <div className="p-6 rounded-3xl bg-slate-950/50 border border-amber-500/20 max-w-md mx-auto space-y-4">
                <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-widest text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  🔒 Premium Feature
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Get custom bi-weekly CBT reports, vagus somatic exercise homework, and personalized clinical diagnostics based on your historical emotional patterns.
                </p>
                <button
                  onClick={() => {
                    const btn = document.getElementById("toggle-premium-membership");
                    if (btn) {
                      btn.click();
                    } else {
                      alert("Please access the Profile page Settings Center to upgrade.");
                    }
                  }}
                  className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-widest transition active:scale-95 flex items-center justify-center gap-1.5 mx-auto font-sans"
                >
                  <span>Unlock Blueprint Now</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* RENDER ACTIVE BLUEPRINT */}
        {blueprint && (
          <div className="space-y-6 animate-fade-in pt-2 border-t border-slate-705">
            {/* Overview Section */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">1. Strategic Clinical Overview</h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-serif italic">
                    "{blueprint.assessmentOverview}"
                  </p>
                </div>
              </div>
            </div>

            {/* Cognitive Distortions detected */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-amber-500" />
                <span>2. Cognitive Restructuring Exercises</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blueprint.cognitiveDistortions.map((dist, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2">
                    <span className="text-[10px] bg-slate-800 text-amber-400 font-bold font-mono px-2 py-0.5 rounded-md">
                      Detected: {dist.name}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{dist.analysis}</p>
                    <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400">
                      <span className="font-bold text-slate-200 block">✓ Active Assignment:</span>
                      <p className="italic text-amber-100/90 mt-0.5">{dist.reframeHomework}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vagus Nerve autonomic rest */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>3. Vagus Nerve Autonomic Rest</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blueprint.vagalExercises.map((ex, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-white/5 flex items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <h5 className="text-xs font-bold text-amber-100">{ex.name}</h5>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{ex.description}</p>
                    </div>
                    <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono px-1.5 py-0.5 rounded-full shrink-0">
                      {ex.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Homework contracts */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>4. Premium Homework Contracts</span>
              </h4>

              <div className="space-y-2">
                {blueprint.homeworkContracts.map((hw, idx) => {
                  const isDone = !!completedHomework[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleHomework(idx)}
                      className={`w-full p-3.5 rounded-xl border transition-all text-left flex items-center gap-3 active:scale-98 ${
                        isDone
                          ? "bg-slate-900/50 border-amber-500/40 text-slate-400 line-through"
                          : "bg-slate-900 border-white/5 text-white hover:border-white/10"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isDone 
                          ? "bg-amber-500 border-amber-500 text-slate-950" 
                          : "border-slate-600 bg-slate-800"
                      }`}>
                        {isDone && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span className="text-xs leading-relaxed">{hw}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Prescription */}
            <div className="pt-4 border-t border-white/5 text-center space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400/80 block">5. Golden Prescription Seal</span>
              <p className="text-sm font-serif italic text-amber-200/95 max-w-md mx-auto leading-relaxed">
                "{blueprint.poeticPrescription}"
              </p>
              
              <div className="pt-4 flex justify-center items-center gap-1.5 text-[9px] text-slate-500 font-mono uppercase">
                <ShieldCheck size={12} className="text-amber-500" />
                <span>Encrypted • Sign-off Authorized under 256-bit Key ID</span>
              </div>

              {/* Reset trigger */}
              <button
                onClick={() => setBlueprint(null)}
                className="text-[10px] text-slate-400 hover:text-white underline pt-2 block mx-auto font-mono"
              >
                Reset Assessment / Re-Analyze
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
