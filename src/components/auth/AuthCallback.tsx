import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Listen to onAuthStateChange for immediate redirection as soon as session is set
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && mounted) {
        localStorage.setItem("neuraliso_is_anonymous", "false");
        navigate("/app", { replace: true });
      }
    });

    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const params = url.searchParams;
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

        const error = params.get("error") || hashParams.get("error");
        const errorDesc = params.get("error_description") || hashParams.get("error_description");

        if (error) {
          console.error("OAuth Callback Error:", error, errorDesc);
          if (mounted) {
            setErrorMsg(errorDesc || "Google sign-in was canceled or encountered an error.");
          }
          return;
        }

        // 1. Explicit PKCE code exchange if code is in query params
        const code = params.get("code");
        if (code) {
          console.log("[AuthCallback] Exchanging PKCE code for session...");
          const { data: codeData, error: codeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (!codeErr && codeData?.session) {
            console.log("[AuthCallback] PKCE code exchange successful!");
            if (mounted) {
              localStorage.setItem("neuraliso_is_anonymous", "false");
              navigate("/app", { replace: true });
            }
            return;
          } else if (codeErr) {
            console.warn("[AuthCallback] PKCE exchangeCodeForSession notice:", codeErr.message);
          }
        }

        // 2. Explicit access_token handling if in hash params
        const accessToken = hashParams.get("access_token") || params.get("access_token");
        const refreshToken = hashParams.get("refresh_token") || params.get("refresh_token");

        if (accessToken && refreshToken) {
          console.log("[AuthCallback] Setting session from tokens...");
          const { data: tokenData, error: tokenErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!tokenErr && tokenData?.session) {
            if (mounted) {
              localStorage.setItem("neuraliso_is_anonymous", "false");
              navigate("/app", { replace: true });
            }
            return;
          }
        }

        // 3. Check existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          localStorage.setItem("neuraliso_is_anonymous", "false");
          navigate("/app", { replace: true });
          return;
        }

        // 4. Polling fallback loop for up to 8 seconds (16 x 500ms)
        let attempts = 0;
        const maxAttempts = 16;
        const pollInterval = setInterval(async () => {
          if (!mounted) {
            clearInterval(pollInterval);
            return;
          }

          attempts++;
          const { data: { session: pollSession } } = await supabase.auth.getSession();
          if (pollSession) {
            clearInterval(pollInterval);
            if (mounted) {
              localStorage.setItem("neuraliso_is_anonymous", "false");
              navigate("/app", { replace: true });
            }
            return;
          }

          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            if (mounted) {
              setErrorMsg("Google sign-in timed out. Please try signing in again.");
            }
          }
        }, 500);

      } catch (err: any) {
        console.error("[AuthCallback] Unexpected error:", err);
        if (mounted) {
          setErrorMsg("An unexpected error occurred during Google sign-in.");
        }
      }
    };

    handleCallback();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
              className="px-5 py-2.5 rounded-full bg-[#00d4ff] text-[#0B1121] font-bold text-sm flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity cursor-pointer"
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

