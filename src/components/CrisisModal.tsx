import React, { useState, useEffect } from "react";
import { Heart, Phone, MessageSquare, MapPin, X, ShieldAlert, Move } from "lucide-react";
import { sounds } from "../lib/sounds";
import { useDraggable } from "../hooks/useDraggable";

export const CrisisModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { isDragging, dragRef, handlers, handleClick, style } = useDraggable({
    storageKey: "neuraliso_sos_bubble_pos",
    defaultCorner: "bottom-right",
    defaultOffset: { x: 24, y: 24 },
    zIndex: 50,
  });

  useEffect(() => {
    const handleTrigger = () => {
      setIsOpen(true);
    };
    window.addEventListener("trigger-crisis-modal", handleTrigger);
    return () => window.removeEventListener("trigger-crisis-modal", handleTrigger);
  }, []);

  const handleOpen = () => {
    sounds.playClick();
    setIsOpen(true);
  };

  const handleClose = () => {
    sounds.playClick();
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Red Heart Button - Draggable */}
      <div
        ref={dragRef}
        style={style}
        {...handlers}
        className={`transition-shadow duration-200 select-none ${
          isDragging ? "cursor-grabbing scale-110 z-[60] ring-2 ring-white/40 rounded-full" : "cursor-grab"
        }`}
      >
        <button
          onClick={handleClick(handleOpen)}
          aria-label="Immediate Crisis Help & Resources (Drag anywhere to reposition)"
          title="Click for SOS Help • Drag anywhere to move"
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-rose-600 text-white shadow-[0_4px_20px_rgba(244,63,94,0.5)] hover:bg-rose-500 hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto cursor-pointer animate-soft-pulse"
        >
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-400 rounded-full animate-ping" />
          <Heart className="w-6 h-6 fill-current text-white group-hover:scale-110 transition-transform" />
          <Move className="w-3 h-3 text-white/70 absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Crisis Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-page-in">
          <div 
            className="w-full max-w-lg bg-[#1A2338] border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-2xl relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crisis-modal-title"
          >
            {/* Close X button top right */}
            <button
              onClick={handleClose}
              aria-label="Close crisis help modal"
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 id="crisis-modal-title" className="text-2xl font-bold text-white tracking-tight">
                  Need help right now?
                </h3>
                <p className="text-sm text-white/70">
                  You are not alone. Immediate support is free, confidential, and available 24/7.
                </p>
              </div>
            </div>

            {/* Emergency Action Cards */}
            <div className="space-y-3 pt-2">
              <a
                href="tel:988"
                onClick={() => sounds.playClick()}
                className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white transition-all shadow-lg shadow-rose-600/30 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-base font-bold block">Call 988</span>
                    <span className="text-xs text-rose-100">Suicide &amp; Crisis Lifeline (US &amp; Canada)</span>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1.5 rounded-full group-hover:bg-white group-hover:text-rose-700 transition-colors">
                  Call Now
                </span>
              </a>

              <a
                href="sms:741741?body=HOME"
                onClick={() => sounds.playClick()}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-base font-bold block">Text HOME to 741741</span>
                    <span className="text-xs text-white/60">Crisis Text Line (Free, 24/7 support)</span>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-full group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                  Text Now
                </span>
              </a>

              <a
                href="https://www.google.com/maps/search/emergency+room+near+me"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playClick()}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-base font-bold block">Find Nearest ER</span>
                    <span className="text-xs text-white/60">Locate immediate medical or urgent care</span>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-full group-hover:bg-teal-500 group-hover:text-black transition-colors">
                  Open Maps
                </span>
              </a>
            </div>

            {/* Disclaimer & Close button */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-white/50 text-center sm:text-left">
                If you or someone you know is in immediate physical danger, please call 911 or your local emergency number.
              </span>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all cursor-pointer whitespace-nowrap"
              >
                I&apos;m okay, close this
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
