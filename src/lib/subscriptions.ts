import { supabase } from "./supabase";

export const DODO_LINKS = {
  monthly: import.meta.env.VITE_DODO_MONTHLY_LINK || import.meta.env.VITE_DODO_PAYMENT_LINK_MONTHLY || "https://checkout.dodopayments.com/buy/pdt_0NjZcNQU20nKx7FEP7N5V?quantity=1&redirect_url=https://neuraliso-ai.vercel.app",
  yearly: import.meta.env.VITE_DODO_YEARLY_LINK || import.meta.env.VITE_DODO_PAYMENT_LINK_YEARLY || "https://checkout.dodopayments.com/buy/pdt_0Nk8M2dIaqQpnEgOrwBKx?quantity=1&redirect_url=https://neuraliso-ai.vercel.app",
};

export function getDodoCheckoutUrl(plan: "monthly" | "yearly", user?: { id?: string; email?: string } | null): string | null {
  const dodoUrl = plan === "yearly" ? DODO_LINKS.yearly : DODO_LINKS.monthly;
  if (!dodoUrl) {
    console.error("Dodo link missing for", plan);
    return null;
  }
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

export async function verifyManualPayment(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error || !data) return false;
    return data.subscription_tier === "pro" || data.subscription_tier === "plus";
  } catch (e) {
    return false;
  }
}
