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
}

export interface OnboardingState {
  completed: boolean;
  name: string;
  goal: "calm" | "sleep" | "focus" | "explore" | "";
}

export interface ActivityLog {
  id: string;
  date: string;
  timestamp: number;
  type: "mood" | "breathe" | "sleep" | "reframe";
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

