import React, { useEffect, useState } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";

export const PWAUpdatePrompt: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let refreshing = false;

    // Reload or prompt when new service worker takes over control
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      console.log("[PWA] New service worker activated; refreshing page...");
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    // Inspect service worker registration
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      if (reg.waiting) {
        setUpdateAvailable(true);
      }

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  const handleRefresh = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      });
    }
    window.location.reload();
  };

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-slide-down">
      <div className="bg-indigo-950/95 border border-indigo-400/50 backdrop-blur-md p-4 rounded-2xl shadow-2xl shadow-indigo-950/80 flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">New Version Available</h4>
            <p className="text-[11px] text-white/70">A fresh update for Neuraliso AI is ready.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            className="px-3.5 py-1.5 rounded-full bg-[#00d4ff] text-[#0B1121] font-bold text-xs hover:bg-[#33ddff] transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#00d4ff]/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
