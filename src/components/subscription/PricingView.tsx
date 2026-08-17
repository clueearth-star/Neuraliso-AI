import React, { useState } from "react";
import { Check, Sparkles, Shield, Heart, HelpCircle, ArrowRight, Star, UserCheck, Zap, Crown, Lock, ShieldCheck } from "lucide-react";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { LIFETIME_DEAL } from "../../lib/subscriptions";

export const PricingView: React.FC = () => {
  const { 
    isPro, 
    isLifetime, 
    isTrial, 
    expiresAt, 
    upgradeToPro, 
    openLifetimeModal, 
    buyLifetimeDeal 
  } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simulateMode, setSimulateMode] = useState(false);
  const navigate = useNavigate();

  const handleMonthlyUpgrade = async () => {
    setLoadingPlan("monthly");
    setError(null);
    try {
      const res = await upgradeToPro("monthly", simulateMode);
      if (!res.success) setError(res.error || "Failed to upgrade");
    } catch (e: any) {
      setError(e.message || "Upgrade failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleLifetimeUpgrade = async () => {
    setLoadingPlan("lifetime");
    setError(null);
    try {
      openLifetimeModal();
    } catch (e: any) {
      setError(e.message || "Lifetime deal initiation failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in text-white">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FFD700]/20 via-[#FFA500]/20 to-[#FFD700]/20 border border-[#FFD700]/40 text-[#FFD700] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
          <Crown className="w-3.5 h-3.5" />
          <span>Limited-Time Lifetime Offer Available</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Invest in Your Peace of Mind
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
          Core emergency resources and basic check-ins are <span className="text-white font-semibold underline decoration-[#00d4ff]">always 100% free</span>. Choose the plan that best fits your wellness journey.
        </p>

        {/* Social Proof Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-300">
          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Join <strong className="text-white">10,000+ people</strong> prioritizing their mental wellness with zero dark patterns.</span>
        </div>
      </div>

      {/* Already Pro / Lifetime Banner */}
      {isPro && (
        <div className="max-w-2xl mx-auto mb-10 p-6 rounded-3xl bg-gradient-to-r from-[#FFD700]/20 via-[#FFA500]/15 to-[#FFD700]/20 border border-[#FFD700]/40 text-center shadow-xl">
          <div className="inline-flex p-3 rounded-2xl bg-[#FFD700]/20 text-[#FFD700] mb-3">
            <Crown className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">
            {isLifetime 
              ? "You have Neuraliso Plus Lifetime Access! 🎉" 
              : `You are currently on Neuraliso ${isTrial ? "Plus (Free Trial)" : "Plus"}! 🎉`
            }
          </h3>
          <p className="text-slate-300 text-sm mb-4">
            {isLifetime 
              ? "Your subscription is permanently active forever. No renewal fees, ever."
              : (expiresAt 
                  ? `Your access is active until ${new Date(expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
                  : "Your Plus subscription is currently active."
                )
            }
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate("/app/settings")}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Manage in Settings
            </button>
          </div>
        </div>
      )}

      {/* Preview Simulation Toggle */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <label className="inline-flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={simulateMode}
            onChange={(e) => setSimulateMode(e.target.checked)}
            className="rounded border-white/20 bg-white/5 text-[#FFD700] focus:ring-[#FFD700]"
          />
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Preview Mode: Instant Test Checkout (Simulate payment without Dodo popup)</span>
          </span>
        </label>
      </div>

      {/* Error display */}
      {error && (
        <div className="max-w-md mx-auto p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center mb-6">
          {error}
        </div>
      )}

      {/* THREE PRICING CARDS (1. Free, 2. Monthly, 3. Lifetime Hero) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16 items-stretch">
        
        {/* 1. FREE TIER CARD (Small, Neutral) */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-7 flex flex-col justify-between relative hover:border-white/20 transition-all text-left">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Free
              </span>
              <span className="text-[11px] text-slate-400">No card required</span>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Neuraliso Free</h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">
              Essential emotional check-ins and emergency crisis support for everyone.
            </p>
            
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">$0</span>
              <span className="text-slate-400 text-xs sm:text-sm">/ forever</span>
            </div>

            <div className="space-y-3 mb-8 text-xs sm:text-sm text-slate-300">
              <div className="font-semibold text-white text-[11px] uppercase tracking-wider mb-1">What&apos;s Included:</div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>3 mood check-ins</strong> per week</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Box breathing rhythm</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>1 ambient soundscape (Rain)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>3 CBT reframes / week</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                <span>AI Chat (5 msgs / day)</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <Heart className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 fill-current" />
                <span><strong>988 Crisis button</strong> — always 100% free</span>
              </div>
            </div>
          </div>

          <button
            disabled={true}
            className="w-full py-3 px-4 rounded-xl bg-white/10 text-slate-400 font-semibold text-xs cursor-not-allowed text-center"
          >
            Your Current Baseline
          </button>
        </div>

        {/* 2. MONTHLY TIER CARD (Medium) */}
        <div className="rounded-3xl bg-slate-900/90 border border-white/15 p-7 flex flex-col justify-between relative hover:border-white/30 transition-all text-left">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider border border-white/10">
                Monthly Subscription
              </span>
              <span className="text-[11px] text-slate-400">Cancel anytime</span>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Neuraliso Monthly</h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">
              Flexible month-to-month access to the full wellness suite.
            </p>
            
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">$4.99</span>
              <span className="text-slate-400 text-xs sm:text-sm">/ month</span>
            </div>
            <div className="text-[11px] text-slate-400 mb-6">
              Billed monthly ($59.88/year equivalent)
            </div>

            <div className="space-y-3 mb-8 text-xs sm:text-sm text-slate-300">
              <div className="font-semibold text-slate-200 text-[11px] uppercase tracking-wider mb-1">Everything in Free, plus:</div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Unlimited</strong> mood check-ins &amp; history</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>All 5</strong> breathing modes &amp; timer</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>All 6</strong> sleep soundscapes &amp; binaural beats</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Unlimited</strong> CBT thought reframes</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Unlimited</strong> CBT AI Companion chat</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Full trend analytics &amp; encrypted cloud sync</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleMonthlyUpgrade}
            disabled={loadingPlan === "monthly" || isPro}
            className="w-full py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingPlan === "monthly" ? "Opening..." : "Get Monthly ($4.99/mo)"}
          </button>
        </div>

        {/* 3. LIFETIME TIER CARD (LARGE HERO - GOLD SHIMMER) */}
        <div className="rounded-3xl bg-gradient-to-b from-[#18233c] via-[#121b30] to-[#0c1324] border-2 border-[#FFD700] p-8 flex flex-col justify-between relative shadow-2xl shadow-[#FFD700]/25 lg:-translate-y-3 hover:shadow-[#FFD700]/40 transition-all text-left group">
          
          {/* Top Hero Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-[#0B1121] font-black text-xs tracking-wider uppercase shadow-lg flex items-center gap-1.5 animate-pulse">
            <Crown className="w-4 h-4 fill-current" />
            <span>⭐ Best Value • Save 65% Forever</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 mt-1">
              <span className="px-3 py-1 rounded-full bg-[#FFD700]/20 text-[#FFD700] text-xs font-bold uppercase tracking-wider border border-[#FFD700]/40">
                Neuraliso Plus Lifetime
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                Save $38.96/year forever
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
              Pay once. Own forever.
            </h2>
            <p className="text-amber-200/90 text-xs sm:text-sm mb-5 font-medium">
              No monthly fees. No yearly renewals. Forever yours.
            </p>
            
            {/* Huge Price */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFD700]/15 via-[#FFA500]/15 to-[#FFD700]/15 border border-[#FFD700]/40 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700]">
                  $20.92
                </span>
                <span className="text-slate-400 text-sm line-through font-medium">
                  Was $59.88/year
                </span>
              </div>
              <div className="text-xs text-[#FFD700] font-bold mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>One-time payment • Never expires</span>
              </div>
            </div>

            {/* Feature List with Gold Checkmarks */}
            <div className="space-y-3.5 mb-8 text-xs sm:text-sm text-slate-200">
              <div className="font-bold text-[#FFD700] text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Everything in Neuraliso Plus Forever:</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span><strong>Unlimited mood check-ins</strong> &amp; emotional journaling</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span><strong>All 5 clinical breathing modes</strong> (Box, 4-7-8, Calm, Power, Sleep)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span><strong>All 6 ambient sleep soundscapes</strong> (Binaural, Brown Noise, Rain, Ocean)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span><strong>Unlimited CBT thought reframes</strong> &amp; distortion coaching</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span><strong>Unlimited 24/7 AI Companion</strong> with zero data retention</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span><strong>All future updates &amp; new features</strong> included free forever</span>
              </div>
            </div>
          </div>

          <div>
            <button
              id="get-lifetime-access-pricing-cta"
              onClick={handleLifetimeUpgrade}
              disabled={loadingPlan === "lifetime" || isLifetime}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] hover:from-[#ffe244] hover:to-[#ffb324] text-[#0B1121] font-black text-base sm:text-lg shadow-xl shadow-[#FFD700]/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 animate-pulse"
            >
              {isLifetime ? (
                <span>You Own Neuraliso Lifetime 🎉</span>
              ) : (
                <>
                  <Crown className="w-5 h-5 fill-current" />
                  <span>Get Lifetime Access ($20.92)</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-amber-200/80 mt-3 font-medium flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>30-day money-back guarantee • No questions asked</span>
            </p>
          </div>
        </div>

      </div>

      {/* Testimonial Cards */}
      <div className="max-w-5xl mx-auto mb-20">
        <h3 className="text-center text-xl font-bold text-white mb-8">
          Real Stories from Our Community
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="flex gap-1 text-[#FFD700] mb-3">
              <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-slate-300 text-sm italic mb-4">
              &quot;Getting the Lifetime deal was a no-brainer. Having the 4-7-8 breathing and sleep sounds forever without recurring subscription dread is liberating.&quot;
            </p>
            <div className="text-xs text-slate-400 font-semibold">— Marcus T., Lifetime Member</div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="flex gap-1 text-[#FFD700] mb-3">
              <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-slate-300 text-sm italic mb-4">
              &quot;I love that they don&apos;t guilt-trip you. I bought the Lifetime plan for $20.92 and use the ambient soundscapes and CBT reframes every day.&quot;
            </p>
            <div className="text-xs text-slate-400 font-semibold">— Sarah M., Verified User</div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="flex gap-1 text-[#FFD700] mb-3">
              <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-slate-300 text-sm italic mb-4">
              &quot;The AI companion sleep stories and 100% offline privacy make this app completely unique. Best $20 I have spent on my wellness.&quot;
            </p>
            <div className="text-xs text-slate-400 font-semibold">— David K., Lifetime Member</div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mb-16 text-left">
        <h3 className="text-center text-2xl font-bold text-white mb-8 flex items-center justify-center gap-2">
          <HelpCircle className="w-6 h-6 text-[#00d4ff]" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="font-semibold text-white text-base mb-2">How does the Lifetime Deal work?</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              With the Neuraliso Plus Lifetime Deal, you pay a single one-time fee of $20.92. You will never be charged recurring subscription or renewal fees again. You receive permanent, unlimited access to all existing Plus features and all future updates forever.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="font-semibold text-white text-base mb-2">What is the 30-day money-back guarantee?</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              We stand 100% behind Neuraliso. If for any reason within 30 days of purchasing the Lifetime Deal you feel it hasn&apos;t helped your peace of mind, simply email our support team and we will issue a full, courteous refund. No hoops or questions asked.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="font-semibold text-white text-base mb-2">Why are crisis resources always free?</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              We believe emergency mental health support is a fundamental human right. Our 988 lifeline connection, crisis safety planning button, and basic mood check-ins will always remain 100% free and accessible to everyone without paywalls or ads.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Guarantee */}
      <div className="text-center text-xs text-slate-400 pb-8 flex items-center justify-center gap-3">
        <Lock className="w-3.5 h-3.5 text-emerald-400" />
        <span>Secure 256-bit SSL encrypted checkout via Dodo Payments</span>
      </div>

    </div>
  );
};
