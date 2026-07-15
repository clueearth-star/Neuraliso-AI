import React from "react";

/**
 * Irregular, organic border radiuses to avoid harsh boxy cuts.
 * Renders a melted neural organic outline.
 */
const MELTED_RAD_S = "12px 18px 8px 14px / 10px 14px 12px 16px";
const MELTED_RAD_M = "18px 24px 14px 20px / 16px 20px 18px 22px";
const MELTED_RAD_L = "28px 36px 22px 30px / 24px 30px 28px 32px";

export interface NeuroTextSkeletonProps {
  lines?: number;
  heightClass?: string;
  widthClasses?: string[]; // Array of widths e.g. ["w-3/4", "w-11/12", "w-1/2"]
  className?: string;
}

/**
 * NeuroTextSkeleton: Fluid, variable-width lines with organic, melted edges.
 * Mimics text flowing dynamically without structured mechanical endpoints.
 */
export const NeuroTextSkeleton: React.FC<NeuroTextSkeletonProps> = ({
  lines = 1,
  heightClass = "h-4",
  widthClasses = ["w-11/12", "w-5/6", "w-3/4", "w-2/3"],
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => {
        // Pick width cycle or default
        const width = widthClasses[index % widthClasses.length] || "w-full";
        return (
          <div
            key={index}
            className={`${heightClass} ${width} neuro-plasma-glow relative overflow-hidden`}
            style={{
              borderRadius: MELTED_RAD_S,
              boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.4)",
            }}
          >
            {/* Animated liquid glare overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[neuro-wave_3s_infinite_linear]" />
          </div>
        );
      })}
    </div>
  );
};

export interface NeuroBlobSkeletonProps {
  sizeClass?: string;
  className?: string;
  /**
   * Shift rate modifier: "normal", "slow", "ambient"
   */
  speed?: "normal" | "slow" | "ambient";
}

/**
 * NeuroBlobSkeleton: Uses irregular shifting borders (border-radius)
 * to avoid standard circles or rigid squares, delivering organic neural energy.
 */
export const NeuroBlobSkeleton: React.FC<NeuroBlobSkeletonProps> = ({
  sizeClass = "w-12 h-12",
  className = "",
  speed = "normal",
}) => {
  const duration = speed === "slow" ? "14s" : speed === "ambient" ? "18s" : "10s";
  
  return (
    <div
      className={`neuro-plasma-glow animate-neuro-blob shrink-0 relative overflow-hidden ${sizeClass} ${className}`}
      style={{
        animationDuration: duration,
        boxShadow: "0 4px 15px rgba(153, 193, 185, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
      }}
    >
      {/* Moving internal light spark */}
      <div className="absolute inset-0 bg-radial-gradient from-white/25 to-transparent rounded-full transform -translate-x-1/2 -translate-y-1/2 scale-150 animate-[pulse_4s_infinite_ease-in-out]" />
    </div>
  );
};

export interface NeuroCardSkeletonProps {
  children?: React.ReactNode;
  className?: string;
  glowStrength?: "subtle" | "vibrant";
  interactiveHover?: boolean;
}

/**
 * NeuroCardSkeleton: A soft glassmorphism card container that comfortably holds the fluid elements.
 * Rather than a crisp white rectangle, it is shaped organically with soft melted corners.
 */
export const NeuroCardSkeleton: React.FC<NeuroCardSkeletonProps> = ({
  children,
  className = "",
  glowStrength = "subtle",
  interactiveHover = false,
}) => {
  const glowShadow = glowStrength === "vibrant"
    ? "0 12px 28px -4px rgba(168, 213, 196, 0.25), 0 8px 12px -2px rgba(225, 225, 250, 0.3)"
    : "0 6px 20px -5px rgba(142, 157, 142, 0.1)";

  return (
    <div
      className={`bg-neuroplasm-glass neuro-melt-transition ${
        interactiveHover ? "hover:scale-[1.01] hover:bg-white/45" : ""
      } ${className}`}
      style={{
        borderRadius: MELTED_RAD_L,
        borderWidth: "1px",
        borderColor: "rgba(255, 255, 255, 0.65)",
        boxShadow: glowShadow,
        boxSizing: "border-box",
      }}
    >
      <div className="relative p-5 z-10 w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};
