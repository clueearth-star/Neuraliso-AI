import React, { useState, useEffect } from "react";
import { ActiveView, JournalEntry } from "../types";
import { LeafLogoIcon, SadMoodIcon, AnxiousMoodIcon, OverwhelmedMoodIcon, LonelyMoodIcon } from "./Icons";
import { OracleDeck } from "./OracleDeck";
import { AuraLounge } from "./AuraLounge";
import { ChevronRight } from "lucide-react";

interface HomeViewProps {
  onNavigate: (view: ActiveView) => void;
  entries: JournalEntry[];
  currentStress: number;
  setCurrentStress: (val: number) => void;
  userName?: string;
  onJournalWithCard?: (note: string) => void;
  wellnessScore?: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  entries,
  currentStress,
  setCurrentStress,
  userName,
  onJournalWithCard,
  wellnessScore,
}) => {
  const [affirmation, setAffirmation] = useState("Your strength isn't defined by how much you can carry, but how tenderly you hold yourself through the storm.");
  const [insight, setInsight] = useState("Taking small, conscious breaths can slow down your stress response in less than sixty seconds.");
  const [loadingAffirmation, setLoadingAffirmation] = useState(false);

  // Gamification & Badges State
  const badges = [
    { title: "Somatic Sprouter", desc: "Planted first gratitude flora", icon: "🌱", earned: entries.length > 0 },
    { title: "CBT Adept", desc: "First cognitive record complete", icon: "🧠", earned: entries.some(e => e.note && e.note.includes("CBT")) },
    { title: "Vagal Adept", desc: "Paced stress relief completed", icon: "🔋", earned: currentStress <= 4 },
    { title: "7-Day Warrior", desc: "Logged 7 recovery sessions", icon: "🛡️", earned: entries.length >= 7 }
  ];

  // Gratitude Garden State (Feature #1)
  const [gratitudes, setGratitudes] = useState<string[]>(() => {
    const saved = localStorage.getItem("neuraliso_gratitudes_list");
    return saved ? JSON.parse(saved) : [
      "The quiet warmth of early morning air",
      "Having a clean, cozy room to rest in today",
      "Having delicious, comforting warm tea"
    ];
  });
  const [newGratitudeText, setNewGratitudeText] = useState("");

  const handleAddGratitude = () => {
    if (!newGratitudeText.trim()) return;
    const updated = [...gratitudes, newGratitudeText.trim()];
    setGratitudes(updated);
    localStorage.setItem("neuraliso_gratitudes_list", JSON.stringify(updated));
    setNewGratitudeText("");
  };

  // PMR states (Feature #2)
  const [pmrStep, setPmrStep] = useState(0);
  const [pmrPhase, setPmrPhase] = useState<"tense" | "release">("tense");
  
  const pmrSteps = [
    {
      title: "1. Forehead & brow",
      instruction: "Squeeze your forehead muscles tightly into a deep frown for 5 seconds.",
      releaseInstruction: "Now release completely. Observe the warm sensation of mental space opening as your temples soften."
    },
    {
      title: "2. Jaw & mouth",
      instruction: "Clench your teeth and tense your jaw firmly, locking out background noise.",
      releaseInstruction: "Release. Let your mouth hang slightly open, letting all social, reactive, and emotional pressure drop."
    },
    {
      title: "3. Shoulders & neck",
      instruction: "Pull your shoulders right up to your earlobes, tensing your neck and shoulders.",
      releaseInstruction: "Drop them down heavily! Feel the weight transfer instantly to gravity. You are fully supported."
    },
    {
      title: "4. Hands & arms",
      instruction: "Clench both hands into strong, tight fists, tensing your forearms and biceps.",
      releaseInstruction: "Unfold your fingers slowly. Observe the soothing warmth and tingling sensation in your palms."
    },
    {
      title: "5. Abdomen & chest",
      instruction: "Take a deep breath and tense your core abdominal muscles firmly.",
      releaseInstruction: "Exhale fully! Let your chest and posture soften peacefully into your chair cushion."
    },
    {
      title: "6. Feet & legs",
      instruction: "Curl your toes downward, tensing your calves, thighs, and feet.",
      releaseInstruction: "Release completely. Feel your physical foundation sink deep and solid into the earth."
    }
  ];

  // Fetch a warm, personalized affirmation from our Express backend
  const fetchNewInsight = async (mood: string) => {
    setLoadingAffirmation(true);
    try {
      const response = await fetch(`/api/insights?mood=${mood}`);
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.affirmation) setAffirmation(data.affirmation);
        if (data.insight) setInsight(data.insight);
      } else {
        const text = await response.text();
        console.warn("[Insights API Fallback] Received non-JSON or status issue:", text.substring(0, 120));
        // Graceful static defaults in case dev server is restarting/rebuilding
        setAffirmation("You are breathing, you are here, and you are worthy of gentle kindness.");
        setInsight("Take this hour one steady minute at a time.");
      }
    } catch (e) {
      console.warn("[Insights API Network Error - Falling back safely]", e);
      setAffirmation("You are breathing, you are here, and you are worthy of gentle kindness.");
      setInsight("Take this hour one steady minute at a time.");
    } finally {
      setLoadingAffirmation(false);
    }
  };

  useEffect(() => {
    const lastMood = entries.length > 0 ? entries[entries.length - 1].mood : "neutral";
    fetchNewInsight(lastMood);
  }, [entries]);

  // Determine stress label
  const getStressDetails = (lvl: number) => {
    if (lvl <= 3) return { label: "Gentle & Calm", color: "text-green-600", bg: "bg-green-150" };
    if (lvl <= 6) return { label: "Moderate Tension", color: "text-amber-600", bg: "bg-amber-150" };
    return { label: "High Overwhelm", color: "text-danger-red", bg: "bg-red-50 text-red-700" };
  };

  const stressInfo = getStressDetails(currentStress);
  const totalCompletedSessions = entries.length;
  // Dynamic Streak counting based on logs
  const currentStreak = entries.length > 0 ? Math.min(entries.length, 7) : 1;

  // The database score (wellness_score column) is the SINGLE source of truth for the displayed Wellness Index.
  // There is no secondary locally-calculated value that can drift out of sync.
  const activeWellnessScore = wellnessScore ?? 0;

  // Dynamic Routine generation depending on active user mood (If Sad, If Anxious, If Lonely, If Overwhelmed)
  const getLastLoggedMood = () => {
    if (entries.length > 0) {
      return entries[entries.length - 1].mood;
    }
    // Fallback based on high stress
    return currentStress > 6 ? "overwhelmed" : "anxious";
  };

  const activeMoodType = getLastLoggedMood();

  const getDynamicActionPlan = (m: string) => {
    switch (m) {
      case "sad":
        return {
          title: "Depletion Recovery Routine",
          immediate: "Open your curtains or get outdoors for 3 minutes of direct somatic sunlight.",
          fiveMin: "Log 3 bullet points inside the 'Gratitude Garden Sprouter' block below.",
          fifteenMin: "Play the Solfeggio soundscapes inside the 'Aura Lounge' and draft a positive memory journal.",
          longTerm: "Commit to completing brief morning vitality checks and routine outdoor walks."
        };
      case "lonely":
        return {
          title: "Oxytocin Spurge Scheme",
          immediate: "Drink a warm cup of herbal tea or cozy hot water to stimulate throat vagal sensors.",
          fiveMin: "Draft an empathetic supportive memo or reach out to a community chat helpline.",
          fifteenMin: "Complete a scheduled audio reflection inside your AI Companion view.",
          longTerm: "Integrate into nearby weekly group events or open digital discussion portals."
        };
      case "overwhelmed":
        return {
          title: "Prefrontal Cognitive De-escalation",
          immediate: "Forcefully unclench your jaw, drop your neck posture, and let out a deep vocalized sigh.",
          fiveMin: "Open the raw SOS Screen and complete 1 set of guided Box breathing loop steps.",
          fifteenMin: "Examine the muscle steps below and execute the local Progressive Muscle Relaxation (PMR).",
          longTerm: "Divide large task boards into micro-milestones using clear, low-stress prioritization grids."
        };
      case "happy":
        return {
          title: "Joy Anchoring Guide",
          immediate: "Close your eyes and breathe in deeply, capturing this moment of gratitude in memory.",
          fiveMin: "Share a small positive comment or smile with a companion or online discussion board.",
          fifteenMin: "Review your completed achievements and award metrics on your Profile tab.",
          longTerm: "Log a celebratory journal note so you can easily review it on difficult rainy days."
        };
      case "anxious":
      default:
        return {
          title: "Sympathetic Nervous Calm-Down",
          immediate: "Inhale slowly for 4s, hold for 2s, and exhale with parted lips for 6s.",
          fiveMin: "Trigger the cold water face routine to launch the Mammalian Dive Reflex instantly.",
          fifteenMin: "Tap the AI Companion chat and execute a guided Cognitive reframing thought assessment.",
          longTerm: "Integrate biometric sleep monitors and perform consistent paced box breathing."
        };
    }
  };

  const dynamicPlan = getDynamicActionPlan(activeMoodType);

  return (
    <div id="home-view-container" className="pb-24 space-y-6 max-w-xl mx-auto px-1 animate-fade-in text-left">
      
      {/* 🔴 HIGH PRIORITY STICKY SOS PANIC BUTTON */}
      <div className="flex justify-between items-center bg-red-500 text-white p-3.5 rounded-2xl shadow-xl animate-fade-in">
        <div className="flex items-center gap-2">
          <span className="text-base animate-ping">❤️</span>
          <div>
            <span className="text-xs font-bold block uppercase tracking-wide">Extreme Stress Alert?</span>
            <p className="text-[10px] text-red-100 italic leading-none pt-0.5">Instant non-medical calm assistance</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate("sos")}
          id="conspicuous-panic-sos-trigger"
          className="bg-white text-danger-red font-bold font-sans px-4 py-2 rounded-xl text-xs uppercase tracking-wide hover:bg-red-50 transition-all cursor-pointer shadow-md"
        >
          🚨 Launch SOS Mode
        </button>
      </div>

      {/* 📊 CORE MAIN DASHBOARD HEADER & WELLNESS SCORE */}
      <div className="wellness-card p-6 flex flex-col items-center justify-center relative overflow-hidden bg-white border">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-soft-green/30 rounded-full blur-xl pointer-events-none" />
        
        <p className="text-[9px] tracking-widest uppercase text-muted-text font-bold mb-1">CLINICAL SEED METRICS</p>
        <h2 className="text-3xl font-serif italic text-dark-text leading-tight text-center">
          Greetings, {userName || "Seeker"}
        </h2>

        {/* WELNESS SCORE CIRCULAR DIAL RING */}
        <div className="relative w-40 h-40 flex items-center justify-center my-5">
          {/* SVG ring stroke indicator */}
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="64"
              className="stroke-slate-100 fill-none"
              strokeWidth="9"
            />
            <circle
              cx="80"
              cy="80"
              r="64"
              className="stroke-primary-sage fill-none transition-all duration-1000 ease-out"
              strokeWidth="9"
              strokeDasharray={402}
              strokeDashoffset={402 - (402 * activeWellnessScore) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center z-10 space-y-0.5">
            <span className="text-4xl font-serif italic font-bold text-slate-800">{activeWellnessScore}</span>
            <span className="text-[10px] text-muted-text block uppercase font-mono tracking-widest">Wellness Index</span>
          </div>
        </div>

        {/* Dynamic score summary */}
        <p className="text-xs text-muted-text text-center max-w-xs leading-snug">
          Your active index is <strong className="text-primary-sage font-sans">{activeWellnessScore < 60 ? "Slightly Depleted" : "Healthy & Centered"}</strong> reflecting consistent somatic checklists.
        </p>
      </div>

      {/* 📊 DAILY SNAPSHOT SUMMARY */}
      <div className="wellness-card p-5 bg-white border grid grid-cols-3 gap-3 text-center">
        <div>
          <span className="text-xl font-bold font-mono text-primary-sage block">{currentStreak} Days</span>
          <span className="text-[9.5px] text-muted-text uppercase font-sans">Wellness Streak</span>
        </div>
        <div>
          <span className="text-xl font-bold font-mono text-danger-red block">Lv {currentStress} / 10</span>
          <span className="text-[9.5px] text-muted-text uppercase font-sans">Stress Baseline</span>
        </div>
        <div>
          <span className="text-xl font-bold font-mono text-blue-800 block">7.2hr</span>
          <span className="text-[9.5px] text-muted-text uppercase font-sans">Simulated Sleep</span>
        </div>
      </div>

      {/* DYNAMIC COMPASSION ACTION PLAN Prescriptions (CBT DYNAMIC PLAN) */}
      <div id="dynamic-cognitive-roadmap" className="wellness-card p-6 border bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="space-y-1">
          <span className="text-[9px] tracking-widest uppercase font-mono bg-amber-500/20 text-yellow-300 px-2 py-0.5 rounded font-bold">
            🧠 Active Mood-Responsive Prescription
          </span>
          <h4 className="text-xl font-serif italic font-bold pt-1">{dynamicPlan.title}</h4>
          <p className="text-xs text-slate-300 leading-snug pt-0.5">
            Calibrated automatically for the last logged emotional frequency <strong>({activeMoodType})</strong>.
          </p>
        </div>

        {/* Plan item timelines */}
        <div className="space-y-3.5 border-t border-slate-800 pt-4 mt-4 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="bg-yellow-400 text-slate-950 font-bold font-mono px-1.5 py-0.5 rounded text-[8.5px] shrink-0 uppercase">30 Seconds</span>
            <div className="space-y-0.5">
              <strong className="text-amber-300 font-sans block uppercase text-[9px]">Immediate Action:</strong>
              <p className="text-slate-200 leading-normal">{dynamicPlan.immediate}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="bg-emerald-400 text-slate-950 font-bold font-mono px-1.5 py-0.5 rounded text-[8.5px] shrink-0 uppercase">5 Minutes</span>
            <div className="space-y-0.5">
              <strong className="text-emerald-300 font-sans block uppercase text-[9px]">Mid-Range Coping Action:</strong>
              <p className="text-slate-200 leading-normal">{dynamicPlan.fiveMin}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="bg-sky-400 text-slate-950 font-bold font-mono px-1.5 py-0.5 rounded text-[8.5px] shrink-0 uppercase">15 Minutes</span>
            <div className="space-y-0.5">
              <strong className="text-sky-300 font-sans block uppercase text-[9px]">Deep Healing Anchor:</strong>
              <p className="text-slate-200 leading-normal">{dynamicPlan.fifteenMin}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="bg-purple-400 text-slate-950 font-bold font-mono px-1.5 py-0.5 rounded text-[8.5px] shrink-0 uppercase">Long Term</span>
            <div className="space-y-0.5">
              <strong className="text-purple-300 font-sans block uppercase text-[9px]">Psychological Habituation:</strong>
              <p className="text-slate-200 leading-normal">{dynamicPlan.longTerm}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ TODAY'S PROGRESS QUICK ACTIONS CLOUD */}
      <div className="wellness-card p-6 bg-white border space-y-4">
        <h3 className="text-sm font-bold text-dark-text uppercase tracking-wide font-sans">Quick Healing Modules</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("moodCheck")}
            className="p-3.5 rounded-2xl bg-emerald-50/45 hover:bg-emerald-50 border border-emerald-100 flex flex-col justify-between items-start text-left"
          >
            <span className="text-xl">✨</span>
            <div className="mt-2 text-xs">
              <strong className="text-emerald-950 block">Mood Diary Check-In</strong>
              <span className="text-[10px] text-slate-500 font-mono">1–10 factor records</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate("chat")}
            className="p-3.5 rounded-2xl bg-blue-50/45 hover:bg-blue-50 border border-blue-105 flex flex-col justify-between items-start text-left"
          >
            <span className="text-xl">💬</span>
            <div className="mt-2 text-xs">
              <strong className="text-blue-950 block">AI Companion Chat</strong>
              <span className="text-[10px] text-slate-500 font-mono">Clinical CBT dialogs</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate("sos")}
            className="p-3.5 rounded-2xl bg-red-50 hover:bg-red-100/50 border border-red-105 flex flex-col justify-between items-start text-left"
          >
            <span className="text-xl">🚨</span>
            <div className="mt-2 text-xs">
              <strong className="text-red-950 block">SOS Calming Assists</strong>
              <span className="text-[10px] text-slate-500 font-mono">EMDR & Vagus stimulators</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate("hotline")}
            className="p-3.5 rounded-2xl bg-amber-50/45 hover:bg-amber-50 border border-amber-101 flex flex-col justify-between items-start text-left"
          >
            <span className="text-xl">📞</span>
            <div className="mt-2 text-xs">
              <strong className="text-amber-950 block">Helpline Networks</strong>
              <span className="text-[10px] text-slate-500 font-mono">24/7 Professional links</span>
            </div>
          </button>
        </div>
      </div>

      {/* 🧬 EXPERIMENTAL NEUROPLASM LABORATORY ENTRY POINT */}
      <div 
        onClick={() => onNavigate("neuroSkeletons")}
        className="wellness-card p-6 bg-gradient-to-tr from-[#E1E7E2] to-[#DDEFE2] border border-green-200 shadow-lg relative overflow-hidden cursor-pointer group hover:-translate-y-1 transition-all duration-300"
      >
        {/* Soft glowing ambient circle */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 neuro-plasma-glow rounded-full animate-neuro-blob pointer-events-none opacity-80" />
        
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-white/80 border border-green-150 text-primary-sage rounded-xl flex items-center justify-center shadow-xs">
            🧠
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#5C8A6E] font-semibold">
            Experimental Laboratory
          </span>
        </div>
        
        <h4 className="text-lg font-serif italic text-slate-800 font-bold leading-tight group-hover:text-primary-sage transition-colors">
          Explore Neuroplasm UX™
        </h4>
        <p className="text-xs text-slate-500 leading-normal pt-1.5 max-w-sm">
          Experience our fluid, morphing neural interfaces, liquid pulse skeletons, and customizable glassmorphism laboratory playground.
        </p>
        
        <div className="flex items-center gap-1 text-[11px] font-bold text-primary-sage/90 pt-3 group-hover:translate-x-1 transition-transform">
          <span>Enter Organic Lab</span>
          <ChevronRight size={14} />
        </div>
      </div>

      {/* 🏆 GAMIFICATION STREAKS & BADGES SYSTEM */}
      <div className="wellness-card p-5 bg-white border space-y-3.5">
        <h3 className="text-sm font-bold text-dark-text uppercase tracking-wide">🏆 Resilience Awards & Milestones</h3>
        <p className="text-[11px] text-muted-text -mt-1">Grow your recovery points automatically by consistent check-ins and journal entries.</p>
        
        <div className="grid grid-cols-2 gap-3.5 pt-1.5">
          {badges.map((bdg, i) => (
            <div key={i} className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
              bdg.earned 
                ? "bg-slate-50 border-primary-sage/40 opacity-100" 
                : "bg-slate-50 border-slate-200 opacity-40 grayscale"
            }`}>
              <span className="text-2xl p-1 bg-white rounded-xl shadow-xs shrink-0">{bdg.icon}</span>
              <div className="text-left font-sans text-[10.5px]">
                <strong className="text-slate-900 block font-semibold leading-tight">{bdg.title}</strong>
                <span className="text-slate-500 text-[9.5px] font-mono block leading-snug">{bdg.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Daily affirmation display */}
      <div id="daily-affirmation-card" className="wellness-card p-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <span className="p-1.5 bg-soft-green/35 text-primary-sage rounded-xl">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </span>
          <h3 className="font-sans font-semibold text-dark-text text-sm tracking-wide">Daily Affirmation & CBT Insight</h3>
        </div>

        <div className="space-y-3 pl-1">
          <p className={`text-base font-serif italic text-dark-text leading-relaxed transition-all duration-500 ${loadingAffirmation ? "opacity-40" : ""}`}>
            "{affirmation}"
          </p>
          <div className={`text-xs text-muted-text border-t border-soft-green/20 pt-3 flex items-start gap-1.5 transition-all duration-500 ${loadingAffirmation ? "opacity-40" : ""}`}>
            <span className="font-bold text-primary-sage">Insight:</span>
            <span>{insight}</span>
          </div>
        </div>
      </div>

      {/* GOLD REFLEXIVE DECK */}
      <OracleDeck onJournalWithCard={onJournalWithCard} />

      {/* 🌸 COMMUNITY REVIEWS SECTION */}
      <div id="community-reviews-launcher-card" className="wellness-card p-5 bg-white border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-sage/60" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-1.5">
            <span>🌸 Community Reflections</span>
            <span className="text-[9px] font-mono font-bold bg-green-50 text-primary-sage px-1.5 py-0.5 rounded border border-green-100">Live Logs</span>
          </h4>
          <p className="text-xs text-slate-500 max-w-sm">
            Read other verified seekers' healing journeys or publish your own review directly to Google Drive.
          </p>
        </div>
        <button
          onClick={() => onNavigate("reviews")}
          className="bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs whitespace-nowrap hover:bg-slate-800 transition-all cursor-pointer shadow-md group-hover:scale-102 duration-250 active:scale-95"
        >
          Explore Feedback
        </button>
      </div>

      {/* PROCEDURAL SOUND LAB */}
      <AuraLounge />

      {/* 4. Interactive Live Stress Slider */}
      <div id="interactive-stress-panel" className="wellness-card p-6 bg-white border">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-sans font-semibold text-dark-text tracking-wide">Interactive Tension slider</h3>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${stressInfo.bg} ${stressInfo.color}`}>
            {stressInfo.label}
          </span>
        </div>

        <p className="text-xs text-muted-text mb-4">
          Slide the bar below to reflect your active mental tension. Neuraliso recommends customized relief routines instantly.
        </p>

        <div className="space-y-3">
          <div className="flex justify-between text-[11px] text-muted-text font-mono">
            <span>1 (Peaceful)</span>
            <span>5 (Moderate)</span>
            <span>10 (Overwhelmed)</span>
          </div>
          <div className="px-1">
            <input
              id="stress-range-slider"
              type="range"
              min="1"
              max="10"
              value={currentStress}
              onChange={(e) => setCurrentStress(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="text-center font-mono text-sm font-bold text-dark-text pt-1">
            Tension Level: <span className="text-primary-sage text-lg">{currentStress}</span> / 10
          </div>
        </div>
      </div>

      {/* FEATURE 1: GRATITUDE GARDEN MODULE */}
      <div id="gratitude-garden-widget" className="wellness-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-sm">
            🌱
          </span>
          <div>
            <h3 className="font-sans font-semibold text-dark-text text-sm tracking-wide">Gratitude Garden Sprouter</h3>
            <p className="text-[10px] text-muted-text uppercase font-mono">Sprout virtual flora with positive reflections</p>
          </div>
        </div>

        <p className="text-xs text-muted-text leading-relaxed">
          Sowing thoughts of gratitude chemically decreases tension. Enter anything you feel thankful for today—each logs sprouts custom branches and blooms in your virtual pot.
        </p>

        {/* Dynamic Procedural Garden Canvas */}
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 100 60" className="w-full max-w-[280px] h-32 bg-sky-50/45 dark:bg-slate-900/10 rounded-2xl border border-soft-green/10 mt-1 overflow-visible">
            <circle cx="50" cy="22" r="16" fill="#FBD38D" opacity="0.18" />
            
            <path d="M 38 48 C 38 48, 39 56, 42 56 L 58 56 C 61 56, 62 48, 62 48 Z" fill="#755E4C" />
            <rect x="36" y="45" width="28" height="3.5" rx="1.5" fill="#8C6F5A" />
            
            <path d="M 50 45 Q 51 32 50 16" stroke="#489C6F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            
            {gratitudes.map((g, idx) => {
              if (idx % 3 === 0) {
                const yPos = 40 - (Math.floor(idx / 3) * 8);
                if (yPos < 10) return null;
                return (
                  <g key={idx} className="animate-fade-in">
                    <path d={`M 50 ${yPos} Q 40 ${yPos - 5} 32 ${yPos - 2}`} stroke="#489C6F" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    <circle cx="32" cy={yPos - 2} r="3" fill="#F687B3" />
                    <path d={`M 32 ${yPos - 2} Q 29 ${yPos} 32 ${yPos + 2}`} fill="#489C6F" opacity="0.8" />
                  </g>
                );
              }
              if (idx % 3 === 1) {
                const yPos = 36 - (Math.floor(idx / 3) * 8);
                if (yPos < 10) return null;
                return (
                  <g key={idx} className="animate-fade-in">
                    <path d={`M 50 ${yPos} Q 60 ${yPos - 5} 68 ${yPos - 3}`} stroke="#489C6F" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    <path d={`M 68 ${yPos - 3} Q 72 ${yPos - 7} 74 ${yPos + 1}`} fill="#ECC94B" />
                    <circle cx="68" cy={yPos - 3} r="2.2" fill="#D69E2E" />
                  </g>
                );
              }
              const yPos = 32 - (Math.floor(idx / 3) * 8);
              if (yPos < 10) return null;
              return (
                <g key={idx} className="animate-fade-in">
                  <circle cx="50" cy={yPos - 6} r="2.8" fill="#63B3ED" />
                  <path d={`M 50 ${yPos} Q 48 ${yPos - 3} 50 ${yPos - 6}`} stroke="#489C6F" strokeWidth="1.5" fill="none" />
                </g>
              );
            })}
            
            <circle cx="48" cy="43" r="0.8" fill="#F6E05E" opacity="0.8" />
            <circle cx="53" cy="42" r="0.6" fill="#F6E05E" opacity="0.9" />
          </svg>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              id="gratitude-input-field"
              type="text"
              value={newGratitudeText}
              onChange={(e) => setNewGratitudeText(e.target.value)}
              placeholder="I am grateful for..."
              className="flex-1 p-3 border rounded-xl text-xs placeholder-muted-text text-dark-text"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddGratitude();
              }}
            />
            <button
              id="add-gratitude-submit-btn"
              onClick={handleAddGratitude}
              className="bg-primary-sage text-white px-4 py-3.5 rounded-2xl font-bold font-sans text-xs hover:bg-deep-sage transition-all shadow-sm shrink-0 active:scale-95"
            >
              + Sprout
            </button>
          </div>

          <div className="max-h-24 overflow-y-auto pr-1 space-y-1.5 pt-2 border-t border-soft-green/10">
            {gratitudes.slice(-4).reverse().map((g, idx) => (
              <div key={idx} className="p-2 bg-white/50 border border-soft-green/5 text-[11px] leading-snug rounded-xl text-dark-text/90 italic flex items-center gap-1.5">
                <span className="text-emerald-500 animate-pulse">✿</span>
                <span>"{g}"</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURE 2: PROGRESSIVE MUSCLE RELAXATION GUIDELINE */}
      <div id="pmr-somatic-guide" className="wellness-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-blue-105 text-blue-900 rounded-xl text-sm">
            🧘‍♀️
          </span>
          <div>
            <h3 className="font-sans font-semibold text-dark-text text-sm tracking-wide">Progressive Muscle Relaxation</h3>
            <p className="text-[10px] text-muted-text uppercase font-mono">Interactive Physical Somatic Release</p>
          </div>
        </div>

        <p className="text-xs text-muted-text leading-relaxed">
          Alternating high muscle tension with sudden neurological releases signals your parasympathetic network to instantly drain active panic. Let's travel through the somatic steps below.
        </p>

        {/* PMR Step box layout */}
        <div className="p-4 rounded-3xl bg-sky-50/40 relative border border-blue-200/25">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono font-bold text-blue-900 border border-blue-900/30 px-2 py-0.5 rounded-full bg-blue-50">
              PMR Focus Coach
            </span>
            <span className="text-[10px] font-mono text-muted-text">
              Step {pmrStep + 1} of {pmrSteps.length}
            </span>
          </div>

          <h4 className="font-serif italic font-semibold text-dark-text text-base mt-1">
            {pmrSteps[pmrStep].title}
          </h4>

          {/* Phase toggler indicators */}
          <div className="grid grid-cols-2 gap-2 my-3 text-center">
            <button
              onClick={() => setPmrPhase("tense")}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                pmrPhase === "tense"
                  ? "bg-amber-100 border border-amber-300 text-amber-800 shadow-sm"
                  : "bg-white/40 border border-transparent text-muted-text"
              }`}
            >
              ✊ 1. Tense up (5s)
            </button>
            <button
              onClick={() => setPmrPhase("release")}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                pmrPhase === "release"
                  ? "bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-sm"
                  : "bg-white/40 border border-transparent text-muted-text"
              }`}
            >
              🍃 2. Release & Breathe
            </button>
          </div>

          {/* Main instruction box */}
          <div className="p-3 bg-white/70 border border-blue-100/50 rounded-2xl min-h-20 flex items-center">
            <p className="text-xs text-dark-text/95 leading-relaxed font-sans">
              {pmrPhase === "tense" ? pmrSteps[pmrStep].instruction : pmrSteps[pmrStep].releaseInstruction}
            </p>
          </div>

          {/* Step navigator button controls */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-blue-100/40">
            <button
              disabled={pmrStep === 0}
              onClick={() => {
                setPmrStep((prev) => prev - 1);
                setPmrPhase("tense");
              }}
              className="px-3.5 py-1.5 rounded-xl border border-blue-100 text-[10px] font-bold text-muted-text hover:bg-white/60 disabled:opacity-30 self-start cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (pmrStep < pmrSteps.length - 1) {
                  setPmrStep((prev) => prev + 1);
                  setPmrPhase("tense");
                } else {
                  setPmrStep(0);
                  setPmrPhase("tense");
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-900 text-white text-[10px] font-bold hover:bg-blue-950 shadow-xs cursor-pointer"
            >
              {pmrStep === pmrSteps.length - 1 ? "Start Over" : "Next Muscle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
