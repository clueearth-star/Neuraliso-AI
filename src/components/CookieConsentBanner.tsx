import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Cookie, X, Check } from "lucide-react";

const COOKIE_CONSENT_KEY = "neuraliso_cookie_consent_v1";

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Small delay before showing so it doesn't jarringly pop over first paint
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // If localStorage is unavailable, fail silently
    }
  }, []);

  const handleAccept = (type: "all" | "essential") => {
    try {
      localStorage.setItem(
        COOKIE_CONSENT_KEY,
        JSON.stringify({
          type,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn("Could not save cookie consent:", e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      role="region"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-lg w-auto bg-[#131C31]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/60 text-white animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff] shrink-0 mt-0.5">
          <Cookie className="w-5 h-5" />
        </div>

        <div className="space-y-2 flex-1 text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Your Privacy &amp; Cookies</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </h4>
            <button
              onClick={() => handleAccept("essential")}
              className="text-slate-400 hover:text-white p-1 -mr-1 -mt-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close and accept essential only"
              title="Close and accept essential only"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            We use essential local storage &amp; secure session cookies (Supabase Auth) to keep you logged in and preserve your offline mood preferences. We do not sell your personal reflections or use invasive ad trackers.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <Link to="/privacy" className="hover:text-[#00d4ff] underline transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-[#00d4ff] underline transition-colors">
                Terms of Service
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAccept("essential")}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer min-h-[36px]"
              >
                Essential Only
              </button>
              <button
                type="button"
                onClick={() => handleAccept("all")}
                className="px-3.5 py-1.5 rounded-xl bg-[#00d4ff] hover:bg-[#33ddff] text-[#0B1121] text-xs font-bold transition-all shadow-md shadow-[#00d4ff]/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-h-[36px] flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept All</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default CookieConsentBanner;
