import type { VercelRequest, VercelResponse } from "@vercel/node";
import { callAILab, parseRobustJSON } from "./_lib/ai-gateway.js";
import { getCachedData, setCachedData } from "./_lib/cache.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const moodType = (req.query.mood as string) || "neutral";
    const cacheKey = `insights_${moodType}`;
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);

    const systemInstruction =
      "You are a serene mental wellness guide. Provide a comforting wellness response. Keep it under 2 sentences, poetic, calming.";
    const promptText = `Generate a calming daily affirmation and a tiny emotional insight for someone feeling ${moodType}. Respond in JSON with "affirmation" and "insight" (under 15 words).`;

    const responseText = await callAILab(systemInstruction, promptText, [], true);
    const parsed = parseRobustJSON(responseText || "{}");
    const resultPayload = {
      affirmation: parsed.affirmation || "You are breathing, you are here, and you are worthy of gentle kindness.",
      insight: parsed.insight || "Focus on one sensory detail around you right now.",
    };
    setCachedData(cacheKey, resultPayload, 600);
    res.json(resultPayload);
  } catch {
    res.json({
      affirmation: "Breathing in, I calm my body. Breathing out, I smile.",
      insight: "Take this hour one steady minute at a time.",
    });
  }
}
