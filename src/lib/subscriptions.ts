import { supabase } from "./supabase";

export const DODO_LINKS = {
  monthly: import.meta.env.VITE_DODO_MONTHLY_LINK || import.meta.env.VITE_DODO_PAYMENT_LINK_MONTHLY || "https://checkout.dodopayments.com/buy/pdt_0NjZcNQU20nKx7FEP7N5V?quantity=1&redirect_url=https://neuraliso-ai.vercel.app",
  yearly: import.meta.env.VITE_DODO_YEARLY_LINK || import.meta.env.VITE_DODO_PAYMENT_LINK_YEARLY || "https://checkout.dodopayments.com/buy/pdt_0Nk8M2dIaqQpnEgOrwBKx?quantity=1&redirect_url=https://neuraliso-ai.vercel.app",
  lifetime: import.meta.env.VITE_DODO_LIFETIME_LINK || "https://dodo.pe/j2z0q1cr8bh",
};

export const DODO_CUSTOMER_PORTAL_URL = import.meta.env.VITE_DODO_CUSTOMER_PORTAL_URL || "https://customer.dodopayments.com";

export const LIFETIME_DEAL = {
  name: "Neuraliso Plus Lifetime",
  price: 20.92,
  formattedPrice: "$20.92",
  regularPrice: "$59.88/year",
  savings: "Save 65% forever",
  savingsAmount: "Save $38.96/year forever",
  tagline: "Pay once. Own forever.",
  subtext: "No monthly fees. No yearly renewals. Forever yours.",
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
    if (user?.id) url.searchParams.set("client_reference_id", user.id);
    if (user?.email) url.searchParams.set("prefilled_email", user.email);
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
} | null): boolean {
  if (!subOrProfile) return false;
  
  if (subOrProfile.email && subOrProfile.email.toLowerCase().trim() === "clueearth@gmail.com") {
    return true;
  }

  const tier = (subOrProfile.tier || subOrProfile.subscription_tier || "").toLowerCase();
  const status = (subOrProfile.status || subOrProfile.subscription_status || "").toLowerCase();
  const expiresAt = subOrProfile.expiresAt || subOrProfile.subscription_expires_at;

  // 1. Lifetime tier gives permanent access without expiration
  if (tier === "lifetime") {
    return true;
  }

  // 2. Active Pro / Plus subscription
  if (["pro", "plus", "plus_monthly", "plus_yearly"].includes(tier) && (status === "active" || status === "trial" || status === "trialing")) {
    if (!expiresAt) return true;
    return new Date(expiresAt).getTime() > Date.now();
  }

  return false;
}

export async function verifyManualPayment(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error || !data) return false;
    return hasProAccess(data);
  } catch (e) {
    return false;
  }
}
