import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Smile, 
  Wind, 
  Moon, 
  RefreshCw, 
  TrendingUp, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Heart,
  Sparkles,
  X
} from "lucide-react";
import { CrisisBanner } from "./CrisisBanner";
import { BrainLotusLogo } from "./BrainLotusLogo";
import { sounds } from "../lib/sounds";
import { storage } from "../lib/storage";
import neuralisoLogo from "../assets/images/neuraliso_logo_1783904719183.jpg";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | "about" | null>(null);

  const handleStart = () => {
    sounds.playClick();
    const onboarded = storage.getOnboarding();
    if (onboarded && onboarded.completed) {
      navigate("/app");
    } else {
      navigate("/onboarding");
    }
  };

  const scrollToSection = (id: string) => {
    sounds.playClick();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10 bg-[#0B1121] text-white">
      {/* 1. Crisis banner at very top */}
      <CrisisBanner />

      {/* 2. Nav bar */}
      <header className="sticky top-0 z-40 bg-[#0B1121]/80 backdrop-blur-xl border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00d4ff]/40 shadow-sm shadow-[#00d4ff]/20 group-hover:scale-110 transition-all duration-300">
              <img src={neuralisoLogo} alt="Neuraliso Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif font-bold italic text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] via-[#00b8a9] to-emerald-400">
              Neuraliso
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <button onClick={() => scrollToSection("how-it-works")} className="hover:text-white transition-colors cursor-pointer">
              How it works
            </button>
            <button onClick={() => scrollToSection("features")} className="hover:text-white transition-colors cursor-pointer">
              Features
            </button>
            <button onClick={() => setActiveModal("about")} className="hover:text-white transition-colors cursor-pointer">
              About
            </button>
          </nav>

          {/* Get started button */}
          <button
            onClick={handleStart}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#00d4ff]/20 cursor-pointer"
          >
            Get started
          </button>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 px-4 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-8 animate-page-in">
          {/* Brain-lotus SVG logo with glow */}
          <div className="flex justify-center">
            <BrainLotusLogo size={130} />
          </div>

          {/* Headline & Subtitle */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              A quiet space <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] via-[#00b8a9] to-emerald-300">
                for your mind
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-xl mx-auto">
              Guided breathing, mood check-ins, and sleep tools.
            </p>
          </div>

          {/* Two CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00d4ff]/25 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Start your first check-in</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-base hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              See how it works
            </button>
          </div>

          {/* Trust Badge */}
          <div className="pt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-white/60 bg-white/5 border border-white/10 py-2.5 px-5 rounded-full w-fit mx-auto">
            <ShieldCheck className="w-4 h-4 text-[#00b8a9] shrink-0" />
            <span>Powered by secure Supabase database &amp; optional OAuth cloud sync.</span>
          </div>
        </div>
      </section>

      {/* 4. How it works */}
      <section id="how-it-works" className="py-24 px-4 bg-[#111A2E]/50 border-y border-white/5 relative">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              How it works
            </h2>
            <p className="text-base text-white/60">
              Simple, daily practices built for real life. No pressure, no guilt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="wellness-card p-8 space-y-5 text-left relative">
              <div className="w-12 h-12 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff] text-xl font-bold font-mono">
                01
              </div>
              <h3 className="text-2xl font-bold text-white">Check in</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Log how you feel without judgment. Track your mood, note what is on your mind, and select gentle emotional tags in under 30 seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="wellness-card p-8 space-y-5 text-left relative">
              <div className="w-12 h-12 rounded-2xl bg-[#00b8a9]/10 border border-[#00b8a9]/30 flex items-center justify-center text-[#00b8a9] text-xl font-bold font-mono">
                02
              </div>
              <h3 className="text-2xl font-bold text-white">Find your tool</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Choose what you need in the moment: guided breathing exercises, calming sounds &amp; sleep stories, or structured CBT thought reframing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="wellness-card p-8 space-y-5 text-left relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-bold font-mono">
                03
              </div>
              <h3 className="text-2xl font-bold text-white">Build the habit</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Watch your emotional patterns become clearer over time with gentle streak tracking that celebrates your consistency without ever shaming you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#00d4ff] bg-[#00d4ff]/10 px-3 py-1 rounded-full border border-[#00d4ff]/20">
              Everything You Need
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Built for quick relief when you need it most
            </h2>
            <p className="text-base text-white/60">
              Your privacy matters. We keep your data safe by storing everything directly in your browser.
            </p>
          </div>

          {/* 5 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Mood Check-in */}
            <div className="wellness-card p-8 space-y-4 text-left group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Smile className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Mood Check-in</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Quickly log your emotion with simple faces, optional reflective notes, and contextual tags. See how your feelings evolve day by day.
              </p>
            </div>

            {/* 2. Guided Breathing */}
            <div className="wellness-card p-8 space-y-4 text-left group">
              <div className="w-14 h-14 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff] group-hover:scale-110 transition-transform">
                <Wind className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Guided Breathing</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Breathing exercises including Box breathing (4-4-4-4), 4-7-8 sleep breathing, and slow grounding rhythms with visual expansion cues.
              </p>
            </div>

            {/* 3. Sleep Sounds */}
            <div className="wellness-card p-8 space-y-4 text-left group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Moon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Sleep Sounds</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Calming sounds &amp; sleep stories with synthesized rain, white noise, brown noise, and soothing binaural theta frequencies with auto-timers.
              </p>
            </div>

            {/* 4. Thought Reframe */}
            <div className="wellness-card p-8 space-y-4 text-left group">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Thought Reframe</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                A 4-step Cognitive Behavioral Therapy (CBT) journal tool to help you identify automatic negative thoughts and build balanced perspectives.
              </p>
            </div>

            {/* 5. Progress */}
            <div className="wellness-card p-8 space-y-4 text-left group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Progress &amp; Insights</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Visualize your mood history with interactive charts, local pattern recognition, and trend insights surfaced directly in your browser.
              </p>
            </div>

            {/* 6. CBT AI Coach */}
            <div className="wellness-card p-8 space-y-4 text-left group">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">CBT AI Companion</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                24/7 empathetic conversational coach powered by Google Gemini 3.6 Flash under a strict zero data retention policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Transparency & Privacy Matrix Section */}
      <section className="py-20 px-4 bg-[#0D1424] border-t border-[#00d4ff]/20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              AI Transparency &amp; Data Policy
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Exactly how AI works in Neuraliso
            </h2>
            <p className="text-sm sm:text-base text-white/70">
              We believe in complete privacy and clarity. Here is where every AI feature runs and what data it touches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* 1. Local Sentiment Tagging */}
            <div className="wellness-card p-7 space-y-4 border border-emerald-500/30 bg-emerald-950/10">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] font-mono uppercase">
                  100% On-Device
                </span>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Local Sentiment Tagging</h3>
              <ul className="text-xs text-white/80 space-y-2 leading-relaxed">
                <li>• <strong>What it does:</strong> Analyzes journal reflection text to auto-suggest emotional tags (e.g. Anxious, Stressed, Calming).</li>
                <li>• <strong>Where it runs:</strong> 100% inside your browser memory (0 network requests).</li>
                <li>• <strong>Data touched:</strong> Journal text stays strictly on your local device.</li>
              </ul>
            </div>

            {/* 2. Trend & Pattern Insights */}
            <div className="wellness-card p-7 space-y-4 border border-[#00d4ff]/30 bg-[#00d4ff]/5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-[#00d4ff]/20 text-[#00d4ff] font-bold text-[10px] font-mono uppercase">
                  100% On-Device
                </span>
                <ShieldCheck className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <h3 className="text-xl font-bold text-white">Pattern Recognition</h3>
              <ul className="text-xs text-white/80 space-y-2 leading-relaxed">
                <li>• <strong>What it does:</strong> Surfaces evening anxiety trends and suggests targeted breathing or sleep sound exercises.</li>
                <li>• <strong>Where it runs:</strong> Local JavaScript pattern engine in your browser.</li>
                <li>• <strong>Data touched:</strong> Local mood history timestamps &amp; tags.</li>
              </ul>
            </div>

            {/* 3. Optional CBT AI Companion */}
            <div className="wellness-card p-7 space-y-4 border border-purple-500/30 bg-purple-950/10">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] font-mono uppercase">
                  Stateless Cloud Proxy
                </span>
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">CBT AI Companion</h3>
              <ul className="text-xs text-white/80 space-y-2 leading-relaxed">
                <li>• <strong>What it does:</strong> Provides 24/7 conversational CBT coaching &amp; thought reframing.</li>
                <li>• <strong>Provider &amp; Model:</strong> Google Gemini 3.6 Flash via serverless proxy.</li>
                <li>• <strong>Data Retention Policy:</strong> <strong>Zero Data Retention</strong>. Chat prompts are processed statelessly in volatile memory and immediately discarded.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Crisis Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#111A2E]/80 to-[#0B1121] border-t border-rose-500/20 text-center relative">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Need help right now?
            </h2>
            <p className="text-base text-white/70 max-w-xl mx-auto">
              If you are going through a difficult time, you don&apos;t have to handle it alone. Immediate, confidential support is available 24/7.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="tel:988"
              onClick={() => sounds.playClick()}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-base transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2.5"
            >
              <Phone className="w-5 h-5" />
              <span>Call 988 (Lifeline)</span>
            </a>
            <a
              href="sms:741741?body=HOME"
              onClick={() => sounds.playClick()}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-base transition-all flex items-center justify-center gap-2.5"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Text HOME to 741741</span>
            </a>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-12 px-4 border-t border-white/10 bg-[#0B1121] text-xs text-white/50">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[#00d4ff]/40">
                <img src={neuralisoLogo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-serif font-bold italic text-base text-white">Neuraliso</span>
            </div>

            <div className="flex items-center gap-6 font-medium">
              <button onClick={() => setActiveModal("privacy")} className="hover:text-white transition-colors cursor-pointer">
                Privacy Policy
              </button>
              <button onClick={() => setActiveModal("terms")} className="hover:text-white transition-colors cursor-pointer">
                Terms of Service
              </button>
              <button onClick={() => setActiveModal("about")} className="hover:text-white transition-colors cursor-pointer">
                About
              </button>
              <a href="tel:988" className="text-rose-400 hover:text-rose-300 font-bold transition-colors">
                Crisis Resources (988)
              </a>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 text-center md:text-left space-y-3">
            <p className="leading-relaxed max-w-4xl text-white/40">
              <strong className="text-white/60">Disclaimer:</strong> Neuraliso is not a substitute for professional medical advice, diagnosis, or treatment. It is a self-care wellness companion designed for mindfulness and relaxation. If you are experiencing acute psychological distress or a medical emergency, please contact your doctor or emergency services immediately.
            </p>
            <p className="text-white/30">
              &copy; {new Date().getFullYear()} Neuraliso. Built with care for emotional wellness.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals for Privacy, Terms, About */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-page-in">
          <div className="w-full max-w-xl bg-[#1A2338] border border-white/10 rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === "privacy" && (
              <div className="space-y-4 text-sm text-white/80 leading-relaxed">
                <div className="flex items-center gap-2 text-[#00d4ff] font-bold text-lg">
                  <Lock className="w-5 h-5" />
                  <h3>Privacy Policy</h3>
                </div>
                <p>
                  <strong>Your privacy matters. We keep your data safe.</strong>
                </p>
                <p>
                  Neuraliso is designed with offline-first privacy. When you log your mood, write journal notes, reframe CBT thoughts, or customize settings, all information is stored strictly within your browser&apos;s local storage (`localStorage`).
                </p>
                <p>
                  We do not transmit your personal reflections, check-in timestamps, or emotional tags to any cloud server, third-party tracker, or data broker. You have complete ownership of your data and can export or erase it at any time from the Settings menu.
                </p>
              </div>
            )}

            {activeModal === "terms" && (
              <div className="space-y-4 text-sm text-white/80 leading-relaxed">
                <div className="flex items-center gap-2 text-[#00b8a9] font-bold text-lg">
                  <ShieldCheck className="w-5 h-5" />
                  <h3>Terms of Service</h3>
                </div>
                <p>
                  By using Neuraliso, you agree to use this application for personal mindfulness, grounding, and emotional self-reflection.
                </p>
                <p>
                  Neuraliso provides guided breathing rhythms, audio ambient synthesizers, and cognitive reframing prompts for general wellness purposes only. It does not provide clinical therapy, psychiatric diagnosis, or emergency psychiatric intervention.
                </p>
              </div>
            )}

            {activeModal === "about" && (
              <div className="space-y-4 text-sm text-white/80 leading-relaxed">
                <div className="flex items-center gap-2 text-[#00d4ff] font-bold text-lg">
                  <Sparkles className="w-5 h-5" />
                  <h3>About Neuraliso</h3>
                </div>
                <p>
                  Neuraliso was created to provide a quiet, judgment-free space for emotional wellness without the friction of sign-ups, subscriptions, or invasive data collection.
                </p>
                <p>
                  Our goal is simple: offer effective evidence-based mindfulness tools—such as paced breathing, Cognitive Behavioral Therapy (CBT) journaling, and ambient acoustic therapy—accessible to anyone, anytime.
                </p>
                <p className="text-xs text-white/40 pt-2 border-t border-white/10">
                  Version 2.0.0 • Built with care for peace of mind.
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 rounded-full bg-[#00d4ff] text-[#0B1121] font-bold text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
