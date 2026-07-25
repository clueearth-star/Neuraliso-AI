import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [], systemPrompt = "" } = req.body;

    // 1. Try NVIDIA NIM API if key is available
    if (process.env.NVIDIA_API_KEY) {
      try {
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta/llama-3.1-70b-instruct",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.map((m: any) => ({
                role: m.role === "ai" ? "assistant" : "user",
                content: m.content
              }))
            ],
            temperature: 0.7,
            max_tokens: 800
          })
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({ reply });
          }
        } else {
          console.warn("NVIDIA NIM API returned non-OK status:", response.status);
        }
      } catch (nvidiaErr) {
        console.warn("NVIDIA NIM API call failed, trying fallback:", nvidiaErr);
      }
    }

    // 2. Fallback to Gemini if key is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const lastUserMsg = messages[messages.length - 1]?.content || "";
        const historyText = messages.slice(0, -1).map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
        const prompt = `${systemPrompt}\n\nChat History:\n${historyText}\n\nUSER: ${lastUserMsg}\nASSISTANT:`;
        
        const genRes = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        const reply = genRes.text;
        if (reply) {
          return res.json({ reply });
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed, using offline intelligent companion:", geminiErr);
      }
    }

    // 3. Robust Offline / Simulation Fallback
    const lastUserMsg = (messages[messages.length - 1]?.content || "").toLowerCase();
    let reply = "I'm right here with you. How are you feeling right now, and what kind of support would feel most helpful today?";
    
    if (lastUserMsg.includes("sleep story") || lastUserMsg.includes("story") || lastUserMsg.includes("bedtime") || lastUserMsg.includes("cant sleep")) {
      reply = "Imagine you are walking along a quiet path just before twilight. The sky is tinted with soft indigo and lavender, and a gentle breeze rustles through the pine needles above.\n\nAs you find a comfortable wooden bench overlooking a calm mountain lake, you notice how the still water reflects the first evening stars. With every slow breath you exhale, your shoulders sink a little lower, releasing whatever tension you held from the day.\n\nYou are safe here, surrounded by quiet stillness. Notice the weight of your body resting completely supported, letting go of any remaining thoughts as you drift into deep, restful peace.";
    } else if (lastUserMsg.includes("reframe") || lastUserMsg.includes("cbt") || lastUserMsg.includes("thought") || lastUserMsg.includes("work") || lastUserMsg.includes("bad day")) {
      reply = "Let's walk through a quick CBT thought reframe together. Step 1: What was the specific situation or trigger that happened? And what automatic negative thought immediately popped into your mind?";
    } else if (lastUserMsg.includes("breathe") || lastUserMsg.includes("anxious") || lastUserMsg.includes("anxiety") || lastUserMsg.includes("stress") || lastUserMsg.includes("panic") || lastUserMsg.includes("overwhelmed") || lastUserMsg.includes("4-7-8")) {
      reply = "It sounds like things feel really overwhelming or stressful right now. When anxiety hits, slowing down our nervous system with breath is one of the quickest ways to regain calm. Would you like to try a gentle 4-7-8 breathing exercise together?";
    } else if (lastUserMsg.includes("down") || lastUserMsg.includes("sad") || lastUserMsg.includes("depressed") || lastUserMsg.includes("unhappy")) {
      reply = "I'm really sorry you're feeling down right now. Please know that whatever you're feeling is valid, and you don't have to carry it all alone. Would you like to talk through what's on your mind, or maybe listen to some calming ambient sounds?";
    } else if (lastUserMsg.includes("hello") || lastUserMsg.includes("hi") || lastUserMsg.includes("hey") || lastUserMsg.includes("start") || lastUserMsg.includes("who are you")) {
      reply = "Hi there! I'm your Neuraliso companion. I'm here to support your daily wellness, guide you through CBT exercises, generate calming sleep stories, or just listen whenever you want to check in. How are you doing right now?";
    }

    return res.json({ reply });
  } catch (err: any) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

async function startServer() {
  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
