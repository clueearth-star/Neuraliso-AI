import type { VercelRequest, VercelResponse } from "@vercel/node";
import { callAILab, parseRobustJSON } from "./_lib/ai-gateway.js";
import { getCachedData, setCachedData } from "./_lib/cache.js";

const mockBlueprint = {
  assessmentOverview:
    "Executive Well-being Summary: Based on recent logged emotional cycles, your system is demonstrating moderate adaptive resilience.",
  cognitiveDistortions: [
    {
      name: "All-or-Nothing Extremism",
      analysis: "A tendency to categorize your days as either perfectly peaceful or totally ruined.",
      reframeHomework: "Begin journaling in gradients: rate each session 1-10 instead of binary good/bad.",
    },
  ],
  vagalExercises: [
    {
      name: "Sub-Zero Thermal Vagus Shock",
      description: "Submerge your hands or face in ice-cold water for 15 seconds.",
      duration: "15 seconds",
    },
  ],
  homeworkContracts: ["Unsubscribe from stressful notifications after 8:30 PM tonight."],
  poeticPrescription: "In the silent spaces between your thoughts, you are entirely whole.",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { entries, userName } = req.body;
    const cacheKey = `blueprint_${userName || "anon"}_${JSON.stringify(entries || [])}`;
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);

    const systemInstruction =
      "You are a clinical director of cognitive-behavioral therapy. Generate a detailed, professional, supportive Clinical Cognitive Well-being Blueprint. " +
      'Respond ONLY with JSON matching: { "blueprint": { "assessmentOverview": string, ' +
      '"cognitiveDistortions": [ { "name": string, "analysis": string, "reframeHomework": string } ], ' +
      '"vagalExercises": [ { "name": string, "description": string, "duration": string } ], ' +
      '"homeworkContracts": [string], "poeticPrescription": string } }';

    const promptText = `Generate a customized well-being blueprint for ${userName || "Anonymous seeker"} with logged entries: ${JSON.stringify(entries || [])}.`;

    const responseText = await callAILab(systemInstruction, promptText, [], true);
    const parsed = parseRobustJSON(responseText || "{}");
    const resultPayload = { blueprint: parsed.blueprint || parsed || mockBlueprint };
    setCachedData(cacheKey, resultPayload, 300);
    res.json(resultPayload);
  } catch (error: any) {
    res.json({ error: error.message, blueprint: mockBlueprint });
  }
}
