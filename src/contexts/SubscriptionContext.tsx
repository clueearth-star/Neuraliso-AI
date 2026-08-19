import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { SubscriptionTier, SubscriptionStatus, BillingPeriod } from "../types";
import { storage } from "../lib/storage";
import { useAuth } from "./AuthContext";
import { getDodoCheckoutUrl, LIFETIME_DEAL } from "../lib/subscriptions";

export interface SubscriptionContextType {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt: string | null;
  billingPeriod?: BillingPeriod;
  isPro: boolean;
  isLifetime: boolean;
  isTrial: boolean;
  moodsThisWeek: number;
  reframesThisWeek: number;
  chatToday: number;
  showExpiryBanner: boolean;
  daysUntilExpiry: number | null;
  isModalOpen: boolean;
  modalReason: string;
  modalFeature?: string;
  isLifetimeModalOpen: boolean;
  successToast: string | null;
  openUpgradeModal: (reason?: string, feature?: string) => void;
  closeUpgradeModal: () => void;
  openLifetimeModal: () => void;
  closeLifetimeModal: () => void;
  upgradeToPro: (plan?: "monthly" | "yearly" | "lifetime") => Promise<{ success: boolean; error?: string }>;
  buyLifetimeDeal: () => Promise<{ success: boolean; error?: string }>;
  startFreeTrial: () => Promise<{ success: boolean; error?: string }>;
  cancelSubscription: () => Promise<{ success: boolean; error?: string }>;
  checkFeatureAccess: (feature: "mood" | "reframe" | "chat" | "breathe" | "sleep" | "progress", count?: number) => boolean;
  refreshUsageCounts: () => void;
  refreshSubscription: () => Promise<void>;
  triggerLifetimeCelebration: () => void;
  dismissSuccessToast: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Server-authoritative state: strictly default to free/inactive
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [status, setStatus] = useState<SubscriptionStatus>("inactive");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod | undefined>(undefined);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [isLifetime, setIsLifetime] = useState<boolean>(false);
  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [showExpiryBanner, setShowExpiryBanner] = useState<boolean>(false);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState("");
  const [modalFeature, setModalFeature] = useState<string | undefined>(undefined);
  const [isLifetimeModalOpen, setIsLifetimeModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Usage counters
  const [moodsThisWeek, setMoodsThisWeek] = useState(0);
  const [reframesThisWeek, setReframesThisWeek] = useState(0);
  const [chatToday, setChatToday] = useState(0);

  const refreshUsageCounts = useCallback(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const todayStr = new Date().toISOString().split("T")[0];

    const moods = storage.getMoods();
    const recentMoods = moods.filter(m => m.timestamp >= sevenDaysAgo);
    setMoodsThisWeek(recentMoods.length);

    const reframes = storage.getReframes();
    const recentReframes = reframes.filter(r => r.timestamp >= sevenDaysAgo);
    setReframesThisWeek(recentReframes.length);

    const chat = storage.getChatHistory();
    const todayUserMsgs = chat.filter(m => m.sender === "user" && new Date(m.timestamp).toISOString().split("T")[0] === todayStr);
    setChatToday(todayUserMsgs.length);
  }, []);

  useEffect(() => {
    refreshUsageCounts();
    const interval = setInterval(refreshUsageCounts, 10000);
    return () => clearInterval(interval);
  }, [refreshUsageCounts]);

  // Clean any old cached localStorage subscription data on boot to avoid cross-user contamination
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("neuraliso_subscription");
        window.localStorage.removeItem("neuraliso_subscription_v2");
      }
    } catch {}
  }, []);

  // Fresh Server-Side Query: Re-evaluated whenever user logs in, out, or switches accounts
  const checkServerSubscription = useCallback(async (targetUserId?: string, targetEmail?: string) => {
    // 1. Permanent free access exception for clueearth@gmail.com
    if (targetEmail && targetEmail.toLowerCase().trim() === "clueearth@gmail.com") {
      setIsPro(true);
      setIsLifetime(true);
      setIsTrial(false);
      setTier("lifetime");
      setStatus("active");
      setExpiresAt(null);
      setBillingPeriod("lifetime");
      setShowExpiryBanner(false);
      setDaysUntilExpiry(null);
      return;
    }

    // 2. Unauthenticated user -> Strictly FREE / INACTIVE
    if (!targetUserId) {
      setIsPro(false);
      setIsLifetime(false);
      setIsTrial(false);
      setTier("free");
      setStatus("inactive");
      setExpiresAt(null);
      setBillingPeriod(undefined);
      setShowExpiryBanner(false);
      setDaysUntilExpiry(null);
      return;
    }

    try {
      // Query server endpoint which verifies public.subscriptions for this specific user_id
      const res = await fetch("/api/check-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, email: targetEmail })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isPro === true && data.status === "active") {
          const isLife = Boolean(data.isLifetime || (data.planType || "").toLowerCase() === "lifetime");
          setIsPro(true);
          setIsLifetime(isLife);
          setIsTrial(false);
          setTier(isLife ? "lifetime" : "pro");
          setStatus("active");
          setExpiresAt(null);
          setBillingPeriod(isLife ? "lifetime" : undefined);
          setShowExpiryBanner(false);
          setDaysUntilExpiry(null);
          return;
        }
      }
    } catch (e) {
      console.warn("[SubscriptionContext] Error querying server subscription:", e);
    }

    // 3. Fallback / Zero-rows / Query failure / Inactive -> STRICTLY FREE / INACTIVE
    setIsPro(false);
    setIsLifetime(false);
    setIsTrial(false);
    setTier("free");
    setStatus("inactive");
    setExpiresAt(null);
    setBillingPeriod(undefined);
    setShowExpiryBanner(false);
    setDaysUntilExpiry(null);
  }, []);

  // Trigger fresh check every time the authenticated user changes
  useEffect(() => {
    // Reset immediately upon user change
    setIsPro(false);
    setIsLifetime(false);
    setIsTrial(false);
    setTier("free");
    setStatus("inactive");

    if (user) {
      checkServerSubscription(user.id, user.email);
    } else {
      checkServerSubscription(undefined, undefined);
    }
  }, [user?.id, user?.email, checkServerSubscription]);

  const refreshSubscription = useCallback(async () => {
    if (user) {
      await checkServerSubscription(user.id, user.email);
    } else {
      await checkServerSubscription(undefined, undefined);
    }
  }, [user, checkServerSubscription]);

  // Trigger celebratory confetti
  const triggerLifetimeCelebration = useCallback(() => {
    try {
      const count = 200;
      const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
      };

      fire(0.25, { spread: 26, startVelocity: 55, colors: ["#FFD700", "#FFA500", "#FFFFFF"] });
      fire(0.2, { spread: 60, colors: ["#FFD700", "#00d4ff", "#00b8a9"] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45, colors: ["#FFD700", "#FFA500", "#10B981"] });
    } catch (e) {
      console.log("Confetti effect unavailable:", e);
    }

    setSuccessToast("🎉 Welcome to Neuraliso Lifetime! You now have unlimited access forever.");
  }, []);

  // Check URL params for post-checkout redirection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success" || params.get("checkout") === "success" || params.get("lifetime") === "success") {
        triggerLifetimeCelebration();
        // Immediately refresh status from server
        refreshSubscription();
        // Clean URL without refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [triggerLifetimeCelebration, refreshSubscription]);

  const openUpgradeModal = useCallback((reason = "Unlock unlimited mental health enhancements with Neuraliso Plus.", feature?: string) => {
    setModalReason(reason);
    setModalFeature(feature);
    setIsModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const openLifetimeModal = useCallback(() => {
    setIsLifetimeModalOpen(true);
  }, []);

  const closeLifetimeModal = useCallback(() => {
    setIsLifetimeModalOpen(false);
  }, []);

  const dismissSuccessToast = useCallback(() => {
    setSuccessToast(null);
  }, []);

  const buyLifetimeDeal = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const checkoutUrl = getDodoCheckoutUrl("lifetime", user);
      console.log("Redirecting to Dodo Lifetime Checkout URL:", checkoutUrl);
      window.location.href = checkoutUrl;
      return { success: true };
    } catch (e: any) {
      console.error("Lifetime purchase error:", e);
      window.location.href = LIFETIME_DEAL.link;
      return { success: true };
    }
  }, [user]);

  const upgradeToPro = useCallback(async (plan: "monthly" | "yearly" | "lifetime" = "monthly"): Promise<{ success: boolean; error?: string }> => {
    if (plan === "lifetime") {
      return buyLifetimeDeal();
    }
    try {
      const fallbackUrl = "https://checkout.dodopayments.com/buy/pdt_0NjZcNQU20nKx7FEP7N5V?quantity=1&redirect_url=https://neuraliso-ai.vercel.app";
      const checkoutUrl = getDodoCheckoutUrl(plan, user) || fallbackUrl;
      console.log("Redirecting to Dodo Checkout URL:", checkoutUrl);
      window.location.href = checkoutUrl;
      return { success: true };
    } catch (e: any) {
      console.error("Upgrade error:", e);
      window.location.href = "https://checkout.dodopayments.com/buy/pdt_0NjZcNQU20nKx7FEP7N5V?quantity=1&redirect_url=https://neuraliso-ai.vercel.app";
      return { success: true };
    }
  }, [user, buyLifetimeDeal]);

  const startFreeTrial = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    return upgradeToPro("yearly");
  }, [upgradeToPro]);

  const cancelSubscription = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    // In production, cancellations are managed via Dodo Payments customer portal
    return { success: true };
  }, []);

  const checkFeatureAccess = useCallback((feature: "mood" | "reframe" | "chat" | "breathe" | "sleep" | "progress", count?: number): boolean => {
    if (isPro || isLifetime) return true;

    // Ethical non-negotiables & free tiers
    switch (feature) {
      case "mood":
        return (count ?? moodsThisWeek) < 3;
      case "reframe":
        return (count ?? reframesThisWeek) < 3;
      case "chat":
        return (count ?? chatToday) < 5;
      case "breathe":
      case "sleep":
      case "progress":
        return false;
      default:
        return true;
    }
  }, [isPro, isLifetime, moodsThisWeek, reframesThisWeek, chatToday]);

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        status,
        expiresAt,
        billingPeriod,
        isPro,
        isLifetime,
        isTrial,
        moodsThisWeek,
        reframesThisWeek,
        chatToday,
        showExpiryBanner,
        daysUntilExpiry,
        isModalOpen,
        modalReason,
        modalFeature,
        isLifetimeModalOpen,
        successToast,
        openUpgradeModal,
        closeUpgradeModal,
        openLifetimeModal,
        closeLifetimeModal,
        upgradeToPro,
        buyLifetimeDeal,
        startFreeTrial,
        cancelSubscription,
        checkFeatureAccess,
        refreshUsageCounts,
        refreshSubscription,
        triggerLifetimeCelebration,
        dismissSuccessToast,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
