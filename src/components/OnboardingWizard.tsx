import React, { useState, useEffect, useRef } from "react";
import { 
  auth, 
  loginWithGoogle as firebaseLoginWithGoogle, 
  registerWithEmail as firebaseRegisterWithEmail, 
  loginWithEmail as firebaseLoginWithEmail, 
  loginAnonymously as firebaseLoginAnonymously 
} from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";
import neuralisoLogo from "../assets/images/neuraliso_logo_1783904719183.jpg";
import { redirectToDodoCheckout } from "../lib/dodoCheckout";
import { 
  Sparkles, 
  Brain, 
  Heart, 
  Activity, 
  Volume2, 
  ShieldCheck, 
  Infinity as InfinityIcon, 
  ChevronRight, 
  User, 
  Lock, 
  Compass, 
  Flame, 
  VolumeX, 
  RefreshCw,
  Sliders,
  CheckCircle2
} from "lucide-react";

interface OnboardingWizardProps {
  onCompleteOnboarding: (data: {
    displayName: string;
    ageRange: string;
    timeZone: string;
    wellnessGoals: string[];
    assessment: {
      stress: number;
      anxiety: number;
      sleep: number;
      energy: number;
      mood: number;
    };
    challenges: string[];
    coping: string[];
    notifications: boolean;
    initialScore: number;
    actionPlan: string[];
    preferredCheckinTime: string;
    premiumActive?: boolean;
  }) => void;
  onEnterEnterpriseDemo: () => void;
  currentUser?: any;
  loginWithGoogle?: () => Promise<any>;
  loginWithEmail?: (email: string, pass: string) => Promise<any>;
  registerWithEmail?: (email: string, pass: string, name: string) => Promise<any>;
  loginAnonymously?: () => Promise<any>;
  isAuth0Active?: boolean;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onCompleteOnboarding,
  onEnterEnterpriseDemo,
  currentUser,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginAnonymously,
  isAuth0Active
}) => {
  // Firebase Auth Adaptation
  const [user, setUser] = useState<{ uid: string; displayName?: string; email?: string } | null>(() => {
    if (isAuth0Active && currentUser) {
      return {
        uid: currentUser.uid || currentUser.id,
        displayName: currentUser.displayName,
        email: currentUser.email
      };
    }
    return null;
  });
  const [isLoaded, setIsLoaded] = useState(() => !!(isAuth0Active && currentUser));

  useEffect(() => {
    if (isAuth0Active) {
      if (currentUser) {
        setUser({
          uid: currentUser.uid || currentUser.id,
          displayName: currentUser.displayName,
          email: currentUser.email
        });
      } else {
        setUser(null);
      }
      setIsLoaded(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fUser) => {
      if (fUser) {
        setUser({
          uid: fUser.uid,
          displayName: fUser.displayName || "",
          email: fUser.email || ""
        });
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, [currentUser, isAuth0Active]);

  const isSignedIn = !!user;

  // Email login / register states
  const [authMode, setAuthMode] = useState<"options" | "email_login" | "email_register">("options");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Debug state for signup / auth submission
  const [signupDebug, setSignupDebug] = useState<{
    submitHandlerCalled: "yes" | "no";
    lastTappedTime: string | null;
    emailAtTap: string;
    passwordAtTap: string;
    nameAtTap: string;
    validationError: string | null;
    buttonDisabled: boolean;
    disabledReason: string;
    supabaseResult: string | null;
  }>({
    submitHandlerCalled: "no",
    lastTappedTime: null,
    emailAtTap: "",
    passwordAtTap: "",
    nameAtTap: "",
    validationError: null,
    buttonDisabled: false,
    disabledReason: "None (button is enabled)",
    supabaseResult: null,
  });

  // Keep buttonDisabled and disabledReason updated in real time
  useEffect(() => {
    let reason = "None (button is enabled)";
    if (authLoading) {
      reason = "authLoading is true (submission in progress)";
    }
    setSignupDebug(prev => ({
      ...prev,
      buttonDisabled: authLoading,
      disabledReason: reason
    }));
  }, [authLoading]);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (isAuth0Active && loginWithGoogle) {
        await loginWithGoogle();
      } else {
        await firebaseLoginWithGoogle();
      }
    } catch (err: any) {
      if (err.message?.includes("popup-closed-by-user") || err.code?.includes("popup-closed-by-user")) {
        setAuthError("Auth popup was closed. Please try again or use email sign-in below!");
      } else {
        setAuthError(err.message || "Google authentication failed. Please try again.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const now = new Date().toLocaleTimeString();
    
    const currEmail = emailInput;
    const currPass = passwordInput;

    console.log("[Login Debug] Submit handler called at", now, "with exact values:", {
      exactEmail: JSON.stringify(currEmail),
      exactPassword: JSON.stringify(currPass),
      emailLength: currEmail?.length,
      passwordLength: currPass?.length
    });

    let valErr: string | null = null;
    if (!currEmail || !currEmail.trim()) {
      valErr = "Email field is required";
    } else if (!currEmail.includes("@") || !currEmail.includes(".")) {
      valErr = "Invalid email format (must contain @ and domain)";
    } else if (!currPass) {
      valErr = "Password field is required";
    }

    setSignupDebug({
      submitHandlerCalled: "yes",
      lastTappedTime: now,
      emailAtTap: currEmail ? JSON.stringify(currEmail) : "(empty)",
      passwordAtTap: currPass ? JSON.stringify(currPass) : "(empty)",
      nameAtTap: nameInput || "(n/a for login)",
      validationError: valErr,
      buttonDisabled: authLoading,
      disabledReason: authLoading ? "authLoading is true" : "None (button is enabled)",
      supabaseResult: valErr ? `Validation check failed: ${valErr}` : `Calling supabase.auth.signInWithPassword() with email=${JSON.stringify(currEmail.trim())}...`
    });

    if (valErr) {
      setAuthError(valErr);
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    try {
      if (isAuth0Active && loginWithEmail) {
        await loginWithEmail(currEmail, currPass);
      } else {
        await firebaseLoginWithEmail(currEmail, currPass);
      }
      setSignupDebug(prev => ({
        ...prev,
        supabaseResult: `Success: Logged in successfully with email=${JSON.stringify(currEmail.trim())}!`
      }));
    } catch (err: any) {
      const errMsg = err.message || String(err);
      setAuthError(errMsg);
      setSignupDebug(prev => ({
        ...prev,
        supabaseResult: `Error from signInWithPassword(): ${errMsg}`
      }));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const now = new Date().toLocaleTimeString();

    // Capture values at exact moment of tap
    const currName = nameInput;
    const currEmail = emailInput;
    const currPass = passwordInput;

    console.log("[Signup Debug] Submit handler called at", now, "with values:", { currName, currEmail, currPass: currPass ? "***" : "(empty)" });

    // Calculate explicit validation errors
    let valErr: string | null = null;
    if (!currName || !currName.trim()) {
      valErr = "Name field is required";
    } else if (!currEmail || !currEmail.trim()) {
      valErr = "Email field is required";
    } else if (!currEmail.includes("@") || !currEmail.includes(".")) {
      valErr = "Invalid email format (must contain @ and domain)";
    } else if (!currPass) {
      valErr = "Password field is required";
    } else if (currPass.length < 6) {
      valErr = "Password too short (must be at least 6 characters)";
    }

    setSignupDebug({
      submitHandlerCalled: "yes",
      lastTappedTime: now,
      emailAtTap: currEmail ? JSON.stringify(currEmail) : "(empty)",
      passwordAtTap: currPass ? JSON.stringify(currPass) : "(empty)",
      nameAtTap: currName ? JSON.stringify(currName) : "(empty)",
      validationError: valErr,
      buttonDisabled: authLoading,
      disabledReason: authLoading ? "authLoading is true" : "None (button is enabled)",
      supabaseResult: valErr ? `Validation blocked call to supabase.auth.signUp(): ${valErr}` : `Calling supabase.auth.signUp() with email=${JSON.stringify(currEmail.trim())}...`
    });

    if (valErr) {
      setAuthError(valErr);
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    setEmailConfirmationRequired(false);

    try {
      let registeredRes: any = null;
      if (isAuth0Active && registerWithEmail) {
        registeredRes = await registerWithEmail(currEmail, currPass, currName);
      } else {
        registeredRes = await firebaseRegisterWithEmail(currEmail, currPass, currName);
      }

      // Supabase returns { user, session } or user object
      const regUser = registeredRes?.user || (registeredRes?.uid || registeredRes?.id ? registeredRes : null);
      const regSession = registeredRes?.session || null;

      if (regSession) {
        // Email confirmation is NOT required (active session created immediately)
        const successText = `Success (Active Session): Registered & Logged in! User ID: ${regUser?.id || "created"}. Transitioning to onboarding...`;
        setSignupDebug(prev => ({
          ...prev,
          supabaseResult: successText
        }));
        setSubView("step1");
      } else if (regUser) {
        // Email confirmation IS REQUIRED by Supabase project settings (no active session returned)
        setEmailConfirmationRequired(true);
        setRegisteredEmail(currEmail);
        const pendingText = `Success (Email Confirmation Required): Account created (User ID: ${regUser.id || regUser.uid}). Supabase project auth settings REQUIRE email confirmation before logging in — no active session was returned by signUp(). Please check your email inbox to confirm your account.`;
        setSignupDebug(prev => ({
          ...prev,
          supabaseResult: pendingText
        }));
      } else {
        setSubView("step1");
      }
    } catch (err: any) {
      const errDetail = err.message || err.error_description || String(err);
      setAuthError(errDetail);
      setSignupDebug(prev => ({
        ...prev,
        supabaseResult: `Error from supabase.auth.signUp(): ${errDetail}`
      }));
    } finally {
      setAuthLoading(false);
    }
  };

  const [subView, setSubView] = useState<"landing" | "signup" | "step1" | "step2" | "step3" | "step4" | "subscriptionOffer">(() => {
    return isSignedIn ? "step1" : "landing";
  });
  
  useEffect(() => {
    if (isLoaded && isSignedIn && (subView === "landing" || subView === "signup")) {
      setSubView("step1");
    }
  }, [isLoaded, isSignedIn, subView]);

  // Modal / toggle for "Learn More"
  const [showLearnMore, setShowLearnMore] = useState(false);

  // Flow State collections
  const [displayName, setDisplayName] = useState("");
  const [ageRange, setAgeRange] = useState("25-34");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC-5");
  const [wellnessGoals, setWellnessGoals] = useState<string[]>([]);
  
  // Step 2 assessment integers (1-10 scale)
  const [stress, setStress] = useState(5);
  const [anxiety, setAnxiety] = useState(4);
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(6);
  const [mood, setMood] = useState(6);

  // Step 3 customization choices
  const [challenges, setChallenges] = useState<string[]>([]);
  const [coping, setCoping] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(true);
  const [preferredCheckinTime, setPreferredCheckinTime] = useState("08:00 PM");

  // Core thematic 3D positions
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [screenMouse, setScreenMouse] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Track page-wide mouse motion for natural organic parallax depth
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setScreenMouse({ x, y });
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Center-offset position from -0.5 to 0.5
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    
    setTilt({
      x: y * -22, // 22 deg max pitch
      y: x * 22  // 22 deg max yaw
    });
    setIsHovered(true);
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Helper arrays
  const goalsOptions = [
    "Reduce Anxiety & Stress", 
    "Improve Sleep Quality & Circadian Rhythm", 
    "Regulate Heart Rate Variability (HRV)", 
    "Acquire CBT Cognitive Techniques", 
    "Foil Work Burnout", 
    "Foster Biological Serenity"
  ];

  const challengeOptions = [
    "Constant Worry & Ruminating Loops", 
    "Work/School Pressure & Fast Schedules",
    "Insomnia & Sleep Disturbances", 
    "Social Connection Tension", 
    "Sudden Adrenaline or Panic Waves"
  ];

  const copingOptions = [
    "Vagal Box & 4-7-8 Deep Somatic Breathing", 
    "5-4-3-2-1 Somatic Sensory Grounding", 
    "Alpha/Theta Binaural Wave Solfeggio Mixers", 
    "Daily CBT Automated Cognitive Reconstruction"
  ];

  const handleToggleGoal = (g: string) => {
    setWellnessGoals((prev) => 
      prev.includes(g) ? prev.filter(item => item !== g) : [...prev, g]
    );
  };

  const handleToggleChallenge = (c: string) => {
    setChallenges((prev) => 
      prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c]
    );
  };

  const handleToggleCoping = (cp: string) => {
    setCoping((prev) => 
      prev.includes(cp) ? prev.filter(item => item !== cp) : [...prev, cp]
    );
  };

  const calculateWellnessScore = () => {
    const positiveIndex = sleep + energy + mood + (10 - stress) + (10 - anxiety);
    return Math.round((positiveIndex / 50) * 100);
  };

  const compileFirstActionPlan = () => {
    const plans: string[] = [];
    if (stress > 6) {
      plans.push("Activate 4-7-8 Breathing on your dashboard to downregulate active cortisol production.");
    }
    if (anxiety > 5) {
      plans.push("Utilize 5-4-3-2-1 Somatic Grounding sensory triggers inside your relief panel.");
    }
    if (sleep < 6) {
      plans.push("Calibrate the 432Hz Sound Lab generator for optimal nightly restorative phase sync.");
    }
    if (challenges.includes("Constant Worry & Ruminating Loops")) {
      plans.push("Unload recurring cognitive filters into the Guided CBT Thought Reframer.");
    }
    plans.push("Claim weekly gamified Serenity badges and nurture your local digital therapeutic garden.");
    return plans;
  };

  const handleTriggerComplete = (premiumActiveOverride?: boolean) => {
    const calculatedScore = calculateWellnessScore();
    const actionPlan = compileFirstActionPlan();
    
    onCompleteOnboarding({
      displayName: displayName.trim() || "Neuraliso Seeker",
      ageRange,
      timeZone,
      wellnessGoals,
      assessment: { stress, anxiety, sleep, energy, mood },
      challenges,
      coping,
      notifications,
      wellnessScore: calculatedScore,
      initialScore: calculatedScore,
      actionPlan,
      preferredCheckinTime,
      premiumActive: premiumActiveOverride !== undefined ? premiumActiveOverride : false
    });
  };

  // Organic custom radiuses for the unique Neuroplasm style
  const MELTED_RAD_L = "42px 28px 38px 24px / 36px 40px 24px 34px";

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center py-8 overflow-visible">
      
      {/* 🔮 NEUROPLASM 3D PARALLAX BACKDROP FIELDS */}
      <div className="absolute inset-0 pointer-events-none overflow-visible select-none z-0">
        <div 
          className="absolute top-1/4 left-1/10 w-80 h-80 rounded-full bg-soft-green/35 blur-3xl"
          style={{
            transform: `translate3d(${screenMouse.x * 0.7}px, ${screenMouse.y * 0.7}px, 0) scale(1.15)`,
            transition: "transform 0.2s cubic-bezier(0.1, 0.8, 0.2, 1)"
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-calm-blue/20 blur-4xl"
          style={{
            transform: `translate3d(${screenMouse.x * -0.6}px, ${screenMouse.y * -0.6}px, 0) scale(1.1)`,
            transition: "transform 0.2s cubic-bezier(0.1, 0.8, 0.2, 1)"
          }}
        />
        <div 
          className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-indigo-100/30 blur-2xl animate-pulse-slow"
          style={{
            transform: `translate3d(${screenMouse.x * 0.3}px, ${screenMouse.y * -0.4}px, 0)`,
            transition: "transform 0.2s cubic-bezier(0.1, 0.8, 0.2, 1)"
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        
        {/* 1. THE MAIN DYNAMIC 3D LANDING SCREEN */}
        {subView === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm mx-auto z-10 px-3 md:px-0"
            style={{ perspective: 1200 }}
          >
            <div
              ref={cardRef}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="bg-white/70 backdrop-blur-xl border border-white/60 p-8 text-center space-y-7 relative overflow-visible shadow-2xl transition-all duration-300"
              style={{
                borderRadius: MELTED_RAD_L,
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.025 : 1.0})`,
                transition: isHovered ? "transform 0.05s ease-out, shadow 0.15s ease" : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), shadow 0.6s ease",
                boxShadow: isHovered 
                  ? `${-tilt.y * 1.8}px ${tilt.x * 1.8}px 40px rgba(92, 138, 110, 0.15), 0 25px 50px -12px rgba(0,0,0,0.12)`
                  : "0 20px 40px -10px rgba(0,0,0,0.08)",
                transformStyle: "preserve-3d"
              }}
            >
              {/* Shifting gloss reflection */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-[42px] transition-opacity duration-300 overflow-hidden"
                style={{
                  background: isHovered 
                    ? `radial-gradient(circle at ${50 + tilt.y * 2}% ${50 - tilt.x * 2}%, rgba(255,255,255,0.4) 0%, transparent 60%)`
                    : "transparent"
                }}
              />

              {/* Glowing Neuro-Orb with translateZ pop effect */}
              <div 
                className="flex justify-center pt-2 relative"
                style={{ transform: "translateZ(55px)", transformStyle: "preserve-3d" }}
              >
                <div className="relative">
                  {/* Outer breathing aura */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200/50 via-teal-300/40 to-indigo-300/50 rounded-full blur-xl scale-125 animate-pulse" />
                  
                  {/* Organic shifting plasma sphere with logo */}
                  <div 
                    className="w-24 h-24 neuro-plasma-glow animate-neuro-blob flex items-center justify-center relative shadow-[0_12px_36px_rgba(92,138,110,0.25)] border border-white/80 overflow-hidden"
                    style={{ animationDuration: "10s" }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [0.93, 1.07, 0.93] 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 12, 
                        ease: "easeInOut" 
                      }}
                      className="absolute inset-0 rounded-full border border-dashed border-white/50 opacity-60 z-10 pointer-events-none"
                    />
                    {/* Neuraliso AI Logo with beautiful custom fade-in and soft breathing pulse */}
                    <motion.img
                      src={neuralisoLogo}
                      alt="Neuraliso AI Logo"
                      referrerPolicy="no-referrer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: [0, 1, 0.9, 1], 
                        scale: [0.8, 1, 0.98, 1],
                        filter: ["brightness(0.9) contrast(1)", "brightness(1.1) contrast(1.05)", "brightness(0.9) contrast(1)"]
                      }}
                      transition={{ 
                        opacity: { duration: 1.5, ease: "easeOut" },
                        scale: { duration: 1.5, ease: "easeOut" },
                        filter: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                      }}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  {/* Interactive primary CTA button converted from ✦ symbol */}
                  <button
                    onClick={() => setSubView("step1")}
                    className="absolute -top-3 -right-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-[11px] px-3.5 py-1.5 rounded-full shadow-lg shadow-teal-500/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer z-20 border border-teal-300/40"
                    title="Start your first check-in"
                  >
                    <span>Start now</span>
                    <span className="text-xs">✦</span>
                  </button>
                </div>
              </div>

              {/* Title Header with translateZ */}
              <div 
                className="space-y-2 text-center" 
                style={{ transform: "translateZ(40px)" }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-soft-green text-deep-sage px-3 py-1 rounded-full font-bold tracking-widest leading-none">
                    A quiet space for your mind
                  </span>
                </div>
                <h1 className="text-4xl font-serif italic text-dark-text font-bold tracking-wide mt-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.03)]">
                  Neuraliso AI
                </h1>
                <p className="text-xs font-sans text-muted-text font-semibold tracking-tight uppercase">
                  Guided breathing, mood check-ins, and sleep tools.
                </p>
              </div>

              {/* Body Text with translateZ */}
              <p 
                className="text-xs text-muted-text leading-relaxed max-w-sm mx-auto px-4"
                style={{ transform: "translateZ(25px)" }}
              >
                Quick relief when you need it most, breathing exercises, calming sounds & sleep stories, and thoughtful mood check-ins.
              </p>

              {/* Sound visualizer wave bars - premium aesthetic with GPU-accelerated compositor-only scale animations */}
              <div 
                className="flex items-center justify-center gap-1.5 py-1 h-9"
                style={{ transform: "translateZ(15px)" }}
              >
                {[0.4, 0.8, 0.5, 0.9, 0.6, 0.3, 0.7, 0.4].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 h-8 rounded-full bg-gradient-to-t from-deep-sage via-primary-sage to-calm-blue opacity-70 sound-bar-animate"
                    style={{ 
                      animationDelay: `${i * 0.14}s`,
                      animationDuration: `${1.0 + h * 0.4}s`
                    }}
                  />
                ))}
              </div>

              {/* Interactive Dashboard Actions */}
              <div 
                className="space-y-3.5 pt-1"
                style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
              >
                <button
                  onClick={() => setSubView("signup")}
                  className="w-full bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white py-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-lg shadow-teal-500/20 border border-white/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  <span>Start your first check-in</span>
                </button>

                <button
                  onClick={async () => {
                    setAuthLoading(true);
                    setAuthError(null);
                    try {
                      if (isAuth0Active && loginAnonymously) {
                        await loginAnonymously();
                      } else {
                        await firebaseLoginAnonymously();
                      }
                      setDisplayName("Free Guest Seeker");
                      setSubView("step1");
                    } catch (err: any) {
                      console.warn("Could not sign in anonymously, using offline sandbox:", err);
                      setDisplayName("Free Guest Seeker");
                      setSubView("step1");
                    } finally {
                      setAuthLoading(false);
                    }
                  }}
                  disabled={authLoading}
                  className="w-full bg-white/80 border border-slate-100 hover:bg-white text-slate-700 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Activity className="w-3.5 h-3.5 text-primary-sage" />
                  <span>{authLoading ? "Connecting..." : "Try Free Guest Mode"}</span>
                </button>

                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    onClick={() => setShowLearnMore(!showLearnMore)}
                    className="py-2.5 text-[9px] uppercase font-bold font-mono tracking-wider bg-slate-50/60 border border-slate-150 text-slate-500 hover:bg-slate-100/80 rounded-2xl active:scale-95 cursor-pointer"
                  >
                    📖 {showLearnMore ? "Close Info" : "How it helps"}
                  </button>
                  <button
                    onClick={onEnterEnterpriseDemo}
                    className="py-2.5 text-[9px] uppercase font-bold font-mono tracking-wider bg-teal-50 border border-teal-100 text-teal-800 hover:bg-teal-100/80 rounded-2xl active:scale-95 cursor-pointer"
                  >
                    🏢 Team Space
                  </button>
                </div>
              </div>

              {/* Extended Details panel */}
              <AnimatePresence>
                {showLearnMore && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-slate-50/70 border border-slate-150 text-left rounded-3xl space-y-3 overflow-hidden text-xs leading-relaxed"
                    style={{ transform: "translateZ(10px)" }}
                  >
                    <span className="text-[9px] font-bold text-slate-700 block uppercase tracking-amber">🌿 HOW NEURALISO SUPPORTS YOU</span>
                    <ul className="space-y-2 text-slate-500 font-sans list-disc pl-4 leading-normal">
                      <li><strong>Thought Reframing</strong>: Gentle journaling prompts to organize anxious thoughts.</li>
                      <li><strong>Calming Audio</strong>: Relaxing soundscapes and ambient audio for rest and sleep.</li>
                      <li><strong>Instant Relief</strong>: Easy grounding exercises and box breathing for immediate calm.</li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-center text-[9px] font-mono text-muted-text font-bold">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Your privacy matters. We keep your data safe.</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. SECURITY AUTH SIGNUP/METHOD SELECTOR */}
        {subView === "signup" && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm mx-auto z-10 px-3"
          >
            <div className="bg-white/85 backdrop-blur-xl border border-white/60 p-7 space-y-6 text-center shadow-2xl relative" style={{ borderRadius: MELTED_RAD_L }}>
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-deep-sage to-calm-blue rounded-t-3xl" />
              
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif italic text-dark-text font-bold">Secure Account Integration</h3>
                <p className="text-[10px] text-emerald-600 font-bold font-mono tracking-widest animate-pulse">FIREBASE SECURE PORTAL</p>
              </div>

              <div className="space-y-4 py-2">
                {authError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-sans text-left leading-normal border border-red-150">
                    ⚠️ {authError}
                  </div>
                )}

                {!isSignedIn ? (
                  <div className="flex flex-col gap-3 max-w-xs mx-auto text-center space-y-1">
                    {authMode === "options" && (
                      <>
                        <p className="text-xs text-slate-500 leading-relaxed mb-1">
                          Save your daily mood check-ins, personal journal entries, and favorite breathing exercises securely.
                        </p>
                        
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={authLoading}
                          className="w-full bg-gradient-to-r from-deep-sage to-primary-sage hover:from-primary-sage hover:to-deep-sage text-white py-3 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-deep-sage/15 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <User className="w-4 h-4 animate-pulse" />
                          <span>{authLoading ? "Establishing Link..." : "Continue with Google"}</span>
                        </button>

                        <div className="flex items-center gap-2 justify-center my-3 text-slate-400 text-[10px] font-mono">
                          <div className="h-px bg-slate-200 flex-1"></div>
                          <span>OR USE EMAIL SECURITY</span>
                          <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => { setAuthMode("email_login"); setAuthError(null); }}
                            className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                          >
                            🔑 Log In
                          </button>
                          <button
                            type="button"
                            onClick={() => { setAuthMode("email_register"); setAuthError(null); }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-2 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                          >
                            📝 Register
                          </button>
                        </div>
                      </>
                    )}

                    {authMode === "email_login" && (
                      <form noValidate onSubmit={handleEmailSignIn} className="space-y-3.5 text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="your@email.com"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-deep-sage"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-deep-sage"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => { setAuthMode("options"); setAuthError(null); }}
                            className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all text-center"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={authLoading}
                            onClick={() => handleEmailSignIn()}
                            className="w-2/3 bg-deep-sage hover:bg-primary-sage text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all text-center flex items-center justify-center gap-1.5"
                          >
                            <span>{authLoading ? "Verifying..." : "Confirm Login 🔑"}</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {authMode === "email_register" && (
                      <form noValidate onSubmit={handleEmailRegister} className="space-y-3.5 text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Your Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Aura Seeker"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-deep-sage"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="your@email.com"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-deep-sage"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                          <input
                            type="password"
                            required
                            placeholder="•••••••• (min 6 chars)"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-deep-sage"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => { setAuthMode("options"); setAuthError(null); }}
                            className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all text-center"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={authLoading}
                            onClick={() => {
                              console.log("[Signup Debug] Button onClick triggered");
                              handleEmailRegister();
                            }}
                            className="w-2/3 bg-deep-sage hover:bg-primary-sage text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all text-center flex items-center justify-center gap-1.5"
                          >
                            <span>{authLoading ? "Creating..." : "Create Account 📝"}</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* EMAIL CONFIRMATION REQUIRED NOTICE BANNER */}
                    {emailConfirmationRequired && (
                      <div className="w-full bg-amber-950/90 text-amber-100 p-4 rounded-2xl border border-amber-400/80 shadow-xl text-left space-y-2 text-xs my-3 animate-fade-in">
                        <div className="flex items-center gap-2 font-bold text-amber-300 text-sm border-b border-amber-800/80 pb-1.5">
                          <span>✉️ Check Your Email to Confirm Account</span>
                        </div>
                        <p className="leading-relaxed">
                          Your account for <strong className="text-white">{registeredEmail}</strong> was created successfully!
                        </p>
                        <p className="leading-relaxed text-amber-200/90">
                          <strong>Note:</strong> "Confirm Email" is currently <strong>REQUIRED</strong> in this Supabase project's Auth settings. Supabase does not grant an active login session until you click the link in your email.
                        </p>
                        <p className="text-[11px] text-amber-300/80 italic">
                          Please check your email inbox (and spam folder), click the confirmation link, then return here and tap "Go to Login 🔑".
                        </p>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode("email_login");
                              setEmailConfirmationRequired(false);
                              setAuthError(null);
                            }}
                            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow"
                          >
                            Go to Login 🔑
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 max-w-xs mx-auto">
                    <span className="text-xs text-muted-text block font-medium">Session Connected successfully:</span>
                    <div className="flex items-center justify-center gap-3 p-3 bg-slate-50 border border-slate-150 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                        ✓
                      </div>
                      <span className="text-xs text-slate-800 font-bold">{user?.displayName || user?.email || "Authenticated Seeker"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (user?.displayName) {
                          setDisplayName(user.displayName);
                        }
                        setSubView("step1");
                      }}
                      className="w-full bg-primary-sage hover:bg-deep-sage text-white py-3.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer block shadow-md shadow-primary-sage/10"
                    >
                      🚀 Proceed to Diagnostics & Setup
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSubView("landing")}
                className="w-full text-center text-[10px] text-muted-text hover:text-dark-text font-bold font-mono uppercase cursor-pointer bg-transparent border-0 flex items-center justify-center gap-1 pt-2"
              >
                ← Return to Landing Page
              </button>
            </div>
          </motion.div>
        )}

        {/* 3. STEP 1: CREATE PROFILE */}
        {subView === "step1" && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto z-10 px-3"
          >
            <div className="bg-white/85 backdrop-blur-xl p-7 space-y-6 text-left shadow-2xl relative border border-white/50" style={{ borderRadius: MELTED_RAD_L }}>
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <span className="text-[10px] font-mono text-primary-sage font-bold uppercase">Diagnostics: Step 1 of 4</span>
                  <h3 className="text-xl font-serif italic text-dark-text font-bold">Assemble Profile Space</h3>
                </div>
                <div className="p-2.5 bg-soft-green text-deep-sage rounded-xl">
                  <User className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10.5px] font-bold text-slate-700 uppercase block tracking-wide">What should Neuraliso call you?</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name/pseudonym..."
                    className="w-full p-3.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-sage focus:bg-white text-slate-800 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5 mt-1.5">
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-bold text-slate-700 uppercase block tracking-wide">Age Group:</label>
                    <select
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white/70 text-slate-800 font-bold"
                    >
                      <option value="18-24">18-24 years</option>
                      <option value="25-34">25-34 years</option>
                      <option value="35-44">35-44 years</option>
                      <option value="45-54">45-54 years</option>
                      <option value="55+">55+ senior years</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-bold text-slate-700 uppercase block tracking-wide">Time Zone:</label>
                    <input
                      type="text"
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      placeholder="timezone"
                      className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white/70 focus:outline-none focus:ring-1 focus:ring-primary-sage font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* Goals selector */}
                <div className="space-y-2.5 mt-4">
                  <label className="text-[10.5px] font-bold text-slate-700 uppercase block tracking-wide">Select your healing priorities (Choose multiple):</label>
                  <div className="grid grid-cols-2 gap-2">
                    {goalsOptions.map((g) => {
                      const active = wellnessGoals.includes(g);
                      return (
                        <button
                          key={g}
                          onClick={() => handleToggleGoal(g)}
                          className={`p-3 text-left rounded-xl border text-[11px] leading-tight transition-all flex items-start gap-1.5 select-none ${
                            active 
                              ? "bg-emerald-50 text-emerald-950 border-emerald-300 font-bold shadow-sm"
                              : "bg-slate-50 border-slate-150 text-slate-650 hover:bg-slate-100"
                          }`}
                        >
                          <span className="shrink-0">{active ? "✓" : "+"}</span>
                          <span>{g}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSubView("landing")}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setSubView("step2")}
                  disabled={!displayName.trim()}
                  className="flex-1 bg-primary-sage hover:bg-deep-sage text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 text-center block"
                >
                  Continue to Assessment →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. STEP 2: EMOTIONAL ASSESSMENT */}
        {subView === "step2" && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto z-10 px-3"
          >
            <div className="bg-white/85 backdrop-blur-xl p-7 space-y-5 text-left shadow-2xl relative border border-white/50" style={{ borderRadius: MELTED_RAD_L }}>
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <span className="text-[10px] font-mono text-primary-sage font-bold uppercase">Diagnostics: Step 2 of 4</span>
                  <h3 className="text-xl font-serif italic text-dark-text font-bold">Intake Assessment</h3>
                </div>
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
              </div>

              <p className="text-xs text-muted-text leading-relaxed">
                Provide estimates of your recent wellness quotients. Neuraliso calibrates therapeutic cycles and cognitive exercises recursively based on this spectrum.
              </p>

              <div className="space-y-4 pt-2">
                {/* Sliders */}
                {[
                  { label: "Active Stress (Baseline)", state: stress, setter: setStress, color: "text-red-500" },
                  { label: "Anxiety & Rumination Wave frequency", state: anxiety, setter: setAnxiety, color: "text-amber-500" },
                  { label: "Sleep Pattern Restfulness", state: sleep, setter: setSleep, color: "text-blue-500" },
                  { label: "Vitality & Bodoly Energy", state: energy, setter: setEnergy, color: "text-emerald-500" },
                  { label: "Daily Mood Consistency", state: mood, setter: setMood, color: "text-teal-500" }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.label}</span>
                      <span className={`${item.color} font-mono`}>{item.state} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={item.state}
                      onChange={(e) => item.setter(Number(e.target.value))}
                      className="w-full h-2 rounded-lg cursor-pointer accent-primary-sage"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSubView("step1")}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setSubView("step3")}
                  className="flex-1 bg-primary-sage hover:bg-deep-sage text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-center cursor-pointer"
                >
                  Personalize Plan →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. STEP 3: PERSONALIZATION SETUP */}
        {subView === "step3" && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto z-10 px-3"
          >
            <div className="bg-white/85 backdrop-blur-xl p-7 space-y-5 text-left shadow-2xl relative border border-white/50" style={{ borderRadius: MELTED_RAD_L }}>
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <span className="text-[10px] font-mono text-primary-sage font-bold uppercase">Diagnostics: Step 3 of 4</span>
                  <h3 className="text-xl font-serif italic text-dark-text font-bold">Tune Personalization Engine</h3>
                </div>
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
              </div>

              <div className="space-y-4">
                {/* Challenge triggers */}
                <div className="space-y-2">
                  <label className="text-[10.5px] font-bold text-slate-700 uppercase block tracking-wide">What are your main emotional friction points?</label>
                  <div className="grid grid-cols-1 gap-1.5 animate-slide-in">
                    {challengeOptions.map((c) => {
                      const active = challenges.includes(c);
                      return (
                        <button
                          key={c}
                          onClick={() => handleToggleChallenge(c)}
                          className={`p-3 w-full text-xs text-left rounded-xl border transition-all flex items-center justify-between ${
                            active 
                              ? "bg-amber-50 text-amber-950 border-amber-300 font-bold"
                              : "bg-slate-50 border-slate-150 text-slate-650 hover:bg-slate-100"
                          }`}
                        >
                          <span>{c}</span>
                          <span className="text-[10px]">{active ? "✓" : "+"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Coping Methods selection */}
                <div className="space-y-2">
                  <label className="text-[10.5px] font-bold text-slate-700 uppercase block tracking-wide">Interests in targeted clinical interventions:</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {copingOptions.map((cp) => {
                      const active = coping.includes(cp);
                      return (
                        <button
                          key={cp}
                          onClick={() => handleToggleCoping(cp)}
                          className={`p-3 w-full text-xs text-left rounded-xl border transition-all flex items-center justify-between ${
                            active 
                              ? "bg-indigo-50 text-indigo-950 border-indigo-300 font-bold"
                              : "bg-slate-50 border-slate-150 text-slate-650 hover:bg-slate-100"
                          }`}
                        >
                          <span>{cp}</span>
                          <span className="text-[10px]">{active ? "✓" : "+"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notifications setup */}
                <div className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Daily Mindfulness Reminders</span>
                    <span className="text-[10px] text-slate-500 font-mono">Gentle breathing cues and daily mood check-in reminders</span>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-6.5 rounded-full transition-all flex items-center p-1 cursor-pointer ${
                      notifications ? "bg-primary-sage justify-end" : "bg-gray-300 justify-start"
                    }`}
                  >
                    <div className="w-4.5 h-4.5 bg-white rounded-full transition-all transform shadow-xs" />
                  </button>
                </div>

                {/* Preferred Check-In Time Select */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Preferred Check-In Time</span>
                    <span className="text-[10px] text-slate-500 font-mono">When should we send your daily somatic summary?</span>
                  </div>
                  <select
                    value={preferredCheckinTime}
                    onChange={(e) => setPreferredCheckinTime(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-primary-sage"
                  >
                    <option value="08:00 AM">Morning (08:00 AM)</option>
                    <option value="12:00 PM">Noon (12:00 PM)</option>
                    <option value="04:00 PM">Afternoon (04:00 PM)</option>
                    <option value="08:00 PM">Evening (08:00 PM)</option>
                    <option value="10:00 PM">Night (10:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSubView("step2")}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setSubView("step4")}
                  className="flex-1 bg-primary-sage hover:bg-deep-sage text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-center cursor-pointer"
                >
                  Compile Welcome Space →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 6. STEP 4: WELCOME BLUEPRINT EXPERIENCE */}
        {subView === "step4" && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-full max-w-md mx-auto z-10 px-3"
          >
            <div className="bg-white/85 backdrop-blur-xl p-7 space-y-6 text-left shadow-2xl relative border border-white/50" style={{ borderRadius: MELTED_RAD_L }}>
              
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <span className="text-[10px] font-mono text-primary-sage font-bold uppercase">Setup Complete 🎉</span>
                  <h3 className="text-xl font-serif italic text-dark-text font-bold">Your Psychiatric Welcome Space</h3>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl animate-bounce">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              {/* Dynamic seed metric box */}
              <div className="p-5 bg-gradient-to-br from-soft-green/40 to-calm-blue/25 rounded-2xl border border-soft-green/35 text-center space-y-1 shadow-inner relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-28 h-28 bg-white/20 rounded-full blur-xl pointer-events-none" />
                <span className="text-[10px] font-mono uppercase text-deep-sage font-extrabold tracking-widest">SEED CLINICAL SERENITY SCORE</span>
                <div className="text-5xl font-serif italic font-bold text-slate-900 mt-1">
                  {calculateWellnessScore()} <span className="text-base text-slate-500 font-sans font-normal">/ 100</span>
                </div>
                <p className="text-[10.5px] text-slate-500 max-w-xs mx-auto leading-normal font-medium">
                  Analyzed and calculated through customized levels of cortisol projection, sleep, and physical vitality indicators.
                </p>
              </div>

              {/* Customized plans list */}
              <div className="space-y-3">
                <span className="text-[10.5px] font-extrabold text-slate-700 uppercase tracking-widest block">🌱 Your Personalized Cognitive Roadmaps:</span>
                <div className="space-y-2">
                  {compileFirstActionPlan().map((act, i) => (
                    <div 
                      key={i} 
                      className="p-3 bg-slate-50/80 border border-slate-150 rounded-xl text-xs text-slate-700 leading-normal flex items-start gap-2.5 shadow-xs"
                    >
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✔</span>
                      <span className="font-medium">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Master Dashboard launcher - Proceeds to skippable subscription offer */}
              <button
                onClick={() => setSubView("subscriptionOffer")}
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-semibold font-sans py-4 rounded-full text-xs uppercase tracking-widest text-center block shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 cursor-pointer mt-6"
              >
                Launch Personalized Space Suite
              </button>
            </div>
          </motion.div>
        )}

        {/* 7. SUBSCRIPTION / UPGRADE FIRST-TIME OFFER SCREEN */}
        {subView === "subscriptionOffer" && (
          <motion.div
            key="subscriptionOffer"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-full max-w-lg mx-auto z-10 px-3"
          >
            <div className="bg-white/90 backdrop-blur-xl p-7 space-y-6 text-left shadow-2xl relative border border-white/60" style={{ borderRadius: MELTED_RAD_L }}>
              
              <div className="flex justify-between items-start pb-2 border-b">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-800 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 animate-pulse" /> Neuraliso Premium
                  </span>
                  <h3 className="text-xl font-serif italic text-dark-text font-bold">Step Into Complete Emotional Freedom</h3>
                </div>
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Brain className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs text-muted-text leading-relaxed">
                Unlock scientific mental wellness diagnostics, priority high-reasoning companion models, and uncompromised somatic breathing generators.
              </p>

              {/* Pricing Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Monthly card */}
                <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col justify-between transition hover:border-slate-300">
                  <div>
                    <span className="text-[8px] uppercase font-mono tracking-wider text-slate-500 font-bold">Monthly Plan</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">Monthly Compassion</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">Tactical ongoing anxiety relief.</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">$4.99</span>
                    <span className="text-[10px] text-slate-500">/ mo</span>
                  </div>
                </div>

                {/* Yearly card */}
                <div className="p-4 border-2 border-amber-400 bg-amber-500/[0.02] rounded-2xl flex flex-col justify-between transition relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-500 text-[8px] font-bold text-slate-950 px-2 py-0.5 rounded-bl-lg uppercase tracking-wider font-mono scale-90 origin-top-right">
                    Save 20%
                  </div>
                  <div>
                    <span className="text-[8px] uppercase font-mono tracking-wider text-amber-700 font-bold">Annual Plan</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">Yearly Sanctuary</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">Dedicated deep habit changes.</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">$48.00</span>
                    <span className="text-[10px] text-slate-500">/ yr</span>
                  </div>
                </div>
              </div>

              {/* Quick Feature highlights */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Included Premium VIP Features:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Infinite</strong> Journal Logs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Priority <strong>CBT AI Chat</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Realistic <strong>Vocal CBT</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Stress</strong> forecasting</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    handleTriggerComplete(false);
                    redirectToDodoCheckout(currentUser);
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold font-sans py-3.5 rounded-full text-xs uppercase tracking-wider text-center block shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  Access Premium Sanctuary Now
                </button>

                <div className="flex justify-center gap-4 text-xs font-medium">
                  <button
                    onClick={() => handleTriggerComplete(false)}
                    className="text-slate-500 hover:text-slate-800 underline transition cursor-pointer bg-transparent border-0"
                  >
                    Continue with Free Tier
                  </button>
                  <span className="text-slate-350">•</span>
                  <button
                    onClick={() => handleTriggerComplete(false)}
                    className="text-slate-500 hover:text-slate-800 underline transition cursor-pointer bg-transparent border-0"
                  >
                    Maybe later
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
