import { MoodEntry, ReframeEntry, AppSettings, OnboardingState, ActivityLog } from "../types";

const ONBOARDING_KEY = "neuraliso_onboarding_v2";
const SETTINGS_KEY = "neuraliso_settings_v2";
const MOODS_KEY = "neuraliso_moods_v2";
const REFRAMES_KEY = "neuraliso_reframes_v2";
const ACTIVITIES_KEY = "neuraliso_activities_v2";

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
    } catch (e) {
      console.error("Failed to save mood", e);
    }
    return newEntry;
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
    } catch (e) {
      console.error("Failed to save reframe", e);
    }
    return newEntry;
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

  exportAllDataJSON(): string {
    const data = {
      exportDate: new Date().toISOString(),
      onboarding: this.getOnboarding(),
      settings: this.getSettings(),
      moods: this.getMoods(),
      reframes: this.getReframes(),
      activities: this.getActivities(),
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
    } catch (e) {
      console.error("Failed to delete all data", e);
    }
  },
};
