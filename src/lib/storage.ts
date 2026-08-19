import { 
  MoodEntry, 
  ReframeEntry, 
  AppSettings, 
  OnboardingState, 
  ActivityLog, 
  ChatMessage, 
  CrisisLog, 
  UserSubscription,
  Habit,
  HabitCompletionStats
} from "../types";
import { supabase, isSupabaseConfigured } from "./supabase";
import { safeStorage } from "./safeStorage";

export { safeStorage };
const localStorage = safeStorage;

const ONBOARDING_KEY = "neuraliso_onboarding_v2";
const SETTINGS_KEY = "neuraliso_settings_v2";
const MOODS_KEY = "neuraliso_moods_v2";
const REFRAMES_KEY = "neuraliso_reframes_v2";
const ACTIVITIES_KEY = "neuraliso_activities_v2";
const CHAT_KEY = "neuraliso_chat_history";
const CRISIS_LOG_KEY = "neuraliso_crisis_logs";
const SUBSCRIPTION_KEY = "neuraliso_subscription_v2";
const HABITS_KEY = "neuraliso_habits_v2";

const DEFAULT_HABITS: Habit[] = [
  {
    id: "habit_hydrate",
    title: "Daily Hydration",
    description: "Drink at least 6-8 glasses of water to maintain mental clarity and physical calm",
    category: "hydration",
    emoji: "💧",
    targetPerDay: 8,
    unit: "glasses",
    frequency: "daily",
    color: "#00d4ff",
    createdAt: Date.now() - 86400000 * 2,
    completedDates: {},
    currentStreak: 0,
    bestStreak: 0,
  },
  {
    id: "habit_breathe",
    title: "Mindful Breathing",
    description: "Take 3 to 5 minutes for box breathing or diaphragmatic grounding",
    category: "mindfulness",
    emoji: "🌿",
    targetPerDay: 1,
    unit: "session",
    frequency: "daily",
    color: "#10b981",
    createdAt: Date.now() - 86400000 * 2,
    completedDates: {},
    currentStreak: 0,
    bestStreak: 0,
  },
  {
    id: "habit_walk",
    title: "Gentle Movement / Walk",
    description: "15 minutes of outdoor walking or body stretching to release muscular tension",
    category: "physical",
    emoji: "🚶",
    targetPerDay: 1,
    unit: "walk",
    frequency: "daily",
    color: "#f59e0b",
    createdAt: Date.now() - 86400000 * 2,
    completedDates: {},
    currentStreak: 0,
    bestStreak: 0,
  },
  {
    id: "habit_gratitude",
    title: "Gratitude Reflection",
    description: "Acknowledge one person, moment, or comfort you are thankful for today",
    category: "gratitude",
    emoji: "✨",
    targetPerDay: 1,
    unit: "note",
    frequency: "daily",
    color: "#a855f7",
    createdAt: Date.now() - 86400000 * 2,
    completedDates: {},
    currentStreak: 0,
    bestStreak: 0,
  },
  {
    id: "habit_sleep_hygiene",
    title: "Digital Sunset",
    description: "Power down screens 30 minutes before sleep with calming ambient sound",
    category: "sleep",
    emoji: "🌙",
    targetPerDay: 1,
    unit: "routine",
    frequency: "daily",
    color: "#6366f1",
    createdAt: Date.now() - 86400000 * 2,
    completedDates: {},
    currentStreak: 0,
    bestStreak: 0,
  },
];

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  tier: "free",
  status: "inactive",
  expiresAt: null,
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  reminderTime: "20:00",
  notifications: false,
  soundEnabled: true,
};

const DEFAULT_ONBOARDING: OnboardingState = {
  completed: false,
  name: "",
  goal: "",
};

export const storage = {
  get(key: string): string | null {
    return safeStorage.getItem(key);
  },
  set(key: string, value: string): void {
    safeStorage.setItem(key, value);
  },
  remove(key: string): void {
    safeStorage.removeItem(key);
  },

  getSubscription(): UserSubscription {
    try {
      if (typeof window !== "undefined") {
        safeStorage.removeItem(SUBSCRIPTION_KEY);
        safeStorage.removeItem("neuraliso_subscription");
        safeStorage.removeItem("neuraliso_subscription_v2");
      }
    } catch {}
    return DEFAULT_SUBSCRIPTION;
  },

  saveSubscription(_sub: UserSubscription): void {
    // Subscription status is strictly server-authoritative and queried from public.subscriptions.
    // Client-side subscription caching is disabled to prevent cross-account access leakage.
    try {
      if (typeof window !== "undefined") {
        safeStorage.removeItem(SUBSCRIPTION_KEY);
        safeStorage.removeItem("neuraliso_subscription");
        safeStorage.removeItem("neuraliso_subscription_v2");
      }
    } catch {}
  },

  getOnboarding(): OnboardingState {
    try {
      const data = localStorage.getItem(ONBOARDING_KEY);
      return data ? JSON.parse(data) : DEFAULT_ONBOARDING;
    } catch {
      return DEFAULT_ONBOARDING;
    }
  },

  saveOnboarding(state: OnboardingState): void {
    try {
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save onboarding", e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  },

  getMoods(): MoodEntry[] {
    try {
      const data = localStorage.getItem(MOODS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveMood(entry: Omit<MoodEntry, "id" | "timestamp" | "date">): MoodEntry {
    const moods = this.getMoods();
    const now = new Date();
    const newEntry: MoodEntry = {
      ...entry,
      id: `mood_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: now.getTime(),
      date: now.toISOString().split("T")[0],
    };
    try {
      localStorage.setItem(MOODS_KEY, JSON.stringify([newEntry, ...moods]));
      this.logActivity("mood", `Logged mood: ${newEntry.emoji} ${newEntry.label}`, newEntry.note || "Daily emotional check-in");
      
      const uid = localStorage.getItem("neuraliso_auth_uid");
      if (uid && isSupabaseConfigured()) {
        supabase.from("moods").upsert({
          id: newEntry.id,
          user_id: uid,
          score: newEntry.score,
          note: newEntry.note || "",
          date: newEntry.date,
          emoji: newEntry.emoji,
          label: newEntry.label,
          tags: newEntry.tags || [],
          created_at: new Date(newEntry.timestamp).toISOString()
        }).then(({ error }) => {
          if (error) console.warn("[Supabase] Failed to background sync mood:", error.message);
        });
      }
    } catch (e) {
      console.error("Failed to save mood", e);
    }
    return newEntry;
  },

  deleteMood(id: string): void {
    try {
      const moods = this.getMoods().filter((m) => m.id !== id);
      localStorage.setItem(MOODS_KEY, JSON.stringify(moods));
      
      const uid = localStorage.getItem("neuraliso_auth_uid");
      if (uid && isSupabaseConfigured()) {
        supabase.from("moods").delete().eq("id", id).eq("user_id", uid).then(({ error }) => {
          if (error) console.warn("[Supabase] Failed to delete remote mood:", error.message);
        });
      }
    } catch (e) {
      console.error("Failed to delete mood", e);
    }
  },

  getReframes(): ReframeEntry[] {
    try {
      const data = localStorage.getItem(REFRAMES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveReframe(entry: Omit<ReframeEntry, "id" | "timestamp" | "date">): ReframeEntry {
    const reframes = this.getReframes();
    const now = new Date();
    const newEntry: ReframeEntry = {
      ...entry,
      id: `reframe_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: now.getTime(),
      date: now.toISOString().split("T")[0],
    };
    try {
      localStorage.setItem(REFRAMES_KEY, JSON.stringify([newEntry, ...reframes]));
      this.logActivity("reframe", "Thought reframe completed", `Shifted perspective on: "${entry.situation.slice(0, 30)}..."`);

      const uid = localStorage.getItem("neuraliso_auth_uid");
      if (uid && isSupabaseConfigured()) {
        supabase.from("thoughts").upsert({
          id: newEntry.id,
          user_id: uid,
          situation: newEntry.situation,
          thought: newEntry.automaticThought,
          truth: "",
          balanced_thought: newEntry.balancedThought,
          belief_percent: newEntry.beliefPercent || 50,
          date: newEntry.date,
          created_at: new Date(newEntry.timestamp).toISOString()
        }).then(({ error }) => {
          if (error) console.warn("[Supabase] Failed to background sync thought:", error.message);
        });
      }
    } catch (e) {
      console.error("Failed to save reframe", e);
    }
    return newEntry;
  },

  deleteReframe(id: string): void {
    try {
      const reframes = this.getReframes().filter((r) => r.id !== id);
      localStorage.setItem(REFRAMES_KEY, JSON.stringify(reframes));

      const uid = localStorage.getItem("neuraliso_auth_uid");
      if (uid && isSupabaseConfigured()) {
        supabase.from("thoughts").delete().eq("id", id).eq("user_id", uid).then(({ error }) => {
          if (error) console.warn("[Supabase] Failed to delete remote thought:", error.message);
        });
      }
    } catch (e) {
      console.error("Failed to delete reframe", e);
    }
  },

  getActivities(): ActivityLog[] {
    try {
      const data = localStorage.getItem(ACTIVITIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  logActivity(type: ActivityLog["type"], title: string, description: string): void {
    const activities = this.getActivities();
    const now = new Date();
    const log: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date: now.toISOString().split("T")[0],
      timestamp: now.getTime(),
      type,
      title,
      description,
    };
    try {
      // Keep last 50 activities
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify([log, ...activities].slice(0, 50)));
    } catch (e) {
      console.error("Failed to log activity", e);
    }
  },

  getStreak(): number {
    const activities = this.getActivities();
    if (activities.length === 0) return 0;

    const uniqueDates = Array.from(new Set<string>(activities.map((a) => a.date))).sort().reverse() as string[];
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Check if most recent is today or yesterday
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const curr = new Date(uniqueDates[i]);
      const prev = new Date(uniqueDates[i + 1]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },

  getWeeklyMoodChart() {
    const moods = this.getMoods();
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

      const dayMoods = moods.filter((m) => m.date === dateStr);
      let avgScore = null;
      if (dayMoods.length > 0) {
        avgScore = Number((dayMoods.reduce((sum, m) => sum + m.score, 0) / dayMoods.length).toFixed(1));
      }

      days.push({
        day: dayName,
        date: dateStr,
        score: avgScore,
      });
    }
    return days;
  },

  getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(HABITS_KEY);
      if (!data) {
        // Initialize default habits
        localStorage.setItem(HABITS_KEY, JSON.stringify(DEFAULT_HABITS));
        return DEFAULT_HABITS;
      }
      const parsed: Habit[] = JSON.parse(data);
      // Re-calculate live streaks on retrieval
      return parsed.map((h) => {
        const { currentStreak, bestStreak } = this.calculateHabitStreak(h.completedDates || {}, h.targetPerDay);
        return {
          ...h,
          currentStreak,
          bestStreak: Math.max(h.bestStreak || 0, bestStreak),
        };
      });
    } catch {
      return DEFAULT_HABITS;
    }
  },

  calculateHabitStreak(completedDates: Record<string, number>, targetPerDay: number): { currentStreak: number; bestStreak: number } {
    const target = Math.max(1, targetPerDay || 1);
    const completedDays = Object.entries(completedDates || {})
      .filter(([_, count]) => count >= target)
      .map(([date]) => date)
      .sort();

    if (completedDays.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    const dateSet = new Set(completedDays);

    // Calculate Best Streak
    let best = 0;
    let running = 0;
    let prevMs = 0;

    for (const dStr of completedDays) {
      const ms = new Date(dStr + "T00:00:00").getTime();
      if (prevMs === 0) {
        running = 1;
      } else {
        const diffDays = Math.round((ms - prevMs) / 86400000);
        if (diffDays === 1) {
          running++;
        } else if (diffDays > 1) {
          running = 1;
        }
      }
      prevMs = ms;
      if (running > best) best = running;
    }

    // Calculate Current Streak
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const yesterday = new Date(now.getTime() - 86400000);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let current = 0;
    let cursor = new Date(now);

    if (dateSet.has(todayStr)) {
      current = 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (dateSet.has(yesterdayStr)) {
      // Streak still active from yesterday, waiting for today's check
      current = 1;
      cursor.setDate(cursor.getDate() - 2);
    } else {
      return { currentStreak: 0, bestStreak: best };
    }

    while (true) {
      const cursorStr = cursor.toISOString().split("T")[0];
      if (dateSet.has(cursorStr)) {
        current++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      currentStreak: current,
      bestStreak: Math.max(best, current),
    };
  },

  saveHabit(habitData: Omit<Habit, "id" | "createdAt" | "currentStreak" | "bestStreak" | "completedDates">): Habit {
    const habits = this.getHabits();
    const newHabit: Habit = {
      ...habitData,
      id: `habit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
      completedDates: {},
      currentStreak: 0,
      bestStreak: 0,
    };
    const updated = [newHabit, ...habits];
    try {
      localStorage.setItem(HABITS_KEY, JSON.stringify(updated));
      this.logActivity("habit", `Created Habit: ${newHabit.emoji} ${newHabit.title}`, `Goal: ${newHabit.targetPerDay} ${newHabit.unit} daily`);
    } catch (e) {
      console.error("Failed to save habit", e);
    }
    return newHabit;
  },

  updateHabit(updated: Habit): void {
    const habits = this.getHabits();
    const next = habits.map((h) => (h.id === updated.id ? updated : h));
    try {
      localStorage.setItem(HABITS_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Failed to update habit", e);
    }
  },

  deleteHabit(id: string): void {
    const habits = this.getHabits();
    const next = habits.filter((h) => h.id !== id);
    try {
      localStorage.setItem(HABITS_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Failed to delete habit", e);
    }
  },

  toggleHabitStep(id: string, dateStr?: string, delta: number = 1): { habit: Habit | null; isComplete: boolean; currentCount: number } {
    const habits = this.getHabits();
    const habit = habits.find((h) => h.id === id);
    if (!habit) return { habit: null, isComplete: false, currentCount: 0 };

    const targetDate = dateStr || new Date().toISOString().split("T")[0];
    const currentCount = habit.completedDates[targetDate] || 0;
    let nextCount = Math.max(0, currentCount + delta);

    // If single target (target = 1) and delta was +1 but already complete, toggle back to 0
    if (habit.targetPerDay === 1 && currentCount >= 1 && delta > 0) {
      nextCount = 0;
    }

    const updatedCompletedDates = {
      ...habit.completedDates,
      [targetDate]: nextCount,
    };

    if (nextCount === 0) {
      delete updatedCompletedDates[targetDate];
    }

    const { currentStreak, bestStreak } = this.calculateHabitStreak(updatedCompletedDates, habit.targetPerDay);

    const updatedHabit: Habit = {
      ...habit,
      completedDates: updatedCompletedDates,
      currentStreak,
      bestStreak: Math.max(habit.bestStreak || 0, bestStreak),
    };

    this.updateHabit(updatedHabit);

    const isComplete = nextCount >= habit.targetPerDay;
    if (isComplete && currentCount < habit.targetPerDay) {
      this.logActivity("habit", `Completed Habit: ${habit.emoji} ${habit.title}`, `${nextCount}/${habit.targetPerDay} ${habit.unit} on ${targetDate}`);
    }

    return { habit: updatedHabit, isComplete, currentCount: nextCount };
  },

  getHabitStats(): HabitCompletionStats {
    const habits = this.getHabits();
    const today = new Date().toISOString().split("T")[0];

    const totalHabits = habits.length;
    let completedToday = 0;
    let totalCompletionsAllTime = 0;
    let longestStreakEver = 0;
    let activeStreakCount = 0;

    habits.forEach((h) => {
      const todayCount = h.completedDates[today] || 0;
      if (todayCount >= h.targetPerDay) {
        completedToday++;
      }
      if (h.currentStreak > 0) {
        activeStreakCount++;
      }
      if (h.bestStreak > longestStreakEver) {
        longestStreakEver = h.bestStreak;
      }
      if (h.currentStreak > longestStreakEver) {
        longestStreakEver = h.currentStreak;
      }

      Object.values(h.completedDates || {}).forEach((count) => {
        if (count >= h.targetPerDay) {
          totalCompletionsAllTime++;
        }
      });
    });

    const completionRateToday = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    return {
      totalHabits,
      completedToday,
      completionRateToday,
      totalCompletionsAllTime,
      longestStreakEver,
      activeStreakCount,
    };
  },

  getHabitWeeklyMatrix(daysCount: number = 7) {
    const habits = this.getHabits();
    const now = new Date();
    const matrix = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "narrow" });
      const dayShort = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();
      const isToday = i === 0;

      const habitStatuses = habits.map((h) => {
        const count = h.completedDates[dateStr] || 0;
        return {
          id: h.id,
          title: h.title,
          emoji: h.emoji,
          color: h.color,
          count,
          target: h.targetPerDay,
          completed: count >= h.targetPerDay,
        };
      });

      const totalCompleted = habitStatuses.filter((s) => s.completed).length;
      const rate = habits.length > 0 ? Math.round((totalCompleted / habits.length) * 100) : 0;

      matrix.push({
        date: dateStr,
        dayName,
        dayShort,
        dayNum,
        isToday,
        totalCompleted,
        rate,
        habits: habitStatuses,
      });
    }

    return matrix;
  },

  exportAllDataJSON(): string {
    const data = {
      exportDate: new Date().toISOString(),
      onboarding: this.getOnboarding(),
      settings: this.getSettings(),
      moods: this.getMoods(),
      reframes: this.getReframes(),
      activities: this.getActivities(),
      habits: this.getHabits(),
    };
    return JSON.stringify(data, null, 2);
  },

  deleteAllData(): void {
    try {
      localStorage.removeItem(ONBOARDING_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(MOODS_KEY);
      localStorage.removeItem(REFRAMES_KEY);
      localStorage.removeItem(ACTIVITIES_KEY);
      localStorage.removeItem(CHAT_KEY);
      localStorage.removeItem(CRISIS_LOG_KEY);
      localStorage.removeItem(HABITS_KEY);
    } catch (e) {
      console.error("Failed to delete all data", e);
    }
  },

  getChatHistory(): ChatMessage[] {
    try {
      const data = localStorage.getItem(CHAT_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveChatMessage(message: ChatMessage): void {
    try {
      const history = this.getChatHistory();
      localStorage.setItem(CHAT_KEY, JSON.stringify([...history, message]));

      const uid = localStorage.getItem("neuraliso_auth_uid");
      if (uid && isSupabaseConfigured()) {
        supabase.from("chat_history").upsert({
          id: message.id,
          user_id: uid,
          role: message.sender,
          content: message.text,
          created_at: new Date(message.timestamp).toISOString()
        }).then(({ error }) => {
          if (error) console.warn("[Supabase] Failed to background sync chat:", error.message);
        });
      }
    } catch (e) {
      console.error("Failed to save chat message", e);
    }
  },

  clearChatHistory(): void {
    try {
      localStorage.removeItem(CHAT_KEY);
      const uid = localStorage.getItem("neuraliso_auth_uid");
      if (uid && isSupabaseConfigured()) {
        supabase.from("chat_history").delete().eq("user_id", uid).then(({ error }) => {
          if (error) console.warn("[Supabase] Failed to clear remote chat:", error.message);
        });
      }
    } catch (e) {
      console.error("Failed to clear chat history", e);
    }
  },

  logCrisis(keyword: string, message: string): void {
    try {
      const logs: CrisisLog[] = JSON.parse(localStorage.getItem(CRISIS_LOG_KEY) || "[]");
      const now = new Date();
      const newLog: CrisisLog = {
        id: `crisis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: now.getTime(),
        date: now.toISOString(),
        keyword,
        message,
      };
      localStorage.setItem(CRISIS_LOG_KEY, JSON.stringify([newLog, ...logs]));
      console.warn(`Crisis keyword detected at ${newLog.date}`);
    } catch (e) {
      console.error("Failed to log crisis", e);
    }
  },

  async syncToSupabase(uid: string): Promise<void> {
    if (!isSupabaseConfigured() || !uid) return;
    try {
      const moods = this.getMoods();
      if (moods.length > 0) {
        const payload = moods.map((m) => ({
          id: m.id,
          user_id: uid,
          score: m.score,
          note: m.note || "",
          date: m.date,
          emoji: m.emoji || "😐",
          label: m.label || "Neutral",
          tags: m.tags || [],
          created_at: new Date(m.timestamp || Date.now()).toISOString(),
        }));
        await supabase.from("moods").upsert(payload);
      }

      const reframes = this.getReframes();
      if (reframes.length > 0) {
        const payload = reframes.map((r) => ({
          id: r.id,
          user_id: uid,
          situation: r.situation,
          thought: r.automaticThought,
          truth: "",
          balanced_thought: r.balancedThought,
          belief_percent: r.beliefPercent || 50,
          date: r.date,
          created_at: new Date(r.timestamp || Date.now()).toISOString(),
        }));
        await supabase.from("thoughts").upsert(payload);
      }

      const chats = this.getChatHistory();
      if (chats.length > 0) {
        const payload = chats.map((c) => ({
          id: c.id,
          user_id: uid,
          role: c.sender,
          content: c.text,
          created_at: new Date(c.timestamp || Date.now()).toISOString(),
        }));
        await supabase.from("chat_history").upsert(payload);
      }
    } catch (e) {
      console.warn("[Supabase] Error syncing local data to Supabase:", e);
    }
  },

  async syncFromSupabase(uid: string): Promise<void> {
    if (!isSupabaseConfigured() || !uid) return;
    try {
      // Fetch moods
      const { data: moodsData, error: moodsErr } = await supabase
        .from("moods")
        .select("*")
        .eq("user_id", uid)
        .order("date", { ascending: false });

      if (!moodsErr && moodsData) {
        const mappedMoods: MoodEntry[] = moodsData.map((m) => ({
          id: m.id,
          date: m.date,
          timestamp: new Date(m.created_at || m.date).getTime() || Date.now(),
          score: m.score,
          emoji: m.emoji || "😐",
          label: m.label || "Neutral",
          note: m.note || "",
          tags: m.tags || [],
        }));
        localStorage.setItem(MOODS_KEY, JSON.stringify(mappedMoods));
      }

      // Fetch reframes / thoughts
      const { data: thoughtsData, error: thoughtsErr } = await supabase
        .from("thoughts")
        .select("*")
        .eq("user_id", uid)
        .order("date", { ascending: false });

      if (!thoughtsErr && thoughtsData) {
        const mappedReframes: ReframeEntry[] = thoughtsData.map((t) => ({
          id: t.id,
          date: t.date,
          timestamp: new Date(t.created_at || t.date).getTime() || Date.now(),
          situation: t.situation,
          automaticThought: t.thought,
          beliefPercent: t.belief_percent || 50,
          balancedThought: t.balanced_thought,
        }));
        localStorage.setItem(REFRAMES_KEY, JSON.stringify(mappedReframes));
      }

      // Fetch chat history
      const { data: chatsData, error: chatsErr } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: true });

      if (!chatsErr && chatsData) {
        const mappedChats: ChatMessage[] = chatsData.map((c) => ({
          id: c.id,
          sender: (c.role as any) || "user",
          text: c.content,
          timestamp: new Date(c.created_at).getTime() || Date.now(),
        }));
        localStorage.setItem(CHAT_KEY, JSON.stringify(mappedChats));
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("neuraliso-storage-updated"));
      }
    } catch (e) {
      console.warn("[Supabase] Error syncing remote data from Supabase:", e);
    }
  },
};
