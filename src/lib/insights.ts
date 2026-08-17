import { MoodEntry } from "../types";

export interface PatternInsight {
  id: string;
  type: "anxiety_trend" | "fatigue_trend" | "mood_dip" | "positive_streak" | "general_balance";
  severity: "info" | "warning" | "success";
  title: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
  actionParams?: Record<string, any>;
  icon: "wind" | "moon" | "refresh" | "sparkles" | "trending";
  timestamp: string;
}

export function detectMoodPatterns(moods: MoodEntry[]): PatternInsight[] {
  const insights: PatternInsight[] = [];

  if (!moods || moods.length === 0) {
    insights.push({
      id: "initial-welcome",
      type: "general_balance",
      severity: "info",
      title: "Welcome to Insights",
      description: "Complete 2 or 3 daily mood check-ins to unlock pattern analysis, evening anxiety trends, and customized wellness recommendations.",
      actionLabel: "Log First Check-in",
      actionRoute: "/app/mood",
      icon: "sparkles",
      timestamp: new Date().toISOString()
    });
    return insights;
  }

  // Sort moods by timestamp descending
  const sorted = [...moods].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // 1. Check Evening Anxiety / Stress Trend
  const eveningAnxietyEntries = sorted.filter((m) => {
    const hour = new Date(m.timestamp).getHours();
    const isEvening = hour >= 17 || hour <= 4;
    const hasAnxiousTag = (m.tags || []).some((t) => ["Anxious", "Stressed", "Overwhelmed"].includes(t));
    const isLowScore = m.score <= 2;
    return isEvening && (hasAnxiousTag || isLowScore);
  });

  const recentAnxietyCount = eveningAnxietyEntries.length;
  if (recentAnxietyCount >= 2) {
    insights.push({
      id: "evening-anxiety-pattern",
      type: "anxiety_trend",
      severity: "warning",
      title: "Evening Tension Detected",
      description: `You've logged 'Anxious' or 'Stressed' ${recentAnxietyCount} evening${recentAnxietyCount > 1 ? "s" : ""} recently. Would you like to try a calming 4-7-8 breathing exercise to unwind your nervous system?`,
      actionLabel: "Start 4-7-8 Breathing",
      actionRoute: "/app/breathe",
      actionParams: { preset: "4-7-8" },
      icon: "wind",
      timestamp: new Date().toISOString()
    });
  }

  // 2. Check Frequent Fatigue / Sleep Need
  const tiredEntries = sorted.filter((m) => (m.tags || []).some((t) => ["Tired", "Exhausted"].includes(t)));
  if (tiredEntries.length >= 2) {
    insights.push({
      id: "fatigue-pattern",
      type: "fatigue_trend",
      severity: "info",
      title: "Frequent Fatigue Pattern",
      description: `You've reported feeling 'Tired' on ${tiredEntries.length} recent check-ins. Listening to soothing ambient rain or forest sleep sounds can improve your sleep depth tonight.`,
      actionLabel: "Explore Sleep Sounds",
      actionRoute: "/app/sleep",
      icon: "moon",
      timestamp: new Date().toISOString()
    });
  }

  // 3. Check Mood Dip / Low Score Streak
  const lowScoreRecent = sorted.slice(0, 3).filter((m) => m.score <= 2);
  if (lowScoreRecent.length >= 2) {
    insights.push({
      id: "mood-dip-pattern",
      type: "mood_dip",
      severity: "warning",
      title: "Cognitive Reframe Recommendation",
      description: "Noticeable low mood or heavy reflection notes detected in recent check-ins. A guided 3-step Cognitive Reframe helps challenge automatic negative thoughts.",
      actionLabel: "Start CBT Reframe",
      actionRoute: "/app/reframe",
      icon: "refresh",
      timestamp: new Date().toISOString()
    });
  }

  // 4. Check Positive Streak
  const highScoreRecent = sorted.slice(0, 5).filter((m) => m.score >= 4);
  if (highScoreRecent.length >= 2) {
    insights.push({
      id: "positive-streak-pattern",
      type: "positive_streak",
      severity: "success",
      title: "Positive Mindset Streak",
      description: `Great momentum! You have recorded ${highScoreRecent.length} high-mood check-ins recently. Taking time to notice positive moments builds long-term emotional resilience.`,
      actionLabel: "Log Gratitude Check-in",
      actionRoute: "/app/mood",
      icon: "sparkles",
      timestamp: new Date().toISOString()
    });
  }

  // Fallback pattern if no special condition met
  if (insights.length === 0) {
    insights.push({
      id: "balanced-baseline",
      type: "general_balance",
      severity: "info",
      title: "Balanced Emotional Baseline",
      description: "Your recent check-ins show a steady, balanced emotional state. Keep checking in daily to maintain self-awareness and track long-term trends.",
      actionLabel: "Check In Today",
      actionRoute: "/app/mood",
      icon: "trending",
      timestamp: new Date().toISOString()
    });
  }

  return insights;
}
