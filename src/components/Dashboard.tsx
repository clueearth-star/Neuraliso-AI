import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Smile, 
  Wind, 
  Moon, 
  RefreshCw, 
  Flame, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Sparkles,
  Bot,
  MessageCircle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts";
import { storage } from "../lib/storage";
import { sounds } from "../lib/sounds";
import { ActivityLog } from "../types";
import { useAuth } from "../contexts/AuthContext";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [onboarding] = useState(storage.getOnboarding());
  const [streak, setStreak] = useState(0);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [latestMood, setLatestMood] = useState(storage.getMoods()[0]);
  const [selectedQuickMood, setSelectedQuickMood] = useState<number | null>(null);

  const reloadData = () => {
    setStreak(storage.getStreak());
    setActivities(storage.getActivities().slice(0, 5));
    setChartData(storage.getWeeklyMoodChart());
    setLatestMood(storage.getMoods()[0]);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const emojis = [
    { score: 1, emoji: "😢", label: "Sad" },
    { score: 2, emoji: "😕", label: "Down" },
    { score: 3, emoji: "😐", label: "Okay" },
    { score: 4, emoji: "🙂", label: "Good" },
    { score: 5, emoji: "😊", label: "Great" },
  ];

  const handleQuickMood = (item: typeof emojis[0]) => {
    sounds.playSuccess();
    setSelectedQuickMood(item.score);
    storage.saveMood({
      score: item.score,
      emoji: item.emoji,
      label: item.label,
      tags: ["Quick Check-in"],
      note: "Logged from Dashboard quick check",
    });
    reloadData();
    setTimeout(() => {
      setSelectedQuickMood(null);
    }, 2000);
  };

  const getActivityIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "mood": return <Smile className="w-4 h-4 text-amber-400" />;
      case "breathe": return <Wind className="w-4 h-4 text-[#00d4ff]" />;
      case "sleep": return <Moon className="w-4 h-4 text-indigo-400" />;
      case "reframe": return <RefreshCw className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 pb-28 md:pb-12 animate-page-in">
      {/* 1. Welcome Greeting & Gentle Streak Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-[#111A2E] to-[#1A2338] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#00d4ff]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Grounding Space</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || onboarding.name || "friend"}.
          </h1>
          <p className="text-sm sm:text-base text-white/60">
            Take a deep breath. You are in a safe, judgment-free space.
          </p>
        </div>

        {/* Gentle Streak Card */}
        <div className="flex items-center gap-4 bg-black/30 border border-amber-500/30 px-5 py-4 rounded-2xl z-10 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-6 h-6 fill-current animate-bounce" style={{ animationDuration: "3s" }} />
          </div>
          <div>
            <div className="text-xl font-bold text-white flex items-baseline gap-1">
              <span>{streak}</span>
              <span className="text-sm font-normal text-white/60">{streak === 1 ? "day streak" : "days streak"}</span>
            </div>
            <p className="text-xs text-amber-200/80">
              {streak > 0 ? "You're showing up for yourself." : "Every moment of check-in counts."}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Today's mood quick-check */}
      <div className="wellness-card p-6 sm:p-8 text-center space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">How are you feeling today?</h2>
          <p className="text-xs sm:text-sm text-white/60">
            Tap an emoji to record an instant check-in, or open full journal.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap pt-2">
          {emojis.map((item) => {
            const isSelected = selectedQuickMood === item.score;
            return (
              <button
                key={item.score}
                onClick={() => handleQuickMood(item)}
                className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-[#00d4ff]/20 border border-[#00d4ff] scale-110 shadow-lg shadow-[#00d4ff]/20"
                    : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105"
                }`}
              >
                <span className="text-3xl sm:text-4xl block transition-transform group-hover:scale-110">{item.emoji}</span>
                <span className="text-xs font-semibold text-white/80">{item.label}</span>
              </button>
            );
          })}
        </div>

        {selectedQuickMood && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold animate-page-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Mood recorded! Great job checking in with yourself.</span>
          </div>
        )}

        <div className="pt-2">
          <Link
            to="/app/mood"
            onClick={() => sounds.playClick()}
            className="text-xs font-bold text-[#00d4ff] hover:text-[#00b8a9] inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Open full mood check-in with notes &amp; tags</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* AI Companion Banner Card */}
      <div 
        onClick={() => {
          sounds.playClick();
          navigate("/app/chat", { 
            state: { 
              initialPrompt: latestMood 
                ? `I'm checking in. I recently felt ${latestMood.label} (${latestMood.emoji})` 
                : "Hi, I'd like to talk to my wellness companion today." 
            } 
          });
        }}
        className="wellness-card p-6 sm:p-8 bg-gradient-to-r from-[#131C31] via-[#112338] to-[#00d4ff]/10 border border-[#00d4ff]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#00d4ff] transition-all duration-300 group cursor-pointer shadow-lg shadow-[#00d4ff]/10"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#00d4ff]/20 border border-[#00d4ff]/40 flex items-center justify-center text-[#00d4ff] shrink-0 group-hover:scale-110 transition-transform">
            <Bot className="w-7 h-7" />
          </div>
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00d4ff]/15 text-[#00d4ff] text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>24/7 AI Wellness Companion</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Talk to your companion
            </h3>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl">
              {latestMood 
                ? `You recently checked in feeling ${latestMood.emoji} ${latestMood.label}. Want to explore thoughts, try a CBT reframe, or hear a calming story?`
                : "Your supportive wellness coach is right here to listen without judgment, walk through CBT exercises, or help you relax."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#0088ff] text-[#0B1121] font-extrabold text-xs shrink-0 shadow-md shadow-[#00d4ff]/25 group-hover:scale-105 transition-all">
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Open AI Coach</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Four Tool Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Your Wellness Tools</h2>
          <span className="text-xs text-white/50">Pick what you need right now</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Mood Check */}
          <Link
            to="/app/mood"
            onClick={() => sounds.playClick()}
            className="wellness-card p-6 flex flex-col justify-between h-52 group cursor-pointer"
          >
            <div className="space-y-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Mood Check-in</h3>
                <p className="text-xs text-white/60 mt-1">Log emotions, tags &amp; private reflection notes.</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Start journal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Breathe */}
          <Link
            to="/app/breathe"
            onClick={() => sounds.playClick()}
            className="wellness-card p-6 flex flex-col justify-between h-52 group cursor-pointer"
          >
            <div className="space-y-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff] group-hover:scale-110 transition-transform">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Guided Breathing</h3>
                <p className="text-xs text-white/60 mt-1">Box breathing, 4-7-8 sleep rhythm &amp; slow grounding.</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs font-bold text-[#00d4ff] group-hover:translate-x-1 transition-transform">
              <span>Breathe now</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Sleep */}
          <Link
            to="/app/sleep"
            onClick={() => sounds.playClick()}
            className="wellness-card p-6 flex flex-col justify-between h-52 group cursor-pointer"
          >
            <div className="space-y-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sleep Sounds</h3>
                <p className="text-xs text-white/60 mt-1">Rain, brown noise, white noise &amp; theta beats.</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>Listen &amp; rest</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Reframe */}
          <Link
            to="/app/reframe"
            onClick={() => sounds.playClick()}
            className="wellness-card p-6 flex flex-col justify-between h-52 group cursor-pointer"
          >
            <div className="space-y-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Thought Reframe</h3>
                <p className="text-xs text-white/60 mt-1">4-step CBT prompt to balance anxious thoughts.</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs font-bold text-teal-400 group-hover:translate-x-1 transition-transform">
              <span>Reframe thought</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Weekly Sparkline & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Sparkline */}
        <div className="wellness-card p-6 sm:p-8 space-y-6 lg:col-span-2 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
                <span>Weekly Mood Overview</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">Your 7-day emotional heartbeat</p>
            </div>
            <Link
              to="/app/progress"
              onClick={() => sounds.playClick()}
              className="text-xs font-bold text-[#00d4ff] hover:underline cursor-pointer"
            >
              Full Analytics &rarr;
            </Link>
          </div>

          <div className="h-48 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} />
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
                <Area type="monotone" dataKey="score" stroke="#00d4ff" strokeWidth={3} fillOpacity={1} fill="url(#moodGradient)" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="wellness-card p-6 sm:p-8 space-y-6 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <span>Recent Activity</span>
            </h3>

            {activities.length === 0 ? (
              <div className="py-8 text-center space-y-2 bg-white/5 rounded-2xl border border-white/5 p-4">
                <p className="text-sm font-semibold text-white/80">Your journey starts here.</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  Take your first breath or log a mood check-in to see your personal history grow.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="p-2 rounded-lg bg-black/30 mt-0.5">
                      {getActivityIcon(act.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-white truncate">{act.title}</p>
                        <span className="text-[10px] text-white/40 shrink-0">{act.date}</span>
                      </div>
                      <p className="text-xs text-white/60 line-clamp-1 mt-0.5">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/app/progress"
            onClick={() => sounds.playClick()}
            className="w-full py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-center text-xs font-bold text-white transition-all block cursor-pointer"
          >
            View Full Progress Report
          </Link>
        </div>
      </div>
    </div>
  );
};
