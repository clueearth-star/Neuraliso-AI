import React, { useState, useEffect } from "react";
import { Smile, Check, Tag, Clock, TrendingUp, Sparkles, Trash2 } from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid 
} from "recharts";
import { storage } from "../lib/storage";
import { sounds } from "../lib/sounds";
import { MoodEntry } from "../types";

export const MoodCheckView: React.FC = () => {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Form State
  const [selectedScore, setSelectedScore] = useState<number>(3);
  const [note, setNote] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const emojis = [
    { score: 1, emoji: "😢", label: "Sad" },
    { score: 2, emoji: "😕", label: "Down" },
    { score: 3, emoji: "😐", label: "Okay" },
    { score: 4, emoji: "🙂", label: "Good" },
    { score: 5, emoji: "😊", label: "Great" },
  ];

  const availableTags = ["Anxious", "Tired", "Stressed", "Happy", "Calm", "Overwhelmed"];

  const reloadData = () => {
    setMoods(storage.getMoods());
    setChartData(storage.getWeeklyMoodChart());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const toggleTag = (tag: string) => {
    sounds.playClick();
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    const currentEmoji = emojis.find((item) => item.score === selectedScore) || emojis[2];
    
    storage.saveMood({
      score: selectedScore,
      emoji: currentEmoji.emoji,
      label: currentEmoji.label,
      note: note.trim(),
      tags: selectedTags,
    });

    setNote("");
    setSelectedTags([]);
    setShowSuccess(true);
    reloadData();

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleDeleteEntry = (id: string) => {
    sounds.playClick();
    const updated = moods.filter((m) => m.id !== id);
    localStorage.setItem("neuraliso_moods_v2", JSON.stringify(updated));
    reloadData();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12 pb-28 md:pb-12 animate-page-in text-left">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Smile className="w-3.5 h-3.5" />
          <span>Emotional Awareness</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Mood Check-in
        </h1>
        <p className="text-sm sm:text-base text-white/60">
          Take a moment to check in with yourself. Name your feelings without judgment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 wellness-card p-6 sm:p-8 space-y-8">
          <form onSubmit={handleSave} className="space-y-8">
            {/* 1. Emoji Faces */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-white block">
                1. How are you feeling right now?
              </label>
              <div className="grid grid-cols-5 gap-2 sm:gap-4">
                {emojis.map((item) => {
                  const isSelected = selectedScore === item.score;
                  return (
                    <button
                      type="button"
                      key={item.score}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedScore(item.score);
                      }}
                      className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/20 border-2 border-amber-400 scale-105 shadow-lg shadow-amber-500/20"
                          : "bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-102"
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl block">{item.emoji}</span>
                      <span className="text-xs font-semibold text-white/90">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Optional Note Area */}
            <div className="space-y-3">
              <label htmlFor="mood-note" className="text-sm font-bold text-white flex items-center justify-between">
                <span>2. What&apos;s on your mind?</span>
                <span className="text-xs font-normal text-white/40">Optional reflection</span>
              </label>
              <textarea
                id="mood-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write whatever is in your thoughts. Your journal is 100% private and stored on your device..."
                rows={3}
                className="w-full text-sm leading-relaxed"
              />
            </div>

            {/* 3. Tag Selector */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#00d4ff]" />
                <span>3. Select emotional tags (multi-select):</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#00d4ff] text-[#0B1121] shadow-md shadow-[#00d4ff]/30 scale-105"
                          : "bg-white/5 border border-white/10 hover:bg-white/10 text-white/80"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00d4ff]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Save Check-in</span>
                <Sparkles className="w-5 h-5" />
              </button>
            </div>

            {showSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-page-in">
                <Check className="w-4 h-4" />
                <span>Your check-in has been saved securely to local storage.</span>
              </div>
            )}
          </form>
        </div>

        {/* Right 7-day Chart (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="wellness-card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
                <span>7-Day Mood Trend</span>
              </h2>
              <p className="text-xs text-white/50 mt-0.5">Average daily mood score (1 to 5)</p>
            </div>

            <div className="h-56 w-full pt-2">
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
                  <Line type="monotone" dataKey="score" stroke="#00d4ff" strokeWidth={3} dot={{ r: 5, fill: "#00d4ff" }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* History List Below */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" />
            <span>Check-in History</span>
          </h2>
          <span className="text-xs font-bold text-white/50 bg-white/5 px-3 py-1 rounded-full">
            {moods.length} {moods.length === 1 ? "entry" : "entries"} logged
          </span>
        </div>

        {moods.length === 0 ? (
          <div className="wellness-card p-12 text-center space-y-3">
            <Smile className="w-10 h-10 text-white/30 mx-auto" />
            <h3 className="text-base font-bold text-white">Your journey starts here. How are you feeling?</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              Use the form above to record your first mood check-in. You can return anytime to see your history.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moods.map((entry) => (
              <div key={entry.id} className="wellness-card p-5 space-y-3 relative group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-black/30 p-2 rounded-2xl block">{entry.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{entry.label}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                          Score {entry.score}/5
                        </span>
                      </div>
                      <span className="text-xs text-white/40 block mt-0.5">{entry.date}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    aria-label="Delete entry"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {entry.note && (
                  <p className="text-xs text-white/80 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 italic">
                    &quot;{entry.note}&quot;
                  </p>
                )}

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {entry.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
