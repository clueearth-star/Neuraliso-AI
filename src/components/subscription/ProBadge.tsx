import React from "react";
import { Sparkles } from "lucide-react";
import { useSubscription } from "../../contexts/SubscriptionContext";

interface ProBadgeProps {
  className?: string;
  onClick?: () => void;
  showIfFree?: boolean;
}

export const ProBadge: React.FC<ProBadgeProps> = ({ className = "", onClick, showIfFree = false }) => {
  const { isPro, isTrial, openUpgradeModal } = useSubscription();

  if (!isPro && !showIfFree) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else if (!isPro) {
      openUpgradeModal("Unlock Neuraliso Plus for unlimited wellness enhancements.");
    }
  };

  if (!isPro) {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 text-[#FFD700] border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all duration-200 cursor-pointer shadow-sm shadow-[#FFD700]/10 ${className}`}
        title="Upgrade to Neuraliso Plus"
      >
        <Sparkles className="w-3 h-3 text-[#FFD700] animate-pulse" />
        <span>Upgrade Plus</span>
      </button>
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0B1121] shadow-md shadow-[#FFD700]/20 font-sans tracking-wide cursor-default ${className}`}
      title={isTrial ? "Neuraliso Plus (Free Trial)" : "Neuraliso Plus Subscriber"}
    >
      <Sparkles className="w-3 h-3 text-[#0B1121] fill-current" />
      <span>{isTrial ? "Plus Trial" : "Plus"}</span>
    </span>
  );
};
