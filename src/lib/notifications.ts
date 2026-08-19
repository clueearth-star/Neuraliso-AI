import { storage } from "./storage";
import { sounds } from "./sounds";

export type NotificationPermissionState = "granted" | "denied" | "default" | "unsupported";

export interface ScheduledReminderInfo {
  enabled: boolean;
  time24: string;
  timeFormatted: string;
  nextOccurrence: string;
  permission: NotificationPermissionState;
  hasCheckedInToday: boolean;
  lastNotifiedDate: string | null;
}

const LAST_NOTIFIED_KEY = "neuraliso_last_notified_date";

/**
 * Check if the browser environment supports Notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission as NotificationPermissionState;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) return "unsupported";

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermissionState;
  } catch (error) {
    console.error("[Notifications] Permission request error:", error);
    return "denied";
  }
}

/**
 * Format "HH:MM" (24h) to "h:mm A" (12h with AM/PM)
 */
export function formatTime12Hour(time24: string): string {
  if (!time24 || !time24.includes(":")) return "8:00 PM";
  const [hStr, mStr] = time24.split(":");
  let hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10) || 0;

  if (isNaN(hours)) hours = 20;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Get human-readable description of when the next reminder will trigger
 */
export function getNextReminderDescription(reminderTime: string): string {
  if (!reminderTime || !reminderTime.includes(":")) return "Today at 8:00 PM";

  const now = new Date();
  const [hStr, mStr] = reminderTime.split(":");
  const targetHour = parseInt(hStr, 10);
  const targetMinute = parseInt(mStr, 10);

  const targetToday = new Date();
  targetToday.setHours(targetHour, targetMinute, 0, 0);

  const formattedTime = formatTime12Hour(reminderTime);

  if (now.getTime() < targetToday.getTime()) {
    return `Today at ${formattedTime}`;
  } else {
    return `Tomorrow at ${formattedTime}`;
  }
}

/**
 * Check if the user has already logged a mood check-in today
 */
export function hasCheckedInToday(): boolean {
  try {
    const today = new Date().toISOString().split("T")[0];
    const moods = storage.getMoods();
    return moods.some((m) => m.date === today);
  } catch {
    return false;
  }
}

/**
 * Get the date string when a notification was last delivered
 */
export function getLastNotifiedDate(): string | null {
  try {
    return storage.get(LAST_NOTIFIED_KEY);
  } catch {
    return null;
  }
}

/**
 * Set the date string when a notification was delivered
 */
export function setLastNotifiedDate(dateStr: string): void {
  try {
    storage.set(LAST_NOTIFIED_KEY, dateStr);
  } catch (err) {
    console.warn("[Notifications] Could not save last notified date:", err);
  }
}

/**
 * Trigger a browser notification (via Service Worker if active, falling back to Notification API)
 */
export async function showMoodCheckInNotification(
  customTitle?: string,
  customBody?: string,
  isTest = false
): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn("[Notifications] Notifications are not supported on this device/browser.");
    return false;
  }

  if (Notification.permission !== "granted") {
    console.warn("[Notifications] Cannot send notification: permission is not granted.");
    return false;
  }

  const title = customTitle || "Daily Mood Check-in 🌿";
  const body = customBody || "Take a gentle pause. How are you feeling right now?";
  const targetUrl = `${window.location.origin}/app/mood`;

  // Optional gentle audio cue if app sounds enabled
  try {
    const settings = storage.getSettings();
    if (settings.soundEnabled && sounds?.playBreathingCue) {
      sounds.playBreathingCue();
    }
  } catch {
    // Ignore audio error
  }

  let shown = false;

  // Method 1: Try Service Worker registration showNotification
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && "showNotification" in reg) {
        await reg.showNotification(title, {
          body,
          icon: "/icon.svg",
          badge: "/icon.svg",
          tag: "neuraliso-daily-mood",
          renotify: true,
          requireInteraction: false,
          data: {
            url: "/app/mood",
            date: new Date().toISOString(),
          },
          actions: [
            { action: "checkin", title: "✨ Check In" },
            { action: "dismiss", title: "Later" }
          ]
        } as any);
        shown = true;
      }
    } catch (swErr) {
      console.warn("[Notifications] Service Worker showNotification failed, using fallback:", swErr);
    }
  }

  // Method 2: Direct Window Notification fallback
  if (!shown) {
    try {
      const notification = new Notification(title, {
        body,
        icon: "/icon.svg",
        tag: "neuraliso-daily-mood",
      });

      notification.onclick = (e) => {
        e.preventDefault();
        window.focus();
        if (window.location.pathname !== "/app/mood") {
          window.location.href = targetUrl;
        }
        notification.close();
      };
      shown = true;
    } catch (notifErr) {
      console.error("[Notifications] Direct Notification constructor failed:", notifErr);
    }
  }

  if (shown && !isTest) {
    const today = new Date().toISOString().split("T")[0];
    setLastNotifiedDate(today);
  }

  return shown;
}

/**
 * Core Scheduler Engine
 */
class ReminderSchedulerEngine {
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  private listeners: Set<() => void> = new Set();

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error("[Notifications] Listener error:", err);
      }
    });
  }

  public start(): void {
    if (this.isRunning) {
      this.reschedule();
      return;
    }

    this.isRunning = true;

    // Listen for tab focus / wake-up
    if (typeof window !== "undefined") {
      window.addEventListener("visibilitychange", this.handleVisibilityChange);
      window.addEventListener("focus", this.handleVisibilityChange);
    }

    this.reschedule();

    // Secondary watchdog interval: runs every 30 seconds to catch wakeups or missed intervals
    this.intervalId = setInterval(() => {
      this.checkAndTriggerIfNeeded();
    }, 30000);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("visibilitychange", this.handleVisibilityChange);
      window.removeEventListener("focus", this.handleVisibilityChange);
    }
  }

  public reschedule(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    const settings = storage.getSettings();
    if (!settings.notifications || Notification.permission !== "granted") {
      return;
    }

    const reminderTime = settings.reminderTime || "20:00";
    const [hStr, mStr] = reminderTime.split(":");
    const targetHours = parseInt(hStr, 10) || 20;
    const targetMinutes = parseInt(mStr, 10) || 0;

    const now = new Date();
    const target = new Date();
    target.setHours(targetHours, targetMinutes, 0, 0);

    let delayMs = target.getTime() - now.getTime();
    if (delayMs <= 0) {
      // Target time for today has passed, schedule for tomorrow
      target.setDate(target.getDate() + 1);
      delayMs = target.getTime() - now.getTime();
    }

    // Set precise timeout
    this.timerId = setTimeout(() => {
      this.checkAndTriggerIfNeeded();
      this.reschedule();
    }, Math.max(delayMs, 1000));

    this.notifyListeners();
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      this.checkAndTriggerIfNeeded();
    }
  };

  /**
   * Evaluates if a notification should be triggered right now
   */
  public checkAndTriggerIfNeeded(): boolean {
    const settings = storage.getSettings();
    if (!settings.notifications || Notification.permission !== "granted") {
      return false;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const lastNotified = getLastNotifiedDate();

    // Already sent a notification today
    if (lastNotified === todayStr) {
      return false;
    }

    const reminderTime = settings.reminderTime || "20:00";
    const [hStr, mStr] = reminderTime.split(":");
    const targetHours = parseInt(hStr, 10) || 20;
    const targetMinutes = parseInt(mStr, 10) || 0;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    // Check if we have reached or passed the target hour & minute today
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    const targetTimeInMinutes = targetHours * 60 + targetMinutes;

    if (currentTimeInMinutes >= targetTimeInMinutes) {
      // Trigger notification
      showMoodCheckInNotification(
        "Time for your daily mood check-in 🌿",
        settings.reminderMessage || "Take 60 seconds to reflect on your day and log how you feel."
      );
      this.notifyListeners();
      return true;
    }

    return false;
  }

  public getStatus(): ScheduledReminderInfo {
    const settings = storage.getSettings();
    const permission = getNotificationPermission();
    const time24 = settings.reminderTime || "20:00";
    const lastNotifiedDate = getLastNotifiedDate();
    const checkedIn = hasCheckedInToday();

    return {
      enabled: settings.notifications && permission === "granted",
      time24,
      timeFormatted: formatTime12Hour(time24),
      nextOccurrence: getNextReminderDescription(time24),
      permission,
      hasCheckedInToday: checkedIn,
      lastNotifiedDate,
    };
  }
}

export const reminderScheduler = new ReminderSchedulerEngine();
