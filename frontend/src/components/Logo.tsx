import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'light' | 'dark'; // 'light' text for deep olive backgrounds, 'dark' text for ivory
}

export const AgentShieldLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'dark'
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Custom Geometric Shield Mark in Olive + Warm Brown */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} shrink-0`}>
        {/* Subtle Ambient Halo */}
        <div className={`absolute inset-0 rounded-xl blur-md pointer-events-none ${
          isLight ? 'bg-olive-muted/30' : 'bg-olive-primary/20'
        }`} />

        <svg
          viewBox="0 0 40 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_2px_8px_rgba(52,59,43,0.2)]"
        >
          <defs>
            <linearGradient id="shieldOliveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#68734A" />
              <stop offset="50%" stopColor="#80634B" />
              <stop offset="100%" stopColor="#343B2B" />
            </linearGradient>

            <linearGradient id="shieldInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isLight ? "rgba(104,115,74,0.35)" : "rgba(104,115,74,0.2)"} />
              <stop offset="100%" stopColor={isLight ? "rgba(52,59,43,0.8)" : "rgba(247,245,239,0.85)"} />
            </linearGradient>
          </defs>

          {/* Exterior Shield Shell */}
          <path
            d="M20 2 L37 8.5 C37 26.5 20 41 20 41 C20 41 3 26.5 3 8.5 Z"
            fill="url(#shieldInnerGrad)"
            stroke="url(#shieldOliveGrad)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />

          {/* Inner Geometric Shield Contour */}
          <path
            d="M20 7 L32 11.8 C32 24.5 20 34.5 20 34.5 C20 34.5 8 24.5 8 11.8 Z"
            stroke="#B7A995"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />

          {/* Central AI Hexagonal Firewall Core */}
          <polygon
            points="20,15 25,18 25,24 20,27 15,24 15,18"
            fill={isLight ? "rgba(247,245,239,0.2)" : "rgba(104,115,74,0.25)"}
            stroke="#68734A"
            strokeWidth="1.6"
          />

          {/* Neural Ray Connectors */}
          <line x1="20" y1="9" x2="20" y2="15" stroke="#858B68" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="20" y1="27" x2="20" y2="33" stroke="#80634B" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="12" y1="14" x2="15" y2="18" stroke="#858B68" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="28" y1="14" x2="25" y2="18" stroke="#858B68" strokeWidth="1.2" strokeLinecap="round" />

          {/* Core Center Pulse Dot */}
          <circle cx="20" cy="21" r="2.2" fill="#68734A" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-extrabold tracking-tight ${isLight ? 'text-white' : 'text-charcoal'} ${textSizes[size]}`}>
              AgentShield
            </span>
            <span className={`font-extrabold tracking-tight text-olive-primary ${textSizes[size]}`}>
              AI
            </span>
          </div>
          <span className={`text-[10px] font-mono uppercase tracking-wider mt-0.5 ${
            isLight ? 'text-taupe-light font-medium' : 'text-brown-dark font-bold'
          }`}>
            Policy-Enforced Agent Firewall
          </span>
        </div>
      )}
    </div>
  );
};
