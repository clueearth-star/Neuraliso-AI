import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Wind, 
  Moon, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck, 
  Bot, 
  Brain, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from "recharts";
import { storage } from "../lib/storage";
import { sounds } from "../lib/sounds";
import { detectMoodPatterns, PatternInsight } from "../lib/insights";
import { analyzeSentiment } from "../lib/sentiment";
import { MoodEntry } from "../types";

export const InsightsView: React.FC = () => {
  const navigate = useNavigate();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [tagStats, setTagStats] = useState<{ tag: string; count: number }[]>([]);
  const [overallSentiment, setOverallSentiment] = useState<{ positive: number; neutral: number; negative: number }>({
    positive: 0,
    neutral: 0,
    negative: 0,
  });

  const reloadData = () => {
    const data = storage.getMoods();
    setMoods(data);

    // Detect patterns
    const detected = detectMoodPatterns(data);
    setInsights(detected);

    // Tag counts
    const counts: Record<string, number> = {};
    let pos = 0, neu = 0, neg = 0;

    data.forEach((m) => {
      (m.tags || []).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });

      // Analyze sentiment of notes if available
      if (m.note) {
        const res = analyzeSentiment(m.note);
        if (res.label === "Positive") pos++;
        else if (res.label === "Negative") neg++;
        else neu++;
      } else {
        if (m.score >= 4) pos++;
        else if (m.score <= 2) neg++;
        else neu++;
      }
    });

    const formattedTags = Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    setTagStats(formattedTags);

    const total = Math.max(1, pos + neu + neg);
    setOverallSentiment({
      positive: Math.round((pos / total) * 100),
      neutral: Math.round((neu / total) * 100),
      negative: Math.round((neg / total) * 100),
    });
  };

  useEffect(() => {
    reloadData();
  }, []);

  const getInsightIcon = (iconName: string) => {
    switch (iconName) {
      case "wind":
        return <Wind className="w-6 h-6 text-[#00d4ff]" />;
      case "moon":
        return <Moon className="w-6 h-6 text-indigo-400" />;
      case "refresh":
        return <RefreshCw className="w-6 h-6 text-[#00b8a9]" />;
      case "sparkles":
        return <Sparkles className="w-6 h-6 text-amber-400" />;
      default:
        return <TrendingUp className="w-6 h-6 text-emerald-400" />;
    }
  };

  const COLORS = ["#00d4ff", "#00b8a9", "#fbbf24", "#f43f5e", "#a855f7", "#3b82f6"];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 pb-28 md:pb-12 animate-page-in text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <Brain className="w-3.5 h-3.5" />
            <span>Pattern Recognition &amp; Trends</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Emotional Insights
          </h1>
          <p className="text-sm sm:text-base text-white/60">
            Smart pattern detection calculated locally on your device to surface actionable mental wellness trends.
          </p>
        </div>

        {/* Local privacy badge */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Device-Local Pattern Engine</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wellness-card p-5 space-y-1">
          <p className="text-xs text-white/50 font-medium">Check-ins Analyzed</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{moods.length}</span>
            <span className="text-xs text-emerald-400 font-bold">Total logs</span>
          </div>
        </div>

        <div className="wellness-card p-5 space-y-1">
          <p className="text-xs text-white/50 font-medium">Top Emotion Tag</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#00d4ff]">
              {tagStats[0]?.tag || "None yet"}
            </span>
            {tagStats[0] && (
              <span className="text-xs text-white/40">({tagStats[0].count}x)</span>
            )}
          </div>
        </div>

        <div className="wellness-card p-5 space-y-1">
          <p className="text-xs text-white/50 font-medium">Dominant Sentiment</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-amber-400">
              {overallSentiment.positive >= overallSentiment.negative ? "Uplifting / Calm" : "Tense / Heavy"}
            </span>
          </div>
        </div>

        <div className="wellness-card p-5 space-y-1">
          <p className="text-xs text-white/50 font-medium">Privacy Status</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold pt-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero Server Logs</span>
          </div>
        </div>
      </div>

      {/* Pattern Recommendations Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#00d4ff]" />
          <span>Surfaced Wellness Trends</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight) => (
            <div 
              key={insight.id}
              className={`wellness-card p-6 space-y-5 border-l-4 transition-all duration-300 hover:scale-102 ${
                insight.severity === "warning" 
                  ? "border-l-amber-400 bg-gradient-to-br from-[#111A2E] via-[#162138] to-amber-950/20"
                  : insight.severity === "success"
                  ? "border-l-emerald-400 bg-gradient-to-br from-[#111A2E] via-[#162138] to-emerald-950/20"
                  : "border-l-[#00d4ff] bg-gradient-to-br from-[#111A2E] via-[#162138] to-[#00d4ff]/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                    {getInsightIcon(insight.icon)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{insight.title}</h3>
                    <p className="text-xs text-white/40">Pattern Detection Algorithm</p>
                  </div>
                </div>

                {insight.severity === "warning" && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Trend Alert
                  </span>
                )}
              </div>

              <p className="text-sm text-white/80 leading-relaxed">
                {insight.description}
              </p>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/10">
                <span className="text-[11px] text-white/40 font-mono">
                  Calculated from user history
                </span>
                <button
                  onClick={() => {
                    sounds.playClick();
                    navigate(insight.actionRoute, { state: insight.actionParams });
                  }}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#00d4ff]/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{insight.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Emotion Tag Frequency Bar Chart */}
        <div className="lg:col-span-7 wellness-card p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00d4ff]" />
              <span>Emotion Tag Frequency Breakdown</span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">Most common emotional tags selected during check-ins</p>
          </div>

          {tagStats.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagStats.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <YAxis dataKey="tag" type="category" stroke="rgba(255,255,255,0.8)" fontSize={12} width={80} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#1A2338] border border-white/20 p-2.5 rounded-xl text-xs space-y-1">
                            <p className="font-bold text-white">{payload[0].payload.tag}</p>
                            <p className="text-[#00d4ff]">Frequency: {payload[0].value} times</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {tagStats.slice(0, 6).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-white/40 border border-dashed border-white/10 rounded-2xl">
              Log a few mood check-ins to view emotional tag analytics.
            </div>
          )}
        </div>

        {/* AI Transparency Card */}
        <div className="lg:col-span-5 wellness-card p-6 space-y-6 border border-[#00d4ff]/20 bg-gradient-to-br from-[#111A2E] via-[#16223B] to-[#00d4ff]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Local AI Architecture</h3>
              <p className="text-xs text-[#00d4ff]">Transparent &amp; Private</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-white/70 leading-relaxed">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="font-bold text-white">1. Sentiment Engine (Local Browser)</p>
              <p className="text-white/60">Tokenizes reflection text and calculates emotion valence on your device. 0 bytes sent to external servers.</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="font-bold text-white">2. Pattern Recognition (Local Browser)</p>
              <p className="text-white/60">Evaluates timestamps, tags, and frequency rules stored in local storage to surface proactive suggestions.</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <p className="font-bold text-white">3. Optional CBT AI Companion (Cloud)</p>
              <p className="text-white/60">Powered by Google Gemini 3.6 Flash statelessly via server proxy with a Zero Data Retention policy.</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              navigate("/app/chat");
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-xs hover:scale-102 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Chat with AI CBT Coach</span>
          </button>
        </div>
      </div>
    </div>
  );
};
