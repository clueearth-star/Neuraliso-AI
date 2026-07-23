import React from "react";
import { ActiveView } from "../types";
import { HomeIcon, ChatIcon, HotlineIcon, ProfileIcon } from "./Icons";
import { Tv } from "lucide-react";
import { sounds } from "../lib/sounds";

interface NavigationProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: "home", label: "Home", icon: <HomeIcon size={20} /> },
    { id: "chat", label: "AI Chat", icon: <ChatIcon size={20} /> },
    { id: "relief", label: "Relief", icon: <Tv size={18} /> },
    { id: "hotline", label: "Hotlines", icon: <HotlineIcon size={20} /> },
    { id: "profile", label: "Profile", icon: <ProfileIcon size={20} /> },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav id="bottom-navigation-pill" className="nav-pill flex items-center justify-around w-full max-w-lg px-2 py-1.5">
        {navItems.map((item) => {
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                sounds.playClick();
                setActiveView(item.id as ActiveView);
              }}
              className="relative flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all duration-300 group cursor-pointer"
            >
              {/* Active Highlight Circle with micro animation */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-400/40 text-cyan-300 scale-105 shadow-lg shadow-teal-500/20"
                    : "bg-transparent text-slate-400 group-hover:text-slate-200"
                }`}
              >
                {item.icon}
              </div>

              {/* Minimal Text label with transition */}
              <span
                className={`text-[10px] mt-1 font-medium transition-all duration-300 ${
                  isActive
                    ? "text-cyan-300 font-bold"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              >
                {item.label}
              </span>

              {/* Tiny bottom dot indicator */}
              {isActive && (
                <span
                  className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/80"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
