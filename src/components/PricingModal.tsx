import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ShieldCheck, Check, X, Brain, Radio, MessageSquare, Volume2, Activity, ArrowRight, Settings } from "lucide-react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  premiumActive: boolean;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onUpgrade, premiumActive }) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: <Brain className="w-5 h-5 text-amber-500" />,
      title: "7-Day Clinical Adaptation Blueprint",
      description: "Generates bespoke bi-weekly neuro-synthesis reports that automatically identify subtle cognitive distortions in your journal and formulate custom clinical somatic homework contracts."
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-indigo-500" />,
      title: "Priority Clinical AI Companion Chat",
      description: "Connects your session to high-reasoning Gemini models with priority response speed, deeper situational memory, and more advanced therapeutic empathy."
    },
    {
      icon: <Volume2 className="w-5 h-5 text-emerald-500" />,
      title: "Realistic Vocal CBT Synthesizer",
      description: "Instantly convert text-based grounding exercises and bedtime routines into warm, ultra-calming realistic speech, bypassing robotic system voice generators."
    },
    {
      icon: <Activity className="w-5 h-5 text-rose-500" />,
      title: "Infinite Healing Logs & Analytics",
      description: "Removes the free-tier restriction of 5 logs. Create unlimited historical journals, stress baseline records, and comprehensive mood trend visual charts."
    },
    {
      icon: <Radio className="w-5 h-5 text-sky-500" />,
      title: "Biofeedback stress forecasting",
      description: "Simulates high-precision heart rate variability (HRV) telemetry and physical adrenaline surges, anticipating executive burnout before it limits you."
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border-b border-slate-100 flex items-start justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 animate-pulse" /> Neuraliso Premium
              </span>
              <h3 className="font-serif italic font-bold text-2xl text-slate-900">
                {premiumActive ? "Your VIP Recovery Sanctuary" : "Step Into Complete Emotional Freedom"}
              </h3>
              <p className="text-xs text-slate-500">
                {premiumActive 
                  ? "Enjoy uncompromised access to medical-grade AI grounding and advanced stress-relief toolkits."
                  : "Upgrade to premium to bypass all sandbox limits and unlock scientific mental wellness diagnostics."
                }
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Subscription State Alert */}
            {premiumActive ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-emerald-500 text-white rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">Your Subscription is Active</h4>
                  <p className="text-[11px] text-emerald-700">
                    Thank you for trusting us with your emotional safety. Your features are completely unlocked.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Monthly card */}
                <div className="p-5 border-2 border-slate-200 hover:border-slate-300 rounded-2xl bg-slate-50/50 flex flex-col justify-between transition relative">
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold">Standard Term</span>
                    <h4 className="text-sm font-bold text-slate-800 mt-1">Monthly Compassion</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Perfect for ongoing tactical anxiety relief.</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-slate-900">$4.99</span>
                    <span className="text-xs text-slate-500">/ month</span>
                  </div>
                </div>

                {/* Yearly card */}
                <div className="p-5 border-2 border-amber-400 bg-amber-500/[0.02] rounded-2xl flex flex-col justify-between transition relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-500 text-[9px] font-bold text-slate-950 px-2.5 py-0.5 rounded-bl-xl uppercase tracking-wider font-mono">
                    Save 20%
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-wider text-amber-700 font-bold">Annual Commitment</span>
                    <h4 className="text-sm font-bold text-slate-800 mt-1">Yearly Sanctuary</h4>
                    <p className="text-[11px] text-slate-500 mt-1">For serious seekers dedicated to profound habit changes.</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-slate-900">$48.00</span>
                    <span className="text-xs text-slate-500">/ year</span>
                  </div>
                </div>
              </div>
            )}

            {/* Premium Features List */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
                Bundled Premium Benefits ({features.length} features)
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start p-3 hover:bg-slate-50 rounded-2xl transition">
                    <span className="p-2.5 bg-slate-100 rounded-xl shrink-0">
                      {feat.icon}
                    </span>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-slate-800">{feat.title}</h5>
                      <p className="text-[11px] text-slate-500 leading-normal">{feat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Value Gap Comparison Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
                Value Gap Comparison
              </h4>
              <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-mono text-slate-500 font-bold">
                      <th className="p-3">Core Capabilities</th>
                      <th className="p-3 text-center">Free Tier</th>
                      <th className="p-3 text-center text-amber-700">Premium VIP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-3 font-medium">Daily Stress Grounding</td>
                      <td className="p-3 text-center">Included</td>
                      <td className="p-3 text-center font-semibold text-slate-900">Premium Quality</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Cognitive Restructuring Blueprint</td>
                      <td className="p-3 text-center text-slate-400">Disabled</td>
                      <td className="p-3 text-center font-bold text-emerald-600">Included</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Journal Storage Limit</td>
                      <td className="p-3 text-center">Max 5 Entries</td>
                      <td className="p-3 text-center font-bold text-emerald-600">Infinite</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">AI Empathy Chat Quality</td>
                      <td className="p-3 text-center">Standard</td>
                      <td className="p-3 text-center font-bold text-emerald-600">Priority reasoning</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Professional Vocal CBT Synthesizer</td>
                      <td className="p-3 text-center text-slate-400">Disabled</td>
                      <td className="p-3 text-center font-bold text-emerald-600">Included</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono italic">
              *Billed securely via Secure Sandbox Integration. Cancel anytime.
            </span>
            <div className="flex gap-2.5 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider transition"
              >
                Keep Exploring
              </button>
              <button
                onClick={onUpgrade}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-widest transition active:scale-95 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5"
              >
                <span>{premiumActive ? "Manage Subscription" : "Access Premium Now"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
