import React, { useState, useEffect, useRef } from "react";
import { Message } from "../types";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, X, Send, Sparkles } from "lucide-react";


// Dynamic Wellness Sponsor Ad Block Component
const AD_WELLNESS_TIPS = [
  "Breathe deeply: Inhale peace for 4 seconds, hold for 4, exhale tension for 4.",
  "Grounding check: Name 3 things you can see, 2 you can touch, and 1 you can hear.",
  "Self-Compassion: Offer yourself the same kindness you would show to a dear friend in need.",
  "Present Moment: Give yourself permission to let go of yesterday's worries for the next few minutes.",
  "Serenity Reminder: You are doing the best you can with the resources you have right now."
];

const AdBlock: React.FC = () => {
  const [tip, setTip] = useState("");
  useEffect(() => {
    const idx = Math.floor(Math.random() * AD_WELLNESS_TIPS.length);
    setTip(AD_WELLNESS_TIPS[idx]);
  }, []);

  return (
    <div className="mb-3 p-3 bg-indigo-50/40 border border-indigo-100/50 rounded-xl max-w-sm select-none text-left flex items-start gap-2.5 shadow-sm">
      <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600 shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      </div>
      <div>
        <span className="text-[9px] uppercase tracking-wider text-indigo-500 font-semibold block mb-0.5">Mindful Guidance</span>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">{tip || "Take a slow, deep breath in... and let it all focus away."}</p>
      </div>
    </div>
  );
};

// Helper utility to identify and strip the ad script blocks from visual message displays
const parseAdBlockFromText = (text: string): { cleanedText: string; hasAd: boolean } => {
  const containsAdScript = text.includes("pl29791652.effectivecpmnetwork.com") || 
                            text.includes("container-244bcc68b56ab92603af5f2fe46ab892");
  const hasAd = containsAdScript;

  let cleanedText = text;
  cleanedText = text
    .replace(/<script[^>]*src="https:\/\/pl29791652\.effectivecpmnetwork\.com\/[^>]*><\/script>/gi, "")
    .replace(/<div[^>]*id="container-244bcc68b56ab92603af5f2fe46ab892"[^>]*><\/div>/gi, "")
    .trim();

  return { cleanedText, hasAd };
};

// Safety keywords check on client
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

interface ChatViewProps {
  onTriggerSafety: (triggered: boolean) => void;
  onNavigate?: (view: any) => void;
  premiumActive: boolean;
  userId?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ onTriggerSafety, onNavigate, premiumActive, userId }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Attempt load from localStorage
    const saved = localStorage.getItem("neuraliso_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* noop */
      }
    }
    return [
      {
        id: "sys-1",
        sender: "bot",
        text: "Warm greetings, dear friend. I am Neuraliso AI, your companion in tracking emotional waves, grounding anxiety, and reframing tough thoughts. Whenever you need support, I am here. Tell me, what lies on your heart today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Feature #14: Cognitive Distortions Reframer Coach states
  const [showDistortionHelper, setShowDistortionHelper] = useState(false);
  const [scannedDistortion, setScannedDistortion] = useState<string | null>(null);

  // Real-Time Voice & Chat Assistant States
  const [voiceCallActive, setVoiceCallActive] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem("neuraliso_selected_voice") || "cLONiZ4hQ8VpQ4Sz";
  });

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem("neuraliso_selected_voice", voiceId);
  };
  const [uiModeState, setUiModeState] = useState<string>("FLOATING_HEAD");
  const [dailyCount, setDailyCount] = useState<number | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const fetchLimits = async () => {
      try {
        const response = await fetch(`/api/chat/limits?userId=${userId || "guest"}`);
        if (response.ok && active) {
          const data = await response.json();
          setDailyCount(data.daily_message_count);
          setDailyLimit(data.limit);
        }
      } catch (err) {
        console.error("Failed to fetch limits:", err);
      }
    };
    fetchLimits();
    return () => {
      active = false;
    };
  }, [userId]);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup speech synthesis on overlay unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const speakWithWebSpeech = (cleanedSpeech: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanedSpeech);
    utterance.rate = 1.05; // Conversational, warm pacing
    utterance.pitch = 1.15; // Joyful cuddly creature pitch matching full-body bear

    const voices = window.speechSynthesis.getVoices();
    // Prefer friendly high-quality voices if loaded
    const preferredVoice = voices.find(v => 
      (v.lang.startsWith("en-") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Zira")))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // Automatically resume speech recognition after speaking is complete if call is still active
      if (localStorage.getItem("neuraliso_voice_mode_active") === "true" && !isMuted) {
        startListening();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakAI = async (text: string) => {
    // Stop any currently playing audio if exists
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Clean potential markdown or brackets from speech voice so it sounds completely natural
    const cleanedSpeech = text
      .replace(/\[NAVIGATE:[a-zA-Z_]+\]/g, "")
      .replace(/\[UI_MODE:[A-Z_]+\]/g, "")
      .replace(/[*#_`]/g, " ")
      .trim();

    if (!cleanedSpeech) return;

    if (!premiumActive) {
      // Free tier users fallback directly to local system speech synthesis
      speakWithWebSpeech(cleanedSpeech);
      return;
    }

    // Try ElevenLabs realistic voice via backend proxy first!
    try {
      setIsSpeaking(true);
      const r = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanedSpeech,
          voiceId: selectedVoice,
          userId: userId
        })
      });

      if (r.ok) {
        const audioBlob = await r.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;

        audio.onplay = () => {
          setIsSpeaking(true);
        };

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          activeAudioRef.current = null;
          // Automatically resume speech recognition after speaking is complete if call is still active
          if (localStorage.getItem("neuraliso_voice_mode_active") === "true" && !isMuted) {
            startListening();
          }
        };

        audio.onerror = (e) => {
          console.warn("ElevenLabs Audio playback failed, reverting to system TTS:", e);
          setIsSpeaking(false);
          activeAudioRef.current = null;
          speakWithWebSpeech(cleanedSpeech);
        };

        await audio.play();
        return; // Success!
      } else {
        const responseData = await r.json().catch(() => ({}));
        console.warn("ElevenLabs generation failed or key is not configured. Falling back:", responseData.error || r.statusText);
      }
    } catch (e) {
      console.warn("Could not reach ElevenLabs proxy server, using web voice synthesis fallback:", e);
    }

    // Default Fallback
    speakWithWebSpeech(cleanedSpeech);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Voice input selection is not supported in this browser. Please use the text input option below.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        sendVoiceQuery(transcript);
      }
    };

    rec.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        setSpeechError("Microphone access denied. Please verify frame permissions.");
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.warn("Failed to start speech recognition:", e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const sendVoiceQuery = async (text: string) => {
    if (!text.trim()) return;

    // Direct local command evaluation support
    const normalizedCmd = text.trim().toLowerCase();
    if (normalizedCmd === "/clear" || normalizedCmd === "clear chat" || normalizedCmd === "reset chat") {
      speakAI("I am clearing our companion record now.");
      setMessages([
        {
          id: "sys-fresh-voice",
          sender: "bot",
          text: "I have successfully cleared all our chat records and reset your conversation space. 🙏 Tell me, what's on your mind?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      localStorage.removeItem("neuraliso_chat_history");
      return;
    }

    // Check for safety violations
    const hasViolation = SAFETY_KEYWORDS.some(k => normalizedCmd.includes(k));
    if (hasViolation) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      stopListening();
      setVoiceCallActive(false);
      localStorage.removeItem("neuraliso_voice_mode_active");
      onTriggerSafety(true);
      return;
    }

    const userMsgId = "msg-" + Date.now();
    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const historyMapped = messages
        .filter(m => !m.id.startsWith("sys-"))
        .slice(-6) // optimize context length
        .map(m => ({
          role: m.sender === "user" ? "user" : "model",
          text: m.text
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyMapped,
          mode: "voice",
          userId: userId || "guest"
        })
      });

      const contentType = response.headers.get("content-type");
      let data: any = {};
      if (response.ok && contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { reply: "I felt a minor ripple in my server connection. Let's take a peaceful breath." };
      }

      setIsTyping(false);

      if (data.daily_message_count !== undefined) {
        setDailyCount(data.daily_message_count);
      }
      if (data.limit !== undefined) {
        setDailyLimit(data.limit);
      }

      if (data.limitReached) {
        const botMsg: Message = {
          id: "msg-" + Date.now() + "-bot",
          sender: "bot",
          text: data.reply || "You've reached your daily message limit. Upgrade to Premium for more, or come back tomorrow.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
        setVoiceCallActive(false);
        localStorage.removeItem("neuraliso_voice_mode_active");
        speakAI(botMsg.text);
        return;
      }

      if (data.safetyTriggered) {
        onTriggerSafety(true);
        setVoiceCallActive(false);
        localStorage.removeItem("neuraliso_voice_mode_active");
        return;
      }

      let replyText = data.reply || "I am right here with you.";
      
      // Parse UI Mode from response
      let companionMode = "VOICE_CALL_ACTIVE";
      const uiModeRegex = /^\[UI_MODE:\s*([A-Z_]+)\]\s*\n?/;
      const uiMatch = replyText.match(uiModeRegex);
      if (uiMatch) {
         companionMode = uiMatch[1];
         replyText = replyText.replace(uiModeRegex, "").trim();
      }
      setUiModeState(companionMode);

      // Clean navigation targets if returned
      let targetViewToNavigate: any = null;
      const navRegex = /\[NAVIGATE:([a-zA-Z_]+)\]/;
      const match = replyText.match(navRegex);
      if (match) {
        targetViewToNavigate = match[1];
        replyText = replyText.replace(navRegex, "").trim();
      }

      const botMsg: Message = {
        id: "msg-" + Date.now() + "-bot",
        sender: "bot",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);

      // Speak AI reply aloud!
      speakAI(replyText);

      if (targetViewToNavigate && onNavigate) {
        setTimeout(() => {
          setVoiceCallActive(false);
          localStorage.removeItem("neuraliso_voice_mode_active");
          onNavigate(targetViewToNavigate);
        }, 3000);
      }
    } catch (e) {
      console.warn("Handled vocalization exception (falling back to quiet pause):", e);
      setIsTyping(false);
      speakAI("I'm sorry, my voice link struggled for a moment. Let's take a calm pause.");
    }
  };


  const DISTORTIONS_DICT = [
    { name: "All-or-Nothing", description: "Black-and-white evaluations. 'If I made one mistake, the whole thing is ruined.'", reframe: "Avoid binary terms. Replace 'ruined' with 'partially challenging, but salvageable'." },
    { name: "Catastrophizing", description: "Sprinting to the absolute worst case. 'They haven't texted, there must be a horrible crash.'", reframe: "List the 3 most likely intermediate scenarios and remind your brain what is actually happening." },
    { name: "Emotional Reasoning", description: "Assuming emotions act as evidence of danger. 'I feel panic, therefore my career is over.'", reframe: "Recognize that feelings are physical states of adrenaline, not absolute physical truths." },
    { name: "Overgeneralization", description: "Using single negative moments to define your entire future. 'Nobody ever likes my designs.'", reframe: "Find at least two real-life counter-examples to challenge the 'nobody' blanket." },
    { name: "Mind Reading", description: "Assuming you know what colleagues or partners think without talking to them.", reframe: "Remember that people are busy with their own worries. If curious, politely seek direct feedback." },
    { name: "Labeling", description: "Attaching global negative attributes to your core self. 'I am a hopeless loser.'", reframe: "Describe the specific action instead of labeling your soul. 'I made a typo, and I will fix it.'" }
  ];

  const scanThoughtForDistortions = (text: string) => {
    const normalized = text.toLowerCase();
    if (normalized.includes("always") || normalized.includes("never") || normalized.includes("ruin") || normalized.includes("perfect")) {
      setScannedDistortion("All-or-Nothing / Overgeneralization: Your thought contains absolute qualifiers ('always', 'never', or 'ruined'). Try replacing them with 'sometimes' or 'this specific instance'.");
    } else if (normalized.includes("worst") || normalized.includes("failure") || normalized.includes("horrible") || normalized.includes("fire")) {
      setScannedDistortion("Catastrophizing: Your mind is leaping to extreme danger scenarios. Write down the 3 most realistic, moderate outcomes.");
    } else if (normalized.includes("feel") && (normalized.includes("safe") || normalized.includes("clueless") || normalized.includes("bad"))) {
      setScannedDistortion("Emotional Reasoning: You are equating an internal state of fatigue or stress with objective physical truth. Distinguish body fatigue from reality.");
    } else {
      setScannedDistortion("No specific distortions detected, but look out for global labeling ('loser', 'failure') or mind-reading! Switch to your reframing cards.");
    }
  };

  useEffect(() => {
    localStorage.setItem("neuraliso_chat_history", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Check for safety violation right here
    const normalized = textToSend.toLowerCase();
    const hasViolation = SAFETY_KEYWORDS.some(k => normalized.includes(k));
    
    if (hasViolation) {
      onTriggerSafety(true);
      return;
    }

    const userMsgId = "msg-" + Date.now();
    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Dynamic clean chat on command intersection
    const normalizedText = textToSend.trim().toLowerCase();
    const isClearCommand = 
      normalizedText === "/clear" || 
      normalizedText === "/clean" ||
      normalizedText === "clear chat" || 
      normalizedText === "clean chat" || 
      normalizedText === "reset chat" || 
      normalizedText === "reset conversation" ||
      normalizedText === "clear conversation" ||
      normalizedText === "clean the data of the chat";

    if (isClearCommand) {
      setTimeout(() => {
        const resetMsg: Message = {
          id: "sys-fresh-command",
          sender: "bot",
          text: "I have successfully cleared all our chat records and reset your conversation space as you commanded. We are now starting afresh. 🙏 Tell me, what is on your mind?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([resetMsg]);
        localStorage.removeItem("neuraliso_chat_history");
        setIsTyping(false);
      }, 800);
      return;
    }

    try {
      // Map existing messages list to compatible chat history
      const historyMapped = messages
        .filter(m => !m.id.startsWith("sys-"))
        .map(m => ({
          role: m.sender === "user" ? "user" : "model",
          text: m.text
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyMapped,
          userId: userId || "guest"
        })
      });

      const contentType = response.headers.get("content-type");
      let data: any = {};
      if (response.ok && contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn("[Chat API Fallback] Non-JSON or status error content:", text.substring(0, 120));
        data = { reply: "I felt a momentary wobble in my mental frequency. Let's take a calm breath and try again." };
      }
      setIsTyping(false);

      if (data.daily_message_count !== undefined) {
        setDailyCount(data.daily_message_count);
      }
      if (data.limit !== undefined) {
        setDailyLimit(data.limit);
      }

      if (data.limitReached) {
        const botMsg: Message = {
          id: "msg-" + Date.now() + "-bot",
          sender: "bot",
          text: data.reply || "You've reached your daily message limit. Upgrade to Premium for more, or come back tomorrow.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
        return;
      }

      if (data.safetyTriggered) {
        onTriggerSafety(true);
        return;
      }

      // Intercept and strip programmatic navigation commands like [NAVIGATE:relief]
      let finalBotText = data.reply || "I am right here with you. Take your time.";
      
      // Parse and strip UI_MODE programmatically
      let targetUIState = "FLOATING_HEAD";
      const uiModeRegex = /^\[UI_MODE:\s*([A-Z_]+)\]\s*\n?/;
      const uiMatch = finalBotText.match(uiModeRegex);
      if (uiMatch) {
         targetUIState = uiMatch[1];
         finalBotText = finalBotText.replace(uiModeRegex, "").trim();
      }
      setUiModeState(targetUIState);

      let targetViewToNavigate: any = null;
      const navRegex = /\[NAVIGATE:([a-zA-Z_]+)\]/;
      const match = finalBotText.match(navRegex);
      if (match) {
        targetViewToNavigate = match[1];
        finalBotText = finalBotText.replace(navRegex, "").trim();
      }

      const botMsg: Message = {
        id: "msg-" + Date.now() + "-bot",
        sender: "bot",
        text: finalBotText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);

      // If navigation command is detected, execute it after a minor reading-friendly timeout
      if (targetViewToNavigate && onNavigate) {
        setTimeout(() => {
          onNavigate(targetViewToNavigate);
        }, 1500);
      }
    } catch (e) {
      console.warn("Handled message processing exception (falling back gracefully):", e);
      setIsTyping(false);
      const errMsg: Message = {
        id: "msg-err",
        sender: "bot",
        text: "I felt a momentary wobble in my mental frequency. Let's take a calm breath and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  // Preset prompt options to remove burden from anxious users
  const templates = [
    { label: "Reframing a worry", text: "Help me reframe a negative thought or worry that is building up in my mind." },
    { label: "Feeling anxious", text: "I am feeling a wave of physical anxiety. Could you guide me through a calming CBT thought reframe?" },
    { label: "Reflecting on my day", text: "I want to share my thoughts and gratitude for the day with you and reflect." }
  ];

  const clearChat = () => {
    if (confirm("Would you like to clear our conversation history to start afresh?")) {
      const initial = [
        {
          id: "sys-fresh",
          sender: "bot",
          text: "I've carefully reset our space. Whenever you're ready, take a quiet inhale and let me know how I can comfort you.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(initial);
      localStorage.removeItem("neuraliso_chat_history");
    }
  };

  return (
    <div id="ai-chat-view" className="flex flex-col h-[74vh] max-w-xl mx-auto px-1 animate-fade-in">
      
      {/* Header with clear button */}
      <div id="chat-sub-header" className="wellness-card rounded-b-none p-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white border border-b-none border-indigo-100/10">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-sm" />
          <div>
            <h3 className="font-sans font-bold text-dark-text text-sm">Neuraliso AI Companion</h3>
            <p className="text-[10px] text-muted-text">Powered by Gemini CBT Guard</p>
            {dailyLimit !== null && dailyCount !== null && (
              <p className="text-[9px] text-indigo-600 font-semibold mt-0.5 font-mono">
                {Math.max(0, dailyLimit - dailyCount)} of {dailyLimit} messages left today
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Custom Voice selector dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Voice:</span>
            <select
              value={selectedVoice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="text-[10px] font-bold text-slate-800 bg-transparent border-none outline-none focus:ring-0 p-0 pr-6 cursor-pointer"
            >
              <option value="cLONiZ4hQ8VpQ4Sz">Gradium (Custom)</option>
              <option value="y50Lj77zmtFWFcuY">Aura (Classic)</option>
            </select>
          </div>

          <button
            onClick={() => {
              setVoiceCallActive(true);
              localStorage.setItem("neuraliso_voice_mode_active", "true");
              speakAI("Hey there! I'm right here with you. Take a deep breath—how are you feeling in this moment?");
            }}
            className="text-[11px] text-deep-sage hover:text-emerald-850 transition-all font-bold flex items-center gap-1.5 px-3 py-1.5 bg-soft-green/35 rounded-full cursor-pointer hover:scale-105 active:scale-95"
            title="Start live Voice Stream connection with chosen voice"
          >
            <Phone size={11} fill="currentColor" />
            <span>Voice Call</span>
          </button>
          <button
            id="clear-chat-history-btn"
            onClick={clearChat}
            className="text-[10px] text-muted-text hover:text-danger-red transition-all font-bold underline cursor-pointer"
          >
            Reset Space
          </button>
        </div>
      </div>

      {/* Message logs area */}
      <div id="message-container-scroller" className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[40vh] bg-transparent">
        {/* Dynamic Sponsor Banner */}
        <AdBlock />

        {messages.map((m) => {
          const isBot = m.sender === "bot";
          const { cleanedText, hasAd } = parseAdBlockFromText(m.text);
          return (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${
                isBot ? "self-start" : "self-end ml-auto"
              }`}
            >
              {/* Message bubble */}
              <div
                className={`p-3.5 rounded-[24px] ${
                  isBot
                    ? "bg-transparent neu-flat-sm text-dark-text rounded-tl-sm border-l-2 border-l-primary-sage/45"
                    : "bg-primary-sage text-white rounded-tr-sm shadow-[4px_4px_10px_var(--neu-shadow)]"
                }`}
              >
                {isBot && hasAd && <AdBlock />}
                <p className="text-xs font-sans leading-relaxed whitespace-pre-line">{cleanedText}</p>
                
                {/* AI Badge display */}
                {isBot && m.id.startsWith("sys-") && (
                  <span className="inline-block mt-2 text-[9px] px-2 py-0.5 rounded-full font-bold neu-inset-sm text-deep-sage">
                    Compassion Guide
                  </span>
                )}
              </div>

              {/* Timestamp label */}
              <span className={`text-[9px] text-muted-text mt-1.5 px-1.5 font-mono ${
                isBot ? "text-left" : "text-right"
              }`}>
                {m.timestamp}
              </span>
            </div>
          );
        })}

        {/* Typing feedback dots */}
        {isTyping && (
          <div className="flex items-center gap-1 px-4 py-3 rounded-2xl neu-flat-sm max-w-[110px] self-start ml-1 rounded-tl-none text-dark-text">
            <span className="w-1.5 h-1.5 bg-primary-sage rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-primary-sage rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-primary-sage rounded-full animate-bounce" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset starter Templates */}
      <div id="chat-presets-bar" className="p-3.5 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none bg-transparent">
        {templates.map((t, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(t.text)}
            className="text-[10px] text-primary-sage font-bold py-1.5 px-3.5 neu-btn shrink-0"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CBT Cognitive Distortions Reframing Deck (Feature #14) */}
      <div id="cbt-distortions-deck" className="px-3 py-1 bg-transparent space-y-2">
        <div className="flex justify-between items-center bg-white/50 p-2 rounded-2xl border border-slate-100/80 shadow-sm">
          <span className="text-[10px] font-bold text-dark-text flex items-center gap-1.5">
            <span>🧠</span>
            <span>CBT bias reframer dashboard</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              id="scan-thought-distortions-btn"
              onClick={() => {
                scanThoughtForDistortions(inputText);
                setShowDistortionHelper(true);
              }}
              className="text-[9px] font-bold px-2.5 py-1.5 bg-blue-50 text-blue-900 border border-blue-100 rounded-lg hover:bg-blue-100 active:scale-95 cursor-pointer"
            >
              Scan input for distortions
            </button>
            <button
              type="button"
              id="toggle-distortion-tray-btn"
              onClick={() => {
                setShowDistortionHelper(!showDistortionHelper);
                if (scannedDistortion) setScannedDistortion(null);
              }}
              className="text-[9px] font-bold px-2.5 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:scale-95 cursor-pointer"
            >
              {showDistortionHelper ? "Close Guides" : "Cheat Sheets"}
            </button>
          </div>
        </div>

        {showDistortionHelper && (
          <div className="wellness-card p-4 space-y-3.5 animate-slide-in max-h-56 overflow-y-auto">
            {scannedDistortion && (
              <div id="distortion-scan-result" className="p-3 rounded-xl bg-orange-50 border border-orange-100 text-[10px] text-orange-950 leading-relaxed font-sans">
                <span className="font-bold block uppercase mb-1">🔍 Real-time Thought Scan Output:</span>
                "{scannedDistortion}"
              </div>
            )}

            <span className="text-[10px] uppercase font-mono font-bold text-muted-text block">10 Cognitive Distortions Cheat Sheets:</span>
            <div className="grid grid-cols-1 gap-2.5">
              {DISTORTIONS_DICT.map((d, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-left">
                  <span className="text-xs font-bold text-slate-800 block">{d.name} Error</span>
                  <p className="text-[10px] text-muted-text leading-relaxed">{d.description}</p>
                  <div className="text-[10.5px] text-teal-800 bg-teal-50/50 p-2 rounded border border-teal-100/50 font-serif italic mt-1.5">
                    <span className="font-sans font-bold uppercase text-[8px] tracking-wide text-teal-900 block not-italic mb-0.5">Clinical Reframe Technique:</span>
                    "{d.reframe}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Text form area */}
      <form
        id="chat-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="wellness-card rounded-t-none p-3 flex items-center gap-2.5"
      >
        <input
          id="chat-message-text-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Share your thoughts gently..."
          className="flex-1 p-3 neu-field text-xs placeholder-muted-text text-dark-text"
        />
        <button
          id="send-message-btn"
          type="submit"
          className="bg-primary-sage text-white p-3 rounded-full hover:bg-deep-sage active:scale-90 transition-all shadow-md shadow-primary-sage/25 font-bold shrink-0"
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

      <p className="text-[9px] text-muted-text text-center mt-2.5 italic">
        Caution: Chat responses are guidance vectors only. For extreme scenarios, check our hotline directory directly.
      </p>

      {voiceCallActive && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-55 flex flex-col justify-between p-6 text-white animate-fade-in font-sans">
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">Live Aura Voice Session</span>
            </div>
            <button
              onClick={() => {
                setVoiceCallActive(false);
                localStorage.removeItem("neuraliso_voice_mode_active");
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                stopListening();
              }}
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-all transform active:scale-90 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Central mascot graphic */}
          <div className="text-center flex-1 flex flex-col justify-center py-6">
            {/* Full-Body Mascot render on call screen */}
            <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
              {/* Pulsing visual halo backing */}
              <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                isSpeaking 
                  ? "bg-emerald-500/10 scale-125 animate-ping" 
                  : isListening 
                  ? "bg-blue-500/10 scale-110 animate-pulse" 
                  : "bg-slate-500/5 animate-pulse-slow"
              }`} style={{ animationDuration: '3s' }} />
              
              <svg viewBox="0 0 100 120" className={`w-40 h-40 relative z-10 select-none drop-shadow-md transition-all duration-500 ${
                uiModeState === "FULL_BODY_CELEBRATION" ? "animate-bounce" : ""
              }`}>
                {/* Bear head */}
                <circle cx="50" cy="45" r="28" fill="#8AC2F0" />
                
                {/* Bear Ears */}
                <circle cx="26" cy="22" r="10" fill="#8AC2F0" />
                <circle cx="26" cy="22" r="6" fill="#F49EB4" />
                <circle cx="74" cy="22" r="10" fill="#8AC2F0" />
                <circle cx="74" cy="22" r="6" fill="#F49EB4" />
                
                {/* Headband Green Leaf Icon */}
                <path d="M 50 14 C 46 14, 45 18, 50 20 C 55 18, 54 14, 50 14 Z" fill="#60A166" />
                
                {/* White Face Muzzle Patch */}
                <ellipse cx="50" cy="57" rx="14" ry="10" fill="#FFFFFF" />
                
                {/* Cheek Blush */}
                <circle cx="32" cy="55" r="4" fill="#F8A5C2" opacity="0.8" />
                <circle cx="68" cy="55" r="4" fill="#F8A5C2" opacity="0.8" />

                {/* Eyes */}
                <circle cx="38" cy="46" r="3.5" fill="#3D291F" />
                <circle cx="37" cy="45" r="1" fill="#FFFFFF" />
                <circle cx="62" cy="46" r="3.5" fill="#3D291F" />
                <circle cx="61" cy="45" r="1" fill="#FFFFFF" />
                
                {/* Nose & Mouth */}
                <path d="M 47 52 L 53 52 Q 50 55 47 52" fill="#3D291F" />
                <path d="M 47 57 Q 50 61 53 57" fill="none" stroke="#3D291F" strokeWidth="1" strokeLinecap="round" />

                {/* Body */}
                <path d="M 30 73 C 25 78, 25 105, 50 105 C 75 105, 75 78, 70 73 Z" fill="#8AC2F0" />
                
                {/* White belly patch */}
                <ellipse cx="50" cy="88" rx="15" ry="12" fill="#FFFFFF" />
                
                {/* Paws */}
                <circle cx="22" cy="80" r="6" fill="#8AC2F0" />
                <circle cx="78" cy="80" r="6" fill="#8AC2F0" />
                
                {/* Feet */}
                <circle cx="35" cy="107" r="7" fill="#8AC2F0" />
                <circle cx="65" cy="107" r="7" fill="#8AC2F0" />
              </svg>
            </div>

            <h3 className="text-xl font-serif font-bold italic tracking-wide">
              {selectedVoice === "cLONiZ4hQ8VpQ4Sz" ? "Gradium the Companion" : "Aura the Mascot"}
            </h3>
            <p className="text-xs text-slate-400 capitalize mt-1.5 transition-all">
              {isSpeaking 
                ? `🗣️ ${selectedVoice === "cLONiZ4hQ8VpQ4Sz" ? "Gradium" : "Aura"} is speaking...` 
                : isListening 
                ? "🎙️ Listening to you..." 
                : `⏳ ${selectedVoice === "cLONiZ4hQ8VpQ4Sz" ? "Gradium" : "Aura"} is resting...`}
            </p>

            {/* Subtitles as speech fallback readout */}
            <div className="mt-8 px-5 py-4 bg-slate-900/80 border border-slate-800 rounded-2xl max-w-sm mx-auto text-xs text-slate-200 min-h-[64px] flex items-center justify-center font-sans">
              {messages[messages.length - 1] 
                ? (messages[messages.length - 1].sender === "bot" 
                   ? `${selectedVoice === "cLONiZ4hQ8VpQ4Sz" ? "Gradium" : "Aura"}: "${parseAdBlockFromText(messages[messages.length - 1].text).cleanedText}"` 
                   : `You: "${messages[messages.length - 1].text}"`)
                : `${selectedVoice === "cLONiZ4hQ8VpQ4Sz" ? "Gradium" : "Aura"} is initializing...`}
            </div>

            {speechError && (
              <p className="text-[10px] text-amber-400 mt-3 max-w-xs mx-auto">
                ⚠️ {speechError}
              </p>
            )}
          </div>

          {/* Action buttons footer */}
          <div className="space-y-4">
            {/* Fallback input for text or muted typing */}
            <div className="flex gap-2.5 max-w-sm mx-auto bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
              <input
                type="text"
                placeholder="Type your reply here instead..."
                className="flex-1 bg-transparent text-xs px-3 py-2 text-white outline-none placeholder-slate-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    sendVoiceQuery(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-center gap-6 pb-6">
              {/* Mute button */}
              <button
                onClick={() => {
                  if (isMuted) {
                    setIsMuted(false);
                    startListening();
                  } else {
                    setIsMuted(true);
                    stopListening();
                  }
                }}
                className={`p-4 rounded-full transition-all transform active:scale-90 cursor-pointer ${
                  isMuted ? "bg-red-500/20 text-red-400 border border-red-500" : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* End session key button */}
              <button
                onClick={() => {
                  setVoiceCallActive(false);
                  localStorage.removeItem("neuraliso_voice_mode_active");
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  stopListening();
                }}
                className="px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 font-bold text-xs flex items-center gap-2 tracking-wider uppercase transition-all shadow-lg shadow-rose-600/35 cursor-pointer transform active:scale-95"
              >
                <PhoneOff size={14} fill="currentColor" />
                <span>End Call</span>
              </button>

              {/* Manually retrigger mic if needed */}
              {!isMuted && !isSpeaking && !isListening && (
                <button
                  onClick={startListening}
                  className="p-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse cursor-pointer"
                  title="Force Listen"
                >
                  <Volume2 size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
