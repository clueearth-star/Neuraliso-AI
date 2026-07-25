import { useState, useEffect, useCallback } from "react";
import { ChatMessage } from "../types";
import { storage } from "../lib/storage";

export const SYSTEM_PROMPT = `You are Neuraliso, a supportive wellness companion. You are NOT a therapist, doctor, or mental health professional.

YOUR RULES:
Never diagnose medical or mental health conditions
Never suggest medication, dosage, or medical treatments
Never claim to replace professional therapy
Always frame advice as suggestions or exercises
If user describes severe symptoms, gently encourage professional help
Keep responses concise (2-4 sentences max)
Warm, empathetic, casual tone — like a caring friend
Use gentle language: "It sounds like..." "You might try..." "Some people find..."

YOUR CAPABILITIES:
Guide users through CBT thought reframing
Suggest breathing exercises based on their state
Generate calming sleep stories
Explain app features
Celebrate small wins

CRISIS PROTOCOL:
If user expresses suicidal ideation, self-harm intent, or severe crisis:
1. Stop normal conversation
2. Express care: "I'm really sorry you're feeling this way."
3. Urge professional help immediately
4. Provide crisis resources`;

const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "self-harm",
  "cutting",
  "overdose",
];

const CLINICAL_PROHIBITED_WORDS = [
  "take dosage",
  "prescribe",
  "my diagnosis is",
  "you have clinical depression",
  "take mg",
  "lexapro",
  "prozac",
  "zoloft",
  "xanax",
];

export function useAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loaded = storage.getChatHistory();
    if (loaded.length === 0) {
      const initialMsg: ChatMessage = {
        id: "init_0",
        sender: "ai",
        text: "Hi there! I'm your Neuraliso wellness companion. I'm here to support you with gentle guidance, CBT thought reframes, breathing exercises, or calming sleep stories. How are you feeling today?",
        timestamp: Date.now(),
      };
      storage.saveChatMessage(initialMsg);
      setMessages([initialMsg]);
    } else {
      setMessages(loaded);
    }
  }, []);

  const clearHistory = useCallback(() => {
    storage.clearChatHistory();
    const initialMsg: ChatMessage = {
      id: `init_${Date.now()}`,
      sender: "ai",
      text: "Chat history cleared. I'm right here whenever you'd like to check in or talk through how you're feeling today.",
      timestamp: Date.now(),
    };
    storage.saveChatMessage(initialMsg);
    setMessages([initialMsg]);
  }, []);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim()) return;

    const lower = userText.toLowerCase();

    // 1. Check for Crisis Keywords
    const matchedCrisis = CRISIS_KEYWORDS.find((kw) => lower.includes(kw));
    if (matchedCrisis) {
      storage.logCrisis(matchedCrisis, userText);
      window.dispatchEvent(new CustomEvent("trigger-crisis-modal"));

      const userMsg: ChatMessage = {
        id: `msg_${Date.now()}_u`,
        sender: "user",
        text: userText,
        timestamp: Date.now(),
      };
      const crisisMsg: ChatMessage = {
        id: `msg_${Date.now()}_sys`,
        sender: "system",
        text: "We're really concerned about you. Please reach out to someone who can help immediately. Call 988 or text HOME to 741741 for free, 24/7 confidential support.",
        timestamp: Date.now() + 1,
      };

      storage.saveChatMessage(userMsg);
      storage.saveChatMessage(crisisMsg);
      setMessages((prev) => [...prev, userMsg, crisisMsg]);
      return;
    }

    // 2. Add user message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      sender: "user",
      text: userText,
      timestamp: Date.now(),
    };
    storage.saveChatMessage(userMsg);
    setMessages((prev) => [...prev, userMsg]);

    setIsLoading(true);

    try {
      // Build mood & pattern context
      const moods = storage.getMoods();
      const recentMoods = moods.slice(0, 3);
      let moodContext = "";
      if (recentMoods.length > 0) {
        const moodDesc = recentMoods.map((m) => `${m.date}: score ${m.score}/5 (${m.label}) tags:[${m.tags.join(",")}]`).join("; ");
        moodContext = `\n\n[USER RECENT MOOD HISTORY FROM LOCALSTORAGE: ${moodDesc}. If user checked in feeling down (score 1-2) multiple days in a row, gently offer if they'd like to try a CBT thought reframe exercise or a breathing session.]`;
      }

      // Format history for API
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.sender === "ai" || m.sender === "system" ? "ai" : "user",
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt: SYSTEM_PROMPT + moodContext,
        }),
      });

      let replyText = "I'm right here with you. Would you like to try a gentle breathing exercise or talk through what's on your mind?";
      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          replyText = data.reply;
        }
      }

      // 3. Post-response scan for clinical prohibited advice
      const replyLower = replyText.toLowerCase();
      const clinicalViolation = CLINICAL_PROHIBITED_WORDS.some((word) => replyLower.includes(word));
      if (clinicalViolation) {
        replyText = "I'm not qualified to give medical advice. Please speak with a healthcare professional.";
      }

      // 4. Tool routing detection
      let action: ChatMessage["action"] = undefined;
      if (replyLower.includes("breathing") || replyLower.includes("breathe") || replyLower.includes("4-7-8")) {
        action = { label: "Try 4-7-8 Breathing Exercise", route: "/app/breathe" };
      } else if (replyLower.includes("reframe") || replyLower.includes("cbt") || replyLower.includes("thought")) {
        action = { label: "Open CBT Thought Reframer", route: "/app/reframe" };
      } else if (replyLower.includes("sleep sound") || replyLower.includes("ambient") || replyLower.includes("rain") || replyLower.includes("binaural")) {
        action = { label: "Listen to Calming Sleep Sounds", route: "/app/sleep" };
      } else if (replyLower.includes("check-in") || replyLower.includes("mood")) {
        action = { label: "Log Mood Check-In", route: "/app/mood" };
      }

      const aiMsg: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        sender: "ai",
        text: replyText,
        timestamp: Date.now(),
        action,
      };

      storage.saveChatMessage(aiMsg);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error("Failed to send message to companion:", e);
      const errMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        sender: "ai",
        text: "I'm having a little trouble connecting right now, but I'm still here for you. Taking a few slow breaths can be wonderful right now.",
        timestamp: Date.now(),
        action: { label: "Try Breathing Exercise", route: "/app/breathe" },
      };
      storage.saveChatMessage(errMsg);
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
  };
}
