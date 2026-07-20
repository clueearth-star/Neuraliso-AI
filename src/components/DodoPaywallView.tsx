import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  LogOut,
  CheckCircle2
} from "lucide-react";

interface DodoPaywallViewProps {
  user: {
    id: string;
    email: string;
    displayName: string;
  };
  userProfile: any;
  onPaymentSuccess: () => void;
}

export const DodoPaywallView: React.FC<DodoPaywallViewProps> = ({
  user,
  userProfile,
  onPaymentSuccess
}) => {
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<boolean>(false);

  // Capture redirection parameters on render
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const subscriptionId = params.get("subscription_id");

    if (status === "success" && subscriptionId) {
      verifyPaymentConnection(subscriptionId);
    }
  }, []);

  const verifyPaymentConnection = async (subscriptionId: string) => {
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await fetch("/api/verify-dodo-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          subscriptionId
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Verification failed");
      }

      setVerifySuccess(true);
      setTimeout(() => {
        // Clear query parameters from URL for a clean state
        const url = new URL(window.location.href);
        url.searchParams.delete("status");
        url.searchParams.delete("subscription_id");
        url.searchParams.delete("userId");
        window.history.replaceState({}, document.title, url.pathname + url.search);
        
        onPaymentSuccess();
      }, 2000);
    } catch (err: any) {
      console.error("[verifyPaymentConnection error]:", err);
      setVerifyError(err.message || "We could not verify your subscription with Dodo Payments. Please make sure the payment succeeded.");
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckoutRedirect = () => {
    const checkoutBase = "https://checkout.dodopayments.com/buy/pdt_0NjZcNQU20nKx7FEP7N5V";
    const redirectUrl = `${window.location.origin}${window.location.pathname}?status=success&userId=${encodeURIComponent(user.id)}`;
    
    // Construct dynamic checkout URL with email pre-population and client reference identifiers
    const checkoutUrl = `${checkoutBase}?quantity=1&redirect_url=${encodeURIComponent(redirectUrl)}&customer_email=${encodeURIComponent(user.email)}&client_reference_id=${encodeURIComponent(user.id)}&metadata=${encodeURIComponent(JSON.stringify({ userId: user.id }))}`;
    
    window.location.href = checkoutUrl;
  };

  const handleLogout = async () => {
    // Clear cookies & trigger standard window reload to sign out of Supabase/Firebase Auth
    localStorage.clear();
    window.location.href = "/";
  };

  const isTrialExpired = userProfile?.subscriptionReason === "trial_expired_payment_failed";

  return (
    <div id="neuraliso-dodo-paywall" className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-primary-sage/20 p-8 space-y-6 text-center shadow-2xl rounded-3xl relative animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-deep-sage via-primary-sage to-calm-blue rounded-t-3xl" />
        
        {/* Verification Loading Overlays */}
        {verifying && (
          <div className="space-y-4 py-8">
            <div className="w-12 h-12 border-4 border-primary-sage/30 border-t-primary-sage rounded-full animate-spin mx-auto" />
            <h4 className="text-lg font-serif font-bold text-dark-text italic">Verifying Connection</h4>
            <p className="text-xs text-muted-text font-mono tracking-wider max-w-xs mx-auto">
              Securing handshake with Dodo Payments cloud infrastructure ...
            </p>
          </div>
        )}

        {verifySuccess && (
          <div className="space-y-4 py-8 animate-pulse">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-serif font-bold text-emerald-800 italic">Payment Connection Verified!</h4>
            <p className="text-xs text-emerald-600 font-mono tracking-widest uppercase">
              Access Granted • Launching Workspace
            </p>
          </div>
        )}

        {!verifying && !verifySuccess && (
          <>
            {/* Header Badge */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif italic text-dark-text font-bold tracking-tight">
                {isTrialExpired ? "Your 3-Day Trial has Ended" : "Start Your 3-Day Free Trial"}
              </h3>
              <p className="text-[10px] text-emerald-600 font-bold font-mono tracking-widest uppercase">
                SECURE CHECKOUT REQUIRED
              </p>
            </div>

            {/* Error Message */}
            {verifyError && (
              <div className="p-3.5 bg-red-50 border border-red-150 text-red-700 text-xs rounded-2xl font-sans text-left flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {/* Explanatory Body */}
            <div className="space-y-4 text-left text-xs text-slate-600 bg-slate-50/70 border border-slate-100 p-5 rounded-2xl">
              <p className="leading-relaxed">
                {isTrialExpired ? (
                  "Your 3-day trial period has concluded. To continue enjoying uninterrupted clinical-grade stress relief, biometric feedback, and Solfeggio soundscapes, please verify or reconnect your active payment method."
                ) : (
                  "Neuraliso is a highly optimized clinical wellness space. To prevent spam and secure dedicated premium AI diagnostic models, we require a connected payment method to register your account."
                )}
              </p>
              
              <div className="space-y-2.5 pt-1.5 font-sans font-medium text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>3 Days of Full Access (Unlimited Features)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>No upfront charge • Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Encrypted SSL 256-bit bank safety layers</span>
                </div>
              </div>
            </div>

            {/* Checkout CTA */}
            <div className="space-y-3.5">
              <button
                id="dodo-checkout-btn"
                onClick={handleCheckoutRedirect}
                className="w-full bg-gradient-to-r from-deep-sage via-primary-sage to-calm-blue hover:opacity-95 text-white py-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-lg shadow-deep-sage/15 border border-white/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>{isTrialExpired ? "Update Payment & Reactivate" : "Connect Payment Method"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full bg-slate-100/80 border border-slate-200 text-slate-500 hover:bg-slate-150 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Account</span>
              </button>
            </div>

            {/* Small Footer Disclaimer */}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[8px] font-mono text-muted-text font-bold">
              <span>POWERED BY DODO PAYMENTS</span>
              <span>PCI-DSS COMPLIANT</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
