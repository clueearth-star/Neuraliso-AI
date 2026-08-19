import React, { useState } from "react";
import { Check, X, ShieldCheck, Crown, Heart, Sparkles, Building2, HelpCircle, ArrowRight, Download, Lock, RefreshCw } from "lucide-react";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";

interface PricingProps {
  embedded?: boolean;
}

export const Pricing: React.FC<PricingProps> = ({ embedded = false }) => {
  const { isPro, isLifetime, upgradeToPro, openLifetimeModal } = useSubscription();
  const [syncPeriod, setSyncPeriod] = useState<"monthly" | "yearly">("yearly");
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamFormSubmitted, setTeamFormSubmitted] = useState(false);
  const [teamEmail, setTeamEmail] = useState("");
  const [teamSeats, setTeamSeats] = useState("10");
  const [teamOrg, setTeamOrg] = useState("");
  const navigate = useNavigate();

  const handleStartFree = () => {
    navigate("/app");
  };

  const handleGetSupporter = async () => {
    // Supporter one-time tier ($4.99)
    await upgradeToPro("monthly");
  };

  const handleGetSync = async () => {
    // Cloud Sync tier ($2/mo or $19/yr)
    await upgradeToPro(syncPeriod);
  };

  return (
    <section 
      id="pricing" 
      aria-labelledby="pricing-heading" 
      className={`py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative scroll-mt-20 ${embedded ? "" : "bg-[#0B1121]"}`}
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Honest &amp; Transparent Pricing</span>
          </div>
          <h2 id="pricing-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Simple, private pricing. No tricks.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            All core mental wellness tools are 100% free forever on your device. Upgrade only if you want custom perks or cloud synchronization.
          </p>

          {/* No Credit Card Required Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm font-semibold text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>No credit card required to start. Free forever, no trial expiration.</span>
          </div>
        </div>

        {/* 3 Explicit Tiers Grid (Free, Supporter, Sync) + Lifetime Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          
          {/* TIER 1: FREE FOREVER */}
          <div className="wellness-card p-7 sm:p-8 flex flex-col justify-between border border-white/15 bg-white/[0.03] text-left hover:border-white/30 transition-all rounded-3xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 font-bold text-xs uppercase tracking-wider">
                  Free Forever
                </span>
                <span className="text-xs text-emerald-400 font-semibold">Local Storage</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Free Baseline</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  100% private to your browser. No account or email needed.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-white">$0</span>
                <span className="text-slate-400 text-sm">/ forever</span>
              </div>

              {/* Exact Inclusions & Exclusions */}
              <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-200">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider">What is included:</div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Local browser storage (100% on-device)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>All core tools: 3 check-ins/week &amp; Box Breathing</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Calming rain sleep soundscape &amp; CBT journal</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Basic 7-day mood trend charts</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>988 Crisis Lifeline</strong> button — always free</span>
                </div>

                <div className="font-bold text-slate-400 text-[11px] uppercase tracking-wider pt-2">What is NOT included:</div>
                <div className="flex items-start gap-2.5 text-slate-400">
                  <X className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>Cross-device cloud backup</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-400">
                  <X className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>Custom themes &amp; PDF/CSV export</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={handleStartFree}
                className="w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                Use Free Forever
              </button>
            </div>
          </div>

          {/* TIER 2: SUPPORTER ($4.99 ONE-TIME) */}
          <div className="wellness-card p-7 sm:p-8 flex flex-col justify-between border-2 border-[#00d4ff]/50 bg-gradient-to-b from-[#131E35] to-[#0D1527] text-left hover:border-[#00d4ff] transition-all rounded-3xl relative shadow-lg shadow-[#00d4ff]/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#00d4ff] text-[#0B1121] font-extrabold text-[11px] uppercase tracking-wider shadow">
              Popular One-Time
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#00d4ff]/20 text-[#00d4ff] font-bold text-xs uppercase tracking-wider border border-[#00d4ff]/30">
                  Supporter
                </span>
                <span className="text-xs text-[#00d4ff] font-semibold">Pay Once</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Supporter Pack</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Support independent development and unlock personalization.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-white">$4.99</span>
                <span className="text-slate-400 text-sm">/ one-time</span>
              </div>

              {/* Exact Inclusions */}
              <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-200">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider">Everything in Free, plus:</div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                  <span><strong>Custom themes</strong> (Dark Slate, Forest, Obsidian)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                  <span><strong>Photo mood entries</strong> &amp; rich reflections</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                  <span><strong>Supporter badge</strong> on profile &amp; streak</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                  <span><strong>Export to PDF &amp; CSV</strong> for therapy sessions</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                  <span>All 5 breathing rhythms &amp; soundscapes</span>
                </div>

                <div className="font-bold text-slate-400 text-[11px] uppercase tracking-wider pt-2">What is NOT included:</div>
                <div className="flex items-start gap-2.5 text-slate-400">
                  <X className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>Automated multi-device cloud sync</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={handleGetSupporter}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] hover:from-[#38e1ff] hover:to-[#14d6c4] text-[#0B1121] font-bold text-sm shadow-md shadow-[#00d4ff]/20 transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
              >
                <span>Get Supporter Pack ($4.99)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TIER 3: SYNC ($2/MO OR $19/YR) */}
          <div className="wellness-card p-7 sm:p-8 flex flex-col justify-between border border-white/15 bg-white/[0.03] text-left hover:border-white/30 transition-all rounded-3xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs uppercase tracking-wider border border-indigo-500/30">
                  Cloud Sync
                </span>
                {/* Billing Toggle */}
                <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSyncPeriod("monthly")}
                    className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                      syncPeriod === "monthly" ? "bg-white/20 text-white" : "text-slate-400"
                    }`}
                  >
                    Mo
                  </button>
                  <button
                    type="button"
                    onClick={() => setSyncPeriod("yearly")}
                    className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                      syncPeriod === "yearly" ? "bg-indigo-500 text-white" : "text-slate-400"
                    }`}
                  >
                    Yr (-20%)
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">Encrypted Sync</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Seamless multi-device backup via Supabase with client-side encryption.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-white">
                  {syncPeriod === "monthly" ? "$2" : "$19"}
                </span>
                <span className="text-slate-400 text-sm">
                  {syncPeriod === "monthly" ? "/ month" : "/ year ($1.58/mo)"}
                </span>
              </div>

              {/* Exact Inclusions */}
              <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-200">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider">Everything in Supporter, plus:</div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Cross-device backup</strong> via Supabase</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Encrypted cloud storage</strong> with zero-knowledge keys</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Priority support</strong> from development team</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Unlimited 24/7 AI thought reframing</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Automatic daily backup with version history</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={handleGetSync}
                className="w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
              >
                <span>Enable Sync ({syncPeriod === "monthly" ? "$2/mo" : "$19/yr"})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Lifetime Deal Special Option Banner */}
        <div className="max-w-4xl mx-auto p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#1A2338] via-[#1F2C46] to-[#1A2338] border border-[#FFD700]/40 text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-[#FFD700] text-xs font-bold uppercase tracking-wider">
              <Crown className="w-4 h-4" />
              <span>Special Lifetime Offer</span>
            </div>
            <h4 className="text-xl font-bold text-white">Want permanent access to all current &amp; future tools?</h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Get the Neuraliso Plus Lifetime Deal for a single one-time payment of ₹2,000 (never any subscriptions).
            </p>
          </div>
          <button
            type="button"
            onClick={() => openLifetimeModal()}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#ffe244] text-[#0B1121] font-bold text-sm shrink-0 shadow-lg cursor-pointer min-h-[44px] flex items-center gap-1.5"
          >
            <Crown className="w-4 h-4" />
            <span>Special Offer (₹2,000)</span>
          </button>
        </div>

        {/* Cancel Anytime / Data Ownership Guarantee */}
        <div className="max-w-3xl mx-auto p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-200">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cancel Anytime &amp; 100% Data Ownership</span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
            You can export your complete mood history as CSV/JSON or wipe your local storage in 1 click under Settings anytime before canceling.
          </p>
        </div>

        {/* For Teams / Enterprise Link for Marcus (45) */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowTeamModal(true)}
            className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors underline decoration-white/30 cursor-pointer min-h-[44px] px-3"
          >
            <Building2 className="w-4 h-4 text-[#00d4ff]" />
            <span>Looking for Team, Workplace, or Enterprise deployment? Click here &rarr;</span>
          </button>
        </div>

      </div>

      {/* Enterprise / Teams Modal for Marcus (45) */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-page-in">
          <div className="w-full max-w-xl bg-[#1A2338] border border-white/15 rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Neuraliso for Teams &amp; Organizations</h3>
                  <p className="text-xs text-slate-300">Workplace mental wellness with zero tracking</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close Team Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {teamFormSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white">Inquiry Received</h4>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Thank you! Our enterprise lead will contact <strong className="text-white">{teamEmail}</strong> within 1 business day with custom seat pricing and security documentation.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowTeamModal(false);
                    setTeamFormSubmitted(false);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#00d4ff] text-[#0B1121] font-bold text-sm cursor-pointer min-h-[44px]"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Security Highlights for Corporate Buyer */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 text-xs text-slate-200">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Enterprise Security Architecture:</span>
                  </div>
                  <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
                    <li><strong>AES-256 Client-Side Encryption</strong>: Organization managers never see employee private journal reflections.</li>
                    <li><strong>HIPAA-Aligned Local Architecture</strong>: Data is quarantined to each employee&apos;s browser sandbox by default.</li>
                    <li><strong>Centralized Invoicing</strong>: Annual consolidated billing via credit card, ACH, or PO.</li>
                  </ul>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (teamEmail) setTeamFormSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={teamEmail}
                      onChange={(e) => setTeamEmail(e.target.value)}
                      placeholder="marcus@company.com"
                      className="w-full text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Organization / Company</label>
                      <input
                        type="text"
                        value={teamOrg}
                        onChange={(e) => setTeamOrg(e.target.value)}
                        placeholder="Acme Corp"
                        className="w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white mb-1">Estimated Seats</label>
                      <select
                        value={teamSeats}
                        onChange={(e) => setTeamSeats(e.target.value)}
                        className="w-full text-sm"
                      >
                        <option value="5-25">5 - 25 seats</option>
                        <option value="25-100">25 - 100 seats</option>
                        <option value="100-500">100 - 500 seats</option>
                        <option value="500+">500+ seats (Enterprise)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowTeamModal(false)}
                      className="px-5 py-2.5 rounded-full bg-white/10 text-slate-300 font-semibold text-xs min-h-[44px] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#00d4ff] text-[#0B1121] font-bold text-xs min-h-[44px] flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#00d4ff]/20"
                    >
                      <span>Request Enterprise Quote</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
