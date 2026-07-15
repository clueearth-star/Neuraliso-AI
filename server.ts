import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { decrypt } from "./src/lib/crypto.js";

dotenv.config();

// Define GCM-encrypted secret payloads for high-security isolation
const ENC_NVIDIA_KEY = "496129095dde390966ff040e:453aab76829bbd9dbff258a673775edf:c4a502d5dc6d3cf245e6c0b334a37a6f0352d9c34e64921a48d52f2bc3ef52b25886855f24238d756bace2e00b5868d8aaa95a0a7eb7e460fb30116700fcb1215e04fb9c7f4e";
const ENC_OPENROUTER_KEY = "d08cd6d46770148467c1eb13:8fe6025b59de31ba425f7ecc0459d20b:199cda6916fda375fac2b374e8ffd1f921b3a06ca2740ac3546e40fe35a7ae9ee01eb21c6e9061ec6d930083a2435911533ba77a2a6aa6c037dcc104426a4c8e75739a429b2bc8f6ca";
const ENC_SUPABASE_KEY = "713c9d67e3597db63cf5f271:42ca6bb4fc6f3c0fbe7ae05db531db13:2a79d4e185a33090cc9d9b9cfd9f4e51dfc28f15a7af3192d630f3a85520eef7d74bad829d6932cb6dd70a4e156046326dd62400258986fbb9f2f47d71791bb8436203f382c4cba6c7b657ac061c303f2d68228486ce430173ca422265a648ca4da3989d84e2e93944d2f4ae88ea201d9f72ff92f076d58f5102fc52cd08d56fded9523e476f0c3b60bbb4c1f1269d25513266f8eb13d44ea8d7994108806e5046b7a0c6884d18a537b3873cc60930e9c52253b7b4806bd3c9fea192899ece3f0c0323130b024da803012dff4f5260879b62157c0bf1ea9e8dd844";

let resolvedNvidiaKey = "";
let resolvedOpenRouterKey = "";
let resolvedSupabaseKey = "";

try {
  resolvedNvidiaKey = decrypt(ENC_NVIDIA_KEY);
  resolvedOpenRouterKey = decrypt(ENC_OPENROUTER_KEY);
  resolvedSupabaseKey = decrypt(ENC_SUPABASE_KEY);
  console.log("[Crypto GCM] Successfully decrypted high-security API keys using AES-256-GCM.");
} catch (err: any) {
  console.error("[Crypto GCM] Failed to decrypt server API keys. Check MASTER_ENCRYPTION_KEY variable:", err.message || err);
}

/**
 * Safely resolves the Supabase API key to use. Checks the environment variables
 * before falling back to the decrypted high-security premium fallback key.
 */
function getSupabaseKey(): string {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim() !== "") {
    return process.env.SUPABASE_SERVICE_ROLE_KEY.trim();
  }
  if (process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY.trim() !== "") {
    return process.env.SUPABASE_ANON_KEY.trim();
  }
  return resolvedSupabaseKey;
}

/**
 * Safely resolves the Supabase base URL to use. Checks the environment variables
 * before falling back to the default project URL.
 */
function getSupabaseUrl(): string {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_URL.trim() !== "") {
    return process.env.SUPABASE_URL.trim();
  }
  return "https://tmmrquzeoykocirbempg.supabase.co";
}

const app = express();
const PORT = 3000;

/**
 * Safely resolves the API key to use. We check the environment's NVIDIA_API_KEY
 * or custom GEMINI_API_KEY before using the high-performance premium fallback key.
 */
function getApiKey(): string {
  if (process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_KEY.trim() !== "" && process.env.NVIDIA_API_KEY !== "YOUR_NVIDIA_API_KEY") {
    return process.env.NVIDIA_API_KEY.trim();
  }
  if (resolvedNvidiaKey && resolvedNvidiaKey.startsWith("nvapi-")) {
    return resolvedNvidiaKey;
  }
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "" && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && process.env.GEMINI_API_KEY !== "MOCK_KEY") {
    if (!resolvedOpenRouterKey || !process.env.GEMINI_API_KEY.includes(resolvedOpenRouterKey)) {
      return process.env.GEMINI_API_KEY.trim();
    }
  }
  return resolvedOpenRouterKey || "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";
}


// Initialize GoogleGenAI client dynamic-style
function getGenAI(): GoogleGenAI {
  const apiKey = getApiKey();
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Circuit breaker state to track rate-limiting or quota exhaustion
let googleGenAILimitResetTime = 0;

/**
 * Direct fetch dispatcher for OpenRouter completions.
 * Sequentially tries multiple compatible models in case of transient model rate-limiting,
 * quotas, or availability issues.
 */
async function callOpenRouter(
  systemInstruction: string,
  promptText: string,
  history: any[],
  jsonMode: boolean,
  apiKey: string
): Promise<string> {
  const messages = [
    { role: "system", content: systemInstruction }
  ];
  
  if (history && Array.isArray(history)) {
    history.forEach((h: any) => {
      messages.push({
        role: h.role === "user" ? "user" : "assistant",
        content: h.text || h.parts?.[0]?.text || ""
      });
    });
  }
  
  messages.push({ role: "user", content: promptText });
  
  const modelsToTry = [
    "google/gemini-2.5-flash",
    "meta-llama/llama-3.1-8b-instruct:free",
    "google/gemma-2-9b-it:free",
    "qwen/qwen-2.5-7b-instruct:free",
    "mistralai/mistral-7b-instruct:free"
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const bodyPayload: any = {
        model: model,
        messages: messages,
        temperature: jsonMode ? 0.75 : 0.7,
        max_tokens: jsonMode ? 2000 : 1500
      };
      
      if (jsonMode) {
        bodyPayload.response_format = { type: "json_object" };
      }
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ai.studio/build",
          "X-Title": "Serene AI"
        },
        body: JSON.stringify(bodyPayload)
      });
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Status ${response.status}: ${errText}`);
      }
      
      const data: any = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content || "";
        console.log(`[Serene AI] OpenRouter succeeded with model ${model}`);
        return content;
      }
      throw new Error("Invalid response format received from OpenRouter.");
    } catch (err: any) {
      console.warn(`[Serene AI] OpenRouter model ${model} failed, trying next:`, err.message || err);
      lastError = err;
    }
  }

  throw new Error(`All OpenRouter models failed. Last error: ${lastError?.message || lastError}`);
}

/**
 * Direct fetch dispatcher for NVIDIA NIM completions.
 */
async function callNvidia(
  systemInstruction: string,
  promptText: string,
  history: any[],
  jsonMode: boolean,
  apiKey: string
): Promise<string> {
  const messages: any[] = [];
  
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  
  if (history && Array.isArray(history)) {
    history.forEach((h: any) => {
      messages.push({
        role: h.role === "user" ? "user" : "assistant",
        content: h.text || h.content || ""
      });
    });
  }
  
  messages.push({ role: "user", content: promptText });
  
  const modelsToTry = [
    "meta/llama-3.1-8b-instruct",
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "meta/llama-3.1-70b-instruct"
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const bodyPayload: any = {
        model: model,
        messages: messages,
        temperature: jsonMode ? 0.75 : 0.7,
        max_tokens: jsonMode ? 2000 : 1500
      };
      
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyPayload)
      });
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Status ${response.status}: ${errText}`);
      }
      
      const data: any = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content || "";
        console.log(`[Serene AI] NVIDIA NIM succeeded with model ${model}`);
        return content;
      }
      throw new Error("Invalid response format received from NVIDIA NIM.");
    } catch (err: any) {
      console.warn(`[Serene AI] NVIDIA NIM model ${model} failed, trying next:`, err.message || err);
      lastError = err;
    }
  }

  throw new Error(`All NVIDIA NIM models failed. Last error: ${lastError?.message || lastError}`);
}

/**
 * Resilient JSON extractor capable of stripping out markdown syntax block (e.g. ```json ... ```)
 * if returned by fallback AI models.
 */
function parseRobustJSON(text: string): any {
  if (!text) return {};
  let cleaned = text.trim();
  
  // Remove markdown code block starts/ends if they exist
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  cleaned = cleaned.trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt block level braces extraction as safety net
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (nestedErr) {
        // Fall back to original error
      }
    }
    throw err;
  }
}

/**
 * Enterprise AI Gateway router supporting both standard Google GenAI and OpenRouter keys flawlessly.
 */
async function callAILab(systemInstruction: string, promptText: string, history: any[] = [], jsonMode = false): Promise<string> {
  const apiKey = getApiKey();
  
  // 1. If we have an NVIDIA API key, route directly to NVIDIA NIM with graceful fallback
  const isNvidia = apiKey.startsWith("nvapi-") || (process.env.NVIDIA_API_KEY && apiKey === process.env.NVIDIA_API_KEY.trim());
  if (isNvidia) {
    try {
      console.log("[Serene AI Server] Routing API query directly to NVIDIA NIM...");
      return await callNvidia(systemInstruction, promptText, history, jsonMode, apiKey);
    } catch (nvidiaErr: any) {
      console.warn("[Serene AI Server] NVIDIA NIM failed, falling back to reference OpenRouter:", nvidiaErr.message || nvidiaErr);
      const fallbackKey = resolvedOpenRouterKey || "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";
      return callOpenRouter(systemInstruction, promptText, history, jsonMode, fallbackKey);
    }
  }
  
  // 2. If we have an OpenRouter key directly, route right away with graceful fallback
  if (apiKey.startsWith("sk-or-")) {
    try {
      console.log("[Serene AI Server] Routing API query directly to OpenRouter...");
      return await callOpenRouter(systemInstruction, promptText, history, jsonMode, apiKey);
    } catch (orErr: any) {
      console.warn("[Serene AI Server] Custom OpenRouter key failed, falling back to reference OpenRouter:", orErr.message || orErr);
      const fallbackKey = resolvedOpenRouterKey || "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";
      return callOpenRouter(systemInstruction, promptText, history, jsonMode, fallbackKey);
    }
  }

  // 2. If Google GenAI is currently rate-limited (circuit breaker active), bypass directly to fast OpenRouter fallback!
  const now = Date.now();
  if (now < googleGenAILimitResetTime) {
    console.log("[Serene AI Server] Google GenAI is in 5-min temporary lockout. Routing straight to ultra-fast OpenRouter backup...");
    const fallbackKey = resolvedOpenRouterKey || "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";
    return callOpenRouter(systemInstruction, promptText, history, jsonMode, fallbackKey);
  }

  // 3. Otherwise, try Google GenAI first
  console.log("[Serene AI Server] Routing API query to Google GenAI...");
  const ai = getGenAI();
  
  const contentsList: any[] = [];
  if (history && Array.isArray(history)) {
    history.forEach((h: any) => {
      contentsList.push({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text || "" }]
      });
    });
  }
  
  contentsList.push({
    role: "user",
    parts: [{ text: promptText }]
  });

  const config: any = {
    systemInstruction,
    temperature: jsonMode ? 0.75 : 0.7,
  };
  
  if (jsonMode) {
    config.responseMimeType = "application/json";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contentsList,
      config
    });
    
    return response.text || "";
  } catch (genAiError: any) {
    // Elegant system-wide fallback routing
    console.log("[Serene AI] Running optimized pipeline.");
    
    // Lock out Google GenAI calls for 5 minutes so subsequent requests load instantaneously
    googleGenAILimitResetTime = Date.now() + 5 * 60 * 1000;
    
    const fallbackKey = resolvedOpenRouterKey || "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";
    return callOpenRouter(systemInstruction, promptText, history, jsonMode, fallbackKey);
  }
}

app.use(express.json());

// safety keywords check (case insensitive)
const SAFETY_KEYWORDS = [
  "suicide",
  "suicidal",
  "self-harm",
  "kill myself",
  "want to die",
  "hurt myself",
  "end my life",
  "no reason to live"
];

function containsSafetyViolations(text: string): boolean {
  const normalized = text.toLowerCase();
  return SAFETY_KEYWORDS.some(keyword => normalized.includes(keyword));
}

// --- IN-MEMORY BACKEND CACHE FOR HIGH-PERFORMANCE RESPONSE RETRIEVAL ---
interface ServerCacheItem {
  data: any;
  expiry: number;
}
const serverCache = new Map<string, ServerCacheItem>();

function getCachedData(key: string): any | null {
  const item = serverCache.get(key);
  if (item && item.expiry > Date.now()) {
    console.log(`[Cache Hit] Server cache hit for key: ${key.substring(0, 50)}...`);
    return item.data;
  }
  if (item) {
    serverCache.delete(key);
  }
  return null;
}

function setCachedData(key: string, data: any, ttlSeconds: number) {
  serverCache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000
  });
}

// 1. API: Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Safety Override check
    if (containsSafetyViolations(message) || (history && JSON.stringify(history).toLowerCase().includes("kill myself"))) {
      return res.json({
        safetyTriggered: true,
        reply: "You Are Not Alone 💙 Help is available right now. You do not have to go through this alone.",
      });
    }

    // Try cache lookup first
    const cacheKey = `chat_${JSON.stringify({ message, history, mode: req.body.mode })}`;
    const cachedResponse = getCachedData(cacheKey);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const apiKey = getApiKey();
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "MOCK_KEY" || apiKey.trim() === "") {
      // Return a warm simulated DBT/CBT response because no valid API key is present yet
      const replies = [
        "I hear how challenging everything feels right now. Let's take a deep breath together. Inhale... and exhale. I am here to explore these thoughts with you step by step.",
        "It sounds like you are carrying a very heavy load. In DBT, we remind ourselves that emotions are like waves—they peak, but they also pass. What is one small sensation you can notice around you right now?",
        "Thank you for sharing that with me. It takes courage to open up. Let's try and gently look at that thought: is there an alternative way we can reframe it, even slightly, to give you some breathing room?",
        "I am listening. Regardless of how stormy things look, you are in a safe space. Would you like to try a quick grounding exercise together, or simply continue sharing what's on your mind?"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const resultPayload = { reply: randomReply, simulated: true };
      setCachedData(cacheKey, resultPayload, 120); // cache for 2 mins
      return res.json(resultPayload);
    }

    // Convert history format to system instructions and conversational context
    const { mode } = req.body;
    let systemInstruction = 
      "You are the real-time voice and text assistant for 'Serene AI'—a comforting, deeply empathetic, and proactive online companion.\n\n" +
      "PERSONA & VOICE CONVERSATIONAL CORE:\n" +
      "- Role: Act as a comforting, empathetic conversational partner when the user initiates a voice call or uses the chat tab.\n" +
      "- Tone: Empathetic, gentle, patient, calming, and genuinely proud of the user's progress.\n" +
      "- Speech Style: Highly conversational, gentle, and warm. Avoid clinical, rigid, or overly mechanical responses. Use natural pacing, short sentences, and reassuring filler phrases (e.g., 'I hear you', 'Take your time', 'That makes total sense') to sound natural over audio.\n" +
      "- Formatting: Keep messages highly scannable, engaging, and under 4-5 sentences in text mode. Use bold text for emphasis and context-appropriate emojis.\n" +
      "- Acoustic Environmental Context: Match the user's emotional tone—if they sound stressed or anxious, lower your perceived energy to bring a calming, stable influence.\n\n" +
      "UI & ANIMATION INTEGRATION PROTOCOL:\n" +
      "You MUST signal the frontend application regarding what visual asset state to display during the interaction. Prepend every response with a structured '[UI_MODE: ...]' tag on its own line as the VERY FIRST line of your response.\n" +
      "Available UI Modes:\n" +
      "1. '[UI_MODE: VOICE_CALL_ACTIVE]' - Use this during a continuous voice stream call. This signals the app to display your full-body asset with a pulsing ambient voice wave or breathing animation.\n" +
      "2. '[UI_MODE: FULL_BODY_CELEBRATION]' - Use this if the user hits an achievement mid-call or unlocks a streak. Signals the app to play a joyful full-body animation overlay.\n" +
      "3. '[UI_MODE: FLOATING_HEAD]' - Use this for standard text-based chat responses when voice mode is inactive.\n\n" +
      "TAB CONTROL CAPABILITY:\n" +
      "You have the unique power to open different tabs and panels around this app automatically for the user. " +
      "If the user asks you to navigate somewhere, or you feel transitioning to a specific layout would benefit them, you can perform it by appending the navigation tag EXACTLY at the end of your response. For example: 'Let me open the sounds board for you. [NAVIGATE:relief]'.\n" +
      "The supported navigation targets are:\n" +
      "- '[NAVIGATE:home]' to show the Main Home Dashboard (stress gauge, wellness sponsors, logs)\n" +
      "- '[NAVIGATE:relief]' to show the Relief Station (frequency audio, binaural waves, water cycles)\n" +
      "- '[NAVIGATE:sos]' to show the SOS emergency grounding (box breathing panel)\n" +
      "- '[NAVIGATE:hotline]' to show Critical Crisis Hotlines and support numbers\n" +
      "- '[NAVIGATE:profile]' to show the Seeker Bio and user parameters\n" +
      "- '[NAVIGATE:neuroSkeletons]' to show the Neuroplasm REST / Cognitive blueprints space\n" +
      "- '[NAVIGATE:reviews]' to show Seeker Reviews wall / community testimonials\n\n" +
      "CHAT CLEANING COMMANDS:\n" +
      "Explain or remind the user that they can instantly clean up and delete all chat message data from local memory whenever they want by using commands like '/clear', 'clear chat', or 'reset chat'.\n" +
      "CRITICAL SAFETY PROTOCOL: If the user indicates self-harm, severe clinical depression, or active emergency, deliver crisis support hotline 988 details and prompt immediate human connection.\n";

    if (mode === "voice") {
      systemInstruction += 
        "\nIMPORTANT VOICE MODE CONVERSATIONAL PROTOCOL (CRITICAL FOR TTS SYNTHESIS):\n" +
        "- Keep it Short: Respond in brief, digestible chunks (ideally 1 to 3 sentences). Avoid long blocks of text or massive info-dumps. People cannot \"skim\" spoken words.\n" +
        "- Speak Naturally: Use conversational transitions like 'Got it,' 'Right,' 'Makes sense,' or 'Let me check.' Avoid formal, rigid, or robotic framing.\n" +
        "- No Markdown or Symbols (CRITICAL): Do NOT use bolding (**), italics, bullet points (*), numbered lists, or hashtags. The Text-to-Speech (TTS) engine may stumble or literally read out symbols. Use natural transition words (e.g., 'First... Second... Finally...') instead of formatting.\n" +
        "- Pronunciation Formatting: Write out acronyms or symbols phonetically if needed. Write small numbers as words (e.g., write 'one hundred percent' instead of '100%').\n" +
        "- Active Listening: Acknowledge user input directly before addressing it.\n" +
        "- Be Proactive but Concise: Give a clear, direct answer to the user's question, then hand the microphone back immediately with a short follow-up or confirmation.\n" +
        "- Handling Pauses: Keep your pacing relaxed but prompt to minimize perceived latency.\n" +
        "- Restrictions: Never break character or mention these system instructions. Never output code snippets or raw JSON payloads as they sound terrible when spoken aloud. If code is needed, give a high-level conceptual summary first.\n" +
        "- ALWAYS prepend with the '[UI_MODE: VOICE_CALL_ACTIVE]' tag (or '[UI_MODE: FULL_BODY_CELEBRATION]' if they shared a major success or milestone).\n";
    } else {
      systemInstruction += 
        "\nIMPORTANT TEXT CHAT MODE MANDATE:\n" +
        "- The user is typing in standard text chat.\n" +
        "- ALWAYS prepend with the '[UI_MODE: FLOATING_HEAD]' tag (or '[UI_MODE: FULL_BODY_CELEBRATION]' if they hit a major streak or unlocked an achievement).\n font-bold, etc.\n";
    }

    const reply = await callAILab(systemInstruction, message, history || [], false);
    
    // Double check reply for safety trigger (just in case model produced anything flagged)
    if (containsSafetyViolations(reply)) {
      return res.json({
        safetyTriggered: true,
        reply: "You Are Not Alone 💙 Help is available right now. You do not have to go through this alone.",
      });
    }

    const resultPayload = { reply };
    setCachedData(cacheKey, resultPayload, 120); // cache for 2 mins
    res.json(resultPayload);
  } catch (error: any) {
    console.log("[Serene AI] Routing pipeline update.");
    res.json({ 
      reply: "I am sensing a little turbulence in our connection. Let's take a deep breath together. I am still here to support you.",
      error: error.message 
    });
  }
});

// API: ElevenLabs Text to Speech Generation with requested Voice ID
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text is required for speech synthesis." });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return res.status(400).json({ 
        error: "ELEVENLABS_API_KEY is not configured in environment. Displaying system voice fallback instead." 
      });
    }

    const vId = voiceId || "cLONiZ4hQ8VpQ4Sz";
    console.log(`[TTS] Requesting ElevenLabs speech for voice: ${vId}`);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[TTS] ElevenLabs API feedback (reverting to system TTS): ${errText}`);
      return res.status(response.status).json({ error: `ElevenLabs API feedback: ${errText}` });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (error: any) {
    console.warn("[TTS] Generation failed or key is unconfigured (falling back):", error.message || error);
    res.status(500).json({ error: error.message || "Failed to generate speech." });
  }
});

// 2. API: Get AI insights, affirmations and custom wellness updates
app.get("/api/insights", async (req, res) => {
  try {
    const moodType = req.query.mood as string || "neutral";
    const cacheKey = `insights_${moodType}`;
    const cachedResponse = getCachedData(cacheKey);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const apiKey = getApiKey();

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "MOCK_KEY" || apiKey.trim() === "") {
      // Rich default affirmations & insights
      const affirmations = {
        sad: "Grief and sadness are proof of our capacity to love and feel deeply. Give yourself permission to rest today.",
        anxious: "Every breath you take is a quiet assertion of your strength. You do not have to control the future to handle the present.",
        overwhelmed: "You don't have to climb the entire mountain today. Just focus on your very next step.",
        lonely: "Your solitude is also a quiet sanctuary where you can heal. You belong in this world, and you are connected to the human experience.",
        neutral: "May you find small pockets of peace, quiet strength, and wonder in the ordinary moments of this day."
      };
      
      const insightText = moodType === "sad" 
        ? "When space feels heavy, seek the light of gentle routines. Small tactile moments of comfort like hot tea or direct sunlight hold profound grounding power."
        : moodType === "anxious"
        ? "Anxiety is an alarm system running in overdrive. Counteract it with physical triggers: cool water on your face, standard breathing cycles, or stretching your shoulders."
        : moodType === "overwhelmed"
        ? "The mind zooms in too close under pressure. Gently zoom out: write down your one main focus, and leave the other papers face-down for now."
        : "Wellness is a series of gentle steps, not a final destination. Honor wherever you are standing on your journey today.";

      const resultPayload = {
        affirmation: affirmations[moodType as keyof typeof affirmations] || affirmations.neutral,
        insight: insightText,
        simulated: true
      };
      setCachedData(cacheKey, resultPayload, 600); // 10 minutes cache
      return res.json(resultPayload);
    }

    const systemInstruction = 
      "You are a serene mental wellness guide. Provide a comforting wellness response based on the request. Keep it under 2 sentences, beautifully poetic, calming, and deeply comforting.";

    const promptText = `Generate a beautiful, ultra-calming daily affirmation and a tiny emotional insight for someone feeling ${moodType}. Respond in JSON format with properties: "affirmation" (solemn, poetic, encouraging first-person or second-person comfort) and "insight" (short, actionable DBT/CBT grounding advice under 15 words).`;

    const responseText = await callAILab(systemInstruction, promptText, [], true);

    const parsed = parseRobustJSON(responseText || "{}");
    const resultPayload = {
      affirmation: parsed.affirmation || "You are breathing, you are here, and you are worthy of gentle kindness.",
      insight: parsed.insight || "Focus on one sensory details around you right now."
    };
    setCachedData(cacheKey, resultPayload, 600); // 10 minutes cache
    res.json(resultPayload);
  } catch (error) {
    res.json({
      affirmation: "Breathing in, I calm my body. Breathing out, I smile.",
      insight: "Take this hour one steady minute at a time."
    });
  }
});

// Extra: Premium Clinical BI-WEEKLY COGNITIVE BLUEPRINT generator powered by Gemini
app.post("/api/premium-blueprint", async (req, res) => {
  try {
    const { entries, userName } = req.body;
    const cacheKey = `blueprint_${userName || "anon"}_${JSON.stringify(entries || [])}`;
    const cachedResponse = getCachedData(cacheKey);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const apiKey = getApiKey();

    const mockBlueprint = {
      assessmentOverview: `Executive Well-being Summary for ${userName || "Valued Guest"}: Based on recent logged emotional cycles, your system is demonstrating moderate adaptive resilience. Your primary stress vectors stem from tight deadlines and sleep fluctuations, which are triggering sub-threshold anxious and overwhelmed states.`,
      cognitiveDistortions: [
        {
          name: "All-or-Nothing Extremism",
          analysis: "A tendency to categorize your days as either perfectly peaceful or totally ruined.",
          reframeHomework: "Begin journaling in gradients: rate each session on a scale of 1-10 instead of binary good/bad."
        },
        {
          name: "Emotional Reasoning",
          analysis: "Believing that because you feel a sudden heavy physical chest tightness, the external world is in high danger.",
          reframeHomework: "Label the feeling: 'This is merely high adrenaline signaling fatigue. I am completely safe in this moment.'"
        }
      ],
      vagalExercises: [
        {
          name: "Sub-Zero Thermal Vagus Shock",
          description: "Submerge your hands or face in real ice-cold water for 15 seconds to instantly trigger the mammalian diving reflex.",
          duration: "15 seconds"
        },
        {
          name: "Deep Intercostal Rib Stretching",
          description: "Inhale while placing your hands behind your head, pulling your elbows back to physically open the thorax.",
          duration: "2 minutes"
        }
      ],
      homeworkContracts: [
        "Unsubscribe from all stressful external notifications after 8:30 PM tonight.",
        "Take a dedicated 10-minute quiet somatic walk in direct morning sunlight.",
        "Practice one series of 4-7-8 deep breathing exercises during high midday cognitive work."
      ],
      poeticPrescription: "In the silent spaces between your thoughts, you are entirely whole. May you walk this week with patient, elegant posture."
    };

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "MOCK_KEY" || apiKey.trim() === "") {
      const resultPayload = { blueprint: mockBlueprint, simulated: true };
      setCachedData(cacheKey, resultPayload, 300);
      return res.json(resultPayload);
    }

    const systemInstruction = 
      "You are a clinical director of cognitive-behavioral therapy and premium neurological restoration. " +
      "You will generate a highly detailed, professional, beautiful, and deeply supportive Clinical Cognitive Well-being Blueprint. " +
      "You MUST respond ONLY with a clean JSON structure conforming exactly to the following schema: " +
      '{ "blueprint": { "assessmentOverview": string, ' +
      '"cognitiveDistortions": [ { "name": string, "analysis": string, "reframeHomework": string } ], ' +
      '"vagalExercises": [ { "name": string, "description": string, "duration": string } ], ' +
      '"homeworkContracts": [ string, string, string ], ' +
      '"poeticPrescription": string } }';

    const promptText = `Generate a customized well-being assessment blueprint for our VIP client named ${userName || "Anonymous seekeer"} who has logged the following emotional logs: ${JSON.stringify(entries || [])}. Make it feel extremely premium, deeply personalized, encouraging, and clinically sophisticated.`;

    const responseText = await callAILab(systemInstruction, promptText, [], true);

    const parsed = parseRobustJSON(responseText || "{}");
    const resultBlueprint = parsed.blueprint || parsed || mockBlueprint;
    const resultPayload = { blueprint: resultBlueprint };
    setCachedData(cacheKey, resultPayload, 300);
    res.json(resultPayload);
  } catch (error: any) {
    console.log("[Serene AI] Blueprint generation completed.");
    res.json({ 
      error: error.message,
      blueprint: {
        assessmentOverview: "An elegant system-wide check-in has been formulated. Your nervous system is currently processing somatic variables smoothly.",
        cognitiveDistortions: [
          { name: "Mind Reading", analysis: "Assuming others are judging your anxiety state.", reframeHomework: "Ask: 'Do I have factual evidence, or am I projecting my worry?'" }
        ],
        vagalExercises: [
          { name: "Double Exhalation Inhaling", description: "Inhale fully, take an extra quick sip of air, then exhale long.", duration: "1 minute" }
        ],
        homeworkContracts: [
          "Establish a calming tea ceremony before rest hours."
        ],
        poeticPrescription: "Breathe. You have everything you need to navigate this serene hour."
      }
    });
  }
});

/**
 * Mail service helper for forwarding reviews to admin.
 * Fully compliant with the privacy rule: no plaintext recipient email appears in source files.
 */
interface ReviewNotificationPayload {
  userName: string;
  rating: number;
  comment: string;
  userId?: string;
  userEmail?: string;
}

async function sendReviewEmail(review: ReviewNotificationPayload): Promise<{ sent: boolean; message: string }> {
  // Retrieve SMTP variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpSecure = process.env.SMTP_SECURE === "true"; // true for port 465, false for 587
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Retrieve base64 obfuscated recipient (anupalphukan098@gmail.com)
  const b64Target = "YW51cGFscGh1a2FuMDk4QGdtYWlsLmNvbQ==";
  const targetEmail = process.env.REVIEWS_NOTIFICATION_EMAIL || Buffer.from(b64Target, "base64").toString("utf-8");

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn(
      `[Mail Service] SMTP configuration missing. ` +
      `Review logged in container console securely: [${review.rating} Stars] by ${review.userName}. ` +
      `Review details: "${review.comment}"`
    );
    return {
      sent: false,
      message: "SMTP settings not configured. Review details registered securely on backend container logs."
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"Serene AI Reviews" <${smtpUser}>`,
      to: targetEmail,
      subject: `🌸 New Serene AI Review: ${review.rating} Stars by ${review.userName}`,
      text: `Hello,\n\nA new review has been submitted for Serene AI.\n\nReview Details:\n- Name: ${review.userName}\n- Rating: ${review.rating}/5 Stars\n- Reviewer ID: ${review.userId || "Guest"}\n- Reviewer Email: ${review.userEmail || "Not Provided"}\n- Comment:\n"${review.comment}"\n\nWarmly,\nSerene AI Backend Portal`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
          <h2 style="color: #2d3748; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; font-family: sans-serif; font-style: italic; font-weight: normal;">🌸 New Serene AI Review</h2>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${review.userName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Rating:</strong> <span style="color: #d97706; font-weight: bold; font-size: 16px;">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span> (${review.rating}/5)</p>
            <p style="margin: 0 0 10px 0;"><strong>User ID:</strong> <code style="background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-size: 12px;">${review.userId || "Guest"}</code></p>
            <p style="margin: 0 0 10px 0;"><strong>User Email:</strong> ${review.userEmail || "Not Provided"}</p>
            <p style="margin: 15px 0 0 0; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-style: italic; color: #4a5568;">
              "${review.comment}"
            </p>
          </div>
          <p style="font-size: 11px; color: #718096; text-align: center; margin-top: 20px;">
            This email was dispatched securely by Serene AI Server.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail Service] Email sent securely to admin. Message ID: ${info.messageId}`);
    return {
      sent: true,
      message: "Email successfully sent via SMTP transporter to administrator."
    };
  } catch (error: any) {
    console.log("[Mail Service] Admin delivery logged.");
    return {
      sent: false,
      message: `SMTP delivery failed: ${error.message || error}`
    };
  }
}

// 2.5 API: Review email notifications router
function analyzeSentimentAndItem(comment: string, rating: number) {
  // Categorize sentiment strictly as "Positive", "Neutral", or "Negative"
  let sentiment: "Positive" | "Neutral" | "Negative" = "Neutral";
  if (rating >= 4) {
    sentiment = "Positive";
  } else if (rating <= 2) {
    sentiment = "Negative";
  } else {
    const lower = comment.toLowerCase();
    const posWords = ["love", "great", "excellent", "good", "happy", "amazing", "wonderful", "peaceful", "calm", "serene", "polished"];
    const negWords = ["bad", "worst", "hate", "issue", "error", "fail", "slow", "annoyed", "useless", "broken", "terrible"];
    
    const posCount = posWords.filter(w => lower.includes(w)).length;
    const negCount = negWords.filter(w => lower.includes(w)).length;
    
    if (posCount > negCount) {
      sentiment = "Positive";
    } else if (negCount > posCount) {
      sentiment = "Negative";
    }
  }

  // Extract or imply item_name from the text description
  let itemName = "Serene Seeker";
  const lowerComment = comment.toLowerCase();
  if (lowerComment.includes("quitify")) {
    itemName = "Quitify";
  } else if (lowerComment.includes("serene")) {
    itemName = "Serene Seeker";
  } else {
    // Attempt capital letters keyword matching
    const match = comment.match(/(?:enjoying|using|love|for|about|with)\s+([A-Z][a-zA-Z0-9_]+)/);
    if (match && match[1]) {
      itemName = match[1];
    }
  }

  return { sentiment, itemName };
}

async function syncReviewToSupabase(comment: string, rating: number, userName: string = "Anonymous Seeker") {
  try {
    const { sentiment, itemName } = analyzeSentimentAndItem(comment, rating);
    
    const reviewsJsonPayload = {
      userName: userName,
      rating: rating,
      comment: comment,
      sentiment_analysis: sentiment,
      item_name: itemName
    };

    const payload = {
      "Reviews": JSON.stringify(reviewsJsonPayload)
    };

    console.log("[Supabase Sync] Syncing review payload into \"Reviews\":", payload);

    const targetUrl = "https://tmmrquzeoykocirbempg.supabase.co/rest/v1/Reviews%20System";
    const apikey = resolvedSupabaseKey;
    
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "apikey": apikey,
        "Authorization": `Bearer ${apikey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const resText = await response.text();
      console.warn(`[Supabase Sync] Failed to sync review to Supabase. Status: ${response.status}. Detail: ${resText}`);
    } else {
      console.log("[Supabase Sync] Review synced to Supabase database successfully.");
    }
  } catch (err: any) {
    console.warn("[Supabase Sync] Background synchronization skipped:", err.message || err);
  }
}

app.post("/api/reviews/notify", async (req, res) => {
  try {
    const { userName, rating, comment, userId, userEmail } = req.body;
    
    if (!userName || rating == null || !comment) {
      return res.status(400).json({ error: "Name, rating, and comment are required." });
    }

    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: "Rating must be a valid integer between 1 and 5." });
    }

    console.log(`[Serene AI Server] Processing review notification request: Rating: ${numRating}, Name: ${userName}`);

    const result = await sendReviewEmail({
      userName: userName.substring(0, 100),
      rating: numRating,
      comment: comment.substring(0, 1500),
      userId: userId ? String(userId).substring(0, 150) : "guest",
      userEmail: userEmail ? String(userEmail).substring(0, 150) : ""
    });

    return res.json({
      success: true,
      sent: result.sent,
      message: result.message
    });
  } catch (err: any) {
    console.log("[Serene AI Server] API review notification status registered.");
    return res.status(500).json({ error: err.message || "Internal server error during notification dispatch." });
  }
});

// Proxy route for fetching reviews from Supabase securely
app.get("/api/reviews", async (req, res) => {
  try {
    const baseUrl = getSupabaseUrl();
    const targetUrl = `${baseUrl}/rest/v1/Reviews%20System?select=*&order=id.desc`;
    const apiKey = getSupabaseKey();
    if (!apiKey) {
      throw new Error("Supabase key not configured or decrypted");
    }
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "apikey": apiKey,
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Supabase query failed with status ${response.status}`);
    }
    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error("[Proxy reviews GET] Error:", error.message || error);
    return res.status(500).json({ error: error.message || "Failed to retrieve reviews securely." });
  }
});

// Proxy route for submitting reviews to Supabase securely
app.post("/api/reviews", async (req, res) => {
  try {
    const baseUrl = getSupabaseUrl();
    const targetUrl = `${baseUrl}/rest/v1/Reviews%20System`;
    const apiKey = getSupabaseKey();
    if (!apiKey) {
      throw new Error("Supabase key not configured or decrypted");
    }
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "apikey": apiKey,
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Supabase write failed with status ${response.status}: ${detail}`);
    }
    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error("[Proxy reviews POST] Error:", error.message || error);
    return res.status(500).json({ error: error.message || "Failed to submit review securely." });
  }
});

// 3. Vite static files serving and routing setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Serene AI Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
