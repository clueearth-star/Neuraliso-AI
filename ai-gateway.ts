import { GoogleGenAI } from "@google/genai";
import { getApiKey, getResolvedKeys } from "./keys.js";

/**
 * Strips markdown code fences and extracts JSON robustly from model output.
 */
export function parseRobustJSON(text: string): any {
  if (!text) return {};
  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fall through to original error
      }
    }
    throw err;
  }
}

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: getApiKey(),
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return aiClient;
}

// Circuit breaker: skip Google GenAI for a while after it rate-limits us.
// Module-scope state persists only within a warm instance (see cache.ts note).
let googleGenAILimitResetTime = 0;

async function callOpenRouter(
  systemInstruction: string,
  promptText: string,
  history: any[],
  jsonMode: boolean,
  apiKey: string
): Promise<string> {
  const messages = [{ role: "system", content: systemInstruction }];

  if (history && Array.isArray(history)) {
    history.forEach((h: any) => {
      messages.push({
        role: h.role === "user" ? "user" : "assistant",
        content: h.text || h.parts?.[0]?.text || "",
      });
    });
  }
  messages.push({ role: "user", content: promptText });

  const modelsToTry = [
    "google/gemini-2.5-flash",
    "meta-llama/llama-3.1-8b-instruct:free",
    "google/gemma-2-9b-it:free",
    "qwen/qwen-2.5-7b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
  ];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      const bodyPayload: any = {
        model,
        messages,
        temperature: jsonMode ? 0.75 : 0.7,
        max_tokens: jsonMode ? 2000 : 1500,
      };
      if (jsonMode) bodyPayload.response_format = { type: "json_object" };

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ai.studio/build",
          "X-Title": "Serene AI",
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${await response.text()}`);
      }
      const data: any = await response.json();
      if (data.choices?.[0]?.message) {
        return data.choices[0].message.content || "";
      }
      throw new Error("Invalid response format received from OpenRouter.");
    } catch (err: any) {
      lastError = err;
    }
  }
  throw new Error(`All OpenRouter models failed. Last error: ${lastError?.message || lastError}`);
}

async function callNvidia(
  systemInstruction: string,
  promptText: string,
  history: any[],
  jsonMode: boolean,
  apiKey: string
): Promise<string> {
  const messages: any[] = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  if (history && Array.isArray(history)) {
    history.forEach((h: any) => {
      messages.push({
        role: h.role === "user" ? "user" : "assistant",
        content: h.text || h.content || "",
      });
    });
  }
  messages.push({ role: "user", content: promptText });

  const modelsToTry = [
    "meta/llama-3.1-8b-instruct",
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "meta/llama-3.1-70b-instruct",
  ];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: jsonMode ? 0.75 : 0.7,
          max_tokens: jsonMode ? 2000 : 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${await response.text()}`);
      }
      const data: any = await response.json();
      if (data.choices?.[0]?.message) {
        return data.choices[0].message.content || "";
      }
      throw new Error("Invalid response format received from NVIDIA NIM.");
    } catch (err: any) {
      lastError = err;
    }
  }
  throw new Error(`All NVIDIA NIM models failed. Last error: ${lastError?.message || lastError}`);
}

/**
 * Enterprise AI Gateway: routes to NVIDIA, OpenRouter, or Google GenAI,
 * falling back gracefully between them.
 */
export async function callAILab(
  systemInstruction: string,
  promptText: string,
  history: any[] = [],
  jsonMode = false
): Promise<string> {
  const apiKey = getApiKey();
  const { resolvedOpenRouterKey } = getResolvedKeys();

  const isNvidia =
    apiKey.startsWith("nvapi-") ||
    (process.env.NVIDIA_API_KEY && apiKey === process.env.NVIDIA_API_KEY.trim());

  if (isNvidia) {
    try {
      return await callNvidia(systemInstruction, promptText, history, jsonMode, apiKey);
    } catch {
      if (!resolvedOpenRouterKey) throw new Error("NVIDIA failed and no OpenRouter fallback is configured.");
      return callOpenRouter(systemInstruction, promptText, history, jsonMode, resolvedOpenRouterKey);
    }
  }

  if (apiKey.startsWith("sk-or-")) {
    try {
      return await callOpenRouter(systemInstruction, promptText, history, jsonMode, apiKey);
    } catch {
      if (!resolvedOpenRouterKey) throw new Error("OpenRouter key failed and no fallback is configured.");
      return callOpenRouter(systemInstruction, promptText, history, jsonMode, resolvedOpenRouterKey);
    }
  }

  const now = Date.now();
  if (now < googleGenAILimitResetTime) {
    if (!resolvedOpenRouterKey) throw new Error("Google GenAI is cooling down and no OpenRouter fallback is configured.");
    return callOpenRouter(systemInstruction, promptText, history, jsonMode, resolvedOpenRouterKey);
  }

  const ai = getGenAI();
  const contentsList: any[] = [];
  if (history && Array.isArray(history)) {
    history.forEach((h: any) => {
      contentsList.push({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text || "" }],
      });
    });
  }
  contentsList.push({ role: "user", parts: [{ text: promptText }] });

  const config: any = { systemInstruction, temperature: jsonMode ? 0.75 : 0.7 };
  if (jsonMode) config.responseMimeType = "application/json";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contentsList,
      config,
    });
    return response.text || "";
  } catch {
    googleGenAILimitResetTime = Date.now() + 5 * 60 * 1000;
    if (!resolvedOpenRouterKey) throw new Error("Google GenAI failed and no OpenRouter fallback is configured.");
    return callOpenRouter(systemInstruction, promptText, history, jsonMode, resolvedOpenRouterKey);
  }
}
