export function getDodoCheckoutUrl(user?: { id?: string; email?: string } | null, userProfile?: any): string {
  const checkoutBase = "https://checkout.dodopayments.com/buy/pdt_0NjZcNQU20nKx7FEP7N5V";
  const redirectUrl = "https://neuraliso-ai.vercel.app";

  const userId = user?.id || userProfile?.userId || userProfile?.id || "";
  const email = user?.email || userProfile?.email || "";

  const params = new URLSearchParams();
  params.set("quantity", "1");
  params.set("redirect_url", redirectUrl);

  if (email) {
    params.set("customer_email", email);
    params.set("email", email);
  }
  if (userId) {
    params.set("client_reference_id", userId);
    params.set("userId", userId);
    params.set("metadata[user_id]", userId);
  }

  return `${checkoutBase}?${params.toString()}`;
}

export function redirectToDodoCheckout(user?: { id?: string; email?: string } | null, userProfile?: any): void {
  const url = getDodoCheckoutUrl(user, userProfile);
  window.location.href = url;
}
