import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Check, 
  Lock, 
  Heart,
  Sparkles,
  X,
  HardDrive,
  Bot,
  Zap,
  Star,
  CheckCircle2,
  Building2
} from "lucide-react";
import { CrisisBanner } from "./CrisisBanner";
import { BrainLotusLogo } from "./BrainLotusLogo";
import { HowItWorks } from "./HowItWorks";
import { Testimonials } from "./Testimonials";
import { Pricing } from "./Pricing";
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
    <div className="min-h-screen flex flex-col relative z-10 bg-[#0B1121] text-white selection:bg-[#00d4ff] selection:text-[#0B1121] overflow-x-hidden pb-safe">
      {/* 0. Accessible Skip to Content Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* 1. Crisis banner at very top */}
      <CrisisBanner />

      {/* 2. Nav bar - Max 56px on mobile */}
      <header className="sticky top-0 z-40 bg-[#0B1121]/90 backdrop-blur-xl border-b border-white/10 h-14 sm:h-16 flex items-center transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 cursor-pointer group min-h-[44px]"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            aria-label="Neuraliso Home"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00d4ff]/40 shadow-sm shadow-[#00d4ff]/20 group-hover:scale-110 transition-all duration-300">
              <img src={neuralisoLogo} alt="Neuraliso Logo" className="w-full h-full object-cover" width="32" height="32" loading="eager" />
            </div>
            <span className="font-serif font-bold italic text-xl tracking-tight text-white">
              Neuraliso
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300" aria-label="Main Navigation">
            <button 
              type="button"
              onClick={() => scrollToSection("how-it-works")} 
              className="hover:text-white transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              How it works
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection("features")} 
              className="hover:text-white transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              Features
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection("pricing")} 
              className="hover:text-white transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              Pricing
            </button>
            <button 
              type="button"
              onClick={() => setActiveModal("about")} 
              className="hover:text-white transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              About
            </button>
          </nav>

          {/* Get started button */}
          <button
            type="button"
            onClick={handleStart}
            aria-label="Get Started with Neuraliso"
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#00d4ff]/20 cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1">
        
        {/* 3. Hero Section (Audited Value Prop & Primary CTA) */}
        <section 
          aria-labelledby="hero-title"
          className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden"
        >
          <div className="max-w-4xl mx-auto space-y-8 animate-page-in">
            {/* Brain-lotus SVG logo with glow */}
            <div className="flex justify-center" aria-hidden="true">
              <BrainLotusLogo size={120} />
            </div>

            {/* Clear Hero Headline: Answers "What does this do for me?" in under 3 seconds */}
            <div className="space-y-4 max-w-2xl mx-auto">
              <h1 id="hero-title" className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Quiet your mind <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] via-[#00b8a9] to-emerald-300">
                  in 60 seconds.
                </span>
              </h1>
              <p className="text-base sm:text-xl text-slate-200 leading-relaxed max-w-xl mx-auto font-normal">
                Private mood tracking, breathing exercises, and sleep tools — no signup required.
              </p>
            </div>

            {/* High-Contrast Primary CTA Button Directly Under H1 */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleStart}
                  id="hero-primary-cta"
                  aria-label="Get Started with Neuraliso"
                  className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] hover:from-[#38e1ff] hover:to-[#14d6c4] text-[#0B1121] font-extrabold text-base sm:text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#00d4ff]/30 flex items-center justify-center gap-2.5 cursor-pointer min-h-[48px]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Secondary link smooth-scrolling to feature / how-it-works */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection("how-it-works")}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[44px] px-3"
                >
                  <span>How it works &rarr;</span>
                </button>
              </div>

              {/* No Credit Card Required Banner */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No credit card required to start &bull; 100% Free Forever tier</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Immediate Clarity: 3-Step "How It Works" Section */}
        <HowItWorks />

        {/* 5. Features Section (Plain English, Zero Jargon) */}
        <section id="features" aria-labelledby="features-heading" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-xs font-bold uppercase tracking-wider">
                <span>Core Wellness Tools</span>
              </div>
              <h2 id="features-heading" className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Everything you need for instant calm
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Gentle self-care tools designed for real daily life. Private by default in your browser.
              </p>
            </div>

            {/* 6 Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Mood Check-in */}
              <div className="wellness-card p-6 sm:p-7 space-y-4 text-left border border-white/10 hover:border-amber-500/40 transition-all bg-white/[0.03]">
                <div 
                  aria-hidden="true" 
                  className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400"
                >
                  <Smile className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Mood Check-in</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Quickly log your emotions with 5 friendly faces, optional reflections, and contextual tags in under 10 seconds.
                </p>
              </div>

              {/* 2. Guided Breathing */}
              <div className="wellness-card p-6 sm:p-7 space-y-4 text-left border border-white/10 hover:border-[#00d4ff]/40 transition-all bg-white/[0.03]">
                <div 
                  aria-hidden="true" 
                  className="w-12 h-12 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff]"
                >
                  <Wind className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Guided Breathing</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Box breathing (4-4-4-4) and 4-7-8 rhythms with soothing visual expansion rings and text instructions for screen-reader ease.
                </p>
              </div>

              {/* 3. Sleep Sounds */}
              <div className="wellness-card p-6 sm:p-7 space-y-4 text-left border border-white/10 hover:border-indigo-500/40 transition-all bg-white/[0.03]">
                <div 
                  aria-hidden="true" 
                  className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400"
                >
                  <Moon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Calming Sleep Sounds</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Synthesized ambient rain, brown noise, ocean waves, and soothing background soundscapes with gentle auto-timers.
                </p>
              </div>

              {/* 4. Thought Reframe */}
              <div className="wellness-card p-6 sm:p-7 space-y-4 text-left border border-white/10 hover:border-teal-500/40 transition-all bg-white/[0.03]">
                <div 
                  aria-hidden="true" 
                  className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400"
                >
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Thought Reframing</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  A simple 4-step guided journal tool to help unpack negative thoughts and build balanced, healthy perspectives.
                </p>
              </div>

              {/* 5. Progress */}
              <div className="wellness-card p-6 sm:p-7 space-y-4 text-left border border-white/10 hover:border-emerald-500/40 transition-all bg-white/[0.03]">
                <div 
                  aria-hidden="true" 
                  className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400"
                >
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Private Progress Trends</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Visualize your emotional trends over time with clean charts calculated 100% locally inside your browser.
                </p>
              </div>

              {/* 6. AI Companion */}
              <div className="wellness-card p-6 sm:p-7 space-y-4 text-left border border-white/10 hover:border-purple-500/40 transition-all bg-white/[0.03]">
                <div 
                  aria-hidden="true" 
                  className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400"
                >
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">24/7 AI Companion</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Empathetic conversational guidance for thought reframing with a strict Zero Data Retention privacy policy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Social Proof Section */}
        <Testimonials />

        {/* 7. Transparent Pricing Section */}
        <Pricing embedded={true} />

        {/* 8. 24/7 Crisis Support Section */}
        <section 
          aria-labelledby="crisis-heading"
          className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#111A2E]/80 to-[#0B1121] border-t border-rose-500/20 text-center relative"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <div 
              aria-hidden="true"
              className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto"
            >
              <Heart className="w-7 h-7 fill-current" />
            </div>
            <div className="space-y-2">
              <h2 id="crisis-heading" className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Need immediate help?
              </h2>
              <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed">
                If you are experiencing acute emotional distress, free and confidential support is available 24/7.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href="tel:988"
                onClick={() => sounds.playClick()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2.5 min-h-[44px]"
              >
                <Phone className="w-5 h-5" />
                <span>Call 988 (Lifeline)</span>
              </a>
              <a
                href="sms:741741?body=HOME"
                onClick={() => sounds.playClick()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 min-h-[44px]"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Text HOME to 741741</span>
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* 9. Trust Badges & Footer (Audited with 3 explicit badges & privacy link) */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#0B1121] text-xs text-slate-300">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* 3 Explicit Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-white/10">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3 text-left">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white text-xs">Privacy First</div>
                <div className="text-slate-400 text-[11px]">Your data never leaves your browser unless you enable sync.</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3 text-left">
              <HardDrive className="w-5 h-5 text-[#00d4ff] shrink-0" />
              <div>
                <div className="font-bold text-white text-xs">Independently Built &amp; Auditable</div>
                <div className="text-slate-400 text-[11px]">Zero ad trackers, zero telemetry reselling.</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3 text-left">
              <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-white text-xs">Always Available</div>
                <div className="text-slate-400 text-[11px]">Works offline on planes, trains, and low connectivity.</div>
              </div>
            </div>
          </div>

          {/* Nav & Links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-[#00d4ff]/40">
                <img src={neuralisoLogo} alt="Logo" className="w-full h-full object-cover" width="28" height="28" />
              </div>
              <span className="font-serif font-bold italic text-base text-white">Neuraliso</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
              <Link to="/privacy" className="text-slate-300 hover:text-white transition-colors underline decoration-white/20 min-h-[44px] flex items-center">
                Security &amp; Privacy Policy
              </Link>
              <Link to="/terms" className="text-slate-300 hover:text-white transition-colors underline decoration-white/20 min-h-[44px] flex items-center">
                Terms of Service
              </Link>
              <Link to="/pricing" className="text-slate-300 hover:text-white transition-colors min-h-[44px] flex items-center">
                Pricing Tiers
              </Link>
              <button 
                type="button"
                onClick={() => setActiveModal("about")} 
                className="text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[44px] flex items-center"
              >
                About the Builder
              </button>
              <a href="tel:988" className="text-rose-400 hover:text-rose-300 font-bold transition-colors min-h-[44px] flex items-center">
                Crisis Help (988)
              </a>
            </div>
          </div>

          {/* Tech stack note & Disclaimer */}
          <div className="border-t border-white/5 pt-6 text-center md:text-left space-y-3">
            <p className="leading-relaxed max-w-4xl text-slate-400">
              <strong className="text-slate-200">Disclaimer:</strong> Neuraliso is a self-care wellness companion designed for mindfulness and relaxation. It is not a substitute for professional medical or psychiatric diagnosis, advice, or treatment. If you are experiencing a medical or psychiatric crisis, please reach out to emergency services immediately.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px]">
              <span>&copy; {new Date().getFullYear()} Neuraliso. Built with care for emotional peace of mind.</span>
              <span>Cloud infrastructure (optional sync) powered by Supabase with Row Level Security.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* About & Terms Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-page-in">
          <div className="w-full max-w-xl bg-[#1A2338] border border-white/15 rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === "about" && (
              <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
                <div className="flex items-center gap-2 text-[#00d4ff] font-bold text-lg">
                  <Sparkles className="w-5 h-5" />
                  <h3>About Neuraliso &amp; Why We Built It</h3>
                </div>
                <p>
                  Neuraliso was created to solve a modern crisis: mental health applications have become cluttered with predatory subscriptions, forced email capture, invasive advertising trackers, and dark UX patterns.
                </p>
                <p>
                  Our mission is simple: provide honest, evidence-based self-care tools (paced breathing, CBT thought reframing, calming sleep audio) that start in under 60 seconds with zero friction and 100% browser-level privacy.
                </p>
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5 text-xs text-slate-300">
                  <div className="font-bold text-white">AI Transparency Note:</div>
                  <p>Our conversational CBT companion uses Google Gemini 3.6 Flash statelessly via a secure zero-data-retention proxy. Your reflections are never stored or used to train models.</p>
                </div>
              </div>
            )}

            {activeModal === "terms" && (
              <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
                <div className="flex items-center gap-2 text-[#00b8a9] font-bold text-lg">
                  <ShieldCheck className="w-5 h-5" />
                  <h3>Terms of Service</h3>
                </div>
                <p>
                  By using Neuraliso, you agree to use this application for personal mindfulness, relaxation, and self-reflection.
                </p>
                <p>
                  Neuraliso provides self-directed breathing rhythms, acoustic audio synthesizers, and reflective journaling. It does not provide licensed therapy, medical prescriptions, or emergency intervention.
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 rounded-full bg-[#00d4ff] text-[#0B1121] font-bold text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[44px]"
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
