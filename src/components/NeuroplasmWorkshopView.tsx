import React, { useState, useEffect } from "react";
import { 
  NeuroCardSkeleton, 
  NeuroBlobSkeleton, 
  NeuroTextSkeleton 
} from "./NeuroplasmSkeleton";
import { 
  Sparkles, 
  Cpu, 
  ToggleLeft, 
  ToggleRight, 
  ChevronRight, 
  TrendingUp, 
  User, 
  Heart, 
  Compass, 
  ArrowLeft,
  Activity,
  Award,
  BookOpen,
  Play,
  Share2,
  RefreshCw,
  Waves,
  BrainCircuit,
  Settings,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NeuroplasmWorkshopViewProps {
  onBack: () => void;
}

export const NeuroplasmWorkshopView: React.FC<NeuroplasmWorkshopViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "mindmap" | "sandbox">("dashboard");
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);
  const [chatLoading, setChatLoading] = useState<boolean>(true);
  
  // Sandbox parameters
  const [pulseSpeed, setPulseSpeed] = useState<number>(7); // seconds
  const [blobSpeed, setBlobSpeed] = useState<number>(10); // seconds
  const [glassBlur, setGlassBlur] = useState<number>(12); // px
  const [meltIntensity, setMeltIntensity] = useState<"standard" | "highly-fluid" | "liquid">("standard");

  // Local loop simulation for loading toggles
  useEffect(() => {
    let dashboardInterval: any;
    let chatInterval: any;
    
    // Auto toggle to show off melting fluid transition by default
    dashboardInterval = setTimeout(() => {
      setDashboardLoading(false);
    }, 1800);

    chatInterval = setTimeout(() => {
      setChatLoading(false);
    }, 2500);

    return () => {
      clearTimeout(dashboardInterval);
      clearTimeout(chatInterval);
    };
  }, []);

  const getMeltRadius = (size: "small" | "medium" | "large") => {
    if (meltIntensity === "liquid") {
      if (size === "small") return "18px 24px 10px 18px / 12px 18px 14px 20px";
      if (size === "medium") return "28px 36px 18px 28px / 20px 28px 24px 34px";
      return "40px 60px 30px 50px / 35px 50px 45px 60px";
    }
    if (meltIntensity === "highly-fluid") {
      if (size === "small") return "14px 20px 8px 16px / 10px 16px 12px 18px";
      if (size === "medium") return "22px 30px 16px 24px / 18px 24px 20px 28px";
      return "34px 44px 26px 36px / 28px 36px 32px 42px";
    }
    // Standard
    if (size === "small") return "12px 18px 8px 14px / 10px 14px 12px 16px";
    if (size === "medium") return "18px 24px 14px 20px / 16px 20px 18px 22px";
    return "28px 36px 22px 30px / 24px 30px 28px 32px";
  };

  return (
    <div id="neuroplasm-workshop-root" className="space-y-6 pb-24 text-left animate-fade-in">
      
      {/* HEADER WITH WORKSPACE NAVIGATOR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-150 pb-4 gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-text hover:text-dark-text transition-all py-2 px-3 rounded-xl hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to Home</span>
        </button>
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-primary-sage filter drop-shadow animate-pulse" size={18} />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#5C8A6E] font-extrabold bg-green-50 px-2 py-0.5 rounded-md border border-green-150">
            Neuroplasm UX™ Workshop
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Organic Interface Laboratory</span>
          <Sparkles size={22} className="text-primary-sage/80" />
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
          Welcome to the experimental design system that replaces boxy skeleton frameworks with liquid cell shapes and neural pulse animations. Experience how skeletons smoothly morph into fully realized wellness guides.
        </p>
      </div>

      {/* MODE TABS CONTROL */}
      <div className="flex p-1 bg-slate-150 rounded-2xl max-w-lg border border-slate-200">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "dashboard" 
              ? "bg-white text-dark-text shadow-sm" 
              : "text-muted-text hover:text-dark-text"
          }`}
        >
          <Activity size={14} />
          <span>Dashboard Preview</span>
        </button>
        <button
          onClick={() => setActiveTab("mindmap")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "mindmap" 
              ? "bg-white text-dark-text shadow-sm" 
              : "text-muted-text hover:text-dark-text"
          }`}
        >
          <Compass size={14} />
          <span>Mind-Map Chat</span>
        </button>
        <button
          onClick={() => setActiveTab("sandbox")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "sandbox" 
              ? "bg-white text-dark-text shadow-sm" 
              : "text-muted-text hover:text-dark-text"
          }`}
        >
          <Cpu size={14} />
          <span>Sandbox Labs</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ========================================== */}
        {/* TAB 1: DASHBOARD LAYOUT SIMULATION */}
        {/* ========================================== */}
        {activeTab === "dashboard" && (
          <motion.div
            key="tab-dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Control Header for simulation */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-150">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-800">
                  Somatic Care Dashboard Demonstration
                </h3>
                <p className="text-[11px] text-slate-500">
                  Simulate connection latencies to experience how our skeleton shapes gently melt into life.
                </p>
              </div>
              <button
                onClick={() => setDashboardLoading(!dashboardLoading)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer ${
                  dashboardLoading 
                    ? "bg-primary-sage/10 text-primary-sage border-primary-sage/20" 
                    : "bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-800"
                }`}
              >
                <RefreshCw size={12} className={dashboardLoading ? "animate-spin" : ""} />
                <span>State: {dashboardLoading ? "STREAMING SKELETONS" : "LIVE DASHBOARD"}</span>
              </button>
            </div>

            {/* Simulated Mobile Frame Layout */}
            <div className="w-full max-w-3xl mx-auto border border-slate-200 rounded-[32px] overflow-hidden bg-[#FAF8F4] shadow-xl p-6 relative">
              
              <AnimatePresence mode="wait">
                {dashboardLoading ? (
                  /* LOADING SKELETON STATE */
                  <motion.div
                    key="dash-loading-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Welcome Banner Skeleton */}
                    <NeuroCardSkeleton className="p-6 relative overflow-hidden" glowStrength="vibrant">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-3.5 flex-1">
                          <NeuroTextSkeleton lines={1} widthClasses={["w-1/3"]} heightClass="h-5" />
                          <NeuroTextSkeleton lines={2} widthClasses={["w-11/12", "w-4/5"]} heightClass="h-3" />
                        </div>
                        <NeuroBlobSkeleton sizeClass="w-14 h-14" />
                      </div>
                    </NeuroCardSkeleton>

                    {/* Quick Stats Grid (2 Columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Wellness Index Ring */}
                      <NeuroCardSkeleton className="p-6 flex items-center justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <NeuroTextSkeleton lines={1} widthClasses={["w-3/5"]} heightClass="h-3" />
                          <NeuroTextSkeleton lines={1} widthClasses={["w-1/2"]} heightClass="h-6" />
                        </div>
                        <div className="p-1">
                          <NeuroBlobSkeleton sizeClass="w-14 h-14 bg-emerald-100" />
                        </div>
                      </NeuroCardSkeleton>

                      {/* Mind/Stress Sprouter */}
                      <NeuroCardSkeleton className="p-6 flex items-center justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <NeuroTextSkeleton lines={1} widthClasses={["w-2/3"]} heightClass="h-3" />
                          <NeuroTextSkeleton lines={1} widthClasses={["w-5/12"]} heightClass="h-6" />
                        </div>
                        <div className="p-1">
                          <NeuroBlobSkeleton speed="slow" sizeClass="w-14 h-14" />
                        </div>
                      </NeuroCardSkeleton>
                    </div>

                    {/* Action Daily Rec Card */}
                    <NeuroCardSkeleton className="p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                        <NeuroTextSkeleton lines={1} widthClasses={["w-1/4"]} heightClass="h-4" />
                        <NeuroBlobSkeleton speed="ambient" sizeClass="w-8 h-8" />
                      </div>
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-3">
                          <NeuroBlobSkeleton sizeClass="w-5 h-5" />
                          <NeuroTextSkeleton lines={1} widthClasses={["w-11/12"]} heightClass="h-3" />
                        </div>
                        <div className="flex items-center gap-3">
                          <NeuroBlobSkeleton speed="slow" sizeClass="w-5 h-5" />
                          <NeuroTextSkeleton lines={1} widthClasses={["w-4/5"]} heightClass="h-3" />
                        </div>
                        <div className="flex items-center gap-3">
                          <NeuroBlobSkeleton speed="ambient" sizeClass="w-5 h-5" />
                          <NeuroTextSkeleton lines={1} widthClasses={["w-5/6"]} heightClass="h-3" />
                        </div>
                      </div>
                    </NeuroCardSkeleton>
                  </motion.div>
                ) : (
                  /* RENDERED HIGH-FIDELITY ACTIVE CONTENT */
                  <motion.div
                    key="dash-real-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="space-y-6 duration-500"
                  >
                    {/* Welcome Banner */}
                    <div 
                      className="wellness-card p-6 bg-white border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
                      style={{ borderRadius: getMeltRadius("large") }}
                    >
                      <div className="space-y-1.5 flex-1 select-none text-left">
                        <span className="text-xs font-mono font-bold text-primary-sage uppercase tracking-wider">
                          Somatic Welcome
                        </span>
                        <h2 className="text-xl font-serif font-black text-slate-800">
                          Salutations, Seeker
                        </h2>
                        <p className="text-xs text-slate-500 leading-relaxed italic">
                          "Your strength isn't defined by how much you can carry, but how tenderly you hold yourself."
                        </p>
                      </div>
                      
                      {/* Humanistic Avatar with shift */}
                      <div className="relative group shrink-0">
                        <div 
                          className="w-14 h-14 bg-gradient-to-tr from-primary-sage to-calm-blue flex items-center justify-center text-white text-lg font-bold animate-pulse-slow shadow-md"
                          style={{ borderRadius: "50% 50% 40% 60% / 55% 45% 55% 45%" }}
                        >
                          <User size={22} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white" />
                      </div>
                    </div>

                    {/* Two-Column Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Live Wellness Indicator */}
                      <div 
                        className="wellness-card p-6 bg-[#E1E7E2] flex items-center justify-between gap-4"
                        style={{ borderRadius: getMeltRadius("medium") }}
                      >
                        <div className="space-y-1 text-left">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                            Wellness Score
                          </span>
                          <h3 className="text-3xl font-extrabold tracking-tight text-slate-800 font-serif">
                            84%
                          </h3>
                          <span className="text-[10px] flex items-center gap-1 text-emerald-700 font-bold bg-green-50 px-2 py-0.5 rounded-md border border-green-100 inline-block w-fit">
                            <TrendingUp size={10} /> Optimal
                          </span>
                        </div>
                        {/* Dynamic Radial Ring styled organically */}
                        <div className="relative flex items-center justify-center">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="26" stroke="rgba(92,138,110,0.15)" strokeWidth="6" fill="transparent" />
                            <circle 
                              cx="32" 
                              cy="32" 
                              r="26" 
                              stroke="#5C8A6E" 
                              strokeWidth="6" 
                              fill="transparent" 
                              strokeDasharray="163" 
                              strokeDashoffset="26" 
                              strokeLinecap="round" 
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <span className="absolute text-xs font-bold text-slate-700">84</span>
                        </div>
                      </div>

                      {/* Flora Garden Progress */}
                      <div 
                        className="wellness-card p-6 bg-white border border-slate-100 flex items-center justify-between gap-4"
                        style={{ borderRadius: getMeltRadius("medium") }}
                      >
                        <div className="space-y-1 text-left">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                            Garden Canopy
                          </span>
                          <h3 className="text-3xl font-extrabold tracking-tight text-slate-800 font-serif flex items-center gap-1">
                            <span>Level 4</span>
                            <span className="text-xl">🌱</span>
                          </h3>
                          <span className="text-[10px] text-slate-500 block">
                            Next sprout in: 2 days
                          </span>
                        </div>
                        <div 
                          className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-rose-100 flex items-center justify-center shadow-inner"
                          style={{ borderRadius: "55% 45% 65% 35% / 40% 50% 50% 60%" }}
                        >
                          <Award size={22} className="text-indigo-600 animate-bounce" />
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Action Block */}
                    <div 
                      className="wellness-card p-6 bg-white border border-slate-100 text-left space-y-4"
                      style={{ borderRadius: getMeltRadius("large") }}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-[#5C8A6E]" />
                          <h4 className="text-sm font-bold text-slate-800 font-sans">
                            Somatic Recs
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-primary-sage bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                          Active Scheme
                        </span>
                      </div>

                      <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                        <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
                          <span className="text-sm shrink-0">🌞</span>
                          <p><strong>Sunlight Capture</strong>: Complete 3 minutes of somatic breathing under open light.</p>
                        </div>
                        <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
                          <span className="text-sm shrink-0">🍃</span>
                          <p><strong>Aura Breathing</strong>: Practice the Solfeggio soundscape in the Aura Lounge.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ========================================== */}
        {/* TAB 2: CONVERSATIONAL MIND MAP CHAT */}
        {/* ========================================== */}
        {activeTab === "mindmap" && (
          <motion.div
            key="tab-mindmap"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Control Deck Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-150">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-800">
                  Mind-Map Conversational Skeletons
                </h3>
                <p className="text-[11px] text-slate-500">
                  Instead of straight vertical rectangles, our chat skeleton represents organic bubbles connected via neural lines.
                </p>
              </div>
              <button
                onClick={() => setChatLoading(!chatLoading)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer ${
                  chatLoading 
                    ? "bg-[#5D6B52]/10 text-deep-sage border-deep-sage/20" 
                    : "bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-800"
                }`}
              >
                <RefreshCw size={12} className={chatLoading ? "animate-spin" : ""} />
                <span>State: {chatLoading ? "NEURAL PLASM SYSTEM" : "CONVERSATION ACTIVE"}</span>
              </button>
            </div>

            {/* Neural Chat Map Canvas */}
            <div className="w-full max-w-3xl mx-auto border border-slate-200 rounded-[32px] overflow-hidden bg-gradient-to-tr from-[#FAF8F4] to-[#f5f8f6] shadow-xl p-8 relative min-h-[460px] flex flex-col justify-between">
              
              {/* Decorative Neural Web lines overlay */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Left node connection */}
                  <path d="M 120 120 C 180 80, 240 180, 320 140 C 400 100, 480 250, 580 160" fill="none" stroke="#5C8A6E" strokeWidth="2" strokeDasharray="6,4" />
                  {/* Right node connection */}
                  <path d="M 200 320 C 280 280, 420 400, 520 310" fill="none" stroke="#5C8A6E" strokeWidth="1.5" strokeDasharray="4,4" />
                  {/* Spark pulse dot */}
                  <circle r="4" fill="#CCD9CD" className="animate-[ping_3s_infinite_ease-in-out]">
                    <animateMotion dur="8s" repeatCount="indefinite" path="M 120 120 C 180 80, 240 180, 320 140 C 400 100, 480 250, 580 160" />
                  </circle>
                  <circle r="3" fill="#5C8A6E" className="animate-pulse">
                    <animateMotion dur="11s" repeatCount="indefinite" path="M 200 320 C 280 280, 420 400, 520 310" />
                  </circle>
                </svg>
              </div>

              <div className="z-10 flex-1 flex flex-col justify-center space-y-6">
                <AnimatePresence mode="wait">
                  {chatLoading ? (
                    /* CHAT INTERACTIVE NEURAL PLASM SKELETON */
                    <motion.div
                      key="chat-loading-active"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-6"
                    >
                      {/* Incoming Companion Thought Blob (Left side) */}
                      <div className="flex gap-4 max-w-md items-start text-left">
                        {/* Shifting Irregular Blob Anchor */}
                        <NeuroBlobSkeleton sizeClass="w-11 h-11" speed="ambient" />
                        <div className="space-y-2.5 flex-1 pt-1">
                          <NeuroCardSkeleton className="p-4" glowStrength="subtle">
                            <NeuroTextSkeleton lines={2} widthClasses={["w-5/6", "w-11/12"]} heightClass="h-3" />
                          </NeuroCardSkeleton>
                          <span className="text-[10px] font-mono text-slate-400 block ml-1 select-none">
                            Calibrating neural frequencies...
                          </span>
                        </div>
                      </div>

                      {/* User response floating bubble (Right side) */}
                      <div className="flex gap-4 max-w-sm items-start ml-auto flex-row-reverse text-right">
                        <NeuroBlobSkeleton sizeClass="w-10 h-10 bg-indigo-150" speed="slow" />
                        <div className="space-y-2 flex-1 pt-1">
                          <NeuroCardSkeleton className="p-4 bg-slate-100" glowStrength="vibrant">
                            <NeuroTextSkeleton lines={1} widthClasses={["w-3/4 ml-auto"]} heightClass="h-3" />
                          </NeuroCardSkeleton>
                        </div>
                      </div>

                      {/* Mind Map Connection Node Point */}
                      <div className="flex justify-center items-center py-2 h-10 relative">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary-sage/30 to-transparent animate-pulse" />
                        <div className="relative w-7 h-7 bg-neuroplasm-glass border border-emerald-250/50 flex items-center justify-center animate-spin-slow" style={{ borderRadius: "50% 30% 60% 40% / 40% 60% 40% 60%" }}>
                          <Waves size={11} className="text-[#5C8A6E] animate-pulse" />
                        </div>
                      </div>

                    </motion.div>
                  ) : (
                    /* LIVE CONVERSATION COMPLETED */
                    <motion.div
                      key="chat-real-active"
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6 select-none"
                    >
                      {/* Companion Response */}
                      <div className="flex gap-4 max-w-md items-start text-left">
                        <div 
                          className="w-11 h-11 bg-gradient-to-tr from-primary-sage to-slate-200 flex items-center justify-center animate-neuro-blob pr-0.5 text-xs block shrink-0 font-bold text-emerald-800"
                          style={{ borderRadius: getMeltRadius("medium") }}
                        >
                          🧠
                        </div>
                        <div className="space-y-1">
                          <div 
                            className="bg-white border border-slate-150 p-4 shadow-xs"
                            style={{ borderRadius: "4px 24px 24px 24px" }}
                          >
                            <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                              "As you breathe through this moment, keep your focus on the cold resonance in your palms. This physical sensation triggers vagal pathways to pacify heart rates immediately."
                            </p>
                          </div>
                          <span className="text-[9px] font-mono text-muted-text block ml-1 flex items-center gap-1">
                            <span>Companion</span> • <span>Just now</span>
                          </span>
                        </div>
                      </div>

                      {/* User Bubble */}
                      <div className="flex gap-4 max-w-sm items-start ml-auto flex-row-reverse text-right">
                        <div 
                          className="w-10 h-10 bg-indigo-50 flex items-center justify-center text-xs text-indigo-800 shrink-0 font-black animate-pulse"
                          style={{ borderRadius: "50% 50% 35% 65% / 45% 45% 55% 55%" }}
                        >
                          👤
                        </div>
                        <div className="space-y-1">
                          <div 
                            className="bg-[#DDEFE2] border border-green-150 p-4 mr-0.5 shadow-xs"
                            style={{ borderRadius: "24px 4px 24px 24px" }}
                          >
                            <p className="text-xs text-[#2D3748] leading-relaxed font-bold">
                              "Thank you. Focusing on my deep breathing now. My chest feels considerably lighter already."
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chat action control mockup */}
              <div className="z-10 border-t border-slate-150 pt-4 flex gap-3 h-12 items-center">
                <input 
                  disabled
                  placeholder="Ask your organic companion anything..." 
                  className="flex-1 text-xs border border-slate-250 bg-white/70 px-4 py-2.5 rounded-full select-none outline-none"
                />
                <button 
                  disabled
                  className="bg-slate-900 h-9 w-9 text-white hover:bg-slate-800 rounded-full flex items-center justify-center shrink-0"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* ========================================== */}
        {/* TAB 3: COMPLETE MORPH SANDBOX */}
        {/* ========================================== */}
        {activeTab === "sandbox" && (
          <motion.div
            key="tab-sandbox"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Control Panel (Columns - 5) */}
            <div className="lg:col-span-5 wellness-card p-6 bg-white border border-slate-100 space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Settings size={18} className="text-[#5C8A6E]" />
                <h3 className="text-sm font-bold text-slate-800 font-sans">
                  Neuroplasm Controller
                </h3>
              </div>

              {/* Slider 1: Pulse Shimmer Rate */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-600">Gradient Cycle Pace</label>
                  <span className="font-mono text-primary-sage font-bold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                    {pulseSpeed}s
                  </span>
                </div>
                <input 
                  type="range"
                  min="2"
                  max="16"
                  value={pulseSpeed}
                  onChange={(e) => setPulseSpeed(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-[10px] text-slate-400 block leading-tight">
                  Alters the speed of the liquid lavender and teal pearl gradient flow.
                </span>
              </div>

              {/* Slider 2: Shape Deform rate */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-600">Organic Blur Radius</label>
                  <span className="font-mono text-[#5C8A6E] font-bold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                    {glassBlur}px
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="24"
                  value={glassBlur}
                  onChange={(e) => setGlassBlur(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-[10px] text-slate-400 block leading-tight">
                  Tweak the backdrop filter blur representing cell wall density.
                </span>
              </div>

              {/* Intensity level toggles */}
              <div className="space-y-2 text-left">
                <label className="block text-xs font-bold text-slate-600">
                  Organic Melt Intensity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["standard", "highly-fluid", "liquid"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setMeltIntensity(level)}
                      className={`py-1.5 px-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        meltIntensity === level 
                          ? "bg-primary-sage/10 text-primary-sage border-primary-sage/20" 
                          : "bg-slate-50 text-slate-500 border-slate-150 hover:bg-slate-100"
                      }`}
                    >
                      {level.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Philosophy Explainer */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <p className="font-bold flex items-center gap-1.5 text-[#5C8A6E]">
                  <HelpCircle size={14} /> Fluid Paradigm
                </p>
                <p className="leading-relaxed">
                  Most design systems utilize gray rectangular panels to model layout items. <strong className="text-slate-800">Neuroplasm UX</strong> leverages asymmetrical borders that gently shift over time, mimicking natural structures for enhanced somatic warmth.
                </p>
              </div>
            </div>

            {/* Render Sandbox Preview (Columns - 7) */}
            <div className="lg:col-span-7 flex flex-col justify-between items-center p-6 bg-slate-[#F8F9FA] rounded-[28px] border border-slate-150 shadow-inner relative overflow-hidden min-h-[460px] bg-slate-50/20">
              
              <div className="absolute top-4 left-4 flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase">
                <Activity size={10} /> Reactive Sandbox Stage
              </div>

              {/* Component Preview Block */}
              <div className="my-auto w-full max-w-md space-y-6">
                
                {/* 1. Sandbox Blob */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="neuro-plasma-glow animate-neuro-blob flex items-center justify-center shadow-lg transition-all"
                    style={{
                      width: "110px",
                      height: "110px",
                      animationDuration: `${blobSpeed}s`,
                      animationName: "neuro-blob-shape",
                      backdropFilter: `blur(${glassBlur}px)`,
                      backgroundSize: `${pulseSpeed * 50}% ${pulseSpeed * 50}%`,
                      borderRadius: getMeltRadius("large"),
                    }}
                  >
                    <Waves className="text-emerald-700 animate-pulse" size={26} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    NeuroBlobSkeleton
                  </span>
                </div>

                {/* 2. Custom sandbox text panel */}
                <div 
                  className="p-5 bg-neuroplasm-glass border text-left space-y-3 shadow-md"
                  style={{
                    borderRadius: getMeltRadius("medium"),
                    backdropFilter: `blur(${glassBlur}px)`,
                  }}
                >
                  <div className="w-1/4 h-3.5 neuro-plasma-glow" style={{ borderRadius: getMeltRadius("small") }} />
                  <div className="space-y-1.5">
                    <div className="w-11/12 h-2.5 neuro-plasma-glow" style={{ borderRadius: getMeltRadius("small") }} />
                    <div className="w-5/6 h-2.5 neuro-plasma-glow" style={{ borderRadius: getMeltRadius("small") }} />
                    <div className="w-2/3 h-2.5 neuro-plasma-glow" style={{ borderRadius: getMeltRadius("small") }} />
                  </div>
                </div>

                {/* Live styling stats code indicator */}
                <div className="bg-slate-900 rounded-2xl p-4 text-left font-mono text-[10px] text-green-300 shadow-xl select-all">
                  <span className="text-slate-400">// Dynamic inline stylesheet computed</span><br />
                  <span className="text-slate-200">.neuroplasm-node</span> {"{"}<br />
                  &nbsp;&nbsp;border-radius: <span className="text-orange-300">{getMeltRadius("medium")}</span>;<br />
                  &nbsp;&nbsp;backdrop-filter: <span className="text-orange-300">blur({glassBlur}px)</span>;<br />
                  &nbsp;&nbsp;animation-duration: <span className="text-orange-300">{pulseSpeed}s</span>;<br />
                  &nbsp;&nbsp;gradient-flow: <span className="text-pink-300">lavender, teal, pearl</span>;<br />
                  {"}"}
                </div>

              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
