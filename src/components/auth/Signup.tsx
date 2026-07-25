import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Sparkles, ShieldCheck } from "lucide-react";
import { sounds } from "../../lib/sounds";
import { GoogleIcon } from "./Login";

export const Signup: React.FC = () => {
  const { signUp, signInWithGoogle, setAnonymousMode, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
    if (user && user.email_confirmed_at) {
      navigate("/app", { replace: true });
    }
  }, [user, navigate]);

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return { score: 0, label: "", color: "bg-white/10" };
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9!@#$%^&*]/.test(pwd)) score += 1;

    const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
    const colors = ["bg-rose-500", "bg-rose-400", "bg-amber-400", "bg-emerald-400", "bg-[#00d4ff]"];
    return { score, label: labels[score], color: colors[score] };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-type carefully.");
      return;
    }

    sounds.playClick();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const { data, error } = await signUp(email, password, name || email.split("@")[0]);
      if (error) {
        setErrorMsg(error.message || "Could not create account. Please try again.");
        setLoading(false);
      } else {
        sounds.playSuccess();
        // Check if Supabase requires email confirmation
        if (data?.user && !data.session) {
          setSuccessMsg("Account created! Please check your email to confirm your account.");
          setLoading(false);
        } else {
          setSuccessMsg("Account created! Welcome to Neuraliso.");
          setTimeout(() => {
            navigate("/app", { replace: true });
          }, 1200);
        }
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred during signup.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    sounds.playClick();
    setErrorMsg("");
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error.message || "Could not connect to Google OAuth.");
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMsg("Google authentication failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleGuestContinue = () => {
    sounds.playClick();
    setAnonymousMode(true);
    navigate("/app", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1121] text-white relative overflow-hidden font-sans py-12">
      {/* Ambient Glow Orbs */}
      <div className="absolute w-96 h-96 bg-[#00d4ff]/10 rounded-full blur-3xl -top-20 -right-20 animate-pulse pointer-events-none" />
      <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -bottom-20 -left-20 animate-pulse pointer-events-none" />

      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative z-10 animate-page-in space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Your Wellness Journey</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-white/60">
            Back up your CBT reframes, daily mood charts, and streak progress securely in the cloud.
          </p>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-emerald-500/10">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-emerald-200">Verification Required</p>
              <p className="leading-relaxed">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {googleLoading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
          <span>Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0e1628] px-3 text-[11px] text-white/40 uppercase tracking-widest font-semibold absolute">
            or use email
          </span>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/80 block">Your Name (Optional)</label>
            <div className="relative">
              <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#00d4ff] focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/80 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#00d4ff] focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/80 block">Password (Min 6 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#00d4ff] focus:bg-white/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="pt-1.5 space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-white/60">Strength:</span>
                  <span className={`font-bold ${strength.score >= 3 ? "text-emerald-400" : "text-amber-400"}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-all duration-300 ${
                        step <= strength.score ? strength.color : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/80 block">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#00d4ff] focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-sm shadow-lg shadow-[#00d4ff]/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-[#0B1121] border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center space-y-3 pt-2 border-t border-white/10">
          <p className="text-xs text-white/60">
            Already have an account?{" "}
            <Link
              to="/login"
              onClick={() => sounds.playClick()}
              className="text-[#00d4ff] font-bold hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>

          <button
            type="button"
            onClick={handleGuestContinue}
            className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Explore Anonymously without logging in</span>
          </button>
        </div>
      </div>
    </div>
  );
};
