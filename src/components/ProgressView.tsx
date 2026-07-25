import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  Tag, 
  Download, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { storage } from "../lib/storage";
import { sounds } from "../lib/sounds";
import { MoodEntry } from "../types";

export const ProgressView: React.FC = () => {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    setMoods(storage.getMoods());
    setChartData(storage.getWeeklyMoodChart());
    setStreak(storage.getStreak());
  }, []);

  // Compute stats
  const totalCheckIns = moods.length;
  
  let avgScore = 0;
  let avgEmoji = "😐";
  if (totalCheckIns > 0) {
    const sum = moods.reduce((acc, m) => acc + m.score, 0);
    avgScore = Number((sum / totalCheckIns).toFixed(1));
    if (avgScore >= 4.5) avgEmoji = "😊";
    else if (avgScore >= 3.5) avgEmoji = "🙂";
    else if (avgScore >= 2.5) avgEmoji = "😐";
    else if (avgScore >= 1.5) avgEmoji = "😕";
    else avgEmoji = "😢";
  }

  // Mood distribution for Pie Chart
  const distributionMap = {
    Great: { count: 0, color: "#10b981", label: "Great (5)" },
    Good: { count: 0, color: "#00d4ff", label: "Good (4)" },
    Okay: { count: 0, color: "#f59e0b", label: "Okay (3)" },
    Down: { count: 0, color: "#6366f1", label: "Down (2)" },
    Sad: { count: 0, color: "#f43f5e", label: "Sad (1)" },
  };

  moods.forEach((m) => {
    if (m.score === 5) distributionMap.Great.count++;
    else if (m.score === 4) distributionMap.Good.count++;
    else if (m.score === 3) distributionMap.Okay.count++;
    else if (m.score === 2) distributionMap.Down.count++;
    else if (m.score === 1) distributionMap.Sad.count++;
  });

  const pieData = Object.values(distributionMap).filter((d) => d.count > 0);

  // Most common tags
  const tagCounts: Record<string, number> = {};
  moods.forEach((m) => {
    (m.tags || []).forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // This week vs last week
  const now = Date.now();
  const oneWeekMs = 7 * 86400000;
  const thisWeekMoods = moods.filter((m) => now - m.timestamp <= oneWeekMs);
  const lastWeekMoods = moods.filter((m) => now - m.timestamp > oneWeekMs && now - m.timestamp <= 2 * oneWeekMs);

  const thisWeekAvg = thisWeekMoods.length > 0 
    ? Number((thisWeekMoods.reduce((s, m) => s + m.score, 0) / thisWeekMoods.length).toFixed(1)) 
    : 0;
  const lastWeekAvg = lastWeekMoods.length > 0 
    ? Number((lastWeekMoods.reduce((s, m) => s + m.score, 0) / lastWeekMoods.length).toFixed(1)) 
    : 0;

  const diff = Number((thisWeekAvg - lastWeekAvg).toFixed(1));

  const handleExportJSON = () => {
    sounds.playSuccess();
    const jsonStr = storage.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `neuraliso-wellness-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 pb-28 md:pb-12 animate-page-in text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Emotional Metrics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Progress &amp; Insights
          </h1>
          <p className="text-sm sm:text-base text-white/60">
            Check in a few times and we&apos;ll show you patterns. Everything is stored privately on your device.
          </p>
        </div>

        {/* Export JSON Button */}
        <button
          onClick={handleExportJSON}
          className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#00d4ff]" />
          <span>{downloaded ? "Exported!" : "Export Data (JSON)"}</span>
        </button>
      </div>

      {/* Top Cards: Summary & Streak & This vs Last week */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly summary card */}
        <div className="wellness-card p-6 sm:p-8 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">Overall Summary</span>
            <span className="text-3xl">{avgEmoji}</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">
              You&apos;ve checked in <span className="text-[#00d4ff]">{totalCheckIns}</span> {totalCheckIns === 1 ? "time" : "times"}.
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Average mood score: <strong className="text-white font-mono">{avgScore > 0 ? `${avgScore} / 5` : "N/A"}</strong>
            </p>
          </div>
        </div>

        {/* Streak card */}
        <div className="wellness-card p-6 sm:p-8 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">Consistency</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4 fill-current animate-bounce" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">
              <span className="text-amber-400">{streak}</span> {streak === 1 ? "day streak" : "days streak"}
            </h3>
            <p className="text-xs text-white/60 mt-1">
              {streak > 0 ? "You're building a healthy habit." : "Start your streak with a check-in today."}
            </p>
          </div>
        </div>

        {/* This week vs last week card */}
        <div className="wellness-card p-6 sm:p-8 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">Week vs Last Week</span>
            {diff >= 0 ? (
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white font-mono">
                {thisWeekAvg > 0 ? `${thisWeekAvg}` : "0.0"}
              </span>
              <span className="text-xs text-white/50">vs {lastWeekAvg > 0 ? lastWeekAvg : "0.0"} last week</span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {diff > 0 
                ? `Up by +${diff} points this week!` 
                : diff < 0 
                ? `Down by ${diff} points. Be gentle with yourself.` 
                : "Steady emotional balance."}
            </p>
          </div>
        </div>
      </div>

      {/* 2 Chart Section: Line Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Line chart of mood scores over time (7 Cols) */}
        <div className="lg:col-span-7 wellness-card p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
              <span>Mood Score Over Time (Last 7 Days)</span>
            </h2>
            <p className="text-xs text-white/50 mt-0.5">Scale: 1 (Sad) to 5 (Great)</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const val = payload[0].value;
                      return (
                        <div className="bg-[#1A2338] border border-white/20 p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white">{label}</p>
                          <p className="text-[#00d4ff]">
                            Score: {val !== null ? `${val} / 5` : "No entry"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#00d4ff" strokeWidth={3} dot={{ r: 6, fill: "#00d4ff" }} activeDot={{ r: 8 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood distribution pie chart (5 Cols) */}
        <div className="lg:col-span-5 wellness-card p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-400" />
              <span>Mood Distribution</span>
            </h2>
            <p className="text-xs text-white/50 mt-0.5">Breakdown of all your check-ins</p>
          </div>

          {pieData.length === 0 ? (
            <div className="py-12 text-center text-white/40 text-xs">
              No mood check-ins recorded yet. Log your first check-in to see pie chart breakdown.
            </div>
          ) : (
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="label"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#1A2338] border border-white/20 p-2.5 rounded-lg shadow-xl text-xs font-bold text-white">
                            {d.label}: {d.count} {d.count === 1 ? "time" : "times"}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Most Common Tags */}
      <div className="wellness-card p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-teal-400" />
            <span>Most Common Emotional Tags</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">Frequently logged themes in your check-ins</p>
        </div>

        {sortedTags.length === 0 ? (
          <div className="py-6 text-center text-white/40 text-xs bg-white/5 rounded-2xl">
            No emotional tags selected in your check-ins yet.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {sortedTags.map(([tag, count], idx) => (
              <div
                key={tag}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm font-bold text-white">#{tag}</span>
                <span className="text-xs font-mono font-bold bg-[#00d4ff]/20 text-[#00d4ff] px-2 py-0.5 rounded-full">
                  {count} {count === 1 ? "time" : "times"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
