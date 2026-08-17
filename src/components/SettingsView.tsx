import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Trash2, 
  ShieldAlert, 
  Heart, 
  Check, 
  Volume2, 
  VolumeX, 
  X,
  User,
  LogOut,
  Sparkles,
  CloudCheck,
  Loader2,
  LogIn,
  UserPlus,
  CreditCard,
  ExternalLink,
  Calendar,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { storage } from "../lib/storage";
import { sounds } from "../lib/sounds";
import { AppSettings } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { Crown } from "lucide-react";

export const SettingsView: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfileName, signOut, syncStatus, syncMessage, isAnonymous } = useAuth();
  const { 
    isPro, 
    isLifetime, 
    isTrial, 
    status, 
    tier, 
    expiresAt, 
    billingPeriod, 
    cancelSubscription, 
    upgradeToPro, 
    openUpgradeModal 
  } = useSubscription();
  
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const [showCancelSurvey, setShowCancelSurvey] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [cancellingSub, setCancellingSub] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const [nameInput, setNameInput] = useState("");
  const [updatingName, setUpdatingName] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (profile?.name) {
      setNameInput(profile.name);
    } else if (user?.user_metadata?.full_name || user?.user_metadata?.name) {
      setNameInput(user.user_metadata.full_name || user.user_metadata.name);
    } else {
      const ob = storage.getOnboarding();
      if (ob.name) setNameInput(ob.name);
    }
  }, [profile, user]);

  useEffect(() => {
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

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    sounds.playClick();
    setUpdatingName(true);
    setProfileSuccess(false);

    try {
      const { error } = await updateProfileName(nameInput.trim());
      if (!error) {
        sounds.playSuccess();
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } finally {
      setUpdatingName(false);
    }
  };

  const handleConfirmDelete = () => {
    sounds.playClick();
    storage.deleteAllData();
    setShowDeleteModal(false);
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 pb-28 md:pb-12 animate-page-in text-left font-sans">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-300 text-xs font-semibold">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Preferences &amp; Account</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-white/60">
          Manage your cloud account, customize daily check-in preferences, and control local data storage.
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
        {/* 0. Account & Cloud Sync Section */}
        <div className="wellness-card p-6 sm:p-8 space-y-6 border border-[#00d4ff]/20 bg-gradient-to-br from-[#00d4ff]/5 via-transparent to-transparent">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4 font-serif">
            <User className="w-5 h-5 text-[#00d4ff]" />
            <span>Account &amp; Cloud Backup</span>
          </h2>

          {user ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Signed in as</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#00d4ff]/15 text-[#00d4ff] text-[11px] font-bold">
                      Verified Cloud
                    </span>
                  </div>
                  <p className="text-xs text-white/70 font-mono">{user.email}</p>
                  <div className="flex items-center gap-1.5 pt-1 text-xs text-emerald-400">
                    {syncStatus === "syncing" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00d4ff]" />
                        <span className="text-[#00d4ff]">Syncing data with cloud...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{syncMessage || "All local data backed up to Supabase"}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    signOut();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>

              {/* Profile Name Form */}
              <form onSubmit={handleUpdateName} className="space-y-3">
                <label className="text-xs font-semibold text-white/80 block">Your Name / Nickname</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your preferred name..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#00d4ff] focus:bg-white/10 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={updatingName}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-xs shadow-md shadow-[#00d4ff]/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updatingName ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Save Name</span>
                    )}
                  </button>
                </div>
                {profileSuccess && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Profile name updated across all devices!</span>
                  </p>
                )}
              </form>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Sparkles className="w-4 h-4 text-[#00d4ff]" />
                    <span className="text-sm font-bold text-white">Anonymous Mode Active</span>
                  </div>
                  <p className="text-xs text-white/70 max-w-lg leading-relaxed">
                    You are currently exploring without a cloud account. Your mood logs, CBT reframes, and AI chat history are saved only in this browser's local storage.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <Link
                    to="/login"
                    onClick={() => sounds.playClick()}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#00d4ff]" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => sounds.playClick()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-xs shadow-md shadow-[#00d4ff]/20 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 0.5 Subscription & Billing Section */}
        <div className="wellness-card p-6 sm:p-8 space-y-6 border border-[#FFD700]/20 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-transparent">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
              <CreditCard className="w-5 h-5 text-[#FFD700]" />
              <span>Subscription &amp; Billing</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isPro ? "bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30" : "bg-white/10 text-white/70"
              }`}>
                {isPro && (isLifetime ? <Crown className="w-3.5 h-3.5 fill-current" /> : <Sparkles className="w-3.5 h-3.5" />)}
                <span>{isLifetime ? "Plus Lifetime Member" : isPro ? (isTrial ? "Plus (Free Trial)" : status === "cancelled" ? "Plus (Cancelled)" : "Plus Member") : "Free Plan"}</span>
              </span>
            </div>
          </div>

          {isPro ? (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {isLifetime ? "Neuraliso Plus Lifetime" : `Neuraliso Plus ${billingPeriod ? `(${billingPeriod})` : ""}`}
                      </h3>
                      {isLifetime && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                          Permanent Access
                        </span>
                      )}
                    </div>
                    {isLifetime ? (
                      <p className="text-xs text-amber-200/90 flex items-center gap-1.5 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
                        <span>One-time purchase active forever. No recurring fees or renewals ever.</span>
                      </p>
                    ) : status === "cancelled" ? (
                      <p className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>
                          Your Plus access continues until{" "}
                          <strong>{expiresAt ? new Date(expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "the end of your billing cycle"}</strong>. We&apos;d love to have you back anytime.
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-white/70 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#00d4ff]" />
                        <span>
                          {isTrial ? "Free trial active. Renews automatically unless cancelled." : `Next billing cycle renews automatically.`}
                          {expiresAt && ` Valid until ${new Date(expiresAt).toLocaleDateString()}`}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <a
                      href="https://app.dodo.payments.com/portal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Manage in Dodo Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {!isLifetime && (
                      status !== "cancelled" ? (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setShowCancelSurvey(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-all cursor-pointer"
                        >
                          Cancel Plan
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            sounds.playClick();
                            await upgradeToPro(billingPeriod || "monthly", true);
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0B1121] font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Resume Subscription</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Optional Exit Survey (No guilt, no dark patterns) */}
                {showCancelSurvey && status !== "cancelled" && (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/15 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">We&apos;re sorry to see you go!</h4>
                      <button
                        type="button"
                        onClick={() => setShowCancelSurvey(false)}
                        className="text-white/50 hover:text-white text-xs cursor-pointer"
                      >
                        Keep Plan
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs text-white/80 block">
                        Optional feedback: What could we do better?
                      </label>
                      <input
                        type="text"
                        value={cancelFeedback}
                        onChange={(e) => setCancelFeedback(e.target.value)}
                        placeholder="e.g. Too expensive, don't use it enough, missing features..."
                        className="w-full px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#00d4ff]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCancelSurvey(false)}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all cursor-pointer"
                      >
                        Never mind, keep Plus
                      </button>
                      <button
                        type="button"
                        disabled={cancellingSub}
                        onClick={async () => {
                          sounds.playClick();
                          setCancellingSub(true);
                          await cancelSubscription();
                          setCancellingSub(false);
                          setShowCancelSurvey(false);
                          setCancelSuccess(true);
                        }}
                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {cancellingSub ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        <span>Confirm Cancellation</span>
                      </button>
                    </div>
                  </div>
                )}

                {cancelSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.5]" />
                    <span>Your Plus plan has been cancelled without penalty. Your Plus access continues until {expiresAt ? new Date(expiresAt).toLocaleDateString() : "the end of your current cycle"}. We&apos;d love to have you back anytime.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                  <span>Upgrade to Neuraliso Plus</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30">
                    7-Day Free Trial
                  </span>
                </h3>
                <p className="text-xs text-slate-300 max-w-md">
                  Unlock unlimited CBT thought reframes, all 6 restorative sleep soundscapes, 24/7 AI companion chat, 30-day trends, and CSV data export.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openUpgradeModal("Manage your subscription plan")}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] hover:opacity-95 text-[#0B1121] font-bold text-xs sm:text-sm shadow-md shadow-[#FFD700]/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View Pricing &amp; Plans</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 1. Appearance & Theme */}
        <div className="wellness-card p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4 font-serif">
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
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4 font-serif">
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
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4 font-serif">
            <ShieldAlert className="w-5 h-5 text-teal-400" />
            <span>Data Storage &amp; Cache</span>
          </h2>

          <div className="space-y-4 text-xs text-white/70 leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/5">
            <p>
              <strong>Local Browser Cache:</strong> When signed in, your data is securely backed up to your Supabase cloud account while maintaining a lightning-fast offline local cache.
            </p>
          </div>

          <div className="flex justify-end pt-2">
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
          <h3 className="text-base font-bold text-white font-serif">Neuraliso Wellness Space</h3>
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
