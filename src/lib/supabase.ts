import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials from process.env (defined/injected by Vite)
// or fallback to import.meta.env or hardcoded placeholder
const supabaseUrl = 
  (typeof process !== "undefined" && process.env?.SUPABASE_URL) || 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  "https://siewuccllcisezwyiyaz.supabase.co"; // Correct default fallback project URL

const supabaseAnonKey = 
  (typeof process !== "undefined" && process.env?.SUPABASE_ANON_KEY) || 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  "";

if (!supabaseAnonKey) {
  console.warn(
    "[Supabase Client] SUPABASE_ANON_KEY is empty. We will fetch secure client config on startup."
  );
}

export let supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true
  }
});

/**
 * Dynamically reinitializes the live exported Supabase client instance using live config.
 */
export function reinitializeSupabase(url: string, key: string) {
  if (!url || !key) return;
  console.log("[Supabase Client] Dynamically reinitializing client with URL:", url);
  supabase = createClient(url, key, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
