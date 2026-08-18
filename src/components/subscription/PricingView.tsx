import React from "react";
import { Pricing } from "../Pricing";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PricingView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in text-white">
      {/* Back button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-semibold text-sm transition-colors min-h-[44px] min-w-[44px] cursor-pointer"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-4 h-4 text-[#00d4ff]" />
          <span>Back</span>
        </button>
      </div>

      {/* Embedded Pricing Section */}
      <Pricing embedded={true} />
    </div>
  );
};
