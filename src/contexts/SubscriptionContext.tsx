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

  // Graceful downgrade check (never lose data, just feature limits)
  let isPro = false;
  let isTrial = false;
  let showExpiryBanner = false;
  let daysUntilExpiry: number | null = null;

  const currentTier = profile?.subscription_tier || sub.tier;
  const currentStatus = profile?.subscription_status || sub.status;
  const currentExpiry = profile?.subscription_expires_at || sub.expiresAt;

  if (currentTier === "pro" || currentTier === "plus") {
    if (currentStatus === "active" || currentStatus === "trial" || currentStatus === "trialing" || currentStatus === "cancelled") {
      if (currentExpiry) {
        const expiryDate = new Date(currentExpiry).getTime();
        const now = Date.now();
        if (expiryDate > now) {
          isPro = true;
          if (currentStatus === "trial" || currentStatus === "trialing") isTrial = true;
          
          const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          if (diffDays <= 7 && diffDays >= 0) {
            showExpiryBanner = true;
            daysUntilExpiry = diffDays;
          }
        } else {
          // Expired! Graceful downgrade
          isPro = false;
        }
      } else {
        // Active without expiry date set
        isPro = true;
        if (currentStatus === "trial" || currentStatus === "trialing") isTrial = true;
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

  const upgradeToPro = useCallback(async (plan: "monthly" | "yearly", simulate = false): Promise<{ success: boolean; error?: string }> => {
    try {
      if (simulate || !isSupabaseConfigured()) {
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
        
        // Also update Supabase profile if possible
        if (user && isSupabaseConfigured()) {
          await supabase.from("profiles").update({
            subscription_tier: "pro",
            subscription_status: "active",
            subscription_expires_at: expiresAt
          }).eq("id", user.id);
        }
        
        setIsModalOpen(false);
        return { success: true };
      } else {
        // Open Dodo Payment Link
        console.log("Profile sub data:", profile);
        console.log("Monthly link:", import.meta.env.VITE_DODO_MONTHLY_LINK || import.meta.env.VITE_DODO_PAYMENT_LINK_MONTHLY);
        console.log("Yearly link:", import.meta.env.VITE_DODO_YEARLY_LINK || import.meta.env.VITE_DODO_PAYMENT_LINK_YEARLY);

        const checkoutUrl = getDodoCheckoutUrl(plan, user);
        if (checkoutUrl) {
          console.log("Redirecting to Dodo Checkout URL:", checkoutUrl);
          window.location.href = checkoutUrl;
        } else {
          const fallback = plan === "monthly" 
            ? "https://test.dodopayments.com/buy/p_test_monthly_plus"
            : "https://test.dodopayments.com/buy/p_test_yearly_plus";
          window.location.href = fallback;
        }
        return { success: true };
      }
    } catch (e: any) {
      console.error("Upgrade error:", e);
      return { success: false, error: e.message || "Failed to process upgrade" };
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
