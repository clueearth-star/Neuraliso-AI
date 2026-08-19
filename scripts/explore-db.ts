import fs from "fs";
import { createClient } from "@supabase/supabase-js";

async function explore() {
  const url = "https://siewuccllcisezwyiyaz.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const sbAdmin = createClient(url, serviceKey);

  const report: any = {};

  // 1. List existing tables using rest
  const tableGuesses = ["entries", "users", "profiles", "moods", "thoughts", "subscriptions"];
  report.tables = {};
  for (const t of tableGuesses) {
    const { data, error } = await sbAdmin.from(t).select("*").limit(1);
    report.tables[t] = { exists: !error || error.code !== "PGRST205", error: error?.message };
  }

  // 2. Check if rpc functions exist (e.g. exec_sql, run_sql, exec, etc.)
  const rpcGuesses = ["exec_sql", "execute_sql", "run_sql", "sql", "exec", "query"];
  report.rpcs = {};
  for (const r of rpcGuesses) {
    const { data, error } = await sbAdmin.rpc(r, { query: "SELECT 1;" });
    report.rpcs[r] = { status: !error, error: error?.message, data };
  }

  // 3. Check direct endpoints
  const endpoints = [
    "/pg-meta/default/query",
    "/pg/query",
    "/rest/v1/rpc",
    "/admin/v1/sql",
    "/pg-meta/query"
  ];
  report.endpoints = {};
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${url}${ep}`, {
        method: "POST",
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: "SELECT 1" })
      });
      report.endpoints[ep] = { status: res.status, text: (await res.text()).substring(0, 100) };
    } catch (e: any) {
      report.endpoints[ep] = { error: e.message };
    }
  }

  fs.writeFileSync("db_explore.json", JSON.stringify(report, null, 2));
}

explore();
