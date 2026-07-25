import React, { useState } from "react";
import { Sparkles, Menu, X, Sun, Moon } from "lucide-react";
import neuralisoLogo from "../assets/images/neuraliso_logo_1783904719183.jpg";
import { sounds } from "../lib/sounds";

interface NavbarProps {
  onGetStarted?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  themeMode?: "light" | "neutral";
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGetStarted,
  onNavigateSection,
  themeMode = "neutral",
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#0a1628]/80 backdrop-blur-2xl border-b border-white/10 text-white transition-all shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo Left */}
        <div 
          onClick={() => handleLinkClick("hero")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400/50 shadow-sm shadow-cyan-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,212,255,0.7)] group-hover:border-cyan-300 transition-all duration-300">
            <img 
              src={neuralisoLogo} 
              alt="Neuraliso" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-serif font-bold italic text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Neuraliso
          </span>
        </div>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button 
            onClick={() => handleLinkClick("how-it-works")}
            className="hover:text-teal-300 transition-colors cursor-pointer bg-transparent border-none"
          >
            How it works
          </button>
          <button 
            onClick={() => handleLinkClick("features")}
            className="hover:text-teal-300 transition-colors cursor-pointer bg-transparent border-none"
          >
            Features
          </button>
          <button 
            onClick={() => handleLinkClick("about")}
            className="hover:text-teal-300 transition-colors cursor-pointer bg-transparent border-none"
          >
            About
          </button>
        </div>

        {/* Right CTA & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {/* Floating Theme Switch Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              if (onToggleTheme) onToggleTheme();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all cursor-pointer shadow-sm active:scale-95 group"
            title={`Switch to ${themeMode === "neutral" ? "Classic Light" : "Neutral Dark"} theme`}
          >
            {themeMode === "neutral" ? (
              <>
                <Moon size={14} className="text-cyan-300 group-hover:rotate-12 transition-transform" />
                <span className="text-[11px] font-mono">Neutral Dark</span>
              </>
            ) : (
              <>
                <Sun size={14} className="text-amber-400 group-hover:rotate-45 transition-transform" />
                <span className="text-[11px] font-mono">Classic Light</span>
              </>
            )}
          </button>

          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-teal-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Get started</span>
          </button>
        </div>

        {/* Mobile menu toggle & Theme toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              if (onToggleTheme) onToggleTheme();
            }}
            className="p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer"
            title="Toggle Theme"
          >
            {themeMode === "neutral" ? (
              <Moon size={15} className="text-cyan-300" />
            ) : (
              <Sun size={15} className="text-amber-400" />
            )}
          </button>

          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-sm cursor-pointer"
          >
            Get started
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3 text-sm font-medium text-slate-200">
          <button 
            onClick={() => handleLinkClick("how-it-works")}
            className="block w-full text-left py-2 hover:text-teal-300 cursor-pointer"
          >
            How it works
          </button>
          <button 
            onClick={() => handleLinkClick("features")}
            className="block w-full text-left py-2 hover:text-teal-300 cursor-pointer"
          >
            Features
          </button>
          <button 
            onClick={() => handleLinkClick("about")}
            className="block w-full text-left py-2 hover:text-teal-300 cursor-pointer"
          >
            About
          </button>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Theme Preference</span>
            <button
              onClick={() => {
                sounds.playClick();
                if (onToggleTheme) onToggleTheme();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              {themeMode === "neutral" ? (
                <>
                  <Moon size={14} className="text-cyan-300" />
                  <span>Neutral Dark</span>
                </>
              ) : (
                <>
                  <Sun size={14} className="text-amber-400" />
                  <span>Classic Light</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
