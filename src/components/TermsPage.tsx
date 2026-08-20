import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, FileText, ArrowLeft, Heart, CheckCircle2, AlertTriangle, Scale, RefreshCw } from "lucide-react";
import neuralisoLogo from "../assets/images/neuraliso_logo_1783904719183.jpg";

export const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B1121] text-white flex flex-col selection:bg-[#00d4ff] selection:text-[#0B1121]">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-[#0B1121]/90 backdrop-blur-xl border-b border-white/10 h-14 sm:h-16 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-300 hover:text-white font-semibold text-sm transition-colors min-h-[44px] min-w-[44px] cursor-pointer"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4 text-[#00d4ff]" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-[#00d4ff]/40">
              <img src={neuralisoLogo} alt="Neuraliso Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif font-bold italic text-base text-white">Neuraliso</span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/app")}
            className="px-4 py-1.5 rounded-full bg-[#00d4ff] text-[#0B1121] font-bold text-xs hover:scale-105 transition-all min-h-[44px] flex items-center cursor-pointer"
          >
            Open App
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 text-left">
        {/* Header Title */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Terms of Service &amp; Usage Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Honest, Transparent Terms.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Please read these straightforward terms outlining the purpose, scope, and safety boundaries of using Neuraliso AI.
          </p>
        </div>

        {/* Clinical / Non-Medical Disclaimer */}
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-300 font-bold text-base">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Not a Substitute for Emergency or Professional Clinical Care</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Neuraliso is an educational, self-directed mental wellness companion providing cognitive reflection tools, somatic breath guides, and ambient soundscapes. <strong>Neuraliso does not provide medical diagnosis, clinical psychotherapy, or psychiatric crisis intervention.</strong>
          </p>
          <p className="text-xs text-amber-200/90 font-medium">
            If you are experiencing immediate crisis, emotional distress, or self-harm ideation, please dial 988 (US/Canada), 112 (EU/India), or text HOME to 741741 immediately. Crisis hotline resources are always free and unblocked inside the application.
          </p>
        </div>

        {/* 4 Core Pillars of Service */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="wellness-card p-6 space-y-3 bg-white/[0.03] border border-white/10 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff]">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">1. User Eligibility &amp; Accounts</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              You may use Neuraliso in anonymous local-first mode or create a secure cloud-synced account. You retain 100% ownership of all journal entries, mood logs, and cognitive reflections you input.
            </p>
          </div>

          <div className="wellness-card p-6 space-y-3 bg-white/[0.03] border border-white/10 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">2. Privacy &amp; Data Dignity</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We do not sell, rent, or monetize your emotional wellness logs or personal reflections to advertisers or third-party data brokers. You can export or delete your data at any time.
            </p>
          </div>

          <div className="wellness-card p-6 space-y-3 bg-white/[0.03] border border-white/10 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">3. Subscriptions &amp; Special Offers</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Optional supporter upgrades (Plus Monthly, Yearly, and the ₹2,000 Lifetime Special Offer) are billed securely via Dodo Payments. Lifetime purchases grant permanent access with zero renewal charges.
            </p>
          </div>

          <div className="wellness-card p-6 space-y-3 bg-white/[0.03] border border-white/10 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">4. Fair &amp; Compassionate Usage</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              You agree to use Neuraliso respectfully and for lawful personal wellness purposes. Automated scraping, malicious reverse-engineering, or abuse of the AI service is strictly prohibited.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-8">
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">5. 30-Day Money-Back Guarantee &amp; Cancellations</h3>
            <p>
              Subscribers can cancel active recurring plans at any time directly through the Settings dashboard or via the Dodo Payments Customer Portal. If you are unsatisfied with your lifetime upgrade, you are eligible for our 30-day money-back guarantee with no questions asked.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">6. Contact &amp; Inquiries</h3>
            <p>
              For legal or customer support inquiries regarding these terms, please contact us at <a href="mailto:support@neuraliso.ai" className="text-[#00d4ff] underline">support@neuraliso.ai</a>.
            </p>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Effective as of August 2026. Neuraliso AI.</span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/privacy")}
            className="text-xs text-[#00d4ff] hover:underline font-semibold"
          >
            Read Privacy Policy &rarr;
          </button>
        </div>
      </main>
    </div>
  );
};
export default TermsPage;
