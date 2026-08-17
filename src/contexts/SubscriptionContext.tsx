import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { UserSubscription, SubscriptionTier, SubscriptionStatus, BillingPeriod } from "../types";
import { storage } from "../lib/storage";
import { useAuth } from "./AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { getDodoCheckoutUrl, hasProAccess, LIFETIME_DEAL } from "../lib/subscriptions";

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
  upgradeToPro: (plan: "monthly" | "yearly" | "lifetime", simulate?: boolean) => Promise<{ success: boolean; error?: string }>;
  buyLifetimeDeal: (simulate?: boolean) => Promise<{ success: boolean; error?: string }>;
  startFreeTrial: () => Promise<{ success: boolean; error?: string }>;
  cancelSubscription: () => Promise<{ success: boolean; error?: string }>;
  checkFeatureAccess: (feature: "mood" | "reframe" | "chat" | "breathe" | "sleep" | "progress", count?: number) => boolean;
  refreshUsageCounts: () => void;
  triggerLifetimeCelebration: () => void;
  dismissSuccessToast: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [sub, setSub] = useState<UserSubscription>(() => storage.getSubscription());
  
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

  // Sync subscription from profile/auth or local storage
  useEffect(() => {
    if (profile && profile.subscription_tier) {
      const isLife = profile.subscription_tier === "lifetime";
      const updated: UserSubscription = {
        tier: (profile.subscription_tier as SubscriptionTier) || "free",
        status: (profile.subscription_status as SubscriptionStatus) || "inactive",
        expiresAt: profile.subscription_expires_at || null,
        dodoCustomerId: profile.dodo_customer_id,
        dodoSubscriptionId: profile.dodo_subscription_id,
        isLifetime: isLife,
        billingPeriod: isLife ? "lifetime" : undefined,
      };
      setSub(updated);
      storage.saveSubscription(updated);
    } else {
      const stored = storage.getSubscription();
      setSub(stored);
    }
  }, [profile]);

  const [serverProStatus, setServerProStatus] = useState<boolean | null>(null);
  const [serverIsLifetime, setServerIsLifetime] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function checkServerSub() {
      if (user?.email && user.email.toLowerCase().trim() === "clueearth@gmail.com") {
        if (isMounted) {
          setServerProStatus(true);
          setServerIsLifetime(true);
        }
        return;
      }
      if (!user) {
        if (isMounted) {
          setServerProStatus(false);
          setServerIsLifetime(false);
        }
        return;
      }

      try {
        const res = await fetch("/api/check-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, email: user.email })
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setServerProStatus(!!data.isPro);
            setServerIsLifetime(!!data.isLifetime);
          }
          return;
        }
      } catch (e) {}

      try {
        if (isSupabaseConfigured()) {
          const { data: subData } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "active")
            .maybeSingle();

          if (subData) {
            const isLife = !subData.current_period_end;
            const isValid = isLife || new Date(subData.current_period_end).getTime() > Date.now();
            if (isMounted) {
              setServerProStatus(isValid);
              setServerIsLifetime(isLife);
            }
            return;
          }
        }
      } catch (e) {}

      if (isMounted) {
        setServerProStatus(false);
        setServerIsLifetime(false);
      }
    }

    checkServerSub();
    return () => { isMounted = false; };
  }, [user]);

  // Trigger celebratory confetti
  const triggerLifetimeCelebration = useCallback(() => {
    try {
      // Confetti burst (2-3 seconds)
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ["#FFD700", "#FFA500", "#FFFFFF"]
      });
      fire(0.2, {
        spread: 60,
        colors: ["#FFD700", "#00d4ff", "#00b8a9"]
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ["#FFD700", "#FFA500", "#10B981"]
      });
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
        // Clean URL without refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [triggerLifetimeCelebration]);

  // Graceful downgrade check
  const isClueEarth = user?.email?.toLowerCase().trim() === "clueearth@gmail.com";
  let isPro = false;
  let isLifetime = false;
  let isTrial = false;
  let showExpiryBanner = false;
  let daysUntilExpiry: number | null = null;

  const currentTier = profile?.subscription_tier || sub.tier;
  const currentStatus = profile?.subscription_status || sub.status;
  const currentExpiry = profile?.subscription_expires_at || sub.expiresAt;

  if (isClueEarth) {
    isPro = true;
    isLifetime = true;
  } else if (currentTier === "lifetime" || serverIsLifetime || sub.isLifetime) {
    isPro = true;
    isLifetime = true;
  } else if (serverProStatus === true) {
    isPro = true;
  } else if (serverProStatus === false && !sub.tier) {
    isPro = false;
  } else {
    if (["pro", "plus", "plus_monthly", "plus_yearly"].includes(currentTier) && (currentStatus === "active" || currentStatus === "trial")) {
      if (currentStatus === "trial") isTrial = true;
      if (currentExpiry) {
        const expiryDate = new Date(currentExpiry).getTime();
        const now = Date.now();
        if (expiryDate > now) {
          isPro = true;
          const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          if (diffDays <= 7 && diffDays >= 0) {
            showExpiryBanner = true;
            daysUntilExpiry = diffDays;
          }
        }
      } else {
        isPro = true;
      }
    }
  }

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

  const buyLifetimeDeal = useCallback(async (simulate = false): Promise<{ success: boolean; error?: string }> => {
    try {
      if (simulate) {
        const updated: UserSubscription = {
          tier: "lifetime",
          status: "active",
          expiresAt: null,
          billingPeriod: "lifetime",
          isLifetime: true,
        };
        setSub(updated);
        storage.saveSubscription(updated);

        if (user && isSupabaseConfigured()) {
          await supabase.from("profiles").update({
            subscription_tier: "lifetime",
            subscription_status: "active",
            subscription_expires_at: null
          }).eq("id", user.id);
        }

        setIsLifetimeModalOpen(false);
        setIsModalOpen(false);
        triggerLifetimeCelebration();
        return { success: true };
      }

      const checkoutUrl = getDodoCheckoutUrl("lifetime", user);
      console.log("Redirecting to Dodo Lifetime Checkout URL:", checkoutUrl);
      window.location.href = checkoutUrl;
      return { success: true };
    } catch (e: any) {
      console.error("Lifetime purchase error:", e);
      window.location.href = LIFETIME_DEAL.link;
      return { success: true };
    }
  }, [user, triggerLifetimeCelebration]);

  const upgradeToPro = useCallback(async (plan: "monthly" | "yearly" | "lifetime" = "monthly", simulate = false): Promise<{ success: boolean; error?: string }> => {
    if (plan === "lifetime") {
      return buyLifetimeDeal(simulate);
    }
    try {
      if (simulate) {
        const days = plan === "monthly" ? 30 : 365;
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        const newSub: UserSubscription = {
          tier: "pro",
          status: "active",
          expiresAt,
          billingPeriod: plan,
          isTrial: false,
        };
        setSub(newSub);
        storage.saveSubscription(newSub);

        if (user && isSupabaseConfigured()) {
          await supabase.from("profiles").update({
            subscription_tier: "pro",
            subscription_status: "active",
            subscription_expires_at: expiresAt
          }).eq("id", user.id);
        }

        setIsModalOpen(false);
        return { success: true };
      }

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
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const newSub: UserSubscription = {
        tier: "pro",
        status: "trial",
        expiresAt,
        billingPeriod: "yearly",
        isTrial: true,
      };
      setSub(newSub);
      storage.saveSubscription(newSub);

      if (user && isSupabaseConfigured()) {
        await supabase.from("profiles").update({
          subscription_tier: "pro",
          subscription_status: "trial",
          subscription_expires_at: expiresAt
        }).eq("id", user.id);
      }

      setIsModalOpen(false);
      return { success: true };
    } catch (e: any) {
      console.error("Trial error:", e);
      return { success: false, error: e.message || "Failed to start trial" };
    }
  }, [user]);

  const cancelSubscription = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const updated: UserSubscription = {
        ...sub,
        status: "cancelled",
      };
      setSub(updated);
      storage.saveSubscription(updated);

      if (user && isSupabaseConfigured()) {
        await supabase.from("profiles").update({
          subscription_status: "cancelled"
        }).eq("id", user.id);
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to cancel subscription" };
    }
  }, [sub, user]);

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
        tier: sub.tier,
        status: sub.status,
        expiresAt: sub.expiresAt,
        billingPeriod: sub.billingPeriod,
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
