import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Smile, 
  Wind, 
  Moon, 
  RefreshCw, 
  TrendingUp, 
  Settings as SettingsIcon, 
  Volume2, 
  VolumeX,
  Flame
} from "lucide-react";
import { sounds } from "../lib/sounds";
import { storage } from "../lib/storage";
import neuralisoLogo from "../assets/images/neuraliso_logo_1783904719183.jpg";

export const AppNav: React.FC = () => {
  const location = useLocation();
  const [isMuted, setIsMuted] = useState(sounds.getMuteState());
  const [streak, setStreak] = useState(storage.getStreak());

  useEffect(() => {
    setStreak(storage.getStreak());
  }, [location.pathname]);

  const toggleSound = () => {
    const nextMute = !isMuted;
    sounds.setMuted(nextMute);
    setIsMuted(nextMute);
    if (!nextMute) sounds.playBloop();
  };

  const navItems = [
    { path: "/app", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { path: "/app/mood", label: "Mood", icon: <Smile className="w-5 h-5" /> },
    { path: "/app/breathe", label: "Breathe", icon: <Wind className="w-5 h-5" /> },
    { path: "/app/sleep", label: "Sleep", icon: <Moon className="w-5 h-5" /> },
    { path: "/app/reframe", label: "Reframe", icon: <RefreshCw className="w-5 h-5" /> },
    { path: "/app/progress", label: "Progress", icon: <TrendingUp className="w-5 h-5" /> },
    { path: "/app/settings", label: "Settings", icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Top Desktop & Tablet Navbar */}
      <header className="sticky top-0 z-40 bg-[#0B1121]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/app"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00d4ff]/40 shadow-sm shadow-[#00d4ff]/20 group-hover:scale-110 transition-all duration-300">
              <img src={neuralisoLogo} alt="Neuraliso Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif font-bold italic text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] via-[#00b8a9] to-emerald-400">
              Neuraliso
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => sounds.playClick()}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] shadow-sm shadow-[#00d4ff]/20 scale-105"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Streak & Sound Toggle */}
          <div className="flex items-center gap-3">
            {/* Streak Badge */}
            <Link
              to="/app/progress"
              onClick={() => sounds.playClick()}
              title="Your gentle check-in streak"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-current animate-bounce" style={{ animationDuration: "2s" }} />
              <span>{streak} {streak === 1 ? "day" : "days"}</span>
            </Link>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              aria-label={isMuted ? "Unmute sound effects" : "Mute sound effects"}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#00d4ff]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111A2E]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => sounds.playClick()}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                active ? "text-[#00d4ff] scale-110 font-bold" : "text-white/50 hover:text-white"
              }`}
            >
              <div className={active ? "p-1 rounded-lg bg-[#00d4ff]/15" : ""}>
                {item.icon}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
