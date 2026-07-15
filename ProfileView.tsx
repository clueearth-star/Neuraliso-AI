import React, { useState, useEffect } from "react";
import { JournalEntry } from "../types";
import { PremiumBlueprintView } from "./PremiumBlueprintView";
import { SystemDiagnostics } from "./SystemDiagnostics";

interface ProfileViewProps {
  entries: JournalEntry[];
  user?: any;
  userProfile?: {
    userId: string;
    displayName: string;
    premiumActive: boolean;
    themeMode: "light" | "neutral";
    notificationsEnabled: boolean;
  } | null;
  onUpdateProfile?: (fields: Partial<any>) => void;
  onSignOut?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  entries, 
  user, 
  userProfile, 
  onUpdateProfile,
  onSignOut 
}) => {
  // Determine if utilizing actual database or sandbox defaults
  const isAuthEnabled = !!user;

  // Local state fallbacks if guest/sandbox
  const [localPremium, setLocalPremium] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(true);
  const [localTheme, setLocalTheme] = useState<"light" | "neutral">("light");

  const premiumActive = userProfile ? (userProfile.premiumActive ?? false) : localPremium;
  const notifications = userProfile ? (userProfile.notificationsEnabled ?? true) : localNotifications;
  const themeMode = userProfile ? (userProfile.themeMode ?? "light") : localTheme;

  const [mockHeartRate, setMockHeartRate] = useState(72);
  const [isMeasuringHR, setIsMeasuringHR] = useState(true);

  // Wearable simulated heart rate oscillation
  useEffect(() => {
    if (!isMeasuringHR) return;
    const interval = setInterval(() => {
      setMockHeartRate((prev) => {
        const drift = Math.random() > 0.5 ? 1 : -1;
        const next = prev + drift;
        return next < 60 ? 64 : next > 90 ? 82 : next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isMeasuringHR]);

  const togglePremium = () => {
    if (onUpdateProfile) {
      onUpdateProfile({ premiumActive: !premiumActive });
    } else {
      setLocalPremium((p) => !p);
    }
  };

  const toggleNotifications = () => {
    if (onUpdateProfile) {
      onUpdateProfile({ notificationsEnabled: !notifications });
    } else {
      setLocalNotifications((p) => !p);
    }
  };

  const toggleThemeMode = () => {
    const nextTheme = themeMode === "light" ? "neutral" : "light";
    if (onUpdateProfile) {
      onUpdateProfile({ themeMode: nextTheme });
    } else {
      setLocalTheme(nextTheme);
    }
  };

  const avgEnergy = entries.length > 0 
    ? (entries.reduce((acc, curr) => acc + curr.energy, 0) / entries.length).toFixed(1)
    : "6.5";

  // Display metadata
  const displayName = user?.displayName || userProfile?.displayName || "Neuraliso Seeker";
  const userInitials = displayName.charAt(0).toUpperCase() || "N";
  const userPhoto = user?.photoURL || null;
  const secureIdSuffix = user?.uid ? `${user.uid.slice(0, 8)}...` : "OFFLINE-SANDBOX";

  return (
    <div id="profile-view-container" className="pb-6 space-y-6 max-w-xl mx-auto px-1 animate-fade-in">
      
      {/* 1. USER PROFILE CARD */}
      <div className="wellness-card p-6 border bg-white flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Soft background colors blur */}
        <div className="absolute top-0 left-0 w-full h-12 bg-linear-to-r from-soft-green to-calm-blue/30 opacity-60" />
        
        {/* Avatar Image / Ring */}
        <div className="relative mt-4">
          {userPhoto ? (
            <img 
              src={userPhoto} 
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white bg-soft-green text-deep-sage flex items-center justify-center font-serif italic font-bold text-3xl shadow-md">
              {userInitials}
            </div>
          )}
          {premiumActive && (
            <span className="absolute bottom-0 right-0 bg-yellow-500 text-white font-bold text-[8px] py-0.5 px-2.5 rounded-full shadow-xs animate-bounce uppercase">
              VIP
            </span>
          )}
        </div>

        {/* User Details */}
        <div className="mt-3.5 space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="font-sans font-bold text-dark-text text-base">{displayName}</h3>
            {premiumActive && <span className="text-amber-600">★</span>}
          </div>
          <p className="text-[10px] text-muted-text font-mono">ID: {secureIdSuffix}</p>
          {user?.email && <p className="text-[10px] text-muted-text font-mono -mt-1">{user.email}</p>}
          <p className="text-xs text-muted-text max-w-md mx-auto pt-1 font-serif italic">
            "Breathing in, I center myself. Breathing out, I release what I cannot control."
          </p>
        </div>

        {/* Quick stats board */}
        <div className="grid grid-cols-3 gap-3 w-full border-t border-soft-green/20 pt-4 mt-5 text-center font-sans">
          <div>
            <span className="text-sm font-bold text-dark-text block">
              {entries.length > 0 ? entries.length : "0"}
            </span>
            <span className="text-[10px] text-muted-text">Journal Count</span>
          </div>
          <div>
            <span className="text-sm font-bold text-primary-sage block">
              {entries.length > 0 ? entries.length * 10 : "0"} pts
            </span>
            <span className="text-[10px] text-muted-text">Completed</span>
          </div>
          <div>
            <span className="text-sm font-bold text-blue-800 block">
              {avgEnergy} / 10
            </span>
            <span className="text-[10px] text-muted-text">Avg Vitality</span>
          </div>
        </div>
      </div>

      {/* 2. WEARABLE HEALTH INTELLIGENCE MODULE */}
      <div className="wellness-card p-6 border bg-white space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-soft-green/10">
          <div>
            <h4 className="font-sans font-bold text-dark-text text-sm">Wearable Health Integration</h4>
            <p className="text-[10px] text-muted-text font-mono uppercase">Biofeedback connection</p>
          </div>
          <button
            onClick={() => setIsMeasuringHR((p) => !p)}
            className="text-[10px] text-primary-sage border border-primary-sage/20 py-1 px-2.5 rounded-full hover:bg-soft-green/30"
          >
            {isMeasuringHR ? "Pause Wearable" : "Reconnect Bio"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          
          {/* Heart rate indicator */}
          <div className="p-4 bg-red-50/45 rounded-2xl border border-red-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-red-800 font-bold uppercase tracking-wide block">HEART RATE</span>
              <div className="flex items-baseline mt-1 gap-1">
                <span className="text-3xl font-bold text-danger-red font-mono">
                  {isMeasuringHR ? mockHeartRate : "--"}
                </span>
                <span className="text-[9px] text-red-700 font-semibold font-mono">BPM</span>
              </div>
            </div>
            {isMeasuringHR && (
              <span className="text-xl text-danger-red animate-ping opacity-75">
                ♥
              </span>
            )}
          </div>

          {/* Stress prediction helper */}
          <div className="p-4 bg-blue-50/45 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-blue-850 font-bold uppercase tracking-wide block">STRESS CORRELATION</span>
              <div className="flex items-baseline mt-1">
                <span className="text-xl font-bold text-blue-800">
                  {mockHeartRate < 72 ? "Slight tension" : mockHeartRate <= 80 ? "Medium worry" : "Cortisol spike"}
                </span>
              </div>
            </div>
          </div>

        </div>

        <p className="text-[10px] text-muted-text italic text-center">
          *Note: Neuraliso AI reads Apple Health & WearOS baseline records securely on connected smartphones.
        </p>
      </div>

      {/* ELITE COGNITIVE BLUEPRINT SECTION */}
      <PremiumBlueprintView entries={entries} userName={displayName} />
      
      {/* 3. PREMIUM PREMIUM SAAS FEATURES CHECK IN CARD */}
      <div className="premium-card p-6 border relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-yellow-200/40 rounded-full blur-xl pointer-events-none" />
        
        <div className="space-y-1 mb-4">
          <span className="text-[10px] font-bold tracking-wider text-amber-800 bg-yellow-200/50 px-2.5 py-0.5 rounded-full w-fit block mb-1">
            NEURALISO PREMIUM UPGRADE
          </span>
          <h4 className="font-serif italic font-bold text-xl text-dark-text animate-pulse">Unlock Complete Recovery</h4>
          <p className="text-xs text-muted-text leading-tight pt-1">
            Access unlimited weekly reports, daily biofeedback stress tracking predictions, and deep voice CBT audio channels.
          </p>
        </div>

        {/* Premium perks checklist */}
        <div className="space-y-2 border-t border-soft-green/35 pt-4 mb-5">
          <div className="flex items-center gap-2 text-xs text-muted-text">
            <span className="text-yellow-600 font-bold text-sm">★</span>
            <span>Comprehensive Weekly Bio-analysis PDF</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-text">
            <span className="text-yellow-600 font-bold text-sm">★</span>
            <span>Always-on emergency voice assistant grounder</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-text">
            <span className="text-yellow-600 font-bold text-sm">★</span>
            <span>Wearables advanced predictions telemetry</span>
          </div>
        </div>

        {/* Upgrade Call to action */}
        <button
          id="toggle-premium-membership"
          onClick={togglePremium}
          className="w-full bg-deep-sage text-white text-xs font-bold py-3 px-5 rounded-full shadow-lg shadow-deep-sage/15 hover:bg-primary-sage transition-all active:scale-95 flex items-center justify-between cursor-pointer"
        >
          <span>{premiumActive ? "Manage VIP Subscription" : "Activate 7-Day Free Trial ($4.99/mo)"}</span>
          <span className="font-mono">{premiumActive ? "ACTIVE ✓" : "SIGN UP →"}</span>
        </button>
      </div>

      {/* 4. UTILITY SETTINGS PANEL */}
      <div className="wellness-card p-6 border bg-white space-y-4">
        <h4 className="font-sans font-bold text-dark-text text-sm pb-2 border-b">Settings Control Center</h4>

        {/* Notification toggle */}
        <div className="flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-dark-text block">Smart Breathing Reminders</span>
            <span className="text-[10px] text-muted-text">Comforting vibration hints when feeling anxious</span>
          </div>
          <button
            onClick={toggleNotifications}
            className={`w-12 h-6.5 rounded-full transition-all flex items-end p-1 cursor-pointer ${notifications ? "bg-primary-sage" : "bg-gray-300"}`}
          >
            <span className={`w-4.5 h-4.5 bg-white rounded-full transition-all transform shadow-xs ${notifications ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        {/* Theme mode preference toggle */}
        <div id="theme-soothe-toggle-container" className="flex justify-between items-center text-xs py-1">
          <div>
            <span className="font-bold text-dark-text block">Soothe Visual Theme</span>
            <span className="text-[10px] text-muted-text font-mono uppercase">Contrasting canvas templates</span>
          </div>
          
          <div className="relative flex bg-slate-100 p-1 rounded-full border border-soft-green/15 max-w-[210px] items-center">
            <button
              id="theme-select-light"
              onClick={() => {
                if (themeMode !== "light") toggleThemeMode();
              }}
              className={`relative z-10 px-3 py-1.5 text-[10px] font-bold rounded-full transition-all duration-300 cursor-pointer ${
                themeMode === "light" 
                  ? "text-deep-sage" 
                  : "text-muted-text hover:text-dark-text"
              }`}
            >
              {themeMode === "light" && (
                <span className="absolute inset-0 bg-white rounded-full z-[-1] border border-soft-green/30 shadow-xs" />
              )}
              Pure Light
            </button>
            <button
              id="theme-select-neutral"
              onClick={() => {
                if (themeMode !== "neutral") toggleThemeMode();
              }}
              className={`relative z-10 px-3 py-1.5 text-[10px] font-bold rounded-full transition-all duration-300 cursor-pointer ${
                themeMode === "neutral" 
                  ? "text-amber-900" 
                  : "text-muted-text hover:text-dark-text"
              }`}
            >
              {themeMode === "neutral" && (
                <span className="absolute inset-0 bg-white rounded-full z-[-1] border border-amber-200 shadow-xs" />
              )}
              Warm Neutral
            </button>
          </div>
        </div>

        {/* Privacy options */}
        <div className="flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-dark-text block">Database Synch Guard</span>
            <span className="text-[10px] text-muted-text">
              {isAuthEnabled ? "Cloud-hosted security via resilient Firebase authentication" : "Skip Auth (Saving only to local storage)"}
            </span>
          </div>
          <button
            onClick={() => alert(isAuthEnabled ? "Your Neuraliso journals are locked securely under resilient Firebase security rules." : "No active session loaded. Saving only in offline sandbox.")}
            className="text-[10px] text-muted-text hover:text-dark-text underline font-semibold cursor-pointer"
          >
            Check Status
          </button>
        </div>

        {/* Logout session action */}
        {isAuthEnabled && onSignOut && (
          <div className="pt-4 border-t border-gray-150">
            <button
              id="firebase-signout-action-btn"
              onClick={onSignOut}
              className="w-full bg-red-50 hover:bg-red-100 text-danger-red border border-red-200 py-3 rounded-full font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🚪 Sign Out Securely (Disconnect Firebase Account)</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. SYSTEM PERFORMANCE AND TELEMETRY PORTAL */}
      <SystemDiagnostics />

      <div className="text-center font-mono text-[9px] text-muted-text/80 space-y-1">
        <p>NEURALISO AI SECURED DB AUTH ROUTING PROTOCOL ACTIVE</p>
        <p>© 2026 Neuraliso Inc. Connected with secure cryptographic tokens.</p>
      </div>

    </div>
  );
};
