import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Clock, 
  Download, 
  Trash2, 
  ShieldAlert, 
  Heart, 
  Check, 
  Volume2, 
  VolumeX,
  X
} from "lucide-react";
import { storage } from "../lib/storage";
import { sounds } from "../lib/sounds";
import { AppSettings } from "../types";

export const SettingsView: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    // Apply theme
    if (settings.theme === "light") {
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.remove("theme-light");
    }
  }, [settings.theme]);

  const updateSetting = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => {
    sounds.playClick();
    const next = { ...settings, [key]: val };
    setSettings(next);
    storage.saveSettings(next);

    if (key === "soundEnabled") {
      sounds.setMuted(!val);
    }

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleExportJSON = () => {
    sounds.playSuccess();
    const jsonStr = storage.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `neuraliso-wellness-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleConfirmDelete = () => {
    sounds.playClick();
    storage.deleteAllData();
    setShowDeleteModal(false);
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 pb-28 md:pb-12 animate-page-in text-left">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-300 text-xs font-semibold">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Preferences &amp; Privacy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-white/60">
          Customize your experience, manage daily reminders, and control your local storage data.
        </p>
      </div>

      {saveToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-full bg-emerald-500 text-[#0B1121] font-bold text-xs shadow-lg animate-page-in flex items-center gap-1.5">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Settings updated automatically!</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* 1. Appearance & Theme */}
        <div className="wellness-card p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
            <Sun className="w-5 h-5 text-amber-400" />
            <span>Appearance &amp; Sound</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-1">
              <span className="text-sm font-bold text-white block">Color Theme</span>
              <span className="text-xs text-white/50 block">Choose dark mode (default) or light mode</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting("theme", "dark")}
                className={`flex-1 py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  settings.theme === "dark"
                    ? "bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff] shadow-sm"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </button>

              <button
                onClick={() => updateSetting("theme", "light")}
                className={`flex-1 py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  settings.theme === "light"
                    ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </button>
            </div>
          </div>

          {/* Sound Effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-4 border-t border-white/5">
            <div className="space-y-1">
              <span className="text-sm font-bold text-white block">Sound Effects &amp; Audio</span>
              <span className="text-xs text-white/50 block">Enable soft UI pops, singing bowl bells &amp; chimes</span>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => updateSetting("soundEnabled", !settings.soundEnabled)}
                className={`px-6 py-3 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  settings.soundEnabled
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white"
                }`}
              >
                {settings.soundEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Sounds Enabled</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Muted</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Reminders & Notifications */}
        <div className="wellness-card p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
            <Bell className="w-5 h-5 text-[#00d4ff]" />
            <span>Daily Check-in Reminders</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-1">
              <span className="text-sm font-bold text-white block">Reminder Time</span>
              <span className="text-xs text-white/50 block">Set a gentle daily time to reflect on your mood</span>
            </div>
            <div>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => updateSetting("reminderTime", e.target.value)}
                className="bg-black/30 border border-white/15 px-4 py-2.5 rounded-xl font-mono text-sm text-white w-full sm:w-auto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-4 border-t border-white/5">
            <div className="space-y-1">
              <span className="text-sm font-bold text-white block">Browser Notifications</span>
              <span className="text-xs text-white/50 block">Receive gentle browser notifications at reminder time</span>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (!settings.notifications && "Notification" in window && Notification.permission !== "granted") {
                    Notification.requestPermission().then((perm) => {
                      if (perm === "granted") updateSetting("notifications", true);
                    });
                  } else {
                    updateSetting("notifications", !settings.notifications);
                  }
                }}
                className={`px-6 py-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  settings.notifications
                    ? "bg-[#00d4ff] text-[#0B1121] shadow-md shadow-[#00d4ff]/20"
                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white"
                }`}
              >
                {settings.notifications ? "Notifications Active" : "Notifications Disabled"}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Data Ownership & Privacy */}
        <div className="wellness-card p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
            <Download className="w-5 h-5 text-teal-400" />
            <span>Data Ownership &amp; Storage</span>
          </h2>

          <div className="space-y-4 text-xs text-white/70 leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/5">
            <p>
              <strong>100% Local Storage:</strong> Your check-ins, CBT reframes, and settings live strictly on this browser. No servers, no passwords, no cloud sync.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              onClick={handleExportJSON}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-xs transition-all shadow-md shadow-[#00d4ff]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloaded ? "JSON File Downloaded!" : "Export All Data (JSON)"}</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setShowDeleteModal(true);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-rose-500/20 hover:bg-rose-500 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete All Local Data</span>
            </button>
          </div>
        </div>

        {/* 4. About Section */}
        <div className="wellness-card p-6 sm:p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] mx-auto">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h3 className="text-base font-bold text-white">Neuraliso Wellness Space</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Version 2.0.0 &bull; Built with care for emotional wellness, mindfulness, and tranquility.
          </p>
          <p className="text-[11px] text-white/30 pt-2">
            Not a medical substitute. If in distress, please call 988 or reach out to healthcare professionals.
          </p>
        </div>
      </div>

      {/* Confirmation Modal for Delete All Data */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-page-in">
          <div className="w-full max-w-md bg-[#1A2338] border border-rose-500/40 rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Erase all local data?</h3>
                <p className="text-xs text-rose-200/80 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5">
              This will permanently remove your mood check-in history, CBT reframes, activity logs, streak counter, and onboarding profile from this browser&apos;s local storage.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Yes, Erase Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
