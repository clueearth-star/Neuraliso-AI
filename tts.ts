import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text, voiceId } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text is required for speech synthesis." });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return res.status(400).json({ error: "ELEVENLABS_API_KEY is not configured." });
    }

    const vId = voiceId || "cLONiZ4hQ8VpQ4Sz";
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `ElevenLabs API feedback: ${errText}` });
    }

    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate speech." });
  }
}
