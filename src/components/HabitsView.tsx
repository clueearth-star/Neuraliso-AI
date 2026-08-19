import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Flame, 
  Check, 
  Sparkles, 
  Trash2, 
  Edit3, 
  X, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  RefreshCw, 
  Zap, 
  Layers, 
  ChevronRight, 
  ChevronLeft,
  Award,
  AlertCircle,
  HelpCircle,
  Clock,
  Droplets,
  Heart,
  Moon,
  Wind,
  Smile,
  Target
} from "lucide-react";
import confetti from "canvas-confetti";
import { storage } from "../lib/storage";
import { sounds } from "../lib/sounds";
import { Habit, HabitCategory, HabitFrequency, HabitCompletionStats } from "../types";
import { useAuth } from "../contexts/AuthContext";

const CATEGORY_META: Record<HabitCategory, { label: string; icon: string; defaultColor: string }> = {
  mindfulness: { label: "Mindfulness & Peace", icon: "🌿", defaultColor: "#10b981" },
  hydration: { label: "Hydration & Energy", icon: "💧", defaultColor: "#00d4ff" },
  physical: { label: "Movement & Body", icon: "🚶", defaultColor: "#f59e0b" },
  sleep: { label: "Sleep & Wind-down", icon: "🌙", defaultColor: "#6366f1" },
  gratitude: { label: "Gratitude & Joy", icon: "✨", defaultColor: "#a855f7" },
  nutrition: { label: "Nourishment", icon: "🥗", defaultColor: "#ec4899" },
  focus: { label: "Deep Focus", icon: "🎯", defaultColor: "#3b82f6" },
  custom: { label: "Custom Ritual", icon: "⭐", defaultColor: "#14b8a6" },
};

const PRESET_TEMPLATES = [
  {
    title: "8 Glasses of Water",
    description: "Keep your body and mind hydrated for optimal cognitive function",
    category: "hydration" as HabitCategory,
    emoji: "💧",
    targetPerDay: 8,
    unit: "glasses",
    frequency: "daily" as HabitFrequency,
    color: "#00d4ff",
  },
  {
    title: "5-Minute Box Breathing",
    description: "Reset cortisol levels and settle nervous system overwhelm",
    category: "mindfulness" as HabitCategory,
    emoji: "🌿",
    targetPerDay: 1,
    unit: "session",
    frequency: "daily" as HabitFrequency,
    color: "#10b981",
  },
  {
    title: "15-Minute Nature Walk",
    description: "Gentle physical movement to unclamp bodily tension and refresh your perspective",
    category: "physical" as HabitCategory,
    emoji: "🚶",
    targetPerDay: 1,
    unit: "walk",
    frequency: "daily" as HabitFrequency,
    color: "#f59e0b",
  },
  {
    title: "Gratitude Micro-Journal",
    description: "Write down 1 thing that made you smile or feel safe today",
    category: "gratitude" as HabitCategory,
    emoji: "✨",
    targetPerDay: 1,
    unit: "entry",
    frequency: "daily" as HabitFrequency,
    color: "#a855f7",
  },
  {
    title: "Digital Sunset (No Screens)",
    description: "Disengage from screens 30 minutes before resting to protect sleep melatonin",
    category: "sleep" as HabitCategory,
    emoji: "🌙",
    targetPerDay: 1,
    unit: "routine",
    frequency: "daily" as HabitFrequency,
    color: "#6366f1",
  },
  {
    title: "Healthy Balanced Meal",
    description: "Eat mindfully without rushing to fuel physical energy",
    category: "nutrition" as HabitCategory,
    emoji: "🥗",
    targetPerDay: 1,
    unit: "meal",
    frequency: "daily" as HabitFrequency,
    color: "#ec4899",
  },
];

const EMOJI_OPTIONS = ["💧", "🌿", "🚶", "✨", "🌙", "🥗", "🎯", "🧘", "📖", "💊", "🍵", "☀️", "🍎", "🚴", "🏊", "🎨", "✍️", "🛡️", "🕯️", "🌻"];
const COLOR_OPTIONS = ["#00d4ff", "#10b981", "#f59e0b", "#a855f7", "#6366f1", "#ec4899", "#14b8a6", "#3b82f6"];

export const HabitsView: React.FC = () => {
  const { profile, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<HabitCompletionStats>({
    totalHabits: 0,
    completedToday: 0,
    completionRateToday: 0,
    totalCompletionsAllTime: 0,
    longestStreakEver: 0,
    activeStreakCount: 0,
  });
  const [weeklyMatrix, setWeeklyMatrix] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<HabitCategory>("mindfulness");
  const [formEmoji, setFormEmoji] = useState("🌿");
  const [formTarget, setFormTarget] = useState(1);
  const [formUnit, setFormUnit] = useState("times");
  const [formFrequency, setFormFrequency] = useState<HabitFrequency>("daily");
  const [formColor, setFormColor] = useState("#00d4ff");

  const todayStr = new Date().toISOString().split("T")[0];
  const isSelectedToday = selectedDate === todayStr;

  const loadData = () => {
    const list = storage.getHabits();
    setHabits(list);
    setStats(storage.getHabitStats());
    setWeeklyMatrix(storage.getHabitWeeklyMatrix(7));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    sounds.playClick();
    setEditingHabit(null);
    setFormTitle("");
    setFormDescription("");
    setFormCategory("mindfulness");
    setFormEmoji("🌿");
    setFormTarget(1);
    setFormUnit("times");
    setFormFrequency("daily");
    setFormColor("#00d4ff");
    setShowAddModal(true);
  };

  const openEditModal = (habit: Habit) => {
    sounds.playClick();
    setEditingHabit(habit);
    setFormTitle(habit.title);
    setFormDescription(habit.description || "");
    setFormCategory(habit.category);
    setFormEmoji(habit.emoji);
    setFormTarget(habit.targetPerDay);
    setFormUnit(habit.unit);
    setFormFrequency(habit.frequency);
    setFormColor(habit.color || "#00d4ff");
    setShowAddModal(true);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    sounds.playSuccess();

    if (editingHabit) {
      storage.updateHabit({
        ...editingHabit,
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        emoji: formEmoji,
        targetPerDay: Math.max(1, formTarget),
        unit: formUnit.trim() || "times",
        frequency: formFrequency,
        color: formColor,
      });
    } else {
      storage.saveHabit({
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        emoji: formEmoji,
        targetPerDay: Math.max(1, formTarget),
        unit: formUnit.trim() || "times",
        frequency: formFrequency,
        color: formColor,
      });
    }

    setShowAddModal(false);
    loadData();
  };

  const handleAddPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    sounds.playSuccess();
    storage.saveHabit({
      title: preset.title,
      description: preset.description,
      category: preset.category,
      emoji: preset.emoji,
      targetPerDay: preset.targetPerDay,
      unit: preset.unit,
      frequency: preset.frequency,
      color: preset.color,
    });
    setShowPresets(false);
    loadData();
  };

  const handleDeleteHabit = (id: string) => {
    sounds.playClick();
    storage.deleteHabit(id);
    setDeleteConfirmId(null);
    loadData();
  };

  const handleToggleHabit = (habit: Habit, delta: number = 1) => {
    const { isComplete } = storage.toggleHabitStep(habit.id, selectedDate, delta);
    
    if (isComplete) {
      sounds.playSuccess();
      // Check if all habits completed today
      const currentHabits = storage.getHabits();
      const allDone = currentHabits.every((h) => {
        const c = h.id === habit.id ? (h.completedDates[selectedDate] || 0) + delta : (h.completedDates[selectedDate] || 0);
        return c >= h.targetPerDay;
      });

      if (allDone && isSelectedToday) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#00d4ff", "#10b981", "#a855f7", "#f59e0b"],
          });
        } catch {
          // ignore if canvas blocked
        }
      }
    } else {
      sounds.playBloop();
    }

    loadData();
  };

  const filteredHabits = habits.filter((h) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "completed") {
      return (h.completedDates[selectedDate] || 0) >= h.targetPerDay;
    }
    if (activeCategory === "pending") {
      return (h.completedDates[selectedDate] || 0) < h.targetPerDay;
    }
    return h.category === activeCategory;
  });

  const categoriesWithCounts = [
    { id: "all", label: "All Habits", count: habits.length },
    { id: "pending", label: "Pending Today", count: habits.filter((h) => (h.completedDates[selectedDate] || 0) < h.targetPerDay).length },
    { id: "completed", label: "Completed", count: habits.filter((h) => (h.completedDates[selectedDate] || 0) >= h.targetPerDay).length },
    { id: "hydration", label: "💧 Hydration", count: habits.filter((h) => h.category === "hydration").length },
    { id: "mindfulness", label: "🌿 Mindfulness", count: habits.filter((h) => h.category === "mindfulness").length },
    { id: "physical", label: "🚶 Movement", count: habits.filter((h) => h.category === "physical").length },
    { id: "sleep", label: "🌙 Sleep", count: habits.filter((h) => h.category === "sleep").length },
    { id: "gratitude", label: "✨ Gratitude", count: habits.filter((h) => h.category === "gratitude").length },
  ].filter((c) => c.count > 0 || ["all", "pending", "completed"].includes(c.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 pb-28 md:pb-12 animate-page-in">
      
      {/* 1. Header & Motivation Overview */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-gradient-to-r from-[#111A2E] via-[#16213A] to-[#1A2542] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#00d4ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Micro-Habits & Rituals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
            Nourish Your Daily Rhythm
          </h1>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed">
            Small, consistent actions gently reshape your neural pathways. Track your daily wellness tasks with zero guilt or pressure.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 z-10 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setShowPresets(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial"
          >
            <Layers className="w-4 h-4 text-[#00d4ff]" />
            <span>Habit Library</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#00d4ff] hover:bg-[#00b8e6] text-[#0B1121] text-xs font-extrabold transition-all shadow-lg shadow-[#00d4ff]/25 flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards & Today's Progress Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Completion */}
        <div className="wellness-card p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white/60">
            <span>Today's Progress</span>
            <span className="text-[#00d4ff] font-mono font-bold text-sm">
              {stats.completedToday} / {stats.totalHabits} ({stats.completionRateToday}%)
            </span>
          </div>
          
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#00d4ff] to-emerald-400 rounded-full transition-all duration-500 shadow-sm shadow-[#00d4ff]/50"
              style={{ width: `${Math.min(100, stats.completionRateToday)}%` }}
            />
          </div>

          <p className="text-[11px] text-white/50">
            {stats.completionRateToday === 100
              ? "🌟 All daily rituals completed! Incredible work."
              : stats.completionRateToday >= 50
              ? "⚡ Over halfway there — keep your gentle flow."
              : "🌱 Tap any habit below as you complete it today."}
          </p>
        </div>

        {/* Active Streaks */}
        <div className="wellness-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-white/60 block font-medium">Active Streaks</span>
            <div className="text-2xl font-bold text-white font-mono flex items-baseline gap-1.5">
              <span>{stats.activeStreakCount}</span>
              <span className="text-xs text-amber-400 font-sans font-normal">habits in motion</span>
            </div>
          </div>
        </div>

        {/* Longest Streak Ever */}
        <div className="wellness-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-white/60 block font-medium">Best Streak Record</span>
            <div className="text-2xl font-bold text-white font-mono flex items-baseline gap-1.5">
              <span>{stats.longestStreakEver}</span>
              <span className="text-xs text-purple-400 font-sans font-normal">days continuous</span>
            </div>
          </div>
        </div>

        {/* Lifetime Completions */}
        <div className="wellness-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-white/60 block font-medium">Lifetime Rituals</span>
            <div className="text-2xl font-bold text-white font-mono flex items-baseline gap-1.5">
              <span>{stats.totalCompletionsAllTime}</span>
              <span className="text-xs text-emerald-400 font-sans font-normal">completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Streak Visualizer & 7-Day Matrix */}
      <div className="wellness-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
              <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
              <span>7-Day Consistency Matrix</span>
            </h2>
            <p className="text-xs text-white/60">
              Visual overview of your daily check-ins across the past week. Select any date to inspect or log.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setSelectedDate(todayStr);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelectedToday
                  ? "bg-[#00d4ff] text-[#0B1121]"
                  : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
              }`}
            >
              Today
            </button>
          </div>
        </div>

        {/* 7-Day Matrix Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 overflow-x-auto pb-2">
          {weeklyMatrix.map((day) => {
            const isDaySelected = selectedDate === day.date;
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedDate(day.date);
                }}
                className={`p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2.5 relative group ${
                  isDaySelected
                    ? "bg-[#00d4ff]/15 border-[#00d4ff] shadow-lg shadow-[#00d4ff]/10"
                    : day.isToday
                    ? "bg-white/10 border-white/20 hover:border-white/30"
                    : "bg-black/20 border-white/5 hover:border-white/15"
                }`}
              >
                {day.isToday && (
                  <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-[#00d4ff] text-[#0B1121] text-[9px] font-extrabold tracking-wider uppercase">
                    Today
                  </span>
                )}

                <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                  {day.dayShort}
                </span>

                <span className={`text-base sm:text-lg font-bold font-mono ${
                  isDaySelected ? "text-[#00d4ff]" : "text-white"
                }`}>
                  {day.dayNum}
                </span>

                {/* Progress Mini Pill */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${
                      day.rate === 100
                        ? "bg-emerald-400"
                        : day.rate > 0
                        ? "bg-[#00d4ff]"
                        : "bg-transparent"
                    }`}
                    style={{ width: `${day.rate}%` }}
                  />
                </div>

                <span className="text-[10px] font-mono text-white/60">
                  {day.totalCompleted}/{habits.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Habits Checklist & Filtering */}
      <div className="space-y-6">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categoriesWithCounts.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveCategory(cat.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-[#00d4ff] text-[#0B1121] shadow-md shadow-[#00d4ff]/20"
                    : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat.id ? "bg-[#0B1121]/20 text-[#0B1121]" : "bg-white/10 text-white/50"
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs text-white/50 flex items-center gap-1.5 self-end sm:self-auto">
            <Calendar className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Viewing: <strong className="text-white">{isSelectedToday ? "Today" : selectedDate}</strong></span>
          </div>
        </div>

        {/* Habits Cards Grid */}
        {filteredHabits.length === 0 ? (
          <div className="wellness-card p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto">
              🌱
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-serif">No rituals found in this view</h3>
              <p className="text-xs text-white/60 max-w-md mx-auto">
                Add your first custom habit or pick from our curated mental wellness library.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowPresets(true)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Explore Habit Library
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="px-4 py-2 rounded-xl bg-[#00d4ff] text-[#0B1121] text-xs font-extrabold transition-all cursor-pointer"
              >
                Create Custom Habit
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHabits.map((habit) => {
              const currentCount = habit.completedDates[selectedDate] || 0;
              const isCompleted = currentCount >= habit.targetPerDay;
              const hasMultiStep = habit.targetPerDay > 1;

              return (
                <div
                  key={habit.id}
                  className={`wellness-card p-5 sm:p-6 transition-all relative overflow-hidden group flex flex-col justify-between ${
                    isCompleted
                      ? "border-emerald-500/30 bg-emerald-950/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Accent Top Stripe */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: habit.color || "#00d4ff" }}
                  />

                  <div>
                    {/* Top Row: Emoji, Title, Edit/Delete & Streak */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-white/10 shadow-inner"
                          style={{ backgroundColor: `${habit.color}15` }}
                        >
                          {habit.emoji}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white font-serif leading-snug">
                              {habit.title}
                            </h3>
                          </div>
                          {habit.description && (
                            <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
                              {habit.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Dropdown / Action options */}
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => openEditModal(habit)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                          title="Edit habit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(habit.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-all cursor-pointer"
                          title="Delete habit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Streak & Frequency Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {habit.currentStreak > 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>{habit.currentStreak}-day streak</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-white/50 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-white/40" />
                          <span>Start streak today</span>
                        </span>
                      )}

                      {habit.bestStreak > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-purple-400" />
                          <span>Best: {habit.bestStreak}d</span>
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-white/5 text-white/40">
                        {habit.frequency}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Completion Controls */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                    {hasMultiStep ? (
                      /* Multi-step Counter Controls (e.g. 8 glasses water) */
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={currentCount <= 0}
                            onClick={() => handleToggleHabit(habit, -1)}
                            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm flex items-center justify-center disabled:opacity-30 cursor-pointer"
                          >
                            -
                          </button>

                          <div className="px-3 py-1 bg-black/40 rounded-xl border border-white/10 text-center font-mono text-xs text-white">
                            <span className="font-bold text-sm text-[#00d4ff]">{currentCount}</span> / {habit.targetPerDay} {habit.unit}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleHabit(habit, 1)}
                            className="w-8 h-8 rounded-xl bg-[#00d4ff]/20 hover:bg-[#00d4ff]/30 border border-[#00d4ff]/40 text-[#00d4ff] font-bold text-sm flex items-center justify-center cursor-pointer shadow-sm"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (isCompleted) {
                              storage.toggleHabitStep(habit.id, selectedDate, -currentCount);
                            } else {
                              storage.toggleHabitStep(habit.id, selectedDate, habit.targetPerDay - currentCount);
                            }
                            loadData();
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isCompleted
                              ? "bg-emerald-500 text-[#0B1121] shadow-md shadow-emerald-500/20"
                              : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{isCompleted ? "Completed" : "Complete All"}</span>
                        </button>
                      </div>
                    ) : (
                      /* Single Step Toggle (e.g. Meditation session) */
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-white/50">
                          {isCompleted ? "✅ Completed for this day" : "Pending completion"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleHabit(habit, 1)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                            isCompleted
                              ? "bg-emerald-500 text-[#0B1121] shadow-lg shadow-emerald-500/25 scale-[1.02]"
                              : "bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white"
                          }`}
                        >
                          <Check className={`w-4 h-4 stroke-[3] ${isCompleted ? "text-[#0B1121]" : "text-white/40"}`} />
                          <span>{isCompleted ? "Done!" : "Mark Complete"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Motivational Habits Science Banner */}
      <div className="wellness-card p-6 sm:p-8 bg-gradient-to-r from-[#0E1729] to-[#141E33] border border-white/10 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white font-serif">The Power of Low-Friction Micro-Habits</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Research in neuroplasticity demonstrates that consistency matters far more than intensity. Even 60 seconds of intentional breathing or one mindful glass of water reinforces the identity that you are worthy of gentle daily care.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL: Preset Habit Library */}
      {showPresets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="wellness-card p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 relative border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#00d4ff]" />
                  <span>Wellness Habit Library</span>
                </h3>
                <p className="text-xs text-white/60">
                  Select any evidence-backed ritual to add it instantly to your daily dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPresets(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PRESET_TEMPLATES.map((preset, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-black/30 border border-white/10 hover:border-[#00d4ff]/40 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-white/10"
                      style={{ backgroundColor: `${preset.color}15` }}
                    >
                      {preset.emoji}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white leading-tight font-serif">{preset.title}</h4>
                      <p className="text-[11px] text-white/60 leading-relaxed">{preset.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] font-mono text-white/40">
                      Goal: {preset.targetPerDay} {preset.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddPreset(preset)}
                      className="px-3 py-1.5 rounded-xl bg-[#00d4ff]/20 hover:bg-[#00d4ff] text-[#00d4ff] hover:text-[#0B1121] text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Add Habit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowPresets(false);
                  openCreateModal();
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Or create custom ritual from scratch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create / Edit Habit */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="wellness-card p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-6 relative border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                <Target className="w-5 h-5 text-[#00d4ff]" />
                <span>{editingHabit ? "Edit Habit" : "Create New Habit"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHabit} className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">Habit Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Morning Sunlight, Drink Water, 10m Reading"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 focus:border-[#00d4ff] focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">Gentle Note / Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Why this matters or when to do it..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 focus:border-[#00d4ff] focus:outline-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    const cat = e.target.value as HabitCategory;
                    setFormCategory(cat);
                    setFormEmoji(CATEGORY_META[cat].icon);
                    setFormColor(CATEGORY_META[cat].defaultColor);
                  }}
                  className="w-full bg-black/40 border border-white/15 px-4 py-2.5 rounded-xl text-sm text-white focus:border-[#00d4ff] focus:outline-none cursor-pointer"
                >
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <option key={key} value={key} className="bg-[#111A2E] text-white">
                      {meta.icon} {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Emoji & Color Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">Choose Emoji</label>
                  <div className="flex flex-wrap gap-1.5 bg-black/30 p-2 rounded-xl border border-white/10 max-h-24 overflow-y-auto">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormEmoji(emoji)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                          formEmoji === emoji ? "bg-[#00d4ff]/30 border border-[#00d4ff] scale-110" : "hover:bg-white/10"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">Accent Color</label>
                  <div className="flex flex-wrap gap-2 bg-black/30 p-2.5 rounded-xl border border-white/10 items-center">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormColor(c)}
                        className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                          formColor === c ? "ring-2 ring-white scale-110" : "opacity-70 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Target & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">Daily Target</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formTarget}
                    onChange={(e) => setFormTarget(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-black/40 border border-white/15 px-4 py-2.5 rounded-xl text-sm text-white font-mono focus:border-[#00d4ff] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. glasses, min, times"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 px-4 py-2.5 rounded-xl text-sm text-white focus:border-[#00d4ff] focus:outline-none"
                  />
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["daily", "weekdays", "weekends"] as HabitFrequency[]).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFormFrequency(freq)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                        formFrequency === freq
                          ? "bg-[#00d4ff] text-[#0B1121]"
                          : "bg-black/30 border border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00d4ff] hover:bg-[#00b8e6] text-[#0B1121] text-xs font-extrabold transition-all shadow-lg shadow-[#00d4ff]/20 cursor-pointer"
                >
                  {editingHabit ? "Update Habit" : "Save Habit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="wellness-card p-6 sm:p-8 max-w-md w-full space-y-5 border border-red-500/30">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-serif">Delete this habit?</h3>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              This will remove the habit and its historical streaks from your local storage.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/70 text-xs font-bold hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteHabit(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-500/20 cursor-pointer"
              >
                Delete Habit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
