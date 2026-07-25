import React from "react";

export const BrainLotusLogo: React.FC<{ size?: number; className?: string }> = ({ size = 96, className = "" }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Outer Cyan & Teal Glow Ring */}
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-60 animate-soft-pulse"
        style={{ background: "linear-gradient(135deg, #00d4ff 0%, #00b8a9 100%)" }}
      />
      
      {/* Inner Rotating Dashed Halo */}
      <div className="absolute inset-1 rounded-full border border-dashed border-[#00d4ff]/30 animate-[spin_30s_linear_infinite]" />

      {/* SVG Brain-Lotus Icon */}
      <svg
        width={size * 0.75}
        height={size * 0.75}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_0_12px_rgba(0,212,255,0.8)]"
      >
        <defs>
          <linearGradient id="lotusGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#00b8a9" />
          </linearGradient>
        </defs>

        {/* Lotus Center & Outer Petals */}
        <path
          d="M50 15 C45 35 20 45 15 65 C12 75 25 85 50 85 C75 85 88 75 85 65 C80 45 55 35 50 15 Z"
          fill="url(#lotusGlow)"
          fillOpacity="0.15"
          stroke="url(#lotusGlow)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Left Side Petal */}
        <path
          d="M50 85 C35 85 10 75 10 55 C10 40 30 35 50 45"
          fill="none"
          stroke="#00d4ff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Right Side Petal */}
        <path
          d="M50 85 C65 85 90 75 90 55 C90 40 70 35 50 45"
          fill="none"
          stroke="#00b8a9"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Inner Brain Hemispheres / Neural Curves inside the Lotus */}
        <path
          d="M48 30 C42 35 38 42 40 52 C42 62 48 68 48 78"
          stroke="#00d4ff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 2"
        />
        <path
          d="M52 30 C58 35 62 42 60 52 C58 62 52 68 52 78"
          stroke="#00b8a9"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 2"
        />

        {/* Central Crown / Enlightenment Point */}
        <circle cx="50" cy="22" r="3.5" fill="#00d4ff" className="animate-ping" style={{ animationDuration: "3s" }} />
        <circle cx="50" cy="22" r="3.5" fill="#00d4ff" />

        {/* Base Water / Calm Ground Line */}
        <path
          d="M25 88 Q50 94 75 88"
          stroke="#00d4ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
      </svg>
    </div>
  );
};
