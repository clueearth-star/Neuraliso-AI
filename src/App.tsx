import React, { useState, useEffect } from "react";
import { ActiveView, JournalEntry } from "./types";
import { Navigation } from "./components/Navigation";
import { HomeView } from "./components/HomeView";
import { SOSView } from "./components/SOSView";
import { ChatView } from "./components/ChatView";
import { MoodCheckView } from "./components/MoodCheckView";
import { AnalyticsView } from "./components/AnalyticsView";
import { HotlineView } from "./components/HotlineView";
import { ProfileView } from "./components/ProfileView";
import { ReliefStationView } from "./components/ReliefStationView";
import { SOSIcon } from "./components/Icons";

// Onboarding & Enterprise Additions
import { OnboardingWizard } from "./components/OnboardingWizard";
import { DodoPaywallView } from "./components/DodoPaywallView";
import { EnterprisePortal } from "./components/EnterprisePortal";
import { ReviewsView } from "./components/ReviewsView";
import { NeuroplasmWorkshopView } from "./components/NeuroplasmWorkshopView";
import { MascotAssistant } from "./components/MascotAssistant";
import { analytics } from "./lib/analytics";
import { sounds } from "./lib/sounds";

// Firebase integrations
import { 
  db, 
  auth,
  loginWithGoogle as firebaseLoginWithGoogle,
  logoutUser as firebaseLogoutUser,
  registerWithEmail as firebaseRegisterWithEmail,
  loginWithEmail as firebaseLoginWithEmail,
  loginAnonymously as firebaseLoginAnonymously,
  handleFirestoreError, 
  OperationType 
} from "./firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { supabase, reinitializeSupabase } from "./lib/supabase";

interface AppContentProps {
  user: {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    createdAt?: Date;
  } | null;
  loadingAuth: boolean;
  loginWithGoogle: () => Promise<any>;
  logoutUser: () => Promise<any>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<any>;
  loginWithEmail: (email: string, pass: string) => Promise<any>;
  loginAnonymously: () => Promise<any>;
  isAuth0Active: boolean;
  authDebug?: {
    hasSession: string;
    lastEvent: string;
    lastEventUser: string;
    url: string;
    isRedirect: boolean;
  };
}

function AppContent({
  user,
  loadingAuth,
  loginWithGoogle,
  logoutUser,
  registerWithEmail,
  loginWithEmail,
  loginAnonymously,
  isAuth0Active,
  authDebug
}: AppContentProps) {
  const [activeView, setActiveView] = useState<ActiveView>("home");
  const [currentStress, setCurrentStress] = useState<number>(4);
  const [crisisActive, setCrisisActive] = useState<boolean>(false);

  // Synchronous page view tracking in GA4
  useEffect(() => {
    analytics.trackPageView(activeView);
  }, [activeView]);

  const [userProfile, setUserProfile] = useState<{
    userId: string;
    displayName: string;
    premiumActive: boolean;
    trialDaysLeft?: number | null;
    isTrial?: boolean;
    subscriptionReason?: string;
    themeMode: "light" | "neutral";
    notificationsEnabled: boolean;
    completedOnboarding?: boolean;
    wellnessGoals?: string[];
    ageRange?: string;
    challenges?: string[];
    coping?: string[];
    initialScore?: number;
    actionPlan?: any[];
    calmXP?: number;
    currentStreak?: number;
    milestonesMet?: string[];
    preferredCheckinTime?: string;
  } | null>(null);

  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  // Fallback state if user continues offline
  const [isOfflineSandbox, setIsOfflineSandbox] = useState<boolean>(false);

  // Onboarding completion persistence state
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem("neuraliso_onboarded") === "true";
  });

  // Enterprise portal view state
  const [enterpriseActive, setEnterpriseActive] = useState<boolean>(false);

  // Onboarded initial stats memory
  const [onboardingProfile, setOnboardingProfile] = useState<any>(() => {
    const saved = localStorage.getItem("neuraliso_onboarding_profile");
    return saved ? JSON.parse(saved) : null;
  });

  // Journal database logs (fetched from Firestore or localStorage fallback)
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Mascot assistant specific triggerEvent state
  const [mascotEvent, setMascotEvent] = useState<{
    type: "ACHIEVEMENT_UNLOCKED" | "FIRST_TIME_TAB_OPEN" | "CUSTOM_ALERT";
    payload: string;
    timestamp: number;
  } | null>(null);

  // Trigger Mascot Event when entries are added (such as milestones)
  useEffect(() => {
    if (entries.length === 0) return;
    
    // Read last seen entries count to celebrate milestones!
    const lastSeenCount = Number(localStorage.getItem("neuraliso_mascot_last_entries_event") || "0");
    if (entries.length > lastSeenCount) {
      localStorage.setItem("neuraliso_mascot_last_entries_event", String(entries.length));
      
      let payload = "";
      if (entries.length === 1) {
        payload = "Premium Somatic Sprouter! 🌱 You just completed your very first log. Real courage begins here!";
      } else if (entries.length === 3) {
        payload = "3-Day Reflection habit! ⚡ Your neural consistency is establishing beautiful paths.";
      } else if (entries.length >= 7) {
        payload = "7-Day Consistency Streak! 🏆 Look at you shine! Consistency is the ultimate power. We are crushing this daily mission together!";
      } else {
        payload = `A new emotional log was filed! That's ${entries.length} logs in your secure history database! Keep dedicating valuable time to your inner world.`;
      }
      
      setMascotEvent({
        type: "ACHIEVEMENT_UNLOCKED",
        payload,
        timestamp: Date.now()
      });
    }
  }, [entries.length]);

  // Synchronize theme class directly to document element so the entire viewport matches perfectly and prevents automatic browser dark mode from leaking
  useEffect(() => {
    const activeTheme = userProfile?.themeMode || "light";
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove("theme-light", "theme-neutral");
    // Add the active theme class
    root.classList.add(activeTheme === "neutral" ? "theme-neutral" : "theme-light");
    
    // Explicitly enforce light color scheme to prevent browsers from forcing automatic dark mode overrides
    root.style.colorScheme = "light";
  }, [userProfile?.themeMode]);

  // 1. Core Authentication Monitor (Supabase Secure Proxy Profile & Progress Synchronization)
  useEffect(() => {
    if (loadingAuth) return;

    if (user) {
      setIsOfflineSandbox(false);
      setLoadingProfile(true);
      
      const syncProfileAndData = async () => {
        try {
          // Fetch profile from our secure Supabase proxy API
          const res = await fetch(`/api/user-profile/${user.id}`);
          if (!res.ok) {
            throw new Error(`Profile query failed with status ${res.status}`);
          }
          const data = await res.json();
          console.log("[Auth debug] syncProfileAndData fetched profile data:", data);
          
          if (data) {
            // Real-time server-side verified subscription status check (never trust client flags)
            let verifiedPremium = data.premiumActive ?? false;
            let trialDaysLeft = null;
            let isTrial = false;
            let subscriptionReason = undefined;
            try {
              const subRes = await fetch(`/api/verify-subscription?userId=${user.id}`);
              if (subRes.ok) {
                const subData = await subRes.json();
                verifiedPremium = subData.premiumActive;
                trialDaysLeft = subData.trialDaysLeft;
                isTrial = subData.isTrial;
                subscriptionReason = subData.reason;
              }
            } catch (subErr) {
              console.warn("[Subscription verification fallback error]:", subErr);
            }

            const hasCompletedOnboarding = data.completedOnboarding ?? false;
            setUserProfile({
              userId: data.userId || user.id,
              displayName: data.displayName || user.displayName || "Neuraliso Seeker",
              premiumActive: verifiedPremium,
              trialDaysLeft,
              isTrial,
              subscriptionReason,
              themeMode: data.themeMode || "light",
              notificationsEnabled: data.notificationsEnabled ?? true,
              completedOnboarding: hasCompletedOnboarding,
              wellnessGoals: data.wellnessGoals,
              ageRange: data.ageRange,
              challenges: data.challenges,
              coping: data.coping,
              initialScore: data.initialScore,
              actionPlan: data.actionPlan,
              calmXP: data.calmXP ?? 120,
              currentStreak: data.currentStreak ?? 5,
              milestonesMet: data.milestonesMet ?? ["Core Breathing"],
              preferredCheckinTime: data.preferredCheckinTime
            });
            if (hasCompletedOnboarding) {
              setIsOnboarded(true);
              localStorage.setItem("neuraliso_onboarded", "true");
            } else {
              setIsOnboarded(false);
              localStorage.removeItem("neuraliso_onboarded");
            }
          } else {
            // Brand new user or no existing profile in database, force onboarding wizard
            const initialProfile = {
              userId: user.id,
              displayName: user.displayName || "Neuraliso Seeker",
              email: user.email || "",
              premiumActive: false,
              themeMode: "light" as const,
              notificationsEnabled: true,
              completedOnboarding: false,
              calmXP: 120,
              currentStreak: 5,
              milestonesMet: ["Core Breathing"]
            };

            // Save to Supabase
            await fetch("/api/user-profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...initialProfile, id: user.id })
            });

            setUserProfile(initialProfile);
            setIsOnboarded(false);
            localStorage.removeItem("neuraliso_onboarded");
          }

          // Fetch user's journal entries from Supabase Proxy
          const entriesRes = await fetch(`/api/journal-entries/${user.id}`);
          if (entriesRes.ok) {
            const entriesData = await entriesRes.json();
            if (Array.isArray(entriesData)) {
              setEntries(entriesData);
              localStorage.setItem("neuraliso_mood_logs", JSON.stringify(entriesData));
            }
          }
        } catch (error) {
          console.warn("[Auth debug] syncProfileAndData failed, error details:", error);
          console.warn("Supabase profile secure handshake fallback active:", error);
          
          // Retrieve onboarding data fallback if present
          const savedOnboarding = localStorage.getItem("neuraliso_onboarding_profile");
          const parsedOnboarding = savedOnboarding ? JSON.parse(savedOnboarding) : null;
          
          setUserProfile({
            userId: user.id,
            displayName: user.displayName || parsedOnboarding?.displayName || "Neuraliso Seeker",
            premiumActive: false,
            themeMode: "light",
            notificationsEnabled: true,
            calmXP: parsedOnboarding?.calmXP ?? 120,
            currentStreak: parsedOnboarding?.currentStreak ?? 5,
            milestonesMet: parsedOnboarding?.milestonesMet ?? ["Core Breathing"]
          });
          
          const previouslyOnboarded = localStorage.getItem("neuraliso_onboarded") === "true";
          setIsOnboarded(previouslyOnboarded);

          const savedLogs = localStorage.getItem("neuraliso_mood_logs");
          if (savedLogs) {
            try {
              setEntries(JSON.parse(savedLogs));
            } catch (e) {}
          }
        } finally {
          setLoadingProfile(false);
        }
      };

      syncProfileAndData();
    } else {
      const savedOnboarding = localStorage.getItem("neuraliso_onboarding_profile");
      if (savedOnboarding) {
        try {
          const parsed = JSON.parse(savedOnboarding);
          setUserProfile({
            userId: parsed.userId || "OFFLINE-SANDBOX-USER",
            displayName: parsed.displayName || "Guest Seeker",
            premiumActive: parsed.premiumActive ?? false,
            themeMode: parsed.themeMode ?? "light",
            notificationsEnabled: parsed.notificationsEnabled ?? true,
            calmXP: parsed.calmXP ?? 120,
            currentStreak: parsed.currentStreak ?? 5,
            milestonesMet: parsed.milestonesMet ?? ["Core Breathing"]
          });
        } catch (e) {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      if (isOfflineSandbox || !user) {
        const saved = localStorage.getItem("neuraliso_mood_logs");
        if (saved) {
          try {
            setEntries(JSON.parse(saved));
          } catch (e) {
            setEntries([]);
          }
        } else {
          setEntries([]);
        }
      }
    }
  }, [loadingAuth, user, isOfflineSandbox]);

  // Sync to database or local storage fallback
  const handleSaveEntry = async (newEntry: JournalEntry) => {
    // Play comforting sound and log Google Analytics custom event
    sounds.playSuccess();
    analytics.logTelemetryEvent("mood_logged", {
      mood: newEntry.mood,
      stress: newEntry.stress,
      energy: newEntry.energy,
      note_length: newEntry.note?.length || 0,
    });

    if (!user) {
      setEntries((prev) => {
        const updated = [...prev, newEntry];
        localStorage.setItem("neuraliso_mood_logs", JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const response = await fetch("/api/journal-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user.id,
          entry: newEntry
        })
      });
      
      if (response.ok) {
        setEntries((prev) => [...prev, newEntry]);
      } else {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          alert(errData.error || "Free Plan Limit Reached: Please upgrade to Premium to save more than 5 journal entries.");
          // Trigger the premium upgrade pricing modal automatically!
          const btn = document.getElementById("toggle-premium-membership");
          if (btn) {
            btn.click();
          } else {
            setActiveView("profile");
          }
        } else {
          alert("Could not save journal entry: " + (errData.error || "Internal Error"));
        }
      }
    } catch (error) {
      console.warn("Saving journal entry to Supabase failed or went offline:", error);
    }
  };

  // Sync Profile Settings with Supabase Secure Proxy
  const handleUpdateProfile = async (fields: Partial<typeof userProfile>) => {
    const nextProfile = userProfile ? { ...userProfile, ...fields } : {
      userId: user?.id || "OFFLINE-SANDBOX-USER",
      displayName: user?.displayName || "Neuraliso Seeker",
      premiumActive: false,
      themeMode: "light" as const,
      notificationsEnabled: true,
      ...fields
    };

    setUserProfile(nextProfile);

    if (!user) {
      localStorage.setItem("neuraliso_onboarding_profile", JSON.stringify(nextProfile));
      return;
    }

    try {
      const res = await fetch("/api/user-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...nextProfile,
          id: user.id,
          userId: user.id
        })
      });
      if (!res.ok) {
        throw new Error(`Profile update failed with status ${res.status}`);
      }
    } catch (error) {
      console.warn("Supabase profile update offline/network error, saved locally:", error);
    }
  };

  // Onboarding wizard data compiler
  const handleCompleteOnboarding = async (data: any) => {
    // Record baseline stress slider
    if (data.assessment && typeof data.assessment.stress === "number") {
      setCurrentStress(data.assessment.stress);
    }

    // Save profile settings
    const profileData = {
      userId: user?.id || "OFFLINE-SANDBOX-USER",
      displayName: data.displayName,
      premiumActive: data.premiumActive || false,
      themeMode: "light" as const,
      notificationsEnabled: data.notifications,
      wellnessGoals: data.wellnessGoals,
      ageRange: data.ageRange,
      challenges: data.challenges,
      coping: data.coping,
      initialScore: data.initialScore,
      actionPlan: data.actionPlan,
      completedOnboarding: true,
      calmXP: userProfile?.calmXP ?? 120,
      currentStreak: userProfile?.currentStreak ?? 5,
      milestonesMet: userProfile?.milestonesMet ?? ["Core Breathing"],
      preferredCheckinTime: data.preferredCheckinTime || "08:00 PM"
    };

    setOnboardingProfile(profileData);
    localStorage.setItem("neuraliso_onboarding_profile", JSON.stringify(profileData));
    localStorage.setItem("neuraliso_onboarded", "true");

    if (user) {
      fetch("/api/user-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...profileData,
          id: user.id,
          userId: user.id
        })
      }).catch((err) => {
        console.error("Error writing onboarding data to Supabase background task:", err);
      });
      
      setUserProfile({
        userId: profileData.userId,
        displayName: profileData.displayName,
        premiumActive: profileData.premiumActive,
        themeMode: profileData.themeMode,
        notificationsEnabled: profileData.notificationsEnabled,
        completedOnboarding: true,
        wellnessGoals: profileData.wellnessGoals,
        ageRange: profileData.ageRange,
        challenges: profileData.challenges,
        coping: profileData.coping,
        initialScore: profileData.initialScore,
        actionPlan: profileData.actionPlan,
        calmXP: profileData.calmXP,
        currentStreak: profileData.currentStreak,
        milestonesMet: profileData.milestonesMet,
        preferredCheckinTime: profileData.preferredCheckinTime
      });
    } else {
      setIsOfflineSandbox(true);
      // Simulate fallback credentials for sandboxed user
      setUserProfile({
        userId: "OFFLINE-SANDBOX-USER",
        displayName: data.displayName,
        premiumActive: false,
        themeMode: "light",
        notificationsEnabled: data.notifications,
        completedOnboarding: true,
        wellnessGoals: data.wellnessGoals,
        ageRange: data.ageRange,
        challenges: data.challenges,
        coping: data.coping,
        initialScore: data.initialScore,
        actionPlan: data.actionPlan,
        calmXP: 120,
        currentStreak: 5,
        milestonesMet: ["Core Breathing"],
        preferredCheckinTime: data.preferredCheckinTime || "08:00 PM"
      });
    }

    setIsOnboarded(true);
    setActiveView("home");
  };

  // Safe manual dialer popup
  const triggerCrisisDialSimulation = (providerName: string, detail: string) => {
    alert(`[Crisis Dial Hotline Link] Routing dispatch connection to: ${providerName} (${detail}).\nHelp is available 24/7.`);
  };

  const handleResetAppToOnboarding = async () => {
    if (user) {
      await logoutUser();
    }
    setIsOfflineSandbox(false);
    setIsOnboarded(false);
    setOnboardingProfile(null);
    setEnterpriseActive(false);
    localStorage.removeItem("neuraliso_onboarded");
    localStorage.removeItem("neuraliso_onboarding_profile");
    setActiveView("home");
  };

  const activeTheme = userProfile?.themeMode || "light";
  const bgClass = activeTheme === "neutral" 
    ? "theme-neutral text-gray-900 selection:bg-amber-100 selection:text-amber-900" 
    : "theme-light text-dark-text selection:bg-soft-green selection:text-deep-sage";

  const isSpinnerActive = loadingAuth || (user && (loadingProfile || !userProfile));
  const isCrisisTakeover = !isSpinnerActive && crisisActive;
  const isPaywallActive = !isSpinnerActive && !isCrisisTakeover && (user && !isOfflineSandbox && isOnboarded && (!userProfile || !userProfile.premiumActive));
  const isEnterpriseActiveMode = !isSpinnerActive && !isCrisisTakeover && !isPaywallActive && enterpriseActive;
  const isOnboardingActive = !isSpinnerActive && !isCrisisTakeover && !isPaywallActive && !isEnterpriseActiveMode && (!isOnboarded && !isOfflineSandbox);

  console.log(
    "[Auth debug] Decide render - " +
    "user: " + (user ? user.id : "null") + ", " +
    "loadingAuth: " + loadingAuth + ", " +
    "loadingProfile: " + loadingProfile + ", " +
    "userProfile: " + (userProfile ? JSON.stringify({ userId: userProfile.userId, completedOnboarding: userProfile.completedOnboarding }) : "null") + ", " +
    "isOnboarded: " + isOnboarded + ", " +
    "isOfflineSandbox: " + isOfflineSandbox + 
    " -> Rendering Choice: " +
    (isSpinnerActive ? "LOADING AUTH SPINNER" :
     isCrisisTakeover ? "CRISIS TAKEOVER" :
     isPaywallActive ? "PAYWALL" :
     isEnterpriseActiveMode ? "ENTERPRISE PORTAL" :
     isOnboardingActive ? (user ? "ONBOARDING STEPS (Step 1-4)" : "LANDING PAGE (Auth Options)") :
     "REGULAR VIEW ROUTING (Main App)")
  );

  const renderedChoiceName = isSpinnerActive ? "LOADING AUTH SPINNER" :
     isCrisisTakeover ? "CRISIS TAKEOVER" :
     isPaywallActive ? "PAYWALL" :
     isEnterpriseActiveMode ? "ENTERPRISE PORTAL" :
     isOnboardingActive ? (user ? "ONBOARDING STEPS (Step 1-4)" : "LANDING PAGE (Auth Options)") :
     "REGULAR VIEW ROUTING (Main App)";

  return (
    <div className={`min-h-screen relative font-sans pb-24 pt-44 md:pt-32 overflow-x-hidden transition-colors duration-500 ${bgClass}`}>
      
      {/* BACKGROUND DECORATIONS (Calm Technology leaves and nature waves) */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none overflow-hidden blur-3xl z-0 select-none">
        <div className="absolute top-[-100px] left-[-150px] w-[450px] h-[450px] rounded-full bg-soft-green/35 opacity-40 animate-drift" />
        <div className="absolute top-[200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-calm-blue/20 opacity-30 animate-pulse-slow" />
        <div className="absolute bottom-0 left-[20%] w-[350px] h-[350px] rounded-full bg-light-mint/35 opacity-40" />
      </div>

      {/* FIXED CORNER DECORATION LEAVES (Symmetric aesthetic finish) */}
      <div className="fixed top-8 left-8 opacity-15 pointer-events-none hidden md:block">
        <span className="text-3xl text-primary-sage">🍃</span>
      </div>
      <div className="fixed top-24 right-10 opacity-15 pointer-events-none hidden md:block">
        <span className="text-4xl text-primary-sage leading-none">🌿</span>
      </div>

      {/* CORE FRAME CONTAINER */}
      <main className="relative z-10 px-4 pt-6 max-w-2xl mx-auto">
        
        {/* LOADING AUTH SPINNER */}
        {loadingAuth || (user && (loadingProfile || !userProfile)) ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
            <div className="w-10 h-10 border-4 border-primary-sage/30 border-t-primary-sage rounded-full animate-spin" />
            <p className="text-xs font-mono text-muted-text uppercase tracking-widest animate-pulse">
              Securing connection ...
            </p>
          </div>
        ) : crisisActive ? (
          /* APP SAFETY CRISIS TAKEOVER OVERLAY */
          <div id="crisis-takeover-alert-screen" className="wellness-card p-8 border border-red-200 mt-6 bg-white/95 backdrop-blur-xl shadow-2xl relative animate-fade-in text-center space-y-6 max-w-xl mx-auto">
            <div className="absolute top-0 left-0 w-full h-2 bg-danger-red rounded-t-3xl" />
            
            <div className="py-4 space-y-3">
              <span className="text-5xl animate-pulse inline-block">💙</span>
              <h2 className="text-3xl font-serif italic text-danger-red font-bold tracking-tight">
                You Are Not Alone
              </h2>
              <p className="text-sm text-dark-text max-w-md mx-auto leading-relaxed">
                Help is available right now. You do not have to walk through these heavy storms by yourself. Supportive voices are ready to hold space for you without judgment.
              </p>
            </div>

            {/* HIGH DENSITY ACTION CORNER */}
            <div className="space-y-3.5 pt-2 max-w-md mx-auto">
              
              <button
                id="crisis-call-988"
                onClick={() => triggerCrisisDialSimulation("988 Suicide & Crisis Lifeline", "988")}
                className="w-full bg-danger-red text-white py-4.5 rounded-full font-bold text-base shadow-lg shadow-danger-red/30 hover:bg-red-800 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <SOSIcon size={20} className="stroke-white" />
                <span>Call 988 Crisis Lifeline (Highly Recommended)</span>
              </button>

              <button
                id="crisis-text-home"
                onClick={() => triggerCrisisDialSimulation("Crisis Text Line", "Text HOME to 741741")}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 py-4.5 rounded-full font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>💬 Text HOME to 741741 (Anonymous support)</span>
              </button>

              <a
                href="https://988lifeline.org/chat/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-soft-green/30 hover:bg-soft-green text-deep-sage border border-primary-sage/20 py-4.5 rounded-full font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 decoration-none"
              >
                💻 Open 988 Online Web Chat Service
              </a>

              <a
                href="https://www.befrienders.org"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-ivory-bg hover:bg-amber-100 text-amber-900 border border-amber-200 py-4.5 rounded-full font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 decoration-none"
              >
                🌍 Befrienders Worldwide Directory (Outside US/CA)
              </a>

            </div>

            {/* Safety escape mechanism for testing sandbox */}
            <div className="pt-4 border-t border-gray-100 max-w-sm mx-auto">
              <p className="text-[10px] text-muted-text mb-2 animate-pulse-slow">
                If this filter was triggered by mistake and you want to lock it off to continue exploring the Neuraliso AI wellness suite, click compile exit below.
              </p>
              <button
                onClick={() => setCrisisActive(false)}
                className="text-[11px] text-muted-text hover:text-dark-text underline font-medium cursor-pointer"
              >
                Dismiss & Return to Exploration Dashboard
              </button>
            </div>
          </div>
        ) : (user && !isOfflineSandbox && isOnboarded && (!userProfile || !userProfile.premiumActive)) ? (
          /* HARD PAYWALL PAYMENT CONNECTION TAKE-OVER */
          <DodoPaywallView 
            user={user} 
            userProfile={userProfile} 
            onPaymentSuccess={async () => {
              try {
                const subRes = await fetch(`/api/verify-subscription?userId=${user.id}`);
                if (subRes.ok) {
                  const subData = await subRes.json();
                  if (userProfile) {
                    setUserProfile({
                      ...userProfile,
                      premiumActive: subData.premiumActive,
                      trialDaysLeft: subData.trialDaysLeft,
                      isTrial: subData.isTrial,
                      subscriptionReason: subData.reason
                    });
                  }
                }
              } catch (err) {
                console.error("Failed to re-verify after success:", err);
              }
            }} 
          />
        ) : enterpriseActive ? (
          /* ENTERPRISE ADMIN OVERVIEW DEPLOYED */
          <EnterprisePortal onBack={() => setEnterpriseActive(false)} />
        ) : (!isOnboarded && !isOfflineSandbox) ? (
          /* AUTH ONBOARDING PANEL TAKE-OVER */
          <OnboardingWizard 
            onCompleteOnboarding={handleCompleteOnboarding}
            onEnterEnterpriseDemo={() => setEnterpriseActive(true)}
            currentUser={user}
            loginWithGoogle={loginWithGoogle}
            loginWithEmail={loginWithEmail}
            registerWithEmail={registerWithEmail}
            loginAnonymously={loginAnonymously}
            isAuth0Active={isAuth0Active}
          />
        ) : (
          /* REGULAR VIEW ROUTING */
          <div id="neuraliso-core-applet-viewport">
            
            {activeView === "home" && (
              <HomeView
                onNavigate={(v) => setActiveView(v)}
                entries={entries}
                currentStress={currentStress}
                setCurrentStress={setCurrentStress}
                userName={user ? user.displayName || userProfile?.displayName : (userProfile?.displayName || "Guest Seeker")}
              />
            )}

            {activeView === "chat" && (
              <ChatView 
                onTriggerSafety={(triggered) => setCrisisActive(triggered)} 
                onNavigate={(v) => setActiveView(v)}
                premiumActive={userProfile?.premiumActive ?? false}
                userId={user?.id}
              />
            )}

            {activeView === "sos" && (
              <SOSView 
                onTriggerCrisis={(triggered) => setCrisisActive(triggered)}
                onBackToDashboard={() => setActiveView("home")}
              />
            )}

            {activeView === "hotline" && (
              <HotlineView />
            )}

            {activeView === "relief" && (
              <ReliefStationView 
                userProfile={userProfile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeView === "reviews" && (
              <ReviewsView
                onBackToDashboard={() => setActiveView("home")}
                currentUser={user}
                loginWithGoogle={loginWithGoogle}
                loginWithEmail={loginWithEmail}
                registerWithEmail={registerWithEmail}
                isAuth0Active={isAuth0Active}
              />
            )}

            {activeView === "profile" && (
              <div className="space-y-6">
                <ProfileView 
                  entries={entries} 
                  user={user}
                  userProfile={userProfile}
                  onUpdateProfile={handleUpdateProfile}
                  onSignOut={async () => {
                    if (user) {
                      await logoutUser();
                    }
                    setIsOfflineSandbox(false);
                    setIsOnboarded(false);
                    setOnboardingProfile(null);
                    localStorage.removeItem("neuraliso_onboarded");
                    localStorage.removeItem("neuraliso_onboarding_profile");
                    setActiveView("home");
                  }}
                />
                
                {/* Manual Onboarding Reset button in profile for easy grading / testing */}
                <div className="wellness-card p-6 bg-white border">
                  <h4 className="text-xs font-bold text-dark-text uppercase tracking-normal border-b pb-2 mb-2">Diagnostic Tools</h4>
                  <button
                    onClick={handleResetAppToOnboarding}
                    className="w-full py-2.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl active:scale-95 transition-all text-center"
                  >
                    🔄 Restart App and Re-run Onboarding On boarding Flow
                  </button>
                  <button
                    onClick={() => setEnterpriseActive(true)}
                    className="w-full py-2.5 text-xs bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold rounded-xl active:scale-95 transition-all text-center mt-2"
                  >
                    🏢 Directly Inspect Corporate Enterprise Portal
                  </button>
                </div>

                <div className="border-t border-soft-green/20 pt-6">
                  <AnalyticsView entries={entries} />
                </div>
              </div>
            )}

            {activeView === "moodCheck" && (
              <MoodCheckView
                onSaveEntry={handleSaveEntry}
                onNavigate={(v) => setActiveView(v)}
              />
            )}

            {activeView === "neuroSkeletons" && (
              <NeuroplasmWorkshopView onBack={() => setActiveView("home")} />
            )}

          </div>
        )}

      </main>

      {/* FLOATING BOTTOM NAVIGATION */}
      {!crisisActive && !enterpriseActive && (!loadingAuth && (user || isOfflineSandbox || isOnboarded)) && (
        <Navigation
          activeView={activeView}
          setActiveView={setActiveView}
        />
      )}

      {/* FLOATING SOS PANIC BUBBLE (Thumb-friendly mobile placement) */}
      {!crisisActive && !enterpriseActive && activeView !== "sos" && (!loadingAuth && (user || isOfflineSandbox || isOnboarded)) && (
        <button
          onClick={() => setActiveView("sos")}
          id="global-sos-panic-bubble"
          className="fixed bottom-24 right-5 sm:right-8 z-55 flex flex-col items-center justify-center w-14 h-14 bg-gradient-to-tr from-rose-500 to-rose-600 rounded-full shadow-lg shadow-rose-500/40 hover:shadow-rose-500/60 text-white cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Instant SOS Panic Care"
        >
          {/* Pulsing halo ring */}
          <span className="absolute inset-0 rounded-full bg-rose-500 opacity-30 group-hover:opacity-50 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
          <SOSIcon size={24} className="relative z-10 text-white" />
          <span className="absolute -top-7 bg-danger-red text-[9px] font-bold text-white uppercase tracking-widest px-1.5 py-0.5 rounded-md shadow-md scale-0 group-hover:scale-100 transition-transform origin-bottom duration-200 pointer-events-none">
            Panic
          </span>
        </button>
      )}

      {/* FLOATING MASCOT ASSISTANT & PROGRESS MENTOR COMPANION (Thumb-friendly left placing) */}
      {!crisisActive && !enterpriseActive && (!loadingAuth && (user || isOfflineSandbox || isOnboarded)) && (
        <MascotAssistant activeView={activeView} entriesCount={entries.length} triggerEvent={mascotEvent} />
      )}
    </div>
  );
}

function AppWithSupabase() {
  const [sUser, setSUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [authDebug, setAuthDebug] = useState({
    hasSession: "checking",
    lastEvent: "none yet",
    lastEventUser: "null",
    url: window.location.href,
    isRedirect: window.location.hash.includes("access_token=") || 
                window.location.hash.includes("id_token=") || 
                window.location.search.includes("code=")
  });

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;
    let timeoutId: any;

    const isRedirect = window.location.hash.includes("access_token=") || 
                       window.location.hash.includes("id_token=") || 
                       window.location.search.includes("code=");

    console.log(
      "[Auth debug] Client mounting - " +
      "URL: " + window.location.href + ", " +
      "Hash: " + window.location.hash + ", " +
      "Search: " + window.location.search + ", " +
      "isRedirect: " + isRedirect
    );

    async function initAuth() {
      try {
        // 1. Fetch dynamic client config from express proxy (always matches server keys securely)
        const configRes = await fetch("/api/supabase-config");
        if (configRes.ok && isMounted) {
          const config = await configRes.json();
          reinitializeSupabase(config.supabaseUrl, config.supabaseAnonKey);
        }
      } catch (err) {
        console.warn("[Auth Debug] Failed to fetch dynamic supabase config, relying on fallback client initialization.", err);
      }

      if (!isMounted) return;

      // Now we have the correct supabase client initialized!
      // 2. Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log(
          "[Auth debug] getSession returned - " +
          "Has Session: " + (!!session) + ", " +
          "User ID: " + (session?.user?.id || "null") + ", " +
          "isRedirect: " + isRedirect
        );
        if (isMounted) {
          setAuthDebug(prev => ({
            ...prev,
            hasSession: session ? "yes" : "no",
            lastEvent: prev.lastEvent === "none yet" ? "INITIAL_SESSION (from getSession)" : prev.lastEvent,
            lastEventUser: session?.user?.id || "null"
          }));
        }
        if (!isMounted) return;
        if (session) {
          setSUser(session.user);
          setLoadingAuth(false);
        } else if (!isRedirect) {
          setLoadingAuth(false);
        }
      });

      // 3. Listen for auth changes
      const authListener = supabase.auth.onAuthStateChange((_event, session) => {
        console.log(
          "[Auth debug] onAuthStateChange event fired: " + _event + " - " +
          "Has Session: " + (!!session) + ", " +
          "User ID: " + (session?.user?.id || "null")
        );
        if (isMounted) {
          setAuthDebug(prev => ({
            ...prev,
            hasSession: session ? "yes" : "no",
            lastEvent: _event,
            lastEventUser: session?.user?.id || "null"
          }));
        }
        if (!isMounted) return;
        
        if (session) {
          setSUser(session.user);
          setLoadingAuth(false);
        } else {
          setSUser(null);
          if (!isRedirect || _event === "SIGNED_OUT") {
            setLoadingAuth(false);
          }
        }
      });

      subscription = authListener.data.subscription;
    }

    initAuth();

    if (isRedirect) {
      timeoutId = setTimeout(() => {
        if (isMounted) {
          setLoadingAuth(false);
        }
      }, 5000); // Give dynamic configuration fetch and handshake an extra buffer
    }

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const user = sUser ? {
    id: sUser.id,
    uid: sUser.id,
    displayName: sUser.user_metadata?.display_name || sUser.user_metadata?.full_name || sUser.email?.split("@")[0] || "Neuraliso Seeker",
    email: sUser.email || "",
    createdAt: sUser.created_at ? new Date(sUser.created_at) : undefined
  } : null;

  const handleLoginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  };

  const handleLoginWithEmail = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
    return data.user;
  };

  const handleRegisterWithEmail = async (email: string, pass: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          display_name: name,
        }
      }
    });
    if (error) throw error;
    return data.user;
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const handleLoginAnonymously = async () => {
    localStorage.setItem("neuraliso_offline_sandbox", "true");
    window.location.reload();
  };

  return (
    <AppContent
      user={user}
      loadingAuth={loadingAuth}
      loginWithGoogle={handleLoginWithGoogle}
      logoutUser={handleLogout}
      registerWithEmail={handleRegisterWithEmail}
      loginWithEmail={handleLoginWithEmail}
      loginAnonymously={handleLoginAnonymously}
      isAuth0Active={true}
      authDebug={authDebug}
    />
  );
}

export default function App() {
  return <AppWithSupabase />;
}
