import { useEffect, useState, useCallback } from "react";
import {
  reminderScheduler,
  ScheduledReminderInfo,
  requestNotificationPermission,
  showMoodCheckInNotification,
  isNotificationSupported,
} from "../lib/notifications";
import { storage } from "../lib/storage";

export function useReminderScheduler() {
  const [status, setStatus] = useState<ScheduledReminderInfo>(() =>
    reminderScheduler.getStatus()
  );
  const [testingNotification, setTestingNotification] = useState(false);
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  const refreshStatus = useCallback(() => {
    setStatus(reminderScheduler.getStatus());
  }, []);

  useEffect(() => {
    // Start background scheduler on mount
    reminderScheduler.start();

    // Subscribe to changes
    const unsubscribe = reminderScheduler.subscribe(refreshStatus);

    return () => {
      unsubscribe();
    };
  }, [refreshStatus]);

  const enableNotifications = async (): Promise<boolean> => {
    const perm = await requestNotificationPermission();
    if (perm === "granted") {
      const current = storage.getSettings();
      storage.saveSettings({
        ...current,
        notifications: true,
      });
      reminderScheduler.reschedule();
      refreshStatus();
      return true;
    } else {
      const current = storage.getSettings();
      storage.saveSettings({
        ...current,
        notifications: false,
      });
      refreshStatus();
      return false;
    }
  };

  const disableNotifications = () => {
    const current = storage.getSettings();
    storage.saveSettings({
      ...current,
      notifications: false,
    });
    reminderScheduler.reschedule();
    refreshStatus();
  };

  const updateReminderTime = (newTime: string) => {
    const current = storage.getSettings();
    storage.saveSettings({
      ...current,
      reminderTime: newTime,
    });
    reminderScheduler.reschedule();
    refreshStatus();
  };

  const sendTestNotification = async () => {
    setTestingNotification(true);
    setTestSentMessage(null);

    // If permission not granted yet, ask first
    let perm = status.permission;
    if (perm !== "granted") {
      perm = await requestNotificationPermission();
      refreshStatus();
    }

    if (perm === "granted") {
      const success = await showMoodCheckInNotification(
        "Daily Mood Check-in 🌿 (Test)",
        "Gentle reminder: take 60 seconds to check in with how you are feeling right now.",
        true
      );
      if (success) {
        setTestSentMessage("Test notification sent! Look for the popup or notification banner.");
      } else {
        setTestSentMessage("Notification created in window.");
      }
    } else {
      setTestSentMessage("Please enable notification permissions in your browser to receive reminders.");
    }

    setTestingNotification(false);

    setTimeout(() => {
      setTestSentMessage(null);
    }, 6000);
  };

  return {
    status,
    isSupported: isNotificationSupported(),
    enableNotifications,
    disableNotifications,
    updateReminderTime,
    sendTestNotification,
    testingNotification,
    testSentMessage,
    refreshStatus,
  };
}
