import { supabase } from "./supabase";

export const DODO_LINKS = {
  monthly: import.meta.env.VITE_DODO_MONTHLY_LINK || import.meta.env.VITE_DODO_PAYMENT_LINK_MONTHLY || "https://checkout.dodopayments.com/buy/pdt_0NjZcNQU20nKx7FEP7N5V?quantity=1&redirect_url=https://neuraliso-ai.vercel.app",
  yearly: import.meta.env.VITE_DODO_YEARLY_LINK || import.meta.env.VITE_DODO_PAYMENT_LINK_YEARLY || "https://checkout.dodopayments.com/buy/pdt_0Nk8M2dIaqQpnEgOrwBKx?quantity=1&redirect_url=https://neuraliso-ai.vercel.app",
  lifetime: import.meta.env.VITE_DODO_LIFETIME_LINK || "https://dodo.pe/j2z0q1cr8bh",
};

export const DODO_CUSTOMER_PORTAL_URL = import.meta.env.VITE_DODO_CUSTOMER_PORTAL_URL || "https://customer.dodopayments.com";

export const LIFETIME_DEAL = {
  name: "Neuraliso Plus Lifetime (Special Offer)",
  price: 2000,
  formattedPrice: "₹2,000",
  regularPrice: "₹5,999/yr",
  savings: "Special Offer",
  savingsAmount: "Save ₹3,999 forever",
  tagline: "Pay once. Own forever.",
  subtext: "No monthly fees. No yearly renewals. ₹2,000 Special Lifetime Offer.",
  guarantee: "30-day money-back guarantee",
  link: "https://dodo.pe/j2z0q1cr8bh"
};

export function getDodoCheckoutUrl(
  plan: "monthly" | "yearly" | "lifetime", 
  user?: { id?: string; email?: string } | null
): string {
  let dodoUrl = DODO_LINKS[plan] || DODO_LINKS.lifetime;
  try {
    const url = new URL(dodoUrl);
    if (user?.id) {
      url.searchParams.set("client_reference_id", user.id);
      url.searchParams.set("metadata[user_id]", user.id);
      url.searchParams.set("metadata[userId]", user.id);
    }
    if (user?.email) {
      url.searchParams.set("prefilled_email", user.email);
      url.searchParams.set("customer_email", user.email);
      url.searchParams.set("metadata[email]", user.email);
    }
    if (plan === "lifetime") {
      url.searchParams.set("metadata[plan]", "lifetime");
    }
    console.log("Constructed Dodo Checkout URL:", url.toString());
    return url.toString();
  } catch (e) {
    console.error("Invalid Dodo URL:", dodoUrl, e);
    return dodoUrl;
  }
}

export function hasProAccess(subOrProfile?: {
  tier?: string;
  subscription_tier?: string;
  status?: string;
  subscription_status?: string;
  expiresAt?: string | null;
  subscription_expires_at?: string | null;
  email?: string;
  isLifetime?: boolean;
} | null): boolean {
  if (!subOrProfile) return false;
  
  // Permanent exception for clueearth@gmail.com
  if (subOrProfile.email && subOrProfile.email.toLowerCase().trim() === "clueearth@gmail.com") {
    return true;
  }

  const tier = (subOrProfile.tier || subOrProfile.subscription_tier || "").toLowerCase();
  const status = (subOrProfile.status || subOrProfile.subscription_status || "").toLowerCase();

  // Lifetime tier with active status
  if (tier === "lifetime" && (status === "active" || subOrProfile.isLifetime)) {
    return true;
  }

  // Active Pro subscription with active status
  if (["pro", "plus", "plus_monthly", "plus_yearly"].includes(tier) && status === "active") {
    const expiresAt = subOrProfile.expiresAt || subOrProfile.subscription_expires_at;
    if (!expiresAt) return true;
    return new Date(expiresAt).getTime() > Date.now();
  }

  return false;
}

export async function verifyManualPayment(userId: string, email?: string): Promise<boolean> {
  if (email && email.toLowerCase().trim() === "clueearth@gmail.com") return true;
  try {
    const res = await fetch("/api/check-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, email })
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.isPro;
    }
  } catch (e) {}
  return false;
}
