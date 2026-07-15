import type { VercelRequest, VercelResponse } from "@vercel/node";
import { callAILab } from "./_lib/ai-gateway.js";
import { getCachedData, setCachedData } from "./_lib/cache.js";

const SAFETY_KEYWORDS = [
  "suicide",
  "suicidal",
  "self-harm",
  "kill myself",
  "want to die",
  "hurt myself",
  "end my life",
  "no reason to live",
];

function containsSafetyViolations(text: string): boolean {
  const normalized = text.toLowerCase();
  return SAFETY_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, history, mode } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required." });

    if (containsSafetyViolations(message) || JSON.stringify(history || "").toLowerCase().includes("kill myself")) {
      return res.json({
        safetyTriggered: true,
        reply: "You Are Not Alone 💙 Help is available right now. You do not have to go through this alone.",
      });
    }

    const cacheKey = `chat_${JSON.stringify({ message, history, mode })}`;
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);

    let systemInstruction =
      "You are the real-time voice and text assistant for 'Serene AI'—a comforting, deeply empathetic, and proactive online companion.\n\n" +
      "PERSONA & VOICE CONVERSATIONAL CORE:\n" +
      "- Tone: Empathetic, gentle, patient, calming, and genuinely proud of the user's progress.\n" +
      "- Formatting: Keep messages scannable and under 4-5 sentences in text mode.\n\n" +
      "TAB CONTROL CAPABILITY:\n" +
      "You can navigate the app by appending a tag at the end of your response, e.g. '[NAVIGATE:relief]'.\n" +
      "Supported targets: home, relief, sos, hotline, profile, neuroSkeletons, reviews.\n\n" +
      "CRITICAL SAFETY PROTOCOL: If the user indicates self-harm, severe clinical depression, or active emergency, deliver crisis support hotline 988 details and prompt immediate human connection.\n";

    if (mode === "voice") {
      systemInstruction +=
        "\nVOICE MODE: Keep responses to 1-3 sentences, no markdown or symbols, natural spoken pacing. Prepend '[UI_MODE: VOICE_CALL_ACTIVE]'.\n";
    } else {
      systemInstruction += "\nTEXT MODE: Prepend '[UI_MODE: FLOATING_HEAD]'.\n";
    }

    const reply = await callAILab(systemInstruction, message, history || [], false);

    if (containsSafetyViolations(reply)) {
      return res.json({
        safetyTriggered: true,
        reply: "You Are Not Alone 💙 Help is available right now. You do not have to go through this alone.",
      });
    }

    const resultPayload = { reply };
    setCachedData(cacheKey, resultPayload, 120);
    res.json(resultPayload);
  } catch (error: any) {
    res.json({
      reply: "I am sensing a little turbulence in our connection. Let's take a deep breath together. I am still here to support you.",
      error: error.message,
    });
  }
}
