import { createClient } from "@supabase/supabase-js";

// Retrieve Supabase URL and Anon Key from environment variables
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  "https://placeholder-project.supabase.co";

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "neuraliso_auth_token",
  },
});

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== "https://placeholder-project.supabase.co" &&
    !supabaseUrl.includes("placeholder") &&
    supabaseAnonKey !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder" &&
    !supabaseAnonKey.includes("placeholder")
  );
};
