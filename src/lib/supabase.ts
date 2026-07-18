import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials from process.env (defined/injected by Vite)
// or fallback to import.meta.env or hardcoded placeholder
const supabaseUrl = 
  (typeof process !== "undefined" && process.env?.SUPABASE_URL) || 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  "https://tmmrquzeoykocirbempg.supabase.co"; // Default fallback if undefined

const supabaseAnonKey = 
  (typeof process !== "undefined" && process.env?.SUPABASE_ANON_KEY) || 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  "";

if (!supabaseAnonKey) {
  console.warn(
    "[Supabase Client] SUPABASE_ANON_KEY is empty. Supabase features may fail until the anon key is supplied in your environment."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
