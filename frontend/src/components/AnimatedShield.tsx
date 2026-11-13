import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Cpu, Lock, Activity } from 'lucide-react';

interface AnimatedShieldProps {
  protectedMode?: boolean;
  className?: string;
  onToggleMode?: () => void;
}

export const AnimatedShield: React.FC<AnimatedShieldProps> = ({
  protectedMode = true,
  className = "w-80 h-80 sm:w-[440px] sm:h-[440px]",
  onToggleMode
}) => {
  const [hovered, setHovered] = useState(false);
  const isProtected = protectedMode;

  return (
    <div
      className={`relative flex items-center justify-center select-none group cursor-pointer ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onToggleMode}
      title="Click to toggle Gateway Defense Mode"
    >
      {/* Outer ambient blur aura in Olive & Warm Brown */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
          isProtected
            ? hovered
              ? 'bg-gradient-to-tr from-olive-primary/40 via-brown-warm/30 to-olive-muted/40 opacity-70 scale-110'
              : 'bg-gradient-to-tr from-olive-primary/30 via-olive-deep/40 to-brown-warm/30 opacity-60'
            : hovered
            ? 'bg-gradient-to-tr from-rose-600/50 via-brown-dark/40 to-amber-600/40 opacity-80 scale-110'
            : 'bg-gradient-to-tr from-rose-700/40 via-brown-dark/30 to-amber-700/20 opacity-65'
        }`}
      />

      {/* Orbiting Telemetry Ring 1 - Outer segmented ring with tick marks in Taupe/Olive */}
      <div className="absolute inset-2 sm:inset-4 rounded-full border border-dashed border-taupe-soft/30 animate-spin-slow pointer-events-none" />

      {/* Orbiting Telemetry Ring 2 - Counter-rotating orbital with warm brown accents */}
      <div className="absolute inset-8 sm:inset-12 rounded-full border border-brown-warm/30 animate-spin-reverse-slow pointer-events-none" />

      {/* Orbiting Telemetry Ring 3 - Fine high-frequency inner ring */}
      <div className="absolute inset-14 sm:inset-20 rounded-full border border-dotted border-olive-muted/40 animate-spin-slow pointer-events-none" />

      {/* Floating HUD particles & sensor points */}
      <motion.div
        animate={{ y: [-4, 4, -4], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-6 left-8 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-olive-deep/90 border border-taupe-soft/30 text-[10px] font-mono text-ivory shadow-lg backdrop-blur-md"
      >
        <span className={`w-2 h-2 rounded-full ${isProtected ? 'bg-olive-primary animate-pulse' : 'bg-rose-500 animate-ping'}`} />
        <span>FIREWALL: {isProtected ? 'ENFORCING' : 'BYPASSED'}</span>
      </motion.div>

      <motion.div
        animate={{ y: [4, -4, 4], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 right-8 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-olive-deep/90 border border-brown-warm/40 text-[10px] font-mono text-taupe-soft shadow-lg backdrop-blur-md"
      >
        <Activity className="w-3.5 h-3.5 text-olive-muted animate-pulse" />
        <span>LATENCY: 1.2ms</span>
      </motion.div>

      <motion.div
        animate={{ x: [-3, 3, -3], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 -right-4 -translate-y-1/2 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-olive-deep/95 border border-taupe-soft/30 text-[10px] font-mono text-ivory shadow-md"
      >
        <Lock className="w-3 h-3 text-olive-primary" />
        <span>RBAC LEVEL-4</span>
      </motion.div>

      {/* Main Floating 3D Shield SVG Graphic */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotateZ: hovered ? [0, 1, -1, 0] : 0
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-4/5 h-4/5 flex items-center justify-center filter drop-shadow-[0_12px_36px_rgba(37,39,31,0.5)] transition-all duration-300 group-hover:scale-105"
      >
        <svg
          viewBox="0 0 200 240"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary Shield Outline Gradient in Olive & Warm Brown */}
            <linearGradient id="shieldBorderOlive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isProtected ? "#858B68" : "#EF4444"} stopOpacity="0.95" />
              <stop offset="50%" stopColor={isProtected ? "#68734A" : "#80634B"} stopOpacity="0.8" />
              <stop offset="100%" stopColor={isProtected ? "#80634B" : "#514234"} stopOpacity="0.95" />
            </linearGradient>

            {/* Shield Core Glass Background */}
            <linearGradient id="shieldCoreOlive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isProtected ? "rgba(104,115,74,0.3)" : "rgba(128,99,75,0.4)"} />
              <stop offset="50%" stopColor={isProtected ? "rgba(52,59,43,0.85)" : "rgba(81,66,52,0.85)"} />
              <stop offset="100%" stopColor="rgba(37,39,31,0.95)" />
            </linearGradient>
          </defs>

          {/* Layer 1: Outer Shield Hull */}
          <path
            d="M100 12 L185 48 C185 148 100 222 100 222 C100 222 15 148 15 48 Z"
            fill="url(#shieldCoreOlive)"
            stroke="url(#shieldBorderOlive)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Layer 2: Geometric Internal Boundary */}
          <path
            d="M100 30 L168 58 C168 138 100 198 100 198 C100 198 32 138 32 58 Z"
            stroke={isProtected ? "#B7A995" : "#A3846B"}
            strokeWidth="1.5"
            strokeDasharray="5 3"
            strokeOpacity="0.6"
          />

          {/* Layer 3: Central Gateway Axis Beam */}
          <line
            x1="100"
            y1="30"
            x2="100"
            y2="198"
            stroke={isProtected ? "#68734A" : "#80634B"}
            strokeWidth="2"
            strokeOpacity="0.7"
          />

          {/* Layer 4: Latitude Inspection Grids */}
          <line
            x1="50"
            y1="80"
            x2="150"
            y2="80"
            stroke={isProtected ? "#858B68" : "#80634B"}
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          <line
            x1="60"
            y1="120"
            x2="140"
            y2="120"
            stroke={isProtected ? "#B7A995" : "#80634B"}
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          <line
            x1="75"
            y1="160"
            x2="125"
            y2="160"
            stroke={isProtected ? "#858B68" : "#80634B"}
            strokeWidth="1"
            strokeOpacity="0.3"
          />

          {/* Layer 5: Protected AI Agent Core Hexagon */}
          <polygon
            points="100,75 128,90 128,124 100,139 72,124 72,90"
            fill={isProtected ? "rgba(104,115,74,0.3)" : "rgba(128,99,75,0.4)"}
            stroke={isProtected ? "#68734A" : "#80634B"}
            strokeWidth="2.5"
          />

          {/* Inner Hexagon Target Rings */}
          <circle
            cx="100"
            cy="107"
            r="16"
            stroke={isProtected ? "#B7A995" : "#80634B"}
            strokeWidth="1.2"
            strokeDasharray="3 3"
            strokeOpacity="0.7"
          />

          {/* Center Glowing AI Core Point */}
          <circle
            cx="100"
            cy="107"
            r="8"
            fill={isProtected ? "#68734A" : "#80634B"}
            className="animate-pulse"
          />

          {/* Center State Icon */}
          {isProtected ? (
            <path
              d="M93 107 L98 112 L108 101"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M100 100 L100 110 M100 114 L100 116"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          )}

          {/* Active Radar Sweep Line */}
          <line
            x1="100"
            y1="107"
            x2="135"
            y2="107"
            stroke={isProtected ? "#B7A995" : "#80634B"}
            strokeWidth="1.5"
            strokeLinecap="round"
            className="origin-[100px_107px] animate-spin-slow"
          />
        </svg>

        {/* Floating Bottom Status Pill in Deep Olive */}
        <div className="absolute -bottom-4 px-4 py-1.5 rounded-full bg-olive-deep border border-taupe-soft/40 text-[11px] font-mono text-ivory shadow-xl flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isProtected ? 'bg-olive-primary animate-pulse' : 'bg-rose-500 animate-ping'}`} />
          <span className="font-bold tracking-wider">
            {isProtected ? 'GATEWAY ENFORCING • PROTECTED' : 'WARNING: FIREWALL BYPASSED'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
