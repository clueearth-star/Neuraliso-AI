import { createClient } from "@supabase/supabase-js";
import { safeStorage } from "./safeStorage";

// Retrieve Supabase URL and Anon Key from environment variables
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  "https://placeholder-project.supabase.co";

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

if (typeof window !== "undefined") {
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL);
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
