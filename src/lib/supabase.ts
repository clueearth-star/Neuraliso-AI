import { createClient } from "@supabase/supabase-js";
import { safeStorage } from "./safeStorage";

function getValidSupabaseConfig() {
  const targetRef = "siewuccllcisezwyiyaz";
  const rawUrl = 
    import.meta.env.VITE_SUPABASE_URL || 
    import.meta.env.SUPABASE_URL || 
    `https://${targetRef}.supabase.co`;

  let url = `https://${targetRef}.supabase.co`;
  try {
    if (rawUrl && !rawUrl.includes("placeholder") && !rawUrl.includes("supabase.com/dashboard")) {
      const parsed = new URL(rawUrl);
      url = parsed.origin;
    }
  } catch (e) {
    url = `https://${targetRef}.supabase.co`;
  }

  const candidates = [
    import.meta.env.SUPABASE_ANON_KEY,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  ].filter(Boolean);

  let selectedKey = candidates[0] || "";

  for (const k of candidates) {
    try {
      const parts = k.split(".");
      if (parts.length === 3) {
        // Safe base64 decode for browser/node
        const base64Str = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64Str)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        if (payload.ref === targetRef) {
          selectedKey = k;
          break;
        }
      }
    } catch (e) {
      // fallback
    }
  }

  return { url, key: selectedKey };
}

const { url: supabaseUrl, key: supabaseAnonKey } = getValidSupabaseConfig();

if (typeof window !== "undefined") {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Redirect URL:', window.location.origin + '/auth/callback');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: safeStorage,
    storageKey: "neuraliso_auth_token",
  },
});

export async function supabaseRetry<T>(operation: () => Promise<{ data: T; error: any }>, maxRetries = 3): Promise<{ data: T | null; error: any }> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data, error } = await operation();
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      if (i === maxRetries - 1) return { data: null, error: err };
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // exponential backoff
    }
  }
  return { data: null, error: new Error("Max retries exceeded") };
}

export async function ensureValidSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.warn("Error getting session, refreshing...", error);
    const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
    if (refreshErr) return null;
    return refreshed?.session || null;
  }
  if (session && session.expires_at && session.expires_at * 1000 < Date.now() + 60000) {
    const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
    if (refreshErr) return session;
    return refreshed?.session || session;
  }
  return session;
}

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== "https://placeholder-project.supabase.co" &&
    !supabaseUrl.includes("placeholder") &&
    supabaseAnonKey !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder" &&
    !supabaseAnonKey.includes("placeholder")
  );
};
