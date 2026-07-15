import React, { useState, useEffect } from "react";
import { sounds } from "../lib/sounds";
import { cache, CacheMetrics } from "../lib/cache";
import { analytics, GAEvent } from "../lib/analytics";
import { 
  Database, 
  Volume2, 
  VolumeX, 
  Zap, 
  Trash2, 
  Activity, 
  Sparkles, 
  Play, 
  HeartPulse, 
  Tv, 
  CheckCircle,
  HelpCircle,
  RefreshCw
} from "lucide-react";

export const SystemDiagnostics: React.FC = () => {
  const [muted, setMuted] = useState<boolean>(sounds.getMuteState());
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics>(cache.getMetrics());
  const [gaLogs, setGaLogs] = useState<GAEvent[]>(analytics.getEventLogs());
  const [soundLogs, setSoundLogs] = useState<any[]>(sounds.getLogs());
  const [activeTab, setActiveTab] = useState<"cache" | "sounds" | "analytics">("cache");
  const [warming, setWarming] = useState<boolean>(false);

  // Sync up live updates when events fire or cache changes
  useEffect(() => {
    // Analytics service register listener
    analytics.registerUpdateListener(() => {
      setGaLogs([...analytics.getEventLogs()]);
    });

    const interval = setInterval(() => {
      // Periodic metrics polling
      setCacheMetrics({ ...cache.getMetrics() });
      setSoundLogs([...sounds.getLogs()]);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleToggleMute = () => {
    const nextMute = !muted;
    sounds.setMuted(nextMute);
    setMuted(nextMute);
    sounds.playClick();
    analytics.logTelemetryEvent("audio_mute_toggle", { muted: nextMute });
  };

  const handleTestSound = (type: "click" | "bloop" | "success" | "shimmer" | "bell") => {
    if (type === "click") sounds.playClick();
    else if (type === "bloop") sounds.playBloop();
    else if (type === "success") sounds.playSuccess();
    else if (type === "shimmer") sounds.playShimmer();
    else if (type === "bell") sounds.playFocusBell();
    
    analytics.logTelemetryEvent("audio_test_play", { sound_type: type });
    setSoundLogs([...sounds.getLogs()]);
  };

  const handleClearCache = () => {
    cache.clearAll();
    sounds.playBloop();
    setCacheMetrics(cache.getMetrics());
    analytics.logTelemetryEvent("cache_cleared", { timestamp: Date.now() });
  };

  const handleWarmCache = () => {
    setWarming(true);
    sounds.playShimmer();
    
    // Simulate pre-fetching and caching standard mood entries & insights
    setTimeout(() => {
      cache.set("insights_happy", {
        affirmation: "You are the radiant sunshine reflecting off still mountain waters.",
        insight: "Celebrate this moment of joy by sharing a tiny piece of kindness.",
        simulated: true
      }, 600, 320); // 320ms simulated latency savings

      cache.set("insights_neutral", {
        affirmation: "In quiet stillness, you find the deep anchor of your true power.",
        insight: "Notice the grounding weight of your feet firmly on the solid floor.",
        simulated: true
      }, 600, 410);

      cache.set("insights_anxious", {
        affirmation: "Like a bird in a storm, your wings hold the wisdom to ride the wind.",
        insight: "Let your shoulders slide down. Take a slow, cool sip of fresh air.",
        simulated: true
      }, 600, 580);

      setCacheMetrics(cache.getMetrics());
      setWarming(false);
      sounds.playSuccess();
      analytics.logTelemetryEvent("cache_warmed", { seeded_keys: ["insights_happy", "insights_neutral", "insights_anxious"] });
    }, 800);
  };

  // Human-readable storage helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div id="system-diagnostics-dashboard" className="wellness-card p-6 border bg-white space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center pb-3 border-b border-soft-green/15">
        <div>
          <h4 className="font-sans font-bold text-dark-text text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Core Performance & Diagnostics</span>
          </h4>
          <p className="text-[10px] text-muted-text font-mono">100X SYSTEMS TELEMETRY PANEL</p>
        </div>
        
        {/* MASTER MUTE TOGGLE */}
        <button
          onClick={handleToggleMute}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all active:scale-95 cursor-pointer ${
            muted 
              ? "bg-red-50 text-danger-red border-red-200" 
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
          title={muted ? "Unmute system voices & clicks" : "Mute all clicks & sound-scapes"}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{muted ? "Muted" : "Audio Active"}</span>
        </button>
      </div>

      {/* THREE DIAGNOSTIC TAB SWITCHERS */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-center text-xs font-bold font-sans">
        <button
          onClick={() => { setActiveTab("cache"); sounds.playClick(); }}
          className={`py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "cache" ? "bg-white text-deep-sage shadow-xs" : "text-muted-text hover:text-dark-text"
          }`}
        >
          🗄️ Caching
        </button>
        <button
          onClick={() => { setActiveTab("sounds"); sounds.playClick(); }}
          className={`py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "sounds" ? "bg-white text-deep-sage shadow-xs" : "text-muted-text hover:text-dark-text"
          }`}
        >
          🔊 SFX Testing
        </button>
        <button
          onClick={() => { setActiveTab("analytics"); sounds.playClick(); }}
          className={`py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "analytics" ? "bg-white text-deep-sage shadow-xs" : "text-muted-text hover:text-dark-text"
          }`}
        >
          📊 Live GA Logs
        </button>
      </div>

      {/* TAB CONTENTS #1: INTELLIGENT CACHE MODULE */}
      {activeTab === "cache" && (
        <div className="space-y-4 animate-fade-in text-left">
          
          {/* Main indicators grid */}
          <div className="grid grid-cols-2 gap-3.5">
            
            <div className="p-3 bg-indigo-50/45 border border-indigo-100/50 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-indigo-700 tracking-wider block">Cache Hit Ratio</span>
                <span className="text-lg font-bold font-mono text-dark-text leading-tight">
                  {cacheMetrics.totalRequests > 0 
                    ? ((cacheMetrics.hits / cacheMetrics.totalRequests) * 100).toFixed(0) + "%"
                    : "0%"
                  }
                </span>
                <span className="text-[8px] text-muted-text block">
                  ({cacheMetrics.hits} hits / {cacheMetrics.totalRequests} reqs)
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/45 border border-emerald-100/50 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-emerald-800 tracking-wider block">Latency Bypassed</span>
                <span className="text-lg font-bold font-mono text-dark-text leading-tight">
                  {cacheMetrics.latencySavingsMs} ms
                </span>
                <span className="text-[8px] text-muted-text block">Instant offline client speedup</span>
              </div>
            </div>

          </div>

          {/* LocalStorage quota display */}
          <div className="space-y-1.5 p-3.5 bg-slate-50 border rounded-2xl">
            <div className="flex justify-between text-[10px] font-bold text-slate-700">
              <span>LocalStorage Cache Storage</span>
              <span>{formatBytes(cacheMetrics.storageBytes)} / 5.0 MB</span>
            </div>
            
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(1.5, Math.min(100, (cacheMetrics.storageBytes / (5 * 1024 * 1024)) * 100))}%` }}
              />
            </div>
            <p className="text-[8px] text-muted-text leading-tight pt-0.5">
              Dual-layer cache maps volatile states in-memory, compiling stringified indexes to standard key-value browser spaces for permanent caching.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleWarmCache}
              disabled={warming}
              className="flex-1 bg-deep-sage hover:bg-primary-sage disabled:bg-slate-200 text-white font-bold py-2 px-4 rounded-xl text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${warming ? "animate-spin" : ""}`} />
              <span>{warming ? "Warming Cache..." : "Pre-fetch & Warm Cache"}</span>
            </button>
            <button
              onClick={handleClearCache}
              className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-danger-red font-bold py-2 px-3.5 rounded-xl text-xs border border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Flush entire local cache"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Flush Cache</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB CONTENTS #2: PROCEDURAL SFX TESTING SOUNDS */}
      {activeTab === "sounds" && (
        <div className="space-y-4 animate-fade-in text-left">
          <p className="text-xs text-muted-text leading-normal">
            Our high-fidelity sound synthesis engine generates deep calming sound effects using customized envelopes, oscillations, and dual LFO frequencies. Test each wave trigger below:
          </p>

          {/* Interactive grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => handleTestSound("click")}
              className="p-3 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all rounded-xl border flex items-center gap-2 cursor-pointer text-left"
            >
              <span className="p-1 bg-slate-200 rounded-lg text-slate-700">🔘</span>
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">Button Click</span>
                <span className="text-[9px] text-muted-text font-normal block font-mono">450Hz → 150Hz sine</span>
              </div>
            </button>

            <button
              onClick={() => handleTestSound("bloop")}
              className="p-3 bg-indigo-50/30 hover:bg-indigo-50/60 active:scale-95 transition-all rounded-xl border border-indigo-100/40 flex items-center gap-2 cursor-pointer text-left"
            >
              <span className="p-1 bg-indigo-100 rounded-lg text-indigo-700">🫧</span>
              <div>
                <span className="font-bold text-indigo-900 block text-[11px]">Bloop Pop</span>
                <span className="text-[9px] text-muted-text font-normal block font-mono">300Hz → 600Hz sine</span>
              </div>
            </button>

            <button
              onClick={() => handleTestSound("shimmer")}
              className="p-3 bg-amber-50/20 hover:bg-amber-50/40 active:scale-95 transition-all rounded-xl border border-amber-100/30 flex items-center gap-2 cursor-pointer text-left"
            >
              <span className="p-1 bg-amber-100 rounded-lg text-amber-700">✨</span>
              <div>
                <span className="font-bold text-amber-900 block text-[11px]">Star Shimmer</span>
                <span className="text-[9px] text-muted-text font-normal block font-mono">Multi-carrier high-Hz</span>
              </div>
            </button>

            <button
              onClick={() => handleTestSound("bell")}
              className="p-3 bg-sky-50/20 hover:bg-sky-50/55 active:scale-95 transition-all rounded-xl border border-sky-100/30 flex items-center gap-2 cursor-pointer text-left"
            >
              <span className="p-1 bg-sky-100 rounded-lg text-sky-700">🔔</span>
              <div>
                <span className="font-bold text-sky-900 block text-[11px]">Focus Gong</span>
                <span className="text-[9px] text-muted-text font-normal block font-mono">Tibetan bowl 136.1Hz</span>
              </div>
            </button>
          </div>

          <button
            onClick={() => handleTestSound("success")}
            className="w-full p-3.5 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-900 font-bold text-xs rounded-2xl border border-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
          >
            🏆 Test Harmonic Milestone Success Chime (Major Chord Arpeggio)
          </button>

          {/* Sound logs */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Waveform Trigger Log</span>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-2xl text-[10px] font-mono h-24 overflow-y-auto space-y-1.5 scrollbar-thin text-left border border-slate-950">
              {soundLogs.length === 0 ? (
                <span className="text-slate-500 italic block pt-6 text-center">No audio waves emitted yet. Trigger notes above.</span>
              ) : (
                soundLogs.map((log) => (
                  <div key={log.id} className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span className="text-emerald-400">⚡ {log.name}</span>
                    <span className="text-slate-500">{log.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENTS #3: GOOGLE ANALYTICS LIVE CONSOLE */}
      {activeTab === "analytics" && (
        <div className="space-y-4 animate-fade-in text-left">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-text">
              Real-time Google Analytics 4 (GA4) debugger console. Every user event, view transition, and click publishes structured telemetry.
            </p>
            <button
              onClick={() => analytics.clearLogs()}
              className="text-[10px] text-slate-500 hover:text-danger-red underline font-bold cursor-pointer shrink-0"
            >
              Clear Logs
            </button>
          </div>

          {/* Analytics logs display */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">gtag.js Live Stream Telemetry</span>
            <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-[10px] font-mono h-48 overflow-y-auto space-y-2.5 border border-slate-950 shadow-inner scrollbar-thin text-left">
              {gaLogs.length === 0 ? (
                <span className="text-slate-600 italic block pt-16 text-center">Waiting for telemetry tags to fire ...</span>
              ) : (
                gaLogs.map((log) => (
                  <div key={log.id} className="border-b border-slate-900 pb-2 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sky-400">🚀 Event: "{log.name}"</span>
                      <span className="text-[9px] text-slate-500 font-normal">{log.timestamp}</span>
                    </div>
                    <pre className="text-slate-300 text-[9px] leading-tight overflow-x-auto whitespace-pre-wrap pl-3 border-l border-emerald-900/60 font-mono py-0.5">
                      {JSON.stringify(log.params, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-amber-50/45 border border-amber-100/50 rounded-2xl flex items-start gap-2 text-[10px] text-slate-600 leading-normal">
            <span className="text-amber-500 text-sm mt-0.5">💡</span>
            <p>
              To bind a custom production Measurement ID, configure the <strong>VITE_GA_MEASUREMENT_ID</strong> key inside your settings. Fallback test logs run automatically inside this interactive frame container.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
