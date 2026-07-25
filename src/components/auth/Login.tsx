import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Sparkles, ShieldCheck } from "lucide-react";
import { sounds } from "../../lib/sounds";

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23.745 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-8.97Z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.3 0 6.08-1.09 8.11-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.23 1.18-3.25 0-6.01-2.19-7-5.14H1.01v3.15C3.06 21.3 7.23 24 12 24Z"
      fill="#34A853"
    />
    <path
      d="M5 14.03c-.25-.74-.39-1.54-.39-2.36 0-.82.14-1.62.39-2.36V6.16H1.01A11.977 11.977 0 0 0 0 11.67c0 2.01.48 3.91 1.33 5.59L5 14.03Z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.98 1.19 15.21 0 12 0 7.23 0 3.06 2.7 1.01 6.78l3.99 3.15c.99-2.95 3.75-5.18 7-5.18Z"
      fill="#EA4335"
    />
  </svg>
);

export const Login: React.FC = () => {
  const { signIn, signInWithGoogle, setAnonymousMode, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus first input on page load
    emailInputRef.current?.focus();
    // If already logged in, redirect to /app
    if (user) {
      navigate("/app", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    sounds.playClick();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message?.toLowerCase().includes("invalid login credentials")) {
          setErrorMsg("Invalid email or password. Please check your credentials.");
        } else if (error.message?.toLowerCase().includes("email not confirmed")) {
          setErrorMsg("Please verify your email address before signing in.");
        } else {
          setErrorMsg(error.message || "Something went wrong. Try again.");
        }
        setLoading(false);
      } else {
        setSuccessMsg("Welcome back!");
        sounds.playSuccess();
        setTimeout(() => {
          navigate("/app", { replace: true });
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1121] text-white relative overflow-hidden font-sans">
      {/* Ambient Glow Orbs */}
      <div className="absolute w-96 h-96 bg-[#00d4ff]/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse pointer-events-none" />
      <div className="absolute w-96 h-96 bg-[#00b8a9]/10 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse pointer-events-none" />
      <div className="absolute w-72 h-72 bg-purple-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative z-10 animate-page-in space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Secure Cloud Access</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-sm text-white/60">
            Sign in to access your mood logs, CBT reframes, and AI coaching history across all devices.
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
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-semibold">{successMsg}</span>
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
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0e1628] px-3 text-xs text-white/40 uppercase tracking-widest font-semibold absolute">
            or email
          </span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={emailInputRef}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#00d4ff] focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white/80 block">Password</label>
              <Link
                to="/forgot-password"
                onClick={() => sounds.playClick()}
                className="text-xs text-[#00d4ff] hover:underline font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#00d4ff] focus:bg-white/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-sm shadow-lg shadow-[#00d4ff]/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-[#0B1121] border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center space-y-4 pt-2 border-t border-white/10">
          <p className="text-xs text-white/60">
            Don't have an account?{" "}
            <Link
              to="/signup"
              onClick={() => sounds.playClick()}
              className="text-[#00d4ff] font-bold hover:underline transition-colors"
            >
              Create one now
            </Link>
          </p>

          <button
            type="button"
            onClick={handleGuestContinue}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Continue as Guest / Explore Anonymously</span>
          </button>
        </div>
      </div>
    </div>
  );
};
