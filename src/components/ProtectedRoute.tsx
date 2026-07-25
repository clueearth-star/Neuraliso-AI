import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Mail, ArrowRight, ShieldAlert, Sparkles, LogOut } from "lucide-react";
import { sounds } from "../lib/sounds";

export const ProtectedRoute: React.FC = () => {
  const { user, loading, isAnonymous, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1121] text-white relative overflow-hidden">
        <div className="absolute w-72 h-72 bg-[#00d4ff]/10 rounded-full blur-3xl animate-pulse -top-10 -left-10" />
        <div className="absolute w-72 h-72 bg-[#00b8a9]/10 rounded-full blur-3xl animate-pulse -bottom-10 -right-10" />
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-12 h-12 rounded-full border-2 border-[#00d4ff] border-t-transparent animate-spin shadow-lg shadow-[#00d4ff]/20" />
          <p className="text-sm font-medium text-white/70 tracking-wide animate-pulse">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // If authenticated but email not confirmed (for native email/password signups)
  if (user && !user.email_confirmed_at && !user.confirmed_at && user.app_metadata?.provider === "email") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0B1121] text-white relative overflow-hidden">
        <div className="absolute w-96 h-96 bg-[#00d4ff]/10 rounded-full blur-3xl -top-20 -left-20" />
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -bottom-20 -right-20" />
        
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl text-center space-y-6 z-10 animate-page-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-[#00b8a9]/20 border border-[#00d4ff]/30 flex items-center justify-center mx-auto shadow-lg shadow-[#00d4ff]/10">
            <Mail className="w-8 h-8 text-[#00d4ff] animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-white">Please verify your email</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              We sent a confirmation link to <span className="text-[#00d4ff] font-medium">{user.email}</span>. 
              Please check your inbox (and spam folder) to activate your account.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
            <button
              onClick={() => {
                sounds.playClick();
                window.location.reload();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-sm shadow-md shadow-[#00d4ff]/20 hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>I've verified my email</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                signOut();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If neither logged in nor in anonymous fallback mode, redirect to /login
  if (!user && !isAnonymous) {
    return <Navigate to="/login" replace />;
  }

  // Render child protected routes
  return <Outlet />;
};
