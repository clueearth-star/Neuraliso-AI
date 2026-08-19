import fs from "fs";
import { createClient } from "@supabase/supabase-js";

async function inspect() {
  const lines: string[] = [];
  lines.push("=== ENV INSPECTION ===");
  for (const k of Object.keys(process.env)) {
    if (k.includes("SUPABASE") || k.includes("DODO") || k.includes("DATABASE") || k.includes("POSTGRES")) {
      const val = process.env[k] || "";
      lines.push(`${k}: len=${val.length}, sample=${val.substring(0, 20)}...`);
    }
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://siewuccllcisezwyiyaz.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  lines.push(`URL: ${url}`);
  lines.push(`Key present: ${Boolean(serviceKey)}`);

  if (serviceKey) {
    try {
      const supabase = createClient(url, serviceKey);
      const { data: subData, error: subError } = await supabase.from("subscriptions").select("*").limit(1);
      lines.push(`Subscriptions query: data=${JSON.stringify(subData)}, error=${JSON.stringify(subError)}`);
      
      const { data: profData, error: profError } = await supabase.from("profiles").select("*").limit(1);
      lines.push(`Profiles query: data=${JSON.stringify(profData)}, error=${JSON.stringify(profError)}`);
    } catch (e: any) {
      lines.push(`Exception: ${e.message}`);
    }
  }

  fs.writeFileSync("inspect_output.txt", lines.join("\n"));
  console.log("Done. Check inspect_output.txt");
}

inspect();
