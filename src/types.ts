export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export type ActiveView = "home" | "chat" | "sos" | "hotline" | "profile" | "moodCheck" | "relief" | "reviews" | "neuroSkeletons";

export interface JournalEntry {
  id: string;
  date: string;
  mood: "sad" | "anxious" | "overwhelmed" | "lonely" | "neutral" | "happy";
  stress: number; // 1 to 10
  energy: number; // 1 to 10
  note: string;
  actionPlan: string[];
}

export interface HotlineContact {
  name: string;
  phone: string;
  description: string;
  isText?: boolean;
  link?: string;
}
