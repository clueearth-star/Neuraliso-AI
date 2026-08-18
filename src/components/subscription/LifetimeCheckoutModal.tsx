import React, { useState } from "react";
import { X, Sparkles, Check, ShieldCheck, Lock, Crown, HeartHandshake, PartyPopper, CheckCircle2, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { LIFETIME_DEAL } from "../../lib/subscriptions";

/**
 * Fires a celebratory multi-stage confetti animation sequence using canvas-confetti
 */
export const triggerConfettiCelebration = () => {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 99999,
    };

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    };

    // Stage 1: Fast concentrated gold & teal burst
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ["#FFD700", "#FFA500", "#FFFFFF", "#00D4FF"],
    });

    // Stage 2: Medium spread gold flurry
    fire(0.2, {
      spread: 60,
      colors: ["#FFD700", "#F59E0B", "#10B981", "#6366F1"],
    });

    // Stage 3: Wide sky shower
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.9,
      colors: ["#FFD700", "#FFC700", "#00E5FF", "#EC4899", "#10B981"],
    });

    // Stage 4: Heavy golden particles
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.3,
      shapes: ["circle", "square"],
      colors: ["#FFD700", "#FFA500", "#FFFBEB"],
    });

    // Stage 5: High-velocity cannon burst
    fire(0.1, {
      spread: 130,
      startVelocity: 45,
      colors: ["#FFD700", "#38BDF8", "#34D399", "#F43F5E"],
    });

    // Stage 6: Left side celebratory cannon after 250ms
    setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.75 },
        zIndex: 99999,
        colors: ["#FFD700", "#FFA500", "#00D4FF", "#10B981"],
      });
    }, 250);

    // Stage 7: Right side celebratory cannon after 450ms
    setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.75 },
        zIndex: 99999,
        colors: ["#FFD700", "#FFA500", "#00D4FF", "#EC4899"],
      });
    }, 450);

    // Stage 8: Starburst finale after 700ms
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 120,
        origin: { x: 0.5, y: 0.55 },
        zIndex: 99999,
        scalar: 1.3,
        shapes: ["star"],
        colors: ["#FFD700", "#FFA500", "#FFFFFF", "#FDE047"],
      });
    }, 700);
  } catch (err) {
    console.error("Confetti animation failed:", err);
  }
};

export const LifetimeCheckoutModal: React.FC = () => {
  const { isLifetimeModalOpen, closeLifetimeModal, buyLifetimeDeal, isLifetime } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // If modal is not requested and no active success screen, don't render
  if (!isLifetimeModalOpen && !purchaseSuccess) return null;
  // If user is already lifetime and modal is not showing a newly completed celebration screen
  if (isLifetime && !purchaseSuccess && !isLifetimeModalOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      await buyLifetimeDeal();
    } catch (e: any) {
      setError(e.message || "Unable to proceed to checkout");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPurchaseSuccess(false);
    closeLifetimeModal();
  };

  const handleReplayCelebration = () => {
    triggerConfettiCelebration();
  };

  return (
    <div 
      id="lifetime-checkout-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div 
        id="lifetime-checkout-modal-container"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-b from-[#141d33] to-[#0b1121] border-2 border-[#FFD700]/50 shadow-2xl shadow-[#FFD700]/20 p-6 sm:p-8 text-white max-h-[92vh] overflow-y-auto"
      >
        {/* Subtle Shimmer / Ambient Glow */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#FFD700]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#FFA500]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="close-lifetime-modal-btn"
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SUCCESS CELEBRATION VIEW */}
        {purchaseSuccess ? (
          <div id="lifetime-success-celebration-view" className="text-center py-4 sm:py-6 animate-fade-in">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-tr from-[#FFD700] via-[#FFA500] to-[#FFD700] flex items-center justify-center shadow-lg shadow-[#FFD700]/40 animate-bounce">
                <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-[#0B1121] fill-current" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-2 border-[#0B1121] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <PartyPopper className="w-4 h-4 text-emerald-400" />
              <span>Checkout Successful!</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700]">Lifetime Access!</span>
            </h2>
            
            <p className="text-sm sm:text-base text-slate-300 mb-6 max-w-sm mx-auto">
              Your account has been permanently unlocked. Enjoy every current and future Neuraliso Plus feature forever.
            </p>

            {/* Unlocked perks summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 text-left text-xs text-slate-200 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Unlimited Mood Logs & History</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>All 6 Ambient Soundscapes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>5 Breathing Audio Modes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>24/7 AI Companion & Reframes</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                id="lifetime-celebration-continue-btn"
                onClick={handleClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] hover:from-[#ffe244] hover:to-[#ffb324] text-[#0B1121] font-extrabold text-base shadow-xl shadow-[#FFD700]/25 hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start Using Neuraliso Plus</span>
                <Sparkles className="w-5 h-5" />
              </button>

              <button
                id="lifetime-celebration-replay-confetti-btn"
                onClick={handleReplayCelebration}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Replay Confetti Celebration 🎉</span>
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD CHECKOUT VIEW */
          <>
            {/* Top Badge */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FFD700]/20 via-[#FFA500]/25 to-[#FFD700]/20 border border-[#FFD700]/50 text-[#FFD700] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm animate-pulse">
                <Crown className="w-4 h-4 text-[#FFD700]" />
                <span>Exclusive Limited Offer • Save 65% Forever</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                {LIFETIME_DEAL.name}
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                {LIFETIME_DEAL.tagline} {LIFETIME_DEAL.subtext}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFD700]/10 via-[#FFA500]/10 to-[#FFD700]/10 border border-[#FFD700]/40 mb-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="text-slate-400 text-base line-through font-medium">
                  {LIFETIME_DEAL.regularPrice}
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700]">
                  {LIFETIME_DEAL.formattedPrice}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                  One-Time Payment
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-2 font-medium">
                🔥 Pay once today. Never get charged again. All future updates included forever.
              </p>
            </div>

            {/* What's Included List */}
            <div className="space-y-3 mb-6 text-xs sm:text-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Everything in Neuraliso Plus Forever:</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-5 h-5 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-200"><strong>Unlimited Daily Mood Check-Ins</strong> & complete historical analytics</span>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-5 h-5 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-200"><strong>All 6 Ambient Sleep Soundscapes</strong> (Binaural, Rain, Stream, Ocean & more)</span>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-5 h-5 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-200"><strong>5 Clinical Breathing Modes</strong> with soothing acoustic audio feedback</span>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-5 h-5 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-200"><strong>24/7 CBT AI Companion</strong> with empathetic thought reframing</span>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-5 h-5 rounded-full bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-200"><strong>100% Privacy Guarantee:</strong> Zero data retention & offline-first storage</span>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center mb-4">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                id="pay-lifetime-deal-cta"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] hover:from-[#ffe244] hover:to-[#ffb324] text-[#0B1121] font-extrabold text-base sm:text-lg shadow-xl shadow-[#FFD700]/25 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse">Processing Purchase...</span>
                ) : (
                  <>
                    <Crown className="w-5 h-5 fill-current" />
                    <span>Pay $20.92 &amp; Get Lifetime Access</span>
                  </>
                )}
              </button>

              <button
                id="lifetime-modal-maybe-later-btn"
                onClick={handleClose}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer text-center"
              >
                Maybe later
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Secure 256-bit SSL via Dodo Payments</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span>30-Day Money-Back Guarantee</span>
              </div>
              <div className="flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Crisis resources always free</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
