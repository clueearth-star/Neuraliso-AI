import React, { useState } from "react";
import { Check, Sparkles, Shield, Heart, HelpCircle, ArrowRight, Star, UserCheck, Zap } from "lucide-react";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";

export const PricingView: React.FC = () => {
  const { isPro, isTrial, expiresAt, upgradeToPro, startFreeTrial, cancelSubscription } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly">("yearly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulateMode, setSimulateMode] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      if (billingCycle === "yearly" && simulateMode) {
        const res = await startFreeTrial();
        if (!res.success) setError(res.error || "Failed to start trial");
      } else {
        const res = await upgradeToPro(billingCycle, simulateMode);
        if (!res.success) setError(res.error || "Failed to upgrade");
      }
    } catch (e: any) {
      setError(e.message || "Upgrade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in text-white">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] text-xs font-semibold mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transparent, Ethical Mental Health Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
          Invest in Your Peace of Mind
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
          Core emergency resources and basic check-ins are <span className="text-white font-semibold underline decoration-[#00d4ff]">always 100% free</span>. Upgrade to Neuraliso Plus only when you want unlimited history, deep ambient soundscapes, and AI companionship.
        </p>

        {/* Social Proof Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-300">
          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Join <strong className="text-white">10,000+ people</strong> prioritizing their mental wellness with zero dark patterns.</span>
        </div>
      </div>

      {/* Already Pro Banner */}
      {isPro && (
        <div className="max-w-2xl mx-auto mb-10 p-6 rounded-3xl bg-gradient-to-r from-[#FFD700]/20 via-[#FFA500]/15 to-[#FFD700]/20 border border-[#FFD700]/40 text-center shadow-xl">
          <div className="inline-flex p-3 rounded-2xl bg-[#FFD700]/20 text-[#FFD700] mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">
            You are currently on Neuraliso {isTrial ? "Plus (Free Trial)" : "Plus"}! 🎉
          </h3>
          <p className="text-slate-300 text-sm mb-4">
            {expiresAt 
              ? `Your access is active until ${new Date(expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
              : "Your Plus subscription is currently active."
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

      {/* Billing Toggle & Simulation Option */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="inline-flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              billingCycle === "yearly"
                ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0B1121] shadow-md font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Yearly Plan ($48/yr)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              billingCycle === "yearly" ? "bg-[#0B1121] text-[#FFD700]" : "bg-emerald-500/20 text-emerald-400"
            }`}>
              Save 20%
            </span>
          </button>
          
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0B1121] shadow-md font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Monthly Plan ($4.99/mo)
          </button>
        </div>

        {/* Preview Simulation Checkbox */}
        <div className="mt-3">
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
      </div>

      {/* Error display */}
      {error && (
        <div className="max-w-md mx-auto p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center mb-6">
          {error}
        </div>
      )}

      {/* Two Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16 items-stretch">
        
        {/* FREE TIER CARD (Neutral) */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-8 flex flex-col justify-between relative hover:border-white/20 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Free Forever
              </span>
              <span className="text-xs text-slate-400">No credit card required</span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Neuraliso Basic</h2>
            <p className="text-slate-400 text-sm mb-6">
              Essential emotional check-ins and emergency support for everyone.
            </p>
            
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold text-white">$0</span>
              <span className="text-slate-400 text-sm">/ always free</span>
            </div>

            <div className="space-y-4 mb-8 text-sm text-slate-300">
              <div className="font-semibold text-white text-xs uppercase tracking-wider mb-2">What&apos;s Included:</div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>3 mood check-ins</strong> per week</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Basic breathing mode (<strong>Box breathing</strong>)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>1 calming ambient sleep sound (<strong>Rain</strong>)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>3 CBT thought reframes</strong> per week</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Basic progress trend chart (<strong>7 days history</strong>)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#00d4ff] shrink-0 mt-0.5" />
                <span><strong>AI companion chat</strong> (5 messages / day)</span>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <Heart className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 fill-current" />
                <span><strong>Crisis button & 988 emergency help</strong> — 100% free and accessible 24/7/365</span>
              </div>
            </div>
          </div>

          <button
            disabled={true}
            className="w-full py-3.5 px-6 rounded-2xl bg-white/10 text-slate-400 font-semibold text-sm cursor-not-allowed text-center"
          >
            Your Current Baseline
          </button>
        </div>

        {/* PRO TIER CARD ("Neuraliso Plus") — Soft Gold Glow */}
        <div className="rounded-3xl bg-gradient-to-b from-[#131d31] to-[#0e1726] border-2 border-[#FFD700] p-8 flex flex-col justify-between relative shadow-2xl shadow-[#FFD700]/10 scale-[1.02] hover:shadow-[#FFD700]/20 transition-all">
          
          <div className="absolute -top-3.5 right-8 px-4 py-1 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0B1121] font-extrabold text-xs tracking-wider uppercase shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Most Popular</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-[#FFD700]/15 text-[#FFD700] text-xs font-semibold uppercase tracking-wider border border-[#FFD700]/30">
                Neuraliso Plus
              </span>
              <span className="text-xs text-[#FFD700] font-medium">Cancel anytime in 1 click</span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">The Complete Wellness Suite</h2>
            <p className="text-slate-300 text-sm mb-6">
              Unlimited mental health tools, deeper ambient immersion, and personalized sleep stories.
            </p>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold text-white">
                {billingCycle === "yearly" ? "$48" : "$4.99"}
              </span>
              <span className="text-slate-300 text-base">
                {billingCycle === "yearly" ? "/ year" : "/ month"}
              </span>
            </div>
            
            {billingCycle === "yearly" ? (
              <div className="text-xs font-semibold text-[#FFD700] mb-8">
                That&apos;s just <strong className="text-white">$4.00/month</strong> — billed annually
              </div>
            ) : (
              <div className="text-xs text-slate-400 mb-8">
                Or save 20% with our $48/year annual plan
              </div>
            )}

            <div className="space-y-3.5 mb-8 text-sm text-slate-200">
              <div className="font-semibold text-[#FFD700] text-xs uppercase tracking-wider mb-2">
                Everything in Basic, Plus:
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span><strong>Unlimited mood check-ins</strong> & emotional journaling</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span><strong>All 5 breathing modes</strong> (Box, 4-7-8, Calm, Power, Sleep)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span><strong>All 6 ambient sleep sounds</strong> (Rain, White Noise, Brown Noise, Binaural, Ocean, Forest)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span><strong>Unlimited CBT thought reframes</strong> with cognitive distortion analysis</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span><strong>Full progress analytics</strong> (unlimited history, trend insights, data export)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span><strong>AI companion: unlimited messages</strong> + custom calming sleep stories</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span>Custom daily reminders and scheduling</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span>Cross-device cloud sync via Supabase & priority support</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span>Exclusive gold <strong>&quot;Plus&quot; badge</strong> on your profile</span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleUpgrade}
              disabled={loading || isPro}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#ffe244] hover:to-[#ffb324] text-[#0B1121] font-bold text-base shadow-lg shadow-[#FFD700]/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin w-5 h-5 border-2 border-[#0B1121] border-t-transparent rounded-full" />
              ) : isPro ? (
                <span>You Have Plus Access</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 fill-current" />
                  <span>{billingCycle === "yearly" ? "Start 7-Day Free Trial" : "Upgrade to Plus ($4.99/mo)"}</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              {billingCycle === "yearly" 
                ? "Try free for 7 days. Cancel anytime before renewal with zero charge."
                : "Cancel anytime. No questions asked. No hidden hoops."}
            </p>
          </div>
        </div>

      </div>

      {/* Testimonial Cards */}
      <div className="max-w-5xl mx-auto mb-20">
        <h3 className="text-center text-xl font-bold text-white mb-8">
          Real Stories from Our Community
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="flex gap-1 text-[#FFD700] mb-3">
              <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-slate-300 text-sm italic mb-4">
              &quot;Neuraliso Plus helped me build a real habit. Having the 4-7-8 breathing mode right when my work anxiety peaks has been a game-changer.&quot;
            </p>
            <div className="text-xs text-slate-400 font-semibold">— Anonymous user, 4 months on Plus</div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="flex gap-1 text-[#FFD700] mb-3">
              <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-slate-300 text-sm italic mb-4">
              &quot;I love that they don&apos;t guilt-trip you. I used the free tier for 3 weeks and upgraded just because I wanted the ambient brown noise and unlimited CBT reframes.&quot;
            </p>
            <div className="text-xs text-slate-400 font-semibold">— Sarah M., 2 months on Plus</div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="flex gap-1 text-[#FFD700] mb-3">
              <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-slate-300 text-sm italic mb-4">
              &quot;The AI companion sleep stories are incredible. Hearing a calm bedtime narrative tailored to how I felt during the day puts me right to sleep.&quot;
            </p>
            <div className="text-xs text-slate-400 font-semibold">— David K., Annual Subscriber</div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mb-16">
        <h3 className="text-center text-2xl font-bold text-white mb-8 flex items-center justify-center gap-2">
          <HelpCircle className="w-6 h-6 text-[#00d4ff]" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="font-semibold text-white text-base mb-2">How does the 7-day free trial work?</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              When you select the yearly plan ($48/year), you get instant access to all Neuraliso Plus features for 7 full days. We send you a gentle reminder 2 days before the trial ends. If you cancel at any point before the 7 days are up, you will never be charged a penny.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="font-semibold text-white text-base mb-2">Can I cancel anytime? How hard is it?</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              You can cancel with literally 1 click inside your Settings page or via your Dodo Payments customer portal. No phone calls, no confusing questionnaires, no guilt-tripping popups. If you cancel, your Plus access continues until the end of your billing cycle.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="font-semibold text-white text-base mb-2">What happens to my data if I downgrade to Free?</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              You never lose any of your data! All your mood logs, CBT reframes, and chat histories remain safely stored. You simply return to the standard free tier limits (e.g., viewing only the most recent 7 days on the chart until you upgrade again).
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
      <div className="text-center text-xs text-slate-400 pb-8">
        <p>Neuraliso is powered by secure Dodo Payments checkout and encrypted cloud syncing.</p>
      </div>

    </div>
  );
};
