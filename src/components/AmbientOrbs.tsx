import React from "react";

export const AmbientOrbs: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top Right Cyan Glow Orb */}
      <div 
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[80px]"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, rgba(0,0,0,0) 70%)" }}
      />
      {/* Bottom Left Teal Glow Orb */}
      <div 
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-[80px]"
        style={{ background: "radial-gradient(circle, rgba(0,184,169,0.05) 0%, rgba(0,0,0,0) 70%)" }}
      />
      {/* Center Subtle Deep Navy Pulse */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[90px] opacity-60"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.03) 0%, rgba(0,0,0,0) 70%)" }}
      />
    </div>
  );
};
