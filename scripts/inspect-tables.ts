import fs from "fs";
import { createClient } from "@supabase/supabase-js";

async function inspectTables() {
  const url = "https://siewuccllcisezwyiyaz.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const sbAdmin = createClient(url, serviceKey);

  const report: any = {};

  const { data: users, error: usersErr } = await sbAdmin.from("users").select("*").limit(2);
  report.users = { data: users, error: usersErr };

  const { data: entries, error: entriesErr } = await sbAdmin.from("entries").select("*").limit(2);
  report.entries = { data: entries, error: entriesErr };

  fs.writeFileSync("tables_schema.json", JSON.stringify(report, null, 2));
}

inspectTables();
