import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getResolvedKeys } from "./_lib/keys.js";

const BASE_URL = "https://tmmrquzeoykocirbempg.supabase.co/rest/v1/Reviews%20System";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { resolvedSupabaseKey } = getResolvedKeys();
  if (!resolvedSupabaseKey) {
    return res.status(500).json({ error: "Supabase key not configured or decrypted." });
  }

  try {
    if (req.method === "GET") {
      const response = await fetch(`${BASE_URL}?select=*&order=id.desc`, {
        method: "GET",
        headers: {
          apikey: resolvedSupabaseKey,
          Authorization: `Bearer ${resolvedSupabaseKey}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error(`Supabase query failed with status ${response.status}`);
      return res.json(await response.json());
    }

    if (req.method === "POST") {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          apikey: resolvedSupabaseKey,
          Authorization: `Bearer ${resolvedSupabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(req.body),
      });
      if (!response.ok) throw new Error(`Supabase write failed with status ${response.status}: ${await response.text()}`);
      return res.json(await response.json());
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to reach Supabase." });
  }
}
