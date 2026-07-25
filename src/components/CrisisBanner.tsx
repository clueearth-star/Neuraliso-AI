import React, { useState } from "react";
import { Phone, MessageSquare, X } from "lucide-react";
import { sounds } from "../lib/sounds";

export const CrisisBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-rose-950/90 via-rose-900/90 to-rose-950/90 border-b border-rose-500/30 text-white px-4 py-2.5 relative z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <span className="text-xs sm:text-sm font-semibold text-rose-100">
            Need help right now? You&apos;re not alone.
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <a
            href="tel:988"
            onClick={() => sounds.playClick()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call 988</span>
          </a>

          <a
            href="sms:741741?body=HOME"
            onClick={() => sounds.playClick()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-rose-400/30 text-white text-xs font-bold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Text HOME to 741741</span>
          </a>

          <button
            onClick={() => {
              sounds.playClick();
              setDismissed(true);
            }}
            aria-label="Dismiss crisis support banner"
            className="p-1 rounded-full hover:bg-white/10 text-rose-200 hover:text-white transition-colors ml-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
