import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";
import { sounds } from "../../lib/sounds";

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    passwordInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMsg("Please enter and confirm your new password.");
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
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message || "Could not reset password. Your link may have expired.");
        setLoading(false);
      } else {
        sounds.playSuccess();
        setSuccessMsg("Password updated successfully! Redirecting to sign in...");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1121] text-white relative overflow-hidden font-sans">
      {/* Ambient Glow Orbs */}
      <div className="absolute w-96 h-96 bg-[#00d4ff]/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse pointer-events-none" />
      <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse pointer-events-none" />

      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative z-10 animate-page-in space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Set New Password</h1>
          <p className="text-xs text-white/60">
            Enter your new secure password below to complete the recovery process.
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
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-emerald-500/10">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80 block">New Password (Min 6 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={passwordInputRef}
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80 block">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#00d4ff] focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-sm shadow-lg shadow-[#00d4ff]/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-[#0B1121] border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-white/10">
          <Link
            to="/login"
            onClick={() => sounds.playClick()}
            className="text-xs text-[#00d4ff] font-bold hover:underline transition-colors"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
