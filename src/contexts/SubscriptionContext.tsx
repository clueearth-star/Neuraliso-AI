import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserSubscription, SubscriptionTier, SubscriptionStatus, BillingPeriod } from "../types";
import { storage } from "../lib/storage";
import { useAuth } from "./AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { getDodoCheckoutUrl } from "../lib/subscriptions";

export interface SubscriptionContextType {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt: string | null;
  billingPeriod?: BillingPeriod;
  isPro: boolean;
  isTrial: boolean;
  moodsThisWeek: number;
  reframesThisWeek: number;
  chatToday: number;
  showExpiryBanner: boolean;
  daysUntilExpiry: number | null;
  isModalOpen: boolean;
  modalReason: string;
  modalFeature?: string;
  openUpgradeModal: (reason?: string, feature?: string) => void;
  closeUpgradeModal: () => void;
  upgradeToPro: (plan: "monthly" | "yearly", simulate?: boolean) => Promise<{ success: boolean; error?: string }>;
  startFreeTrial: () => Promise<{ success: boolean; error?: string }>;
  cancelSubscription: () => Promise<{ success: boolean; error?: string }>;
  checkFeatureAccess: (feature: "mood" | "reframe" | "chat" | "breathe" | "sleep" | "progress", count?: number) => boolean;
  refreshUsageCounts: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [sub, setSub] = useState<UserSubscription>(() => storage.getSubscription());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState("");
  const [modalFeature, setModalFeature] = useState<string | undefined>(undefined);

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
    // Re-check counters periodically or on storage changes
    const interval = setInterval(refreshUsageCounts, 10000);
    return () => clearInterval(interval);
  }, [refreshUsageCounts]);

  // Sync subscription from profile/auth or local storage
  useEffect(() => {
    if (profile && profile.subscription_tier) {
      const updated: UserSubscription = {
        tier: (profile.subscription_tier as SubscriptionTier) || "free",
        status: (profile.subscription_status as SubscriptionStatus) || "inactive",
        expiresAt: profile.subscription_expires_at || null,
        dodoCustomerId: profile.dodo_customer_id,
        dodoSubscriptionId: profile.dodo_subscription_id,
      };
      setSub(updated);
      storage.saveSubscription(updated);
    } else {
      const stored = storage.getSubscription();
      setSub(stored);
    }
  }, [profile]);

  const [serverProStatus, setServerProStatus] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkServerSub() {
      if (user?.email && user.email.toLowerCase().trim() === "clueearth@gmail.com") {
        if (isMounted) setServerProStatus(true);
        return;
      }
      if (!user) {
        if (isMounted) setServerProStatus(false);
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
            const isValid = !subData.current_period_end || new Date(subData.current_period_end).getTime() > Date.now();
            if (isMounted) setServerProStatus(isValid);
            return;
          }
        }
      } catch (e) {}

      if (isMounted) setServerProStatus(false);
    }

    checkServerSub();
    return () => { isMounted = false; };
  }, [user]);

  // Graceful downgrade check
  const isClueEarth = user?.email?.toLowerCase().trim() === "clueearth@gmail.com";
  let isPro = false;
  let isTrial = false;
  let showExpiryBanner = false;
  let daysUntilExpiry: number | null = null;

  if (isClueEarth) {
    isPro = true;
  } else if (serverProStatus === true) {
    isPro = true;
  } else if (serverProStatus === false) {
    isPro = false;
  } else {
    const currentTier = profile?.subscription_tier || sub.tier;
    const currentStatus = profile?.subscription_status || sub.status;
    const currentExpiry = profile?.subscription_expires_at || sub.expiresAt;

    if ((currentTier === "pro" || currentTier === "plus") && currentStatus === "active") {
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

  const upgradeToPro = useCallback(async (plan: "monthly" | "yearly" = "monthly"): Promise<{ success: boolean; error?: string }> => {
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
  }, [user]);

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
    if (isPro) return true;

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
        return false; // Specific enhanced items check individually
      default:
        return true;
    }
  }, [isPro, moodsThisWeek, reframesThisWeek, chatToday]);

  return (
    <SubscriptionContext.Provider
      value={{
        tier: sub.tier,
        status: sub.status,
        expiresAt: sub.expiresAt,
        billingPeriod: sub.billingPeriod,
        isPro,
        isTrial,
        moodsThisWeek,
        reframesThisWeek,
        chatToday,
        showExpiryBanner,
        daysUntilExpiry,
        isModalOpen,
        modalReason,
        modalFeature,
        openUpgradeModal,
        closeUpgradeModal,
        upgradeToPro,
        startFreeTrial,
        cancelSubscription,
        checkFeatureAccess,
        refreshUsageCounts,
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
