import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle, KeyRound } from "lucide-react";
import { sounds } from "../../lib/sounds";

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    sounds.playClick();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setErrorMsg(error.message || "Could not send reset instructions. Please try again.");
      } else {
        sounds.playSuccess();
        setSuccessMsg("Check your email for reset instructions.");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1121] text-white relative overflow-hidden font-sans">
      {/* Ambient Glow Orbs */}
      <div className="absolute w-96 h-96 bg-[#00d4ff]/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse pointer-events-none" />
      <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse pointer-events-none" />

      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative z-10 animate-page-in space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#00d4ff]/10">
            <KeyRound className="w-7 h-7 text-[#00d4ff]" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-xs text-white/60">
            Enter the email address associated with your Neuraliso account and we'll send you a link to reset your password.
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
              <p className="font-bold text-sm text-emerald-200">Email Sent!</p>
              <p className="leading-relaxed">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Form */}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-sm shadow-lg shadow-[#00d4ff]/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-[#0B1121] border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Send Reset Link</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-white/10">
          <Link
            to="/login"
            onClick={() => sounds.playClick()}
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-[#00d4ff] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
