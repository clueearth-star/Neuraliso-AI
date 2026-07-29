import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

      const error = params.get("error") || hashParams.get("error");
      const errorDesc = params.get("error_description") || hashParams.get("error_description");

      if (error) {
        console.error("OAuth Error:", error, errorDesc);
        setErrorMsg("Google sign-in didn't work. Try again or use email.");
        return;
      }

      const accessToken = hashParams.get("access_token") || params.get("access_token");
      const refreshToken = hashParams.get("refresh_token") || params.get("refresh_token");

      if (accessToken && refreshToken) {
        try {
          const { error: sessionErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionErr) throw sessionErr;
          navigate("/app", { replace: true });
          return;
        } catch (err: any) {
          console.error("Failed to set session:", err);
          setErrorMsg("Failed to establish session after Google sign-in. Please try again.");
          return;
        }
      }

      // Check if session already established by supabase auth auto-detector
      const { data: { session }, error: getErr } = await supabase.auth.getSession();
      if (session && !getErr) {
        navigate("/app", { replace: true });
        return;
      }

      // If we get here after 2 seconds and no session, show error
      setTimeout(() => {
        setErrorMsg("Google sign-in didn't work. Try again or use email.");
      }, 2000);
    };

    handleCallback();
  }, [navigate]);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#0B1121] flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Authentication Error</h2>
          <p className="text-sm text-white/70">{errorMsg}</p>
          <div className="pt-2 flex gap-3 justify-center">
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="px-5 py-2.5 rounded-full bg-[#00d4ff] text-[#0B1121] font-bold text-sm flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1121] flex flex-col items-center justify-center p-4 text-white space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-[#00d4ff]" />
      <p className="text-sm font-medium text-white/80 animate-pulse">Completing Google sign-in...</p>
    </div>
  );
};
