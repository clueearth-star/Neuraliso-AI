import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, Database, HardDrive, Download, Trash2, ArrowLeft, Heart, CheckCircle2 } from "lucide-react";
import { BrainLotusLogo } from "./BrainLotusLogo";
import neuralisoLogo from "../assets/images/neuraliso_logo_1783904719183.jpg";

export const PrivacyPage: React.FC = () => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Plain-Language Security &amp; Privacy Policy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Your mind is private. Your data stays yours.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            We built Neuraliso because emotional wellness apps should never exploit your vulnerability. Here is our simple, transparent privacy commitment.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="wellness-card p-6 space-y-3 bg-white/[0.03] border border-white/10 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">1. Local-First by Default</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              When you log moods, write reflections, or customize breathing routines, everything is stored strictly in your browser&apos;s local memory (`localStorage`). Nothing leaves your device unless you manually turn on cloud backup.
            </p>
          </div>

          <div className="wellness-card p-6 space-y-3 bg-white/[0.03] border border-white/10 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff]">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">2. Zero Data Retention on AI</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our CBT AI companion operates under a strict Zero Data Retention policy with Google Gemini. Chat prompts are processed statelessly in volatile memory and instantly erased. Your chats are never used for AI model training.
            </p>
          </div>

          <div className="wellness-card p-6 space-y-3 bg-white/[0.03] border border-white/10 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">3. Optional Cloud Sync</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              If you choose to sync across your phone and laptop, data is backed up via an encrypted Supabase database with industry-standard row-level security. You can disconnect and purge cloud data at any time.
            </p>
          </div>

          <div className="wellness-card p-6 space-y-3 bg-white/[0.03] border border-white/10 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Download className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">4. Total Data Export &amp; Deletion</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Under Settings, you have instant 1-click tools to export your complete mood logs as JSON/CSV or completely wipe all local data from your device with zero remnants.
            </p>
          </div>
        </div>

        {/* Detailed Plain-Language Breakdown */}
        <div className="space-y-8 wellness-card p-8 bg-white/[0.02] border border-white/10 rounded-3xl">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">What data do we collect?</h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              <strong>None by default.</strong> We do not require an email or credit card to use Neuraliso. We do not use third-party analytics trackers, cookies for ad retargeting, or data brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">What happens during payment?</h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Payments are processed securely by <strong>Dodo Payments</strong> using 256-bit TLS encryption. Neuraliso never sees or stores your full credit card number or billing address.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">Who builds Neuraliso?</h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Neuraliso is built independently with the belief that emotional wellness software should be accessible, calm, and completely honest. We do not sell user data. Our revenue comes solely from transparent optional supporter and lifetime upgrades.
            </p>
          </section>
        </div>

        {/* Emergency Disclaimer */}
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-xs sm:text-sm text-rose-200">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-400 fill-current" />
            <span>Crisis &amp; Medical Disclaimer:</span>
          </div>
          <p className="leading-relaxed">
            Neuraliso is a self-care mindfulness companion, not a medical device or licensed healthcare provider. If you are experiencing a mental health emergency or thoughts of self-harm, please dial <strong>988</strong> (US Lifeline) or text <strong>HOME</strong> to <strong>741741</strong> immediately.
          </p>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-8 px-4 border-t border-white/10 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} Neuraliso. Built for privacy, peace of mind, and honest self-care.</p>
      </footer>
    </div>
  );
};
