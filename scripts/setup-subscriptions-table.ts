import { createClient } from "@supabase/supabase-js";

async function main() {
  const targetRef = "siewuccllcisezwyiyaz";
  const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || `https://${targetRef}.supabase.co`;
  
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  
  console.log("Supabase URL:", rawUrl);
  console.log("Service key exists:", Boolean(serviceKey));
  console.log("Anon key exists:", Boolean(anonKey));

  const keyToUse = serviceKey || anonKey;
  if (!keyToUse) {
    console.error("No Supabase key found in environment variables!");
    return;
  }

  const supabase = createClient(rawUrl, keyToUse);
  
  // Test query
  try {
    const { data, error } = await supabase.from("subscriptions").select("*").limit(1);
    console.log("Query subscriptions table test:", { data, error });
  } catch (e: any) {
    console.error("Error querying subscriptions:", e.message);
  }

  try {
    const { data, error } = await supabase.from("profiles").select("*").limit(1);
    console.log("Query profiles table test:", { data, error });
  } catch (e: any) {
    console.error("Error querying profiles:", e.message);
  }
}

main();
