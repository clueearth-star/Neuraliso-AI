import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { safeStorage } from "../../lib/storage";
import { Loader2, AlertCircle, RefreshCw, Terminal, CheckCircle2, Clock } from "lucide-react";

interface DebugLog {
  timestamp: string;
  type: "info" | "success" | "warn" | "error";
  message: string;
}

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(true);
  const [returnTime, setReturnTime] = useState<string>("");

  const addLog = (type: "info" | "success" | "warn" | "error", message: string) => {
    const time = new Date().toISOString().split("T")[1].slice(0, 8) + "." + Math.floor(new Date().getMilliseconds());
    console.log(`[AuthCallback ${time}] [${type.toUpperCase()}] ${message}`);
    setLogs((prev) => [...prev, { timestamp: time, type, message }]);
  };

  useEffect(() => {
    let mounted = true;
    const nowISO = new Date().toUTCString();
    setReturnTime(nowISO);

    addLog("info", `OAuth redirect received at ${nowISO}`);

    const url = new URL(window.location.href);
    const params = url.searchParams;
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

    const paramCode = params.get("code");
    const paramAccessToken = hashParams.get("access_token") || params.get("access_token");
    const paramError = params.get("error") || hashParams.get("error");
    const paramErrorDesc = params.get("error_description") || hashParams.get("error_description");

    addLog("info", `URL parameters parsed: code=${paramCode ? "PRESENT" : "none"}, access_token=${paramAccessToken ? "PRESENT" : "none"}, error=${paramError || "none"}`);

    if (paramError) {
      addLog("error", `OAuth Provider Error: ${paramError} - ${paramErrorDesc || "No description provided"}`);
      if (mounted) {
        setErrorMsg(paramErrorDesc || `Google sign-in error: ${paramError}`);
      }
      return;
    }

    // Strict hard timeout timer (12 seconds)
    const hardTimeout = setTimeout(() => {
      if (mounted) {
        addLog("error", "Hard timeout reached (12s). Google authentication session was not established in time.");
        setErrorMsg("Sign-in is taking longer than expected. Please try again.");
      }
    }, 12000);

    // Listen to onAuthStateChange for immediate redirection as soon as session is set
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog("info", `onAuthStateChange event: ${event}, session: ${session ? "AUTHENTICATED (" + session.user?.email + ")" : "NULL"}`);
      if (session && mounted) {
        addLog("success", "Session detected via onAuthStateChange! Redirecting to app...");
        clearTimeout(hardTimeout);
        safeStorage.set("neuraliso_is_anonymous", "false");
        setTimeout(() => {
          if (mounted) navigate("/app", { replace: true });
        }, 500);
      }
    });

    const handleCallback = async () => {
      try {
        // 1. Explicit PKCE code exchange if code is in query params
        if (paramCode) {
          addLog("info", "Exchanging PKCE code for session with Supabase...");
          const { data: codeData, error: codeErr } = await supabase.auth.exchangeCodeForSession(paramCode);
          if (codeErr) {
            addLog("warn", `exchangeCodeForSession warning: ${codeErr.message}`);
          } else if (codeData?.session) {
            addLog("success", `PKCE exchange successful! User: ${codeData.session.user.email}`);
            if (mounted) {
              clearTimeout(hardTimeout);
              safeStorage.set("neuraliso_is_anonymous", "false");
              navigate("/app", { replace: true });
            }
            return;
          }
        }

        // 2. Explicit access_token handling if in hash params
        if (paramAccessToken) {
          const refreshToken = hashParams.get("refresh_token") || params.get("refresh_token") || "";
          addLog("info", "Setting session explicitly from access_token/refresh_token...");
          const { data: tokenData, error: tokenErr } = await supabase.auth.setSession({
            access_token: paramAccessToken,
            refresh_token: refreshToken,
          });
          if (tokenErr) {
            addLog("warn", `setSession warning: ${tokenErr.message}`);
          } else if (tokenData?.session) {
            addLog("success", `Session set successfully! User: ${tokenData.session.user.email}`);
            if (mounted) {
              clearTimeout(hardTimeout);
              safeStorage.set("neuraliso_is_anonymous", "false");
              navigate("/app", { replace: true });
            }
            return;
          }
        }

        // 3. Initial getSession check
        addLog("info", "Checking existing Supabase session via getSession()...");
        const { data: { session }, error: getErr } = await supabase.auth.getSession();
        if (getErr) {
          addLog("warn", `getSession warning: ${getErr.message}`);
        } else if (session && mounted) {
          addLog("success", `Active session found via getSession()! User: ${session.user.email}`);
          clearTimeout(hardTimeout);
          safeStorage.set("neuraliso_is_anonymous", "false");
          navigate("/app", { replace: true });
          return;
        }

        // 4. Short polling loop until hard timeout
        let pollCount = 0;
        const pollInterval = setInterval(async () => {
          if (!mounted) {
            clearInterval(pollInterval);
            return;
          }
          pollCount++;
          addLog("info", `Polling session check #${pollCount}...`);
          const { data: { session: pollSession } } = await supabase.auth.getSession();
          if (pollSession && mounted) {
            clearInterval(pollInterval);
            clearTimeout(hardTimeout);
            addLog("success", `Session confirmed during poll #${pollCount}! Redirecting...`);
            safeStorage.set("neuraliso_is_anonymous", "false");
            navigate("/app", { replace: true });
          }
        }, 1000);

      } catch (err: any) {
        addLog("error", `Unexpected error during authentication: ${err?.message || String(err)}`);
        if (mounted) {
          setErrorMsg(err?.message || "An unexpected error occurred during Google sign-in.");
        }
      }
    };

    handleCallback();

    return () => {
      mounted = false;
      clearTimeout(hardTimeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0B1121] flex items-center justify-center p-4 text-white">
      <div className="max-w-lg w-full bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {errorMsg ? (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Authentication Error</h2>
            <p className="text-sm text-slate-300 bg-black/30 p-3 rounded-2xl border border-white/5">
              {errorMsg}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="px-6 py-2.5 rounded-full bg-[#00d4ff] text-[#0B1121] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-[#00d4ff]/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#00d4ff]" />
            </div>
            <h3 className="text-lg font-bold text-white">Completing Google Sign-in</h3>
            <p className="text-xs text-slate-400">Verifying session and security tokens...</p>
          </div>
        )}

        {/* Debug Logs Panel */}
        <div className="pt-2 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-[#00d4ff]" />
              <span>OAuth Diagnostic Log</span>
            </span>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-[10px] text-[#00d4ff] hover:underline cursor-pointer"
            >
              {showLogs ? "Hide Logs" : "Show Logs"}
            </button>
          </div>

          {returnTime && (
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
              <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>Returned to App: <strong className="text-white">{returnTime}</strong></span>
            </div>
          )}

          {showLogs && (
            <div className="p-3 bg-black/60 rounded-xl border border-white/10 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto text-left">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic">Initializing OAuth callback...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="leading-snug break-all flex items-start gap-1.5">
                    <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                    <span
                      className={
                        log.type === "error"
                          ? "text-rose-400 font-semibold"
                          : log.type === "warn"
                          ? "text-amber-300"
                          : log.type === "success"
                          ? "text-emerald-400 font-semibold"
                          : "text-slate-300"
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


