import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Compass, Wind, Heart, ArrowLeft, HelpCircle } from "lucide-react";
import neuralisoLogo from "../assets/images/neuraliso_logo_1783904719183.jpg";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B1121] text-white flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-[#00d4ff] selection:text-[#0B1121] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00d4ff]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        {/* Logo & 404 badge */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-[#00d4ff]/40 shadow-xl shadow-[#00d4ff]/10 p-1 bg-[#1A2338]">
              <img src={neuralisoLogo} alt="Neuraliso Logo" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-[#00d4ff] text-[#0B1121] text-xs font-black tracking-wider shadow-lg">
              404
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Page Not Found</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Lost your way?
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            The page you were looking for doesn't exist or has moved. Take a gentle breath—we'll help you find your center.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00d4ff] to-[#00b8a9] hover:from-[#33ddff] hover:to-[#00c9b8] text-[#0B1121] font-bold text-sm shadow-xl shadow-[#00d4ff]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/app")}
            className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left transition-all cursor-pointer group"
          >
            <Compass className="w-4 h-4 text-[#00d4ff] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Dashboard</div>
            <div className="text-[10px] text-slate-400">Open web app</div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/app/breathe")}
            className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left transition-all cursor-pointer group"
          >
            <Wind className="w-4 h-4 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Breathe</div>
            <div className="text-[10px] text-slate-400">4-7-8 Somatic reset</div>
          </button>
        </div>

        {/* Secondary Back button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go back to previous page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default NotFoundPage;
