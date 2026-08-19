import fs from "fs";
import { createClient } from "@supabase/supabase-js";

async function run() {
  const url = "https://siewuccllcisezwyiyaz.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  
  const results: any = {};

  // Try service key
  if (serviceKey) {
    const sbAdmin = createClient(url, serviceKey);
    const { data: subData, error: subError } = await sbAdmin.from("subscriptions").select("*").limit(5);
    const { data: profData, error: profError } = await sbAdmin.from("profiles").select("*").limit(5);
    const { data: usersData, error: usersError } = await sbAdmin.auth.admin.listUsers();
    results.service = {
      subData,
      subError,
      profData,
      profError,
      userCount: usersData?.users?.length,
      usersError
    };
  }

  // Try anon key
  if (anonKey) {
    const sbAnon = createClient(url, anonKey);
    const { data: subData, error: subError } = await sbAnon.from("subscriptions").select("*").limit(5);
    results.anon = { subData, subError };
  }

  fs.writeFileSync("supabase_test_output.json", JSON.stringify(results, null, 2));
  console.log("Written to supabase_test_output.json");
}

run();
