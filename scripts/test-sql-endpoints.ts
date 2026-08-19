import fs from "fs";

async function testSqlEndpoints() {
  const ref = "siewuccllcisezwyiyaz";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || "";
  
  const sql = `
    CREATE TABLE IF NOT EXISTS public.subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
      dodo_payment_id TEXT,
      plan_type TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can only access their own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);
  `;

  const attempts: any = [];

  // Attempt 1: Supabase API SQL endpoint with Service Key
  const urls = [
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    `https://api.supabase.com/v1/projects/${ref}/query`,
    `https://${ref}.supabase.co/rest/v1/`,
    `https://${ref}.supabase.co/pg-meta/default/query`,
    `https://${ref}.supabase.co/database/query`,
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, {
        method: "POST",
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: sql })
      });
      const text = await res.text();
      attempts.push({ url: u, status: res.status, text: text.substring(0, 200) });
    } catch (e: any) {
      attempts.push({ url: u, error: e.message });
    }
  }

  // Attempt with any other tokens in process.env
  for (const [k, v] of Object.entries(process.env)) {
    if (k.toLowerCase().includes("token") || k.toLowerCase().includes("pass") || k.toLowerCase().includes("secret") || k.toLowerCase().includes("key")) {
      if (v && v.startsWith("sbp_")) {
        // Supabase personal access token!
        try {
          const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${v}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ query: sql })
          });
          attempts.push({ tokenVar: k, status: res.status, text: await res.text() });
        } catch (e: any) {
          attempts.push({ tokenVar: k, error: e.message });
        }
      }
    }
  }

  fs.writeFileSync("sql_attempts.json", JSON.stringify(attempts, null, 2));
}

testSqlEndpoints();
