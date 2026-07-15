import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Compass, RefreshCw, Layers, Award, Zap, Smile } from "lucide-react";

interface MascotEvent {
  type: "ACHIEVEMENT_UNLOCKED" | "FIRST_TIME_TAB_OPEN" | "CUSTOM_ALERT";
  payload: string;
  timestamp: number;
}

interface MascotAssistantProps {
  activeView?: any;
  entriesCount?: number;
  triggerEvent?: MascotEvent | null;
}

export const MascotAssistant: React.FC<MascotAssistantProps> = ({ triggerEvent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pose, setPose] = useState<"happy" | "excited" | "wave">("wave");

  // Auto-dismiss the message bubble smoothly after exactly 5 seconds
  useEffect(() => {
    if (isOpen) {
      const dismissTimer = setTimeout(() => {
        setIsOpen(false);
      }, 5000); // 5 seconds
      return () => clearTimeout(dismissTimer);
    }
  }, [isOpen, message]);

  // Handle external triggerEvent prop (visible state only when triggered by event)
  useEffect(() => {
    if (triggerEvent) {
      const { type, payload } = triggerEvent;
      if (type === "ACHIEVEMENT_UNLOCKED") {
        setPose("excited");
        setMessage(`🎉 **ACHIEVEMENT UNLOCKED!** 🏆\n\n${payload}`);
        setIsOpen(true);
      } else if (type === "FIRST_TIME_TAB_OPEN") {
        setPose("wave");
        setMessage(`👋 **Feature unlocked!** 🌱\n\n${payload}`);
        setIsOpen(true);
      } else {
        setPose("happy");
        setMessage(payload);
        setIsOpen(true);
      }
    }
  }, [triggerEvent]);
  const celebrateDirectly = () => {
    setPose("excited");
    setMessage("🎉 **STREAK BOOST ACTIVATED!** 🌟\n\nI am cheering you on right now! Every gentle step forward counts as a victory for our mental team. Remember that you are fully supported! 🚀✨");
    setIsOpen(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* EXTREMELY POLISHED INTERACTIVE MASCOT TRIGGER */}
          <motion.div 
            id="mascot-launcher"
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={() => {
              setIsOpen(false);
            }}
            className="fixed bottom-24 left-5 sm:left-8 z-55 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 group"
            title="Aura, your Neuraliso Mascot!"
          >
            <div className="relative w-14 h-14 rounded-full bg-white border border-soft-green/30 shadow-md flex items-center justify-center overflow-hidden neu-flat-sm">
              {/* Subtle spinning star halo */}
              <div className="absolute inset-0 rounded-full bg-primary-sage/5 animate-pulse" />
              
              {/* CUTE SVG BLUE MASCOT COMPANION MATCHING IMAGE ATTACHED */}
              <svg viewBox="0 0 100 100" className="w-12 h-12 relative z-15 select-none drop-shadow-sm">
                {/* Background sparkle glow */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3 3" />
                
                {/* Bear head */}
                <circle cx="50" cy="53" r="32" fill="#8AC2F0" />
                
                {/* Ear left */}
                <circle cx="23" cy="28" r="11" fill="#8AC2F0" />
                <circle cx="23" cy="28" r="7" fill="#F49EB4" />
                
                {/* Ear right */}
                <circle cx="77" cy="28" r="11" fill="#8AC2F0" />
                <circle cx="77" cy="28" r="7" fill="#F49EB4" />
                
                {/* Headband background shape */}
                <path d="M 18 43 Q 50 35 82 43 Q 81 35 50 28 Q 19 35 18 43" fill="#FFFFFF" stroke="#6BA4E0" strokeWidth="0.5" />
                {/* Headband Green Leaf Icon as shown on the panda bear in the image */}
                <path d="M 50 32 C 46 32, 45 36, 50 38 C 55 36, 54 32, 50 32 Z" fill="#60A166" />
                <path d="M 48 35 L 52 35" stroke="#FFFFFF" strokeWidth="0.4" />
                
                {/* White Face Muzzle Patch */}
                <ellipse cx="50" cy="67" rx="16" ry="11" fill="#FFFFFF" />
                
                {/* Cute rosy blush cheeks */}
                <circle cx="30" cy="65" r="5" fill="#F8A5C2" opacity="0.8" />
                <circle cx="70" cy="65" r="5" fill="#F8A5C2" opacity="0.8" />

                {/* Sparkly amber eyes */}
                <circle cx="36" cy="55" r="4" fill="#3D291F" />
                <circle cx="35" cy="54" r="1.2" fill="#FFFFFF" /> {/* reflection */}
                <circle cx="64" cy="55" r="4" fill="#3D291F" />
                <circle cx="63" cy="54" r="1.2" fill="#FFFFFF" /> {/* reflection */}
                
                {/* Adorable little nose & happy mouth */}
                <path d="M 47 62 L 53 62 Q 50 65 47 62" fill="#3D291F" />
                <path d="M 46 68 Q 50 73 54 68" fill="none" stroke="#3D291F" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              
              {/* Tiny Notification bubble */}
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-danger-red border-2 border-white rounded-full animate-bounce shadow-xs" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-40 left-5 sm:left-8 z-60 w-[290px] sm:w-[340px] max-w-[calc(100vw-40px)] rounded-3xl bg-white border border-slate-100 shadow-2xl p-5 text-dark-text"
          >
            {/* Speech bubble pointing down to Aura */}
            <div className="absolute bottom-[-6px] left-[22px] sm:left-[34px] w-3 h-3 bg-white border-r border-b border-slate-100 rotate-45 z-10" />

            {/* Celebratory background sparkles if pose is excited */}
            {pose === "excited" && (
              <div className="absolute inset-0 bg-yellow-50/20 pointer-events-none animate-pulse overflow-hidden rounded-3xl">
                <div className="absolute top-2 left-6 text-xl animate-bounce" style={{ animationDelay: "0.2s" }}>✨</div>
                <div className="absolute bottom-6 right-8 text-xl animate-bounce" style={{ animationDelay: "0.5s" }}>🎉</div>
                <div className="absolute top-4 right-10 text-xl animate-pulse">🌟</div>
              </div>
            )}

            <div className="relative z-10">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-sage/10 flex items-center justify-center text-primary-sage font-bold text-xs">
                    🐼
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-dark-text tracking-tight">Aura, Neuraliso Companion</h4>
                    <p className="text-[9px] font-bold text-primary-sage uppercase tracking-wider">Milestone Mascot</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* MESSAGE CONTENT */}
              <div className="my-4 text-xs font-sans text-slate-700 leading-relaxed whitespace-pre-line">
                {message.split("\n\n").map((para, idx) => (
                  <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                    {para.startsWith("👋") || para.startsWith("🎉") || para.startsWith("👋") || para.startsWith("👋") || para.startsWith("🏆") || para.startsWith("🎁") || para.startsWith("🔥") ? (
                      <span className="text-sm font-semibold block mb-1 text-slate-800">{para}</span>
                    ) : (
                      // Parse bold markup like **YOU DID IT!**
                      para.replace(/\*\*(.*?)\*\*/g, "$1")
                    )}
                  </p>
                ))}
              </div>

              {/* ACTION LINKS / UTILITY */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-50">
                <button
                  onClick={celebrateDirectly}
                  className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-primary-sage/10 hover:bg-primary-sage/20 text-primary-sage font-bold text-[10px] transition-all cursor-pointer active:scale-95"
                >
                  <Award size={12} />
                  <span>Virtual Cheer</span>
                </button>
                <button
                  onClick={() => {
                    setMessage("🧭 **Quick Assist Guides** 💡\n\n- Write `/clear` in our **Chat** page to wipes memory instantly.\n- Tell me to 'go to relief' or 'open sos' for quick shifts!\n- Register/Sign in on the **Reviews** wall to post your healing path!");
                    setPose("happy");
                  }}
                  className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] transition-all cursor-pointer active:scale-95"
                >
                  <Compass size={12} />
                  <span>How to use</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
