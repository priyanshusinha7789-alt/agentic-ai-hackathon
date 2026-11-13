import React from 'react';

interface CyberBadgeProps {
  variant?: 'olive' | 'brown' | 'taupe' | 'ivory' | 'terracotta' | 'gold' | 'sage' | 'red' | 'green' | 'amber' | 'cyan' | 'purple' | 'slate';
  text: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const CyberBadge: React.FC<CyberBadgeProps> = ({
  variant = 'olive',
  text,
  size = 'md',
  pulse = false
}) => {
  const variantStyles = {
    // High-contrast Olive + Brown variants readable on white cards and light backgrounds
    olive: 'bg-olive-primary/15 text-olive-deep border-olive-primary/40 font-bold',
    brown: 'bg-brown-warm/15 text-brown-dark border-brown-warm/40 font-bold',
    taupe: 'bg-taupe-soft/30 text-charcoal border-taupe-soft/60 font-bold',
    ivory: 'bg-white text-charcoal border-ivory-border shadow-sm font-bold',
    terracotta: 'bg-terracotta/15 text-terracotta-dark border-terracotta/40 font-bold',
    gold: 'bg-gold/15 text-gold-dark border-gold/40 font-bold',
    sage: 'bg-sage/20 text-sage-dark border-sage/50 font-bold',
    // Security Decision Variants (AA Accessible Contrast)
    red: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
    green: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold',
    amber: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
    // Compatibility aliases mapped to olive/brown palette
    cyan: 'bg-olive-primary/15 text-olive-deep border-olive-primary/40 font-bold',
    purple: 'bg-brown-warm/15 text-brown-dark border-brown-warm/40 font-bold',
    slate: 'bg-ivory text-charcoal border-ivory-border font-bold',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full font-mono tracking-wide ${variantStyles[variant] || variantStyles.olive} ${sizeStyles[size]}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            variant === 'red' ? 'bg-rose-500' : variant === 'green' ? 'bg-emerald-600' : 'bg-olive-primary'
          }`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            variant === 'red' ? 'bg-rose-600' : variant === 'green' ? 'bg-emerald-700' : 'bg-olive-primary'
          }`} />
        </span>
      )}
      {text}
    </span>
  );
};
