import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Sparkles, Bot, Move } from "lucide-react";
import { ChatView } from "./ChatView";
import { sounds } from "../lib/sounds";
import { useDraggable } from "../hooks/useDraggable";

export const FloatingChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const { isDragging, dragRef, handlers, handleClick, style } = useDraggable({
    storageKey: "neuraliso_chat_bubble_pos",
    defaultCorner: "bottom-left",
    defaultOffset: { x: 24, y: 24 },
    zIndex: 40,
  });

  // If already on the dedicated /app/chat route, we don't need the floating button
  if (location.pathname.includes("/chat")) {
    return null;
  }

  const handleToggle = () => {
    sounds.playClick();
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Floating Chat Button - Draggable */}
      <div
        ref={dragRef}
        style={style}
        {...handlers}
        className={`transition-shadow duration-200 select-none ${
          isDragging ? "cursor-grabbing scale-110 z-50 ring-2 ring-white/40 rounded-full" : "cursor-grab"
        }`}
      >
        <button
          onClick={handleClick(handleToggle)}
          aria-label="Open Neuraliso AI Companion (Drag anywhere to reposition)"
          title="Click to open • Drag anywhere to move"
          className="group relative flex items-center gap-2.5 px-4 h-14 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#0088ff] text-[#0B1121] font-extrabold shadow-[0_4px_25px_rgba(0,212,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto cursor-pointer"
        >
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0B1121] rounded-full animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-[#0B1121]/15 flex items-center justify-center text-[#0B1121]">
            {isOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <MessageCircle className="w-5 h-5 fill-current" />}
          </div>
          <span className="text-sm font-bold tracking-tight pr-1 hidden sm:inline">
            {isOpen ? "Close AI Chat" : "AI Companion"}
          </span>
          <Move className="w-3.5 h-3.5 opacity-50 group-hover:opacity-90 transition-opacity ml-0.5 shrink-0" />
        </button>
      </div>

      {/* Slide-up panel / Drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:justify-end bg-black/60 backdrop-blur-sm p-0 md:p-6 animate-fade-in">
          {/* Backdrop click to close */}
          <div 
            className="absolute inset-0 z-0" 
            onClick={() => {
              sounds.playClick();
              setIsOpen(false);
            }} 
          />

          {/* Panel Container: Slide up on mobile, slide in sidebar on desktop */}
          <div className="relative z-10 w-full md:w-[480px] lg:w-[540px] h-[85vh] md:h-[calc(100vh-3rem)] max-h-[800px] bg-[#0B1121]/95 md:rounded-3xl rounded-t-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col animate-slide-up">
            <ChatView onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};
