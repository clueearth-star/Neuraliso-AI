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

import { ClerkProvider, useUser, useClerk } from "@clerk/clerk-react";

interface AppContentProps {
  user: {
    id: string;
    uid: string;
    displayName: string;
    email: string;
  } | null;
  loadingAuth: boolean;
  loginWithGoogle: () => Promise<any>;
  logoutUser: () => Promise<any>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<any>;
  loginWithEmail: (email: string, pass: string) => Promise<any>;
  loginAnonymously: () => Promise<any>;
  isAuth0Active: boolean;
}

function AppContent({
  user,
  loadingAuth,
  loginWithGoogle,
  logoutUser,
  registerWithEmail,
  loginWithEmail,
  loginAnonymously,
  isAuth0Active
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
    themeMode: "light" | "neutral";
    notificationsEnabled: boolean;
  } | null>(null);

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

  // 1. Core Authentication Monitor (Firebase + Firestore Profile Synchronization)
  useEffect(() => {
    if (loadingAuth) return;

    if (user) {
      setIsOfflineSandbox(false);
      const userRef = doc(db, "users", user.id);
      
      const syncProfile = async () => {
        try {
          // Wrap in a snappy 800ms timeout to prevent cold database handshakes from hanging the initial screen
          const profileSnap = await Promise.race([
            getDoc(userRef),
            new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error("Firestore profile connection timed out (slow/offline link)")), 800)
            )
          ]);
          if (profileSnap && profileSnap.exists()) {
            const data = profileSnap.data();
            setUserProfile({
              userId: data.userId,
              displayName: data.displayName || user.displayName || "Neuraliso Seeker",
              premiumActive: data.premiumActive,
              themeMode: data.themeMode,
              notificationsEnabled: data.notificationsEnabled
            });
            // Only mark as onboarded if they have actually completed onboarding or have stored goals/completed flag
            if (data.completedOnboarding === true || (data.wellnessGoals && data.wellnessGoals.length > 0)) {
              setIsOnboarded(true);
              localStorage.setItem("neuraliso_onboarded", "true");
            } else {
              setIsOnboarded(false);
              localStorage.removeItem("neuraliso_onboarded");
            }
          } else {
            // First time registration setup
            const initialProfile = {
              userId: user.id,
              displayName: user.displayName || "Neuraliso Seeker",
              premiumActive: false,
              themeMode: "light" as const,
              notificationsEnabled: true,
              completedOnboarding: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(userRef, initialProfile);
            setUserProfile({
              userId: initialProfile.userId,
              displayName: initialProfile.displayName,
              premiumActive: initialProfile.premiumActive,
              themeMode: initialProfile.themeMode,
              notificationsEnabled: initialProfile.notificationsEnabled
            });
            setIsOnboarded(false);
            localStorage.removeItem("neuraliso_onboarded");
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.warn("Firestore profile handshake fallback activated:", errorMsg);
          
          // Retrieve onboarding data fallback if present
          const savedOnboarding = localStorage.getItem("neuraliso_onboarding_profile");
          const parsedOnboarding = savedOnboarding ? JSON.parse(savedOnboarding) : null;
          
          setUserProfile({
            userId: user.id,
            displayName: user.displayName || parsedOnboarding?.displayName || "Neuraliso Seeker",
            premiumActive: false,
            themeMode: "light",
            notificationsEnabled: true
          });
          
          // Respect localStorage state instead of forcing true
          const previouslyOnboarded = localStorage.getItem("neuraliso_onboarded") === "true";
          setIsOnboarded(previouslyOnboarded);
          
          const isTimeoutOrOffline = errorMsg.toLowerCase().includes("timeout") || 
                             errorMsg.toLowerCase().includes("offline") || 
                             errorMsg.toLowerCase().includes("network") ||
                             errorMsg.toLowerCase().includes("unavailable");
          
          if (!isTimeoutOrOffline) {
            try {
              handleFirestoreError(error, OperationType.GET, `users/${user.id}`);
            } catch (err) {
              console.error("Non-fatal handled profile exception:", err);
            }
          }
        }
      };

      syncProfile();
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
            notificationsEnabled: parsed.notificationsEnabled ?? true
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

  // 2. Real-Time Journal Entry Listener
  useEffect(() => {
    if (!user) return;

    const entriesRef = collection(db, "users", user.uid, "entries");
    const q = query(entriesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: JournalEntry[] = [];
      snapshot.forEach((snapDoc) => {
        const data = snapDoc.data();
        fetched.push({
          id: snapDoc.id,
          date: data.date,
          mood: data.mood,
          stress: data.stress,
          energy: data.energy,
          note: data.note,
          actionPlan: data.actionPlan || []
        });
      });
      setEntries(fetched);
    }, (error) => {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isOffline = errorMsg.toLowerCase().includes("offline") || 
                        errorMsg.toLowerCase().includes("network") || 
                        errorMsg.toLowerCase().includes("failed-precondition") ||
                        errorMsg.toLowerCase().includes("unavailable");
      
      if (isOffline) {
        console.warn("Entries subscription offline mode fallback active:", errorMsg);
        const saved = localStorage.getItem("neuraliso_mood_logs");
        if (saved) {
          try {
            setEntries(JSON.parse(saved));
          } catch (e) {}
        }
      } else {
        try {
          handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/entries`);
        } catch (err) {
          console.error("Non-fatal entries listing exception:", err);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

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

    const entryRef = doc(db, "users", user.uid, "entries", newEntry.id);
    try {
      await setDoc(entryRef, {
        id: newEntry.id,
        date: newEntry.date,
        mood: newEntry.mood,
        stress: newEntry.stress,
        energy: newEntry.energy,
        note: newEntry.note,
        actionPlan: newEntry.actionPlan,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isOffline = errorMsg.toLowerCase().includes("offline") || 
                        errorMsg.toLowerCase().includes("network") || 
                        errorMsg.toLowerCase().includes("failed-precondition") ||
                        errorMsg.toLowerCase().includes("unavailable");
      
      if (isOffline) {
        console.warn("Saving entry failed due to offline state, logging locally:", errorMsg);
        setEntries((prev) => {
          const updated = [...prev, newEntry];
          localStorage.setItem("neuraliso_mood_logs", JSON.stringify(updated));
          return updated;
        });
      } else {
        try {
          handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/entries/${newEntry.id}`);
        } catch (err) {
          console.error("Non-fatal handled entry save exception:", err);
        }
      }
    }
  };

  // Sync Profile Settings with Firestore
  const handleUpdateProfile = async (fields: Partial<typeof userProfile>) => {
    if (!user) {
      const savedOnboarding = localStorage.getItem("neuraliso_onboarding_profile");
      let profileData = savedOnboarding ? JSON.parse(savedOnboarding) : {};
      profileData = { ...profileData, ...fields };
      localStorage.setItem("neuraliso_onboarding_profile", JSON.stringify(profileData));
      setUserProfile((prev: any) => {
        const next = prev ? { ...prev, ...fields } : {
          userId: "OFFLINE-SANDBOX-USER",
          displayName: "Guest Seeker",
          premiumActive: false,
          themeMode: "light",
          notificationsEnabled: true,
          ...fields
        };
        return next;
      });
      return;
    }
    const userRef = doc(db, "users", user.uid);
    try {
      const updatedFields = {
        ...fields,
        updatedAt: serverTimestamp()
      };
      await updateDoc(userRef, updatedFields);
      setUserProfile((prev: any) => ({ ...prev, ...fields }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isOffline = errorMsg.toLowerCase().includes("offline") || 
                        errorMsg.toLowerCase().includes("network") || 
                        errorMsg.toLowerCase().includes("failed-precondition") ||
                        errorMsg.toLowerCase().includes("unavailable");
      
      if (isOffline) {
        console.warn("Updating profile settings offline mode fallback active:", errorMsg);
        setUserProfile((prev: any) => ({ ...prev, ...fields }));
      } else {
        try {
          handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
        } catch (err) {
          console.error("Non-fatal profile update exception:", err);
        }
      }
    }
  };

  // Onboarding wizard data compiler
  const handleCompleteOnboarding = async (data: any) => {
    // Record baseline stress slider
    setCurrentStress(data.assessment.stress);

    // Save profile settings
    const profileData = {
      userId: user?.uid || "OFFLINE-SANDBOX-USER",
      displayName: data.displayName,
      premiumActive: false,
      themeMode: "light" as const,
      notificationsEnabled: data.notifications,
      wellnessGoals: data.wellnessGoals,
      ageRange: data.ageRange,
      challenges: data.challenges,
      coping: data.coping,
      initialScore: data.initialScore,
      actionPlan: data.actionPlan,
      completedOnboarding: true
    };

    setOnboardingProfile(profileData);
    localStorage.setItem("neuraliso_onboarding_profile", JSON.stringify(profileData));
    localStorage.setItem("neuraliso_onboarded", "true");

    if (user) {
      const userRef = doc(db, "users", user.uid);
      try {
        await setDoc(userRef, {
          ...profileData,
          updatedAt: serverTimestamp()
        }, { merge: true });
        setUserProfile({
          userId: profileData.userId,
          displayName: profileData.displayName,
          premiumActive: profileData.premiumActive,
          themeMode: profileData.themeMode,
          notificationsEnabled: profileData.notificationsEnabled
        });
      } catch (err) {
        console.error("Error writing onboarding data to firestore", err);
      }
    } else {
      setIsOfflineSandbox(true);
      // Simulate fallback credentials for sandboxed user
      setUserProfile({
        userId: "OFFLINE-SANDBOX-USER",
        displayName: data.displayName,
        premiumActive: false,
        themeMode: "light",
        notificationsEnabled: data.notifications
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

  return (
    <div className={`min-h-screen relative font-sans pb-24 overflow-x-hidden transition-colors duration-500 ${bgClass}`}>
      
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
        {loadingAuth ? (
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
              <ReliefStationView />
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

// Check if Clerk is configured
let clerkPublishableKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY;

// Robust check: Clerk publishable key must start with 'pk_'. If it starts with 'sk_', it's a secret key, not a publishable key!
if (clerkPublishableKey && clerkPublishableKey.startsWith("sk_")) {
  console.warn("Warning: VITE_CLERK_PUBLISHABLE_KEY is configured with a secret key starting with 'sk_'. Falling back to the valid test publishable key.");
  clerkPublishableKey = "pk_test_YWRlcXVhdGUtaG91bmQtODkuY2xlcmsuYWNjb3VudHMuZGV2JA";
} else if (!clerkPublishableKey) {
  // If not provided, fallback to the default test publishable key since the user explicitly wants Clerk.
  clerkPublishableKey = "pk_test_YWRlcXVhdGUtaG91bmQtODkuY2xlcmsuYWNjb3VudHMuZGV2JA";
}

const isClerkConfigured = !!clerkPublishableKey && clerkPublishableKey.startsWith("pk_");

function AppWithClerk() {
  const { user: cUser, isLoaded } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();

  const user = cUser ? {
    id: cUser.id,
    uid: cUser.id,
    displayName: cUser.fullName || cUser.username || "Neuraliso Seeker",
    email: cUser.primaryEmailAddress?.emailAddress || ""
  } : null;

  const handleLoginWithGoogle = async () => {
    return openSignIn();
  };

  const handleLoginWithEmail = async () => {
    return openSignIn();
  };

  const handleRegisterWithEmail = async () => {
    return openSignUp();
  };

  const handleLogout = async () => {
    return await signOut();
  };

  const handleLoginAnonymously = async () => {
    localStorage.setItem("neuraliso_offline_sandbox", "true");
    window.location.reload();
  };

  return (
    <AppContent
      user={user}
      loadingAuth={!isLoaded}
      loginWithGoogle={handleLoginWithGoogle}
      logoutUser={handleLogout}
      registerWithEmail={handleRegisterWithEmail}
      loginWithEmail={handleLoginWithEmail}
      loginAnonymously={handleLoginAnonymously}
      isAuth0Active={true}
    />
  );
}

function AppWithFirebase() {
  const [user, setUser] = useState<{
    id: string;
    uid: string;
    displayName: string;
    email: string;
  } | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fUser) => {
      if (fUser) {
        setUser({
          id: fUser.uid,
          uid: fUser.uid,
          displayName: fUser.displayName || "Neuraliso Seeker",
          email: fUser.email || ""
        });
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginWithGoogle = async () => {
    return await firebaseLoginWithGoogle();
  };

  const handleLoginWithEmail = async (email: string, pass: string) => {
    return await firebaseLoginWithEmail(email, pass);
  };

  const handleRegisterWithEmail = async (email: string, pass: string, name: string) => {
    return await firebaseRegisterWithEmail(email, pass, name);
  };

  const handleLogout = async () => {
    return await firebaseLogoutUser();
  };

  const handleLoginAnonymously = async () => {
    return await firebaseLoginAnonymously();
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
      isAuth0Active={false}
    />
  );
}

export default function App() {
  if (isClerkConfigured) {
    return (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <AppWithClerk />
      </ClerkProvider>
    );
  } else {
    return <AppWithFirebase />;
  }
}
