import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Check, Heart, Wind, Moon, Compass, Smile, ShieldCheck, CreditCard, Lock, Mail, Loader2 } from "lucide-react";
import { storage } from "../lib/storage";
import { sounds } from "../lib/sounds";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { GoogleIcon } from "./auth/Login";

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signIn, signUp } = useAuth();
  const { upgradeToPro, openUpgradeModal } = useSubscription();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<"calm" | "sleep" | "focus" | "explore" | "">("");
  const [challenge, setChallenge] = useState<"racing" | "stress" | "insomnia" | "burnout" | "">("");

  // Step 4 OAuth / Auth state
  const [authMode, setAuthMode] = useState<"oauth" | "email">("oauth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Step 5 Payment state
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Automatically transition from Step 4 (OAuth) to Step 5 (Payment) once user is authenticated
  useEffect(() => {
    if (user && step === 4) {
      sounds.playSuccess();
      setStep(5);
    }
  }, [user, step]);

  const handleNextFrom1 = () => {
    sounds.playClick();
    setStep(2);
  };

  const handleNextFrom2 = () => {
    sounds.playClick();
    setStep(3);
  };

  const handleNextFrom3 = () => {
    sounds.playClick();
    setStep(4);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError("Please enter both email and password.");
      return;
    }
    sounds.playClick();
    setAuthLoading(true);
    setAuthError("");

    try {
      const { error } = await signUp(email, password, name.trim() || "Wellness Explorer");
      if (error) {
        // If user already exists, try signing in
        if (error.message.toLowerCase().includes("already registered")) {
          const { error: signInErr } = await signIn(email, password);
          if (signInErr) throw signInErr;
        } else {
          throw error;
        }
      }
      // Effect will transition to Step 5 when user updates
      sounds.playSuccess();
      setStep(5);
    } catch (err: any) {
      setAuthError(err.message || "Failed to authenticate with Supabase.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFinish = async (withPlus: boolean = false) => {
    sounds.playSuccess();
    storage.saveOnboarding({
      completed: true,
      name: name.trim(),
      goal,
    });

    if (withPlus) {
      setPaymentLoading(true);
      await upgradeToPro(selectedPlan === "annual" ? "yearly" : "monthly");
      setPaymentLoading(false);
    } else {
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md wellness-card p-8 sm:p-10 text-center space-y-8 animate-page-in relative overflow-hidden">
        {/* Subtle Top Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#00d4ff]/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#00b8a9]/20 rounded-full blur-2xl" />

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? "w-8 bg-[#00d4ff]" : s < step ? "w-4 bg-[#00b8a9]" : "w-4 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Question 1 of 3: Name */}
        {step === 1 && (
          <div className="space-y-6 animate-page-in">
            <div className="w-16 h-16 rounded-3xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff] mx-auto">
              <Smile className="w-8 h-8" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00d4ff]/15 text-[#00d4ff] text-xs font-bold uppercase tracking-wider">
                Question 1 of 3
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                What should we call you?
              </h2>
              <p className="text-sm text-white/60">
                A quiet space for your mind. Let&apos;s start by personalizing your experience.
              </p>
            </div>

            <div className="pt-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name or nickname..."
                className="w-full text-center text-base py-3.5 bg-white/5 border-white/15 focus:border-[#00d4ff] rounded-2xl text-white placeholder-white/30 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNextFrom1();
                }}
              />
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleNextFrom1}
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00d4ff]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{name.trim() ? `Continue as ${name.trim()}` : "Continue"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Question 2 of 3: Goal */}
        {step === 2 && (
          <div className="space-y-6 animate-page-in">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00d4ff]/15 text-[#00d4ff] text-xs font-bold uppercase tracking-wider">
                Question 2 of 3
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                What are you hoping to find?
              </h2>
              <p className="text-sm text-white/60">
                Choose a focus area so we can tailor your daily check-in tools.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-left pt-2">
              {[
                { id: "calm", label: "Calm", desc: "Reduce stress & anxiety", icon: <Wind className="w-5 h-5 text-[#00d4ff]" /> },
                { id: "sleep", label: "Sleep", desc: "Fall asleep faster", icon: <Moon className="w-5 h-5 text-indigo-400" /> },
                { id: "focus", label: "Focus", desc: "Clear mental fog", icon: <Sparkles className="w-5 h-5 text-amber-400" /> },
                { id: "explore", label: "Exploring", desc: "Daily mental wellness", icon: <Compass className="w-5 h-5 text-teal-400" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playClick();
                    setGoal(item.id as any);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all space-y-2 cursor-pointer ${
                    goal === item.id
                      ? "bg-[#00d4ff]/15 border-[#00d4ff] shadow-md shadow-[#00d4ff]/10 scale-[1.02]"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {item.icon}
                    {goal === item.id && <Check className="w-4 h-4 text-[#00d4ff]" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">{item.label}</span>
                    <span className="text-xs text-white/50 block">{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-6">
              <button
                onClick={() => {
                  sounds.playClick();
                  setStep(1);
                }}
                className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextFrom2}
                disabled={!goal}
                className={`flex-1 py-3.5 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  goal
                    ? "bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] shadow-lg shadow-[#00d4ff]/20 hover:scale-105 active:scale-95"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Question 3 of 3: Primary Daily Challenge */}
        {step === 3 && (
          <div className="space-y-6 animate-page-in">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00d4ff]/15 text-[#00d4ff] text-xs font-bold uppercase tracking-wider">
                Question 3 of 3
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                What is your biggest daily challenge?
              </h2>
              <p className="text-sm text-white/60">
                This helps our AI companion and CBT engine customize your daily exercises.
              </p>
            </div>

            <div className="space-y-3 text-left pt-2">
              {[
                { id: "racing", label: "🧠 Racing thoughts & overthinking", desc: "Difficulty turning off mind at night" },
                { id: "stress", label: "😰 High daily stress & tension", desc: "Feeling overwhelmed by responsibilities" },
                { id: "insomnia", label: "🌙 Restless sleep & fatigue", desc: "Waking up exhausted or unable to drift off" },
                { id: "burnout", label: "🔋 Low energy & mental fog", desc: "Struggling to maintain focus and motivation" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playClick();
                    setChallenge(item.id as any);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    challenge === item.id
                      ? "bg-[#00d4ff]/15 border-[#00d4ff] shadow-md shadow-[#00d4ff]/10 scale-[1.02]"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-white block">{item.label}</span>
                    <span className="text-xs text-white/50 block">{item.desc}</span>
                  </div>
                  {challenge === item.id && <Check className="w-5 h-5 text-[#00d4ff] shrink-0" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-6">
              <button
                onClick={() => {
                  sounds.playClick();
                  setStep(2);
                }}
                className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextFrom3}
                disabled={!challenge}
                className={`flex-1 py-3.5 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  challenge
                    ? "bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] shadow-lg shadow-[#00d4ff]/25 hover:scale-105 active:scale-95"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                <span>Save Assessment</span>
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: After 3 Questions -> Supabase OAuth */}
        {step === 4 && (
          <div className="space-y-6 animate-page-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#00d4ff]/20 to-[#00b8a9]/20 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff] mx-auto shadow-lg shadow-[#00d4ff]/10">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Check className="w-3.5 h-3.5" /> 3 of 3 Questions Answered
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif">
                Connect your Supabase Account
              </h2>
              <p className="text-sm text-white/70 leading-relaxed max-w-sm mx-auto">
                Sign in with Supabase OAuth to securely back up your personalized profile, sync across devices, and unlock your AI companion.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-left">
                {authError}
              </div>
            )}

            {authMode === "oauth" ? (
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    signInWithGoogle();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-white text-[#0B1121] font-bold text-sm hover:bg-slate-100 transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <GoogleIcon className="w-5 h-5" />
                  <span>Continue with Google OAuth</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setAuthMode("email");
                  }}
                  className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[#00d4ff]" />
                  <span>Continue with Email &amp; Password</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-3 pt-2 text-left">
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode("oauth")}
                    className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Back to OAuth
                  </button>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Connect Supabase</span>}
                  </button>
                </div>
              </form>
            )}

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  sounds.playClick();
                  setStep(5);
                }}
                className="text-xs text-white/50 hover:text-white transition-colors py-1 cursor-pointer underline underline-offset-4"
              >
                Skip OAuth &amp; continue as Guest (Local storage only)
              </button>
            </div>
          </div>
        )}

        {/* Step 5: After OAuth -> Payment & Subscription */}
        {step === 5 && (
          <div className="space-y-6 animate-page-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] mx-auto shadow-lg shadow-[#FFD700]/15">
              <CreditCard className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD700]/20 text-[#FFD700] text-xs font-bold border border-[#FFD700]/30">
                <Sparkles className="w-3.5 h-3.5" /> Supabase OAuth Connected
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif">
                Unlock Neuraliso Plus
              </h2>
              <p className="text-sm text-white/70 leading-relaxed max-w-sm mx-auto">
                Complete your setup! Enjoy unlimited CBT reframes, all 6 sleep soundscapes, and 24/7 AI companion chat.
              </p>
            </div>

            {/* Plan selection */}
            <div className="grid grid-cols-2 gap-3 text-left pt-2">
              <div
                onClick={() => {
                  sounds.playClick();
                  setSelectedPlan("annual");
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedPlan === "annual"
                    ? "bg-[#FFD700]/15 border-[#FFD700] shadow-lg shadow-[#FFD700]/15 scale-[1.02]"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="absolute top-0 right-0 bg-[#FFD700] text-[#0B1121] text-[9px] font-extrabold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                  Save 50%
                </div>
                <div className="text-xs font-bold text-[#FFD700] uppercase tracking-wider">Annual Plan</div>
                <div className="text-xl font-bold text-white mt-1">$4.99<span className="text-xs text-white/60 font-normal">/mo</span></div>
                <div className="text-[11px] text-white/50 mt-1">$59.99 billed yearly</div>
              </div>

              <div
                onClick={() => {
                  sounds.playClick();
                  setSelectedPlan("monthly");
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedPlan === "monthly"
                    ? "bg-[#FFD700]/15 border-[#FFD700] shadow-lg shadow-[#FFD700]/15 scale-[1.02]"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="text-xs font-bold text-white/80 uppercase tracking-wider">Monthly Plan</div>
                <div className="text-xl font-bold text-white mt-1">$9.99<span className="text-xs text-white/60 font-normal">/mo</span></div>
                <div className="text-[11px] text-white/50 mt-1">Billed monthly</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-left space-y-1.5 text-xs text-white/80">
              <div className="flex items-center gap-2 text-[#00d4ff] font-bold">
                <Check className="w-4 h-4 shrink-0" />
                <span>7-Day Free Trial Included</span>
              </div>
              <p className="text-white/60 text-[11px]">
                You won&apos;t be charged until day 7. Cancel anytime with one click in settings without penalty.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleFinish(true)}
                disabled={paymentLoading}
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-[#0B1121] font-extrabold text-base shadow-xl shadow-[#FFD700]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {paymentLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Start 7-Day Free Trial</span>
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                onClick={() => handleFinish(false)}
                className="w-full py-2.5 text-xs font-semibold text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Continue with Free Plan (limited features)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

