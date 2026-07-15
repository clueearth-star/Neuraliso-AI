import React, { useState } from "react";
import { JournalEntry } from "../types";
import { HistoryIcon, AnalyticsIcon } from "./Icons";

interface AnalyticsProps {
  entries: JournalEntry[];
}

export const AnalyticsView: React.FC<AnalyticsProps> = ({ entries }) => {
  const [selectedStatPeriod, setSelectedStatPeriod] = useState<"week" | "month">("week");

  // Mock initial seed logs if history database is empty
  const defaultEntries: JournalEntry[] = [
    { id: "1", date: "Mon", mood: "neutral", stress: 4, energy: 6, note: "A calm, steady Monday.", actionPlan: [] },
    { id: "2", date: "Tue", mood: "anxious", stress: 7, energy: 4, note: "High stress before meeting.", actionPlan: [] },
    { id: "3", date: "Wed", mood: "sad", stress: 5, energy: 3, note: "Restless sleep, feeling blue.", actionPlan: [] },
    { id: "4", date: "Thu", mood: "overwhelmed", stress: 8, energy: 5, note: "Tight deadlines.", actionPlan: [] },
    { id: "5", date: "Fri", mood: "happy", stress: 2, energy: 8, note: "Uplifting forest walk.", actionPlan: [] },
    { id: "6", date: "Sat", mood: "neutral", stress: 3, energy: 7, note: "Spent quiet time reading.", actionPlan: [] },
    { id: "7", date: "Sun", mood: "happy", stress: 1, energy: 9, note: "Perfect self-care routine.", actionPlan: [] }
  ];

  const activeEntries = entries.length > 0 ? entries : defaultEntries;

  // Mood scores mapped for trend line
  const moodScore = {
    happy: 5,
    neutral: 4,
    lonely: 3,
    sad: 2,
    anxious: 2,
    overwhelmed: 1
  };

  // 1. Calculate Mood distribution metrics
  const moodDistribution = activeEntries.reduce((acc, curr) => {
    const m = curr.mood;
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalLogs = activeEntries.length;

  // Categories card details
  const cardsInfo = [
    { key: "happy", label: "Happy", color: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
    { key: "neutral", label: "Calm", color: "bg-primary-sage", text: "text-deep-sage", bg: "bg-soft-green/30" },
    { key: "anxious", label: "Anxiety", color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
    { key: "sad", label: "Sad", color: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
    { key: "lonely", label: "Lonely", color: "bg-purple-500", text: "text-purple-700", bg: "bg-purple-50" },
    { key: "overwhelmed", label: "Overwhelmed", color: "bg-danger-red", text: "text-danger-red", bg: "bg-light-red" }
  ];

  // 2. Generate line chart SVG coordinates
  // Width 400, Height 150. Margins: left 30, right 20, top 20, bottom 20.
  const chartWidth = 400;
  const chartHeight = 150;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 25;

  const pointsCount = activeEntries.length;
  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const linePoints = activeEntries.map((e, index) => {
    const x = paddingLeft + (index / Math.max(1, pointsCount - 1)) * usableWidth;
    const score = moodScore[e.mood as keyof typeof moodScore] || 3;
    // Score range 1 to 5 maps to chart heights
    const y = paddingTop + usableHeight - ((score - 1) / 4) * usableHeight;
    return { x, y, label: e.date, score, mood: e.mood };
  });

  const pathD = linePoints.length > 0 
    ? `M ${linePoints[0].x} ${linePoints[0].y} ` + linePoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";

  // Helper filled area path
  const areaD = linePoints.length > 0
    ? `${pathD} L ${linePoints[linePoints.length - 1].x} ${chartHeight - paddingBottom} L ${linePoints[0].x} ${chartHeight - paddingBottom} Z`
    : "";

  return (
    <div id="analytics-view-container" className="pb-24 space-y-6 max-w-xl mx-auto px-1 animate-fade-in">
      
      {/* Header and Period switcher */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <h2 className="text-3xl font-serif italic text-dark-text">Analytics Summary</h2>
          <p className="text-xs text-muted-text">A holistic tracking of your emotional weather</p>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-ivory-bg border rounded-full text-xs font-medium">
          <button
            onClick={() => setSelectedStatPeriod("week")}
            className={`px-3 py-1.5 rounded-full transition-all ${selectedStatPeriod === "week" ? "bg-white text-deep-sage shadow-xs" : "text-muted-text"}`}
          >
            Last Week
          </button>
          <button
            onClick={() => setSelectedStatPeriod("month")}
            className={`px-3 py-1.5 rounded-full transition-all ${selectedStatPeriod === "month" ? "bg-white text-deep-sage shadow-xs" : "text-muted-text"}`}
          >
            Month View
          </button>
        </div>
      </div>

      {/* 1. MOOD TRENDS LINE GRAPH - Beautiful custom mapped SVG */}
      <div className="wellness-card p-5 border bg-white space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-xs font-semibold text-deep-sage bg-soft-green/30 px-3 py-1 rounded-full">
            <AnalyticsIcon size={14} />
            <span>Mood Trend Frequency</span>
          </div>
          <span className="text-[10px] font-mono text-muted-text">LOCAL STORAGE GRAPH</span>
        </div>

        {/* Mapped SVG line chart */}
        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
            <defs>
              <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8AB49C" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#8AB49C" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal guidelines */}
            {[0, 1, 2, 3, 4].map((gridLineScore) => {
              const y = paddingTop + usableHeight - (gridLineScore / 4) * usableHeight;
              const labels = ["Low", "Sad", "Neutral", "Reflective", "Radiant"];
              return (
                <g key={gridLineScore} className="opacity-30">
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={chartWidth - paddingRight} 
                    y2={y} 
                    stroke="#5C8A6E" 
                    strokeWidth="0.8" 
                    strokeDasharray="3 3" 
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={y + 3} 
                    fontSize="8" 
                    fontFamily="monospace" 
                    fill="#718096" 
                    textAnchor="end"
                  >
                    {labels[gridLineScore]}
                  </text>
                </g>
              );
            })}

            {/* SVG Mapped Path Area & Line */}
            {pathD && (
              <>
                <path d={areaD} fill="url(#areaGlow)" />
                <path d={pathD} fill="none" stroke="#5C8A6E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}

            {/* Coordinate Node Points */}
            {linePoints.map((pt, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="4.5" 
                  fill="#ffffff" 
                  stroke="#3D6B52" 
                  strokeWidth="2.2" 
                />
                
                {/* Micro hover indicator tool */}
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="9" 
                  className="opacity-0 hover:opacity-20 fill-primary-sage transition-all" 
                />
                
                {/* Horizontal x labels */}
                <text 
                  x={pt.x} 
                  y={chartHeight - 6} 
                  fontSize="8" 
                  fontFamily="sans-serif" 
                  fill="#718096" 
                  textAnchor="middle"
                  className="font-semibold"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* 2. PIE CHART DISTRIBUTION & CARDS MAP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Ring Chart Distribution */}
        <div className="wellness-card p-5 border bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-dark-text tracking-wide mb-1">Mood Distribution Breakdown</h3>
            <p className="text-[10px] text-muted-text">Frequency of logged state profiles</p>
          </div>

          <div className="flex items-center justify-around py-4">
            
            {/* Custom Pie-style Donut display */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-24 h-24 transform -rotate-90">
                {/* Solid gray background track */}
                <circle cx="20" cy="20" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="3.2" />
                
                {/* Primary Sage Segment: representing calm & happy days (mocked ratio 65%) */}
                <circle 
                  cx="20" 
                  cy="20" 
                  r="15.915" 
                  fill="none" 
                  stroke="#5C8A6E" 
                  strokeWidth="3.8" 
                  strokeDasharray="65 100" 
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />

                {/* Sky blue anx segment (mock ratio 25%) */}
                <circle 
                  cx="20" 
                  cy="20" 
                  r="15.915" 
                  fill="none" 
                  stroke="#A8D5F2" 
                  strokeWidth="3.8" 
                  strokeDasharray="25 100" 
                  strokeDashoffset="-65"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute text-center">
                <span className="text-lg font-bold text-dark-text font-serif italic">90%</span>
                <span className="text-[8px] text-muted-text block uppercase">Balanced</span>
              </div>
            </div>

            {/* Legends list */}
            <div className="text-[10px] space-y-1.5 font-sans">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-sage block" />
                <span>Calm / Radiant (65%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-calm-blue block" />
                <span>Tension / Worry (25%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300 block" />
                <span>Other frequencies (10%)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Summary category density tracker */}
        <div className="wellness-card p-5 border bg-white space-y-4">
          <h3 className="text-xs font-semibold text-dark-text tracking-wide">Biological Frequency States</h3>
          
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {cardsInfo.map((card) => {
              const count = moodDistribution[card.key] || 0;
              return (
                <div key={card.key} className={`p-2 rounded-xl border border-soft-green/10 ${card.bg}`}>
                  <span className="text-muted-text block">{card.label}</span>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`font-bold ${card.text}`}>{count} session{count !== 1 ? "s" : ""}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-sage/40" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. HISTORY TIMELINE LOGS */}
      <div className="wellness-card p-5 border bg-white space-y-3">
        <div className="flex justify-between items-center border-b pb-2">
          <div className="flex items-center gap-1 text-xs font-semibold text-deep-sage">
            <HistoryIcon size={14} />
            <span>Comprehensive Wellness Journal History</span>
          </div>
          <span className="text-[10px] text-muted-text font-mono">ALL SECURE RECOVERY</span>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {activeEntries.slice().reverse().map((entry) => (
            <div key={entry.id} className="p-3 bg-ivory-bg rounded-xl border border-soft-green/10 hover:border-soft-green/30 transition-all text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="capitalize font-bold text-dark-text">{entry.mood} state check</span>
                  <span className="text-[9px] bg-soft-green text-deep-sage px-1.5 py-0.5 rounded-full font-semibold">Logged</span>
                </div>
                <span className="text-[9px] text-muted-text font-mono">{entry.date}</span>
              </div>
              <p className="text-muted-text mt-1.5 text-[11px] leading-relaxed truncate-2">{entry.note || "Logged today's emotional weather. Rested and focused."}</p>
              
              {entry.actionPlan && entry.actionPlan.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {entry.actionPlan.map((p, pIdx) => (
                    <span key={pIdx} className="bg-white/80 border text-[9px] text-primary-sage font-medium px-2 py-0.5 rounded-full">
                      ✓ {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
