import React, { useState, useEffect } from "react";
import { Sparkles, Crown, ArrowRight, X, Flame } from "lucide-react";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { sounds } from "../../lib/sounds";
import { safeStorage } from "../../lib/safeStorage";

const DISMISS_KEY = "neuraliso_lifetime_banner_dismissed";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const LifetimeDealBanner: React.FC = () => {
  const { isPro, isLifetime, openLifetimeModal, successToast, dismissSuccessToast } = useSubscription();
  const [isDismissed, setIsDismissed] = useState<boolean>(true); // start true to prevent flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissedAt = safeStorage.getItem(DISMISS_KEY);
    if (!dismissedAt) {
      setIsDismissed(false);
    } else {
      const timestamp = parseInt(dismissedAt, 10);
      if (isNaN(timestamp) || Date.now() - timestamp > SEVEN_DAYS_MS) {
        safeStorage.removeItem(DISMISS_KEY);
        setIsDismissed(false);
      } else {
        setIsDismissed(true);
      }
    }
  }, []);

  // Never show any banner or pill if user is already lifetime
  if (!mounted || isLifetime) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    safeStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  const handleClaim = () => {
    sounds.playClick();
    openLifetimeModal();
  };

  return (
    <>
      {/* Toast Notification (e.g. after successful lifetime purchase) */}
      {successToast && (
        <div 
          id="lifetime-success-toast"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] p-4 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-[#0B1121] shadow-2xl font-bold text-sm flex items-center justify-between gap-3 animate-bounce"
        >
          <span>{successToast}</span>
          <button
            onClick={dismissSuccessToast}
            className="p-1 rounded-full bg-black/10 hover:bg-black/20 text-[#0B1121] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Top Banner (when not dismissed) */}
      {!isDismissed ? (
        <div
          id="lifetime-deal-top-banner"
          className="relative z-50 w-full overflow-hidden bg-gradient-to-r from-[#d49e00] via-[#ffaa00] to-[#e6a800] text-[#0B1121] border-b border-amber-300/40 shadow-md animate-gradient-x"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-2 min-h-[52px] sm:min-h-[56px] flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
            
            {/* Left / Center Content */}
            <div 
              onClick={handleClaim}
              className="flex items-center flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-semibold cursor-pointer group"
            >
              <div className="flex items-center gap-1 bg-[#0B1121] text-[#FFD700] px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm">
                <Flame className="w-3.5 h-3.5 text-[#FFD700] animate-bounce" />
                <span>LIMITED OFFER</span>
              </div>

              <span className="text-[#0B1121] font-medium hidden sm:inline">
                •
              </span>

              <div className="flex items-center gap-1">
                <span>Get Neuraliso</span>
                <span className="font-extrabold text-sm sm:text-base tracking-tight underline decoration-[#0B1121]/40 decoration-2 group-hover:scale-105 transition-transform inline-flex items-center gap-0.5">
                  <Crown className="w-3.5 h-3.5 inline text-[#0B1121]" />
                  <span>Plus Lifetime</span>
                </span>
                <span>Forever for <strong className="font-black text-sm sm:text-base bg-white/40 px-1.5 py-0.5 rounded-md">$20.92</strong></span>
              </div>

              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-950/90 bg-amber-200/50 px-2 py-0.5 rounded-full border border-amber-800/20 animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>Limited spots available</span>
              </span>
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="banner-claim-lifetime-btn"
                onClick={handleClaim}
                className="bg-white text-amber-950 hover:bg-amber-50 font-extrabold text-xs sm:text-sm rounded-full px-4 sm:px-6 py-1.5 sm:py-2 shadow-lg shadow-black/15 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1.5 border border-amber-200"
              >
                <span>Claim Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                id="banner-dismiss-lifetime-btn"
                onClick={handleDismiss}
                aria-label="Dismiss lifetime deal banner"
                title="Dismiss banner (available in bottom corner)"
                className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-[#0B1121] hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* Floating Pill Button Bottom-Left (when dismissed within 7 days) */
        <button
          id="floating-lifetime-deal-pill"
          onClick={handleClaim}
          className="fixed bottom-5 left-5 z-40 px-4 py-2 rounded-full bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-[#0B1121] font-extrabold text-xs sm:text-sm shadow-xl shadow-[#FFD700]/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2 border border-amber-200/50 animate-pulse"
          title="Neuraliso Plus Lifetime Deal - $20.92"
        >
          <Crown className="w-4 h-4 text-[#0B1121]" />
          <span>Lifetime $20.92</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#0B1121] text-[#FFD700] text-[10px] font-bold">
            65% OFF
          </span>
        </button>
      )}
    </>
  );
};
