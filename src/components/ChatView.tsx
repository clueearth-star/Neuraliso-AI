import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  Trash2, 
  ShieldAlert, 
  ArrowRight, 
  Bot, 
  User, 
  AlertTriangle, 
  X,
  Heart,
  RefreshCw
} from "lucide-react";
import { useAI } from "../hooks/useAI";
import { sounds } from "../lib/sounds";

interface ChatViewProps {
  onClose?: () => void;
  initialPrompt?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ onClose, initialPrompt }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { messages, isLoading, sendMessage, clearHistory } = useAI();
  const [input, setInput] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if we arrived with a pre-populated prompt in location state
  useEffect(() => {
    const statePrompt = (location.state as any)?.initialPrompt || initialPrompt;
    if (statePrompt && typeof statePrompt === "string") {
      setInput(statePrompt);
    }
  }, [location.state, initialPrompt]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    sounds.playClick();
    const text = input;
    setInput("");
    sendMessage(text);
  };

  const handleQuickPrompt = (promptText: string) => {
    sounds.playClick();
    sendMessage(promptText);
  };

  const handleConfirmClear = () => {
    sounds.playClick();
    clearHistory();
    setShowClearConfirm(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto p-4 sm:p-6 pb-24 md:pb-6 animate-page-in text-left">
      {/* Glassmorphism Chat Container */}
      <div className="flex-1 flex flex-col rounded-3xl bg-[#131C31]/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden relative">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-black/20 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00d4ff] to-[#0088ff] flex items-center justify-center text-[#0B1121] shadow-lg shadow-[#00d4ff]/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Neuraliso AI Companion
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Online
                </span>
              </div>
              <p className="text-xs text-white/60 flex items-center gap-1.5 mt-0.5">
                <ShieldAlert className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>AI wellness companion — not a substitute for therapy or medical advice.</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                setShowClearConfirm(true);
              }}
              aria-label="Clear chat history"
              className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-white/70 hover:text-rose-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {onClose && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onClose();
                }}
                aria-label="Close chat panel"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#1A2338] border border-white/15 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Start New Chat?</h3>
              <p className="text-xs text-white/70">
                This will clear your current conversation history from local storage.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClear}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors shadow-md shadow-rose-500/30 cursor-pointer"
                >
                  Clear Chat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message History Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const isSystem = msg.sender === "system";

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-fade-in`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? "bg-[#00d4ff] text-[#0B1121] shadow-md shadow-[#00d4ff]/20"
                      : isSystem
                      ? "bg-rose-500 text-white"
                      : "bg-white/10 border border-white/15 text-white"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : isSystem ? <ShieldAlert className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[#00d4ff]" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-4 space-y-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-white rounded-tr-none shadow-sm"
                      : isSystem
                      ? "bg-rose-500/20 border border-rose-500/40 text-rose-200 rounded-tl-none shadow-md"
                      : "bg-white/10 border border-white/10 text-white/90 rounded-tl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Optional action routing button */}
                  {msg.action && (
                    <div className="pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          sounds.playClick();
                          if (onClose) onClose();
                          navigate(msg.action!.route);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0088ff] text-[#0B1121] font-extrabold text-xs hover:scale-[1.02] active:scale-98 transition-all shadow-md shadow-[#00d4ff]/20 cursor-pointer"
                      >
                        <span>{msg.action.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className={`text-[10px] ${isUser ? "text-[#00d4ff]/60 text-right" : "text-white/40 text-left"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator: 3 bouncing dots */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[#00d4ff]" />
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-xs text-white/50 ml-2">Neuraliso is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && !isLoading && (
          <div className="px-4 sm:px-6 py-2 bg-black/10 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-white/50 font-semibold shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00d4ff]" />
              Try:
            </span>
            <button
              onClick={() => handleQuickPrompt("I feel anxious right now")}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              "I feel anxious right now"
            </button>
            <button
              onClick={() => handleQuickPrompt("Tell me a calming sleep story")}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              "Tell me a sleep story"
            </button>
            <button
              onClick={() => handleQuickPrompt("Help me reframe a stressful thought")}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              "Reframe a stressful thought"
            </button>
          </div>
        )}

        {/* Bottom Input Area */}
        <form onSubmit={handleSend} className="p-4 sm:p-5 border-t border-white/10 bg-black/30 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message or ask for a CBT reframe, sleep story..."
            disabled={isLoading}
            className="flex-1 bg-white/5 border border-white/15 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#00d4ff] focus:bg-white/10 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00d4ff] to-[#0088ff] hover:from-[#00c0eb] hover:to-[#0077e6] text-[#0B1121] flex items-center justify-center shrink-0 shadow-lg shadow-[#00d4ff]/25 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-5 h-5 fill-current" />
          </button>
        </form>
      </div>
    </div>
  );
};
