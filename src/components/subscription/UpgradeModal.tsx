import React, { useState } from "react";
import { X, Moon, Wind, Bot, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { useSubscription } from "../../contexts/SubscriptionContext";

export const UpgradeModal: React.FC = () => {
  const { 
    isModalOpen, 
    modalReason, 
    modalFeature, 
    closeUpgradeModal, 
    openLifetimeModal, 
    upgradeToPro, 
    startFreeTrial 
  } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulateMode, setSimulateMode] = useState(false); // Default false for Dodo checkout

  if (!isModalOpen) return null;

  const handleAction = async () => {
    setLoading(true);
    setError(null);
    try {
      await upgradeToPro(selectedPlan);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#0e1726]/95 border border-[#FFD700]/30 shadow-2xl shadow-[#FFD700]/10 p-6 md:p-8 text-white">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeUpgradeModal}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Neuraliso Plus</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Get more from Neuraliso
          </h2>
          <p className="text-slate-300 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            {modalReason || "Unlock your full wellness toolkit and personalized AI companionship."}
          </p>
          {modalFeature && (
            <div className="mt-3 inline-block px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-[#FFD700]">
              ✨ Unlocks: <span className="font-medium text-white">{modalFeature}</span>
            </div>
          )}
        </div>

        {/* 3 Benefit Icons with Text */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
          <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/15 text-[#38bdf8] flex items-center justify-center mb-2">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-200 leading-snug">
              All 6 sleep sounds for better rest
            </span>
          </div>

          <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-[#a855f7]/15 text-[#a855f7] flex items-center justify-center mb-2">
              <Wind className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-200 leading-snug">
              5 breathing modes for any moment
            </span>
          </div>

          <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/15 text-[#FFD700] flex items-center justify-center mb-2">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-200 leading-snug">
              Unlimited AI companion & stories
            </span>
          </div>
        </div>

        {/* Pricing Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Yearly Plan Card */}
          <div
            onClick={() => setSelectedPlan("yearly")}
            className={`relative p-4 rounded-2xl cursor-pointer transition-all border text-left ${
              selectedPlan === "yearly"
                ? "bg-[#FFD700]/10 border-[#FFD700] shadow-lg shadow-[#FFD700]/10 scale-[1.02]"
                : "bg-white/5 border-white/10 hover:border-white/20 opacity-80"
            }`}
          >
            <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-[#0B1121] font-bold text-[10px] tracking-wide uppercase shadow">
              Save 20%
            </div>
            <div className="text-xs font-medium text-slate-300 mb-1">Yearly Plan</div>
            <div className="text-xl font-bold text-white">$48<span className="text-xs font-normal text-slate-400">/year</span></div>
            <div className="text-xs font-semibold text-[#FFD700] mt-1">That&apos;s $4/month</div>
            <div className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 inline" /> 7-day free trial
            </div>
          </div>

          {/* Monthly Plan Card */}
          <div
            onClick={() => setSelectedPlan("monthly")}
            className={`p-4 rounded-2xl cursor-pointer transition-all border text-left flex flex-col justify-between ${
              selectedPlan === "monthly"
                ? "bg-[#FFD700]/10 border-[#FFD700] shadow-lg shadow-[#FFD700]/10 scale-[1.02]"
                : "bg-white/5 border-white/10 hover:border-white/20 opacity-80"
            }`}
          >
            <div>
              <div className="text-xs font-medium text-slate-300 mb-1">Monthly Plan</div>
              <div className="text-xl font-bold text-white">$4.99<span className="text-xs font-normal text-slate-400">/mo</span></div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">Billed monthly</div>
          </div>
        </div>

        {/* Featured Lifetime Deal Strip */}
        <div 
          onClick={() => {
            closeUpgradeModal();
            openLifetimeModal();
          }}
          className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-[#FFD700]/20 via-[#FFA500]/25 to-[#FFD700]/20 border border-[#FFD700]/50 flex items-center justify-between gap-3 cursor-pointer hover:border-[#FFD700] transition-all group shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#FFD700] text-[#0B1121]">
              <Sparkles className="w-4 h-4 fill-current" />
            </span>
            <div className="text-left">
              <div className="text-xs font-black text-white flex items-center gap-1">
                <span>🔥 Lifetime Deal: $20.92 One-Time</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-[#0B1121] font-bold">SAVE 65%</span>
              </div>
              <div className="text-[11px] text-slate-300">Pay once, own Neuraliso Plus forever. Never renew.</div>
            </div>
          </div>
          <span className="text-xs font-bold text-[#FFD700] group-hover:translate-x-0.5 transition-transform shrink-0">
            View Deal →
          </span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center mb-4">
            {error}
          </div>
        )}

        {/* Preview Simulation Toggle */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <label className="inline-flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={simulateMode}
              onChange={(e) => setSimulateMode(e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-[#FFD700] focus:ring-[#FFD700]"
            />
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#FFD700]" />
              <span>Preview Mode: Instant Test Checkout (No card required)</span>
            </span>
          </label>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleAction}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#ffe244] hover:to-[#ffb324] text-[#0B1121] font-bold text-base shadow-lg shadow-[#FFD700]/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin w-5 h-5 border-2 border-[#0B1121] border-t-transparent rounded-full" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{selectedPlan === "yearly" ? "Start 7-Day Free Trial" : "Upgrade to Plus ($4.99/mo)"}</span>
              </>
            )}
          </button>

          {/* Secondary Button: Zero Shame / Easy Dismiss */}
          <button
            onClick={closeUpgradeModal}
            className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors cursor-pointer text-center block"
          >
            Continue with free
          </button>
        </div>

        {/* Footer Guarantees */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-4 text-[11px] text-slate-400 text-center">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cancel anytime
          </span>
          <span>•</span>
          <span>No questions asked</span>
          <span>•</span>
          <span>Crisis help is always 100% free</span>
        </div>

      </div>
    </div>
  );
};
