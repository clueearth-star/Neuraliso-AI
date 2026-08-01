import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0B1121] text-white font-sans">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 text-center space-y-4 shadow-2xl backdrop-blur-md">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Something went wrong</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Neuraliso encountered an unexpected issue. Try refreshing the page to restore your session. Your saved data is safe.
        </p>
        
        {error && (
          <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-28 whitespace-pre-wrap">
            {error.message || String(error)}
          </div>
        )}

        <button
          onClick={handleReload}
          className="w-full py-3 px-6 rounded-full bg-[#00d4ff] text-[#0B1121] font-bold text-sm hover:bg-[#33ddff] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00d4ff]/20 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload page</span>
        </button>
      </div>
    </div>
  );
};
