import React, { useState, useEffect, useRef } from "react";
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
  Flame, 
  MessageCircle,
  User,
  LogOut,
  ChevronDown,
  LogIn,
  UserPlus,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  Target
} from "lucide-react";
import { sounds } from "../lib/sounds";
import { storage } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { ProBadge } from "./subscription/ProBadge";
import neuralisoLogo from "../assets/images/neuraliso_logo_1783904719183.jpg";

export const AppNav: React.FC = () => {
  const location = useLocation();
  const { user, profile, signOut, syncStatus, syncMessage, isAnonymous } = useAuth();
  const { isPro, openUpgradeModal } = useSubscription();
  
  const [isMuted, setIsMuted] = useState(sounds.getMuteState());
  const [streak, setStreak] = useState(storage.getStreak());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStreak(storage.getStreak());
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSound = () => {
    const nextMute = !isMuted;
    sounds.setMuted(nextMute);
    setIsMuted(nextMute);
    if (!nextMute) sounds.playBloop();
  };

  const navItems = [
    { path: "/app", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { path: "/app/chat", label: "AI Coach", icon: <MessageCircle className="w-5 h-5" /> },
    { path: "/app/habits", label: "Habits", icon: <Target className="w-5 h-5" /> },
    { path: "/app/insights", label: "Insights", icon: <Sparkles className="w-5 h-5" /> },
    { path: "/app/mood", label: "Mood", icon: <Smile className="w-5 h-5" /> },
    { path: "/app/breathe", label: "Breathe", icon: <Wind className="w-5 h-5" /> },
    { path: "/app/sleep", label: "Sleep", icon: <Moon className="w-5 h-5" /> },
    { path: "/app/reframe", label: "Reframe", icon: <RefreshCw className="w-5 h-5" /> },
    { path: "/app/progress", label: "Progress", icon: <TrendingUp className="w-5 h-5" /> },
    { path: "/app/settings", label: "Settings", icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  const displayName = profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const firstLetter = displayName.charAt(0).toUpperCase();

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
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => sounds.playClick()}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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

          {/* Right Actions: Streak, Sound Toggle, Auth */}
          <div className="flex items-center gap-2.5">
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

            {/* Auth Area */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center gap-2 p-1 pl-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                >
                  {/* Sync Status Mini Indicator */}
                  {syncStatus === "syncing" && (
                    <span title="Syncing..."><Loader2 className="w-3.5 h-3.5 text-[#00d4ff] animate-spin" /></span>
                  )}
                  {syncStatus === "synced" && (
                    <span title="Data backed up"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /></span>
                  )}
                  {syncStatus === "error" && (
                    <span title="Offline / Local only"><AlertCircle className="w-3.5 h-3.5 text-amber-400" /></span>
                  )}

                  <span className="text-xs font-semibold text-white/90 hidden sm:inline max-w-[100px] truncate">
                    {displayName}
                  </span>
                  
                  <ProBadge showIfFree={false} />

                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#00b8a9] text-[#0B1121] font-bold text-xs flex items-center justify-center shadow-sm overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      firstLetter
                    )}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/60 mr-1 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111A2E] border border-white/15 shadow-2xl backdrop-blur-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 z-50">
                    <div className="px-3 py-2 border-b border-white/10">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-white truncate">{displayName}</p>
                        <ProBadge showIfFree={true} />
                      </div>
                      <p className="text-[11px] text-white/50 truncate mt-0.5">{user.email}</p>
                      {syncMessage && (
                        <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{syncMessage}</span>
                        </p>
                      )}
                    </div>

                    <Link
                      to="/app/pricing"
                      onClick={() => {
                        sounds.playClick();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Flame className="w-4 h-4 text-[#FFD700]" />
                        <span>{isPro ? "Subscription Plan" : "Upgrade to Plus"}</span>
                      </span>
                      {!isPro && <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#FFD700] text-[#0B1121] font-bold">PRO</span>}
                    </Link>

                    <Link
                      to="/app/settings"
                      onClick={() => {
                        sounds.playClick();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#00d4ff]" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/app/settings"
                      onClick={() => {
                        sounds.playClick();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <SettingsIcon className="w-4 h-4 text-[#00b8a9]" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t border-white/10 pt-1">
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => sounds.playClick()}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#00d4ff]" />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => sounds.playClick()}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] text-[#0B1121] text-xs font-bold shadow-sm shadow-[#00d4ff]/20 hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Non-intrusive banner for anonymous mode */}
      {!user && isAnonymous && (
        <div className="bg-gradient-to-r from-[#00d4ff]/15 via-emerald-500/15 to-[#00b8a9]/15 border-b border-white/10 px-4 py-2 text-center text-xs font-medium text-white flex items-center justify-center gap-3">
          <span className="text-white/90">Sign in to back up your data across devices</span>
          <Link
            to="/login"
            onClick={() => sounds.playClick()}
            className="px-2.5 py-0.5 rounded-full bg-[#00d4ff] text-[#0B1121] font-bold text-[11px] hover:bg-[#00d4ff]/90 transition-all shadow-sm shrink-0"
          >
            Sign In &rarr;
          </Link>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111A2E]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-start sm:justify-around overflow-x-auto scrollbar-none gap-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => sounds.playClick()}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all shrink-0 ${
                active ? "text-[#00d4ff] scale-105 font-bold" : "text-white/50 hover:text-white"
              }`}
            >
              <div className={active ? "p-1 rounded-lg bg-[#00d4ff]/15" : ""}>
                {item.icon}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
