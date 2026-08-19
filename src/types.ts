export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  score: number; // 1 to 5
  emoji: string;
  label: string;
  note?: string;
  tags: string[];
}

export interface ReframeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  situation: string;
  automaticThought: string;
  beliefPercent: number; // 0 to 100
  balancedThought: string;
}

export interface SleepSoundItem {
  id: "rain" | "white" | "brown" | "binaural";
  name: string;
  description: string;
  icon: string;
  volume: number; // 0 to 1
}

export interface AppSettings {
  theme: "dark" | "light";
  reminderTime: string; // e.g. "20:00"
  notifications: boolean;
  soundEnabled: boolean;
  reminderMessage?: string;
}

export interface OnboardingState {
  completed: boolean;
  name: string;
  goal: "calm" | "sleep" | "focus" | "explore" | "";
}

export type HabitFrequency = "daily" | "weekdays" | "weekends" | "weekly";

export type HabitCategory = 
  | "mindfulness" 
  | "physical" 
  | "hydration" 
  | "sleep" 
  | "nutrition" 
  | "focus" 
  | "gratitude" 
  | "custom";

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  emoji: string;
  targetPerDay: number; // e.g. 1 or 8
  unit: string; // e.g. "times", "glasses", "min", "pages"
  frequency: HabitFrequency;
  color: string; // hex or theme accent e.g. "#00d4ff"
  createdAt: number;
  completedDates: Record<string, number>; // date "YYYY-MM-DD" -> count completed
  currentStreak: number;
  bestStreak: number;
  archived?: boolean;
}

export interface HabitCompletionStats {
  totalHabits: number;
  completedToday: number;
  completionRateToday: number; // 0 to 100
  totalCompletionsAllTime: number;
  longestStreakEver: number;
  activeStreakCount: number;
}

export interface ActivityLog {
  id: string;
  date: string;
  timestamp: number;
  type: "mood" | "breathe" | "sleep" | "reframe" | "habit";
  title: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: number;
  action?: {
    label: string;
    route: string;
  };
}

export interface CrisisLog {
  id: string;
  timestamp: number;
  date: string;
  keyword: string;
  message: string;
}

export type SubscriptionTier = "free" | "pro" | "plus" | "lifetime" | "plus_monthly" | "plus_yearly";
export type SubscriptionStatus = "active" | "inactive" | "cancelled" | "trial" | "trialing";
export type BillingPeriod = "monthly" | "yearly" | "lifetime";

export interface UserSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt: string | null; // ISO string (null for lifetime)
  dodoCustomerId?: string;
  dodoSubscriptionId?: string;
  billingPeriod?: BillingPeriod;
  isTrial?: boolean;
  isLifetime?: boolean;
}


