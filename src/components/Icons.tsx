import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const HomeIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

export const ChatIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <rect x="13" y="13" width="5" height="3" rx="1.5" fill="currentColor" stroke="none" />
    <text x="14" y="15" fontSize="3px" fontWeight="bold" fill="white" stroke="none" fontFamily="sans-serif">AI</text>
  </svg>
);

export const SOSIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 2v20M2 12h20" className="opacity-40" />
    <path d="M11 5h2M9 12h6M11 19h2" />
    <path d="M4 12c0-4 4-8 8-8s8 4 8 8-4 8-8 8-8-4-8-8z" />
    <path d="M7 12h2l1.5-3 1.5 6 1.5-4.5 1.5 1.5h2" strokeWidth="2.5" />
  </svg>
);

export const HotlineIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const ProfileIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const SadMoodIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 10h.01M16 10h.01" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M16 17a4 4 0 0 0-8 0" strokeLinecap="round" />
  </svg>
);

export const AnxiousMoodIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9 10c.5.5 1 .5 1.5 0M13.5 10c.5.5 1 .5 1.5 0" strokeLinecap="round" />
    <path d="M9 16c2-1 4-1 6 0" strokeLinecap="round" />
  </svg>
);

export const OverwhelmedMoodIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 9.5a1.5 1.5 0 1 1 2.2-1.3l.5 1" strokeLinecap="round" />
    <path d="M13.8 9.5a1.5 1.5 0 1 1 2.2-1.3l.5 1" strokeLinecap="round" />
    <path d="M12 11.5c-1 0.4-1.5 1.2-1.2 2s1.3.8 1.8.8 1.5-1.5.2-2.3z" strokeLinecap="round" />
    <path d="M8.5 16.5c1-1.5 3-2 5-1" strokeLinecap="round" />
  </svg>
);

export const LonelyMoodIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M7.5 11h.01M13.5 11h.01" strokeWidth="2.5" />
    <path d="M8 16c1-1.5 3-1.5 4 0" strokeLinecap="round" />
    <path d="M15 15l1.5-1.5M18 12.5a4 4 0 0 0-2-2.5" strokeLinecap="round" className="opacity-60" />
  </svg>
);

export const BreathingIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 3a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z" />
    <path d="M7 10h10a4 4 0 0 1 4 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a4 4 0 0 1 4-4z" />
    <circle cx="12" cy="14" r="1.5" />
  </svg>
);

export const GroundingIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 22v-8" />
    <path d="M17 12c0-3.3-2.2-6-5-6s-5 2.7-5 6h10z" />
    <path d="M19 9a7 7 0 0 0-14 0h14z" />
    <path d="M21 15v1H3v-1" />
    <path d="M7 21h10" />
  </svg>
);

export const AffirmationIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const AnalyticsIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
    <path d="M3 13h4M12 15h4M18 10h2" />
  </svg>
);

export const HistoryIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

// Leaf Icon to Beautiful Organic Mindful Silhouette Logo
export const LeafLogoIcon: React.FC<IconProps> = ({ size = 32, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Base Sky Circle Backdrop */}
    <circle cx="50" cy="50" r="46" fill="url(#app-sky-gradient)" />

    {/* Elegant Wave Shadows/Layers on the right side */}
    <path
      d="M 50 96 C 72 96 92 84 96 62 C 90 58 81 56 73 58 C 58 61 51 70 41 73 C 35 75 25 73 20 65 C 23 80 35 96 50 96 Z"
      fill="url(#app-wave-light)"
      opacity="0.85"
    />
    <path
      d="M 55 94 C 75 92 92 78 95 56 C 88 52 79 50 69 52 C 56 55 48 64 38 67 C 30 69 20 67 16 59 C 18 72 30 88 44 93 C 48 94 51 94 55 94 Z"
      fill="url(#app-wave-deep)"
      opacity="0.7"
    />

    {/* White peaceful silhouette face profile */}
    <path
      d="M38,18 C45,18 52,24 55,31 C56,34 54,38 46,40 C52,41 59,41.5 60,43.5 C60.5,44.5 58,46 58,47.5 C59.5,48.5 59.5,49.5 58,50.5 C57.5,51.5 58,53.5 56,55 C54.5,56 46,62 41,65 C34,68 28,60 27,50 C26,40 31,25 38,18 Z"
      fill="#FFFFFF"
    />

    {/* Meditation sleeping eye curve on face */}
    <path
      d="M44.5,37.5 C46.5,36 49.5,36 51,38"
      stroke="#79C5EB"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Organic Green branch stem & detailed leaves */}
    <path
      d="M 25 72 C 22 60 22 45 28 33 C 31 28 34 22 38 18"
      stroke="#5BB37E"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Left branch leaves */}
    <path d="M 37 19 C 32 15 25 21 27 30 C 33 34 40 28 37 19 Z" fill="url(#app-leaf-g1)" />
    <path d="M 27 30 C 18 28 16 38 24 43 C 30 45 31 38 27 30 Z" fill="url(#app-leaf-g2)" />
    <path d="M 23 45 C 15 45 15 54 23 57 C 28 58 28 52 23 45 Z" fill="url(#app-leaf-g3)" />
    <path d="M 25 58 C 19 60 20 68 26 69 C 30 69 30 64 25 58 Z" fill="url(#app-leaf-g4)" />
    {/* Inner decorative leaves on forehead */}
    <path d="M 39 31 C 36 25 31 32 31 38 C 34 44 41 38 39 31 Z" fill="url(#app-leaf-g1)" />
    <path d="M 39 41 C 36 36 29 42 30 48 C 34 52 41 46 39 41 Z" fill="url(#app-leaf-g2)" />

    {/* Cradling gentle hand at the bottom */}
    <path
      d="M 26,58 C 25,65 27,72 32,78 C 39,87 50,91 62,89 C 70,87.5 76,82 82,75 C 85,71 88,68 83,69 C 78,70 70,74 65,74 C 58,74 53,70 48,68 C 43,66.2 36,66 31,63 C 29,61.8 27.5,60 26,58 Z"
      fill="url(#app-hand-g)"
    />
    <path
      d="M 68,74 C 73,73 78,70 81,67 C 83,65 85,63 81,64 C 77,65 72,69 68,74 Z"
      fill="url(#app-hand-g)"
      opacity="0.9"
    />

    {/* Sparkles on sky sector */}
    <path d="M 69 25 C 69 28 70 29 73 29 C 70 29 69 30 69 33 C 69 30 68 29 65 29 C 68 29 69 28 69 25 Z" fill="#FFFFFF" />
    <path d="M 75 34 C 75 36.5 75.8 37.2 78 37.2 C 75.8 37.2 75 38 75 40.5 C 75 38 74.2 37.2 72 37.2 C 74.2 37.2 75 36.5 75 34 Z" fill="#FFFFFF" />
    <circle cx="69" cy="41" r="1.3" fill="#FFFFFF" opacity="0.85" />

    {/* Color Gradient definitions */}
    <defs>
      <linearGradient id="app-sky-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7CC7EE" />
        <stop offset="100%" stopColor="#B6E5F8" />
      </linearGradient>
      <linearGradient id="app-wave-light" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A8E2FC" />
        <stop offset="100%" stopColor="#6CBAE2" />
      </linearGradient>
      <linearGradient id="app-wave-deep" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5BB2DE" />
        <stop offset="100%" stopColor="#308EB8" />
      </linearGradient>
      <linearGradient id="app-leaf-g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#AEE9C2" />
        <stop offset="100%" stopColor="#76CE97" />
      </linearGradient>
      <linearGradient id="app-leaf-g2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9DE4B5" />
        <stop offset="100%" stopColor="#64BC86" />
      </linearGradient>
      <linearGradient id="app-leaf-g3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#87DBA3" />
        <stop offset="100%" stopColor="#55AB76" />
      </linearGradient>
      <linearGradient id="app-leaf-g4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#72D291" />
        <stop offset="100%" stopColor="#3FA261" />
      </linearGradient>
      <linearGradient id="app-hand-g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A2D6BA" />
        <stop offset="100%" stopColor="#75BE96" />
      </linearGradient>
    </defs>
  </svg>
);
