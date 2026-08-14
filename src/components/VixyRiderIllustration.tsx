import React from 'react';

interface VixyRiderIllustrationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
}

export const VixyRiderIllustration: React.FC<VixyRiderIllustrationProps> = ({
  className = '',
  size = 'lg',
  showGlow = true,
}) => {
  const sizeMap = {
    sm: 'w-48 h-48',
    md: 'w-64 h-64',
    lg: 'w-80 h-80 sm:w-96 sm:h-96',
    xl: 'w-96 h-96 sm:w-[480px] sm:h-[480px]',
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none ${sizeMap[size]} ${className}`}
    >
      {/* Dynamic Purple Neon Glow Atmosphere */}
      {showGlow && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-fuchsia-600/20 to-indigo-600/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute -inset-4 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
        </>
      )}

      {/* SVG Mascot Art Vector */}
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full drop-shadow-[0_15px_30px_rgba(147,51,234,0.45)] relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#581c87" />
          </linearGradient>
          <linearGradient id="neonSpeed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d8b4fe" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="foxOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="70%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>
          <linearGradient id="helmetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="30%" stopColor="#a855f7" />
            <stop offset="70%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>
          <linearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="40%" stopColor="#a855f7" />
            <stop offset="80%" stopColor="#6b21a8" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f3e8ff" />
            <stop offset="50%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
          <filter id="neonShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#a855f7" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Speed Wind Streaks & Motion Lines (Right side) */}
        <g opacity="0.85">
          <path d="M 330 140 L 470 140" stroke="url(#neonSpeed)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 340 170 L 490 170" stroke="url(#neonSpeed)" strokeWidth="12" strokeLinecap="round" />
          <path d="M 320 205 L 480 205" stroke="url(#neonSpeed)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 350 240 L 495 240" stroke="url(#neonSpeed)" strokeWidth="12" strokeLinecap="round" />
          <path d="M 310 270 L 470 270" stroke="url(#neonSpeed)" strokeWidth="10" strokeLinecap="round" />
          <path d="M 300 300 L 450 300" stroke="url(#neonSpeed)" strokeWidth="6" strokeLinecap="round" />
        </g>

        {/* Left sharp aerodynamic speed dart */}
        <path d="M 90 280 L 160 260 L 160 300 Z" fill="#9333ea" opacity="0.8" />

        {/* --- Fox Ears (Under Helmet) --- */}
        {/* Left Ear */}
        <path
          d="M 180 160 L 205 90 C 215 80, 240 100, 240 130 Z"
          fill="url(#foxOrange)"
          stroke="#3b0764"
          strokeWidth="6"
        />
        <path d="M 195 145 L 210 105 C 215 100, 228 110, 230 130 Z" fill="#fed7aa" />

        {/* Right Ear */}
        <path
          d="M 320 160 L 295 90 C 285 80, 260 100, 260 130 Z"
          fill="url(#foxOrange)"
          stroke="#3b0764"
          strokeWidth="6"
        />
        <path d="M 305 145 L 290 105 C 285 100, 272 110, 270 130 Z" fill="#fed7aa" />

        {/* --- Pilot Helmet --- */}
        <ellipse
          cx="250"
          cy="165"
          rx="78"
          ry="68"
          fill="url(#helmetGrad)"
          stroke="#2e1065"
          strokeWidth="8"
        />
        {/* Helmet Highlights */}
        <path
          d="M 195 140 C 205 115, 250 110, 275 118"
          stroke="#f3e8ff"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M 185 160 C 190 135, 215 125, 230 125"
          stroke="#e9d5ff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Helmet Visor / Face Opening */}
        <ellipse
          cx="250"
          cy="175"
          rx="60"
          ry="48"
          fill="#1e1b4b"
          stroke="#581c87"
          strokeWidth="6"
        />

        {/* Fox Face Inside Helmet */}
        <path
          d="M 200 175 C 200 150, 300 150, 300 175 C 300 205, 250 220, 200 175 Z"
          fill="url(#foxOrange)"
        />
        {/* White cheeks */}
        <path
          d="M 210 185 C 220 215, 280 215, 290 185 C 275 198, 225 198, 210 185 Z"
          fill="#fffbeb"
        />

        {/* Fox Big Anime Eyes */}
        {/* Left Eye */}
        <ellipse cx="228" cy="172" rx="10" ry="14" fill="#0f172a" />
        <ellipse cx="225" cy="168" rx="4" ry="6" fill="#ffffff" />
        <circle cx="231" cy="178" r="2" fill="#ffffff" />

        {/* Right Eye */}
        <ellipse cx="272" cy="172" rx="10" ry="14" fill="#0f172a" />
        <ellipse cx="269" cy="168" rx="4" ry="6" fill="#ffffff" />
        <circle cx="275" cy="178" r="2" fill="#ffffff" />

        {/* Cute Fox Nose & Smile */}
        <path d="M 246 182 Q 250 180 254 182 Q 250 187 246 182 Z" fill="#0f172a" />
        <path
          d="M 244 188 Q 250 193 256 188"
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Fox Paws / Hands on Steering Wheel */}
        <circle cx="205" cy="225" r="14" fill="url(#foxOrange)" stroke="#3b0764" strokeWidth="4" />
        <circle cx="295" cy="225" r="14" fill="url(#foxOrange)" stroke="#3b0764" strokeWidth="4" />

        {/* Steering Wheel */}
        <path
          d="M 195 230 C 210 210, 290 210, 305 230"
          stroke="#1e293b"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle cx="250" cy="235" r="8" fill="#475569" />

        {/* --- Speed Racing Kart Car --- */}
        {/* Kart Chassis / Body */}
        <path
          d="M 130 295 C 130 255, 175 225, 250 225 C 325 225, 370 255, 370 295 C 370 315, 340 330, 250 330 C 160 330, 130 315, 130 295 Z"
          fill="url(#carBody)"
          stroke="#3b0764"
          strokeWidth="8"
          filter="url(#neonShadow)"
        />

        {/* Kart Windshield Hood & Aero Strip */}
        <path
          d="M 175 275 C 200 245, 300 245, 325 275 C 290 285, 210 285, 175 275 Z"
          fill="#1e1b4b"
          stroke="#a855f7"
          strokeWidth="4"
        />
        <path
          d="M 210 260 L 290 260"
          stroke="#c084fc"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Front Left Kart Wheel */}
        <ellipse cx="160" cy="305" rx="26" ry="20" fill="#09090b" stroke="#6b21a8" strokeWidth="6" />
        <ellipse cx="160" cy="305" rx="12" ry="8" fill="#3f3f46" />

        {/* Front Right Kart Wheel */}
        <ellipse cx="340" cy="305" rx="26" ry="20" fill="#09090b" stroke="#6b21a8" strokeWidth="6" />
        <ellipse cx="340" cy="305" rx="12" ry="8" fill="#3f3f46" />

        {/* Neon Undercar Light Strip */}
        <path
          d="M 180 325 L 320 325"
          stroke="#c084fc"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#neonShadow)"
        />

        {/* --- Emblem Badge & Typography "Vixy Rider" --- */}
        {/* Emblem Shield Background */}
        <path
          d="M 140 340 L 360 340 L 340 405 C 300 440, 200 440, 160 405 Z"
          fill="#090514"
          stroke="url(#purpleGlow)"
          strokeWidth="8"
        />

        {/* Text "Vixy" */}
        <text
          x="250"
          y="390"
          textAnchor="middle"
          fill="url(#textGrad)"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="56"
          letterSpacing="-1.5"
          stroke="#2e1065"
          strokeWidth="3"
          style={{ fontStyle: 'italic', textShadow: '0 4px 12px rgba(168,85,247,0.7)' }}
        >
          Vixy
        </text>

        {/* Subtitle Text "Rider" */}
        <text
          x="250"
          y="420"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="24"
          letterSpacing="4"
          style={{ fontStyle: 'italic', textTransform: 'uppercase' }}
        >
          Rider
        </text>

        {/* Outer Neon Glow Outline Ring */}
        <path
          d="M 115 320 C 85 365, 140 455, 250 455 C 360 455, 415 365, 385 320"
          stroke="#9333ea"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="6 8"
          opacity="0.7"
        />
      </svg>
    </div>
  );
};
