import React, { useState } from "react";
import { Phone, MessageSquare, X } from "lucide-react";

export const CrisisBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside 
      aria-label="Crisis Support Banner"
      className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 border-b border-rose-900/60 text-slate-100 px-3 py-2 sm:px-6 sm:py-2.5 backdrop-blur-md shadow-lg transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-medium text-rose-200">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Need help right now? You're not alone.</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="tel:988"
            className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold px-3 py-1.5 rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5 text-xs text-decoration-none"
          >
            <Phone className="w-3 h-3" />
            <span>Call 988</span>
          </a>

          <a
            href="sms:741741?body=HOME"
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold px-3 py-1.5 rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5 text-xs text-decoration-none"
          >
            <MessageSquare className="w-3 h-3 text-teal-400" />
            <span>Text HOME to 741741</span>
          </a>

          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss crisis banner"
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
