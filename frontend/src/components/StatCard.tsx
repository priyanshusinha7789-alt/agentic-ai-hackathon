import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'olive' | 'brown' | 'taupe' | 'terracotta' | 'gold' | 'sage' | 'red' | 'green' | 'cyan' | 'purple' | 'amber';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'olive',
  trend
}) => {
  const colorMap = {
    olive: {
      border: 'border-ivory-border hover:border-olive-primary',
      iconBg: 'bg-sage-light text-olive-deep border-olive-primary/30',
      value: 'text-olive-deep'
    },
    brown: {
      border: 'border-ivory-border hover:border-brown-warm',
      iconBg: 'bg-beige text-brown-warm border-brown-warm/30',
      value: 'text-brown-dark'
    },
    terracotta: {
      border: 'border-ivory-border hover:border-terracotta',
      iconBg: 'bg-terracotta-subtle text-terracotta border-terracotta/30',
      value: 'text-charcoal'
    },
    gold: {
      border: 'border-ivory-border hover:border-gold',
      iconBg: 'bg-gold-subtle text-gold-dark border-gold/30',
      value: 'text-charcoal'
    },
    sage: {
      border: 'border-ivory-border hover:border-sage',
      iconBg: 'bg-sage-light text-sage-dark border-sage/40',
      value: 'text-charcoal'
    },
    taupe: {
      border: 'border-ivory-border hover:border-taupe-soft',
      iconBg: 'bg-beige text-charcoal border-taupe-soft/40',
      value: 'text-charcoal'
    },
    red: {
      border: 'border-ivory-border hover:border-rose-400',
      iconBg: 'bg-rose-50 text-rose-800 border-rose-200',
      value: 'text-rose-900'
    },
    green: {
      border: 'border-ivory-border hover:border-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      value: 'text-emerald-950'
    },
    amber: {
      border: 'border-ivory-border hover:border-amber-500',
      iconBg: 'bg-amber-50 text-amber-800 border-amber-200',
      value: 'text-amber-950'
    },
    // Aliases
    cyan: {
      border: 'border-ivory-border hover:border-olive-primary',
      iconBg: 'bg-sage-light text-olive-deep border-olive-primary/30',
      value: 'text-olive-deep'
    },
    purple: {
      border: 'border-ivory-border hover:border-brown-warm',
      iconBg: 'bg-beige text-brown-warm border-brown-warm/30',
      value: 'text-brown-dark'
    }
  };

  const scheme = colorMap[color] || colorMap.olive;

  return (
    <div className={`group ivory-card p-6 transition-all duration-300 ${scheme.border} bg-white shadow-card-subtle hover:shadow-card-elevated text-charcoal`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-mono text-brown-dark mb-1.5 font-bold">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl font-extrabold font-mono tracking-tight ${scheme.value}`}>{value}</h3>
            {trend && <span className="text-xs text-brown-dark font-mono font-medium">{trend}</span>}
          </div>
          {subtitle && <p className="text-xs text-brown-dark font-medium mt-1.5">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border shadow-sm group-hover:scale-105 transition-transform duration-200 ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
