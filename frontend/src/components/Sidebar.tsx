import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Flame,
  Shield,
  Sliders,
  AlertTriangle,
  FileText,
  BarChart3,
  Users,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Award
} from 'lucide-react';
import { AgentShieldLogo } from './Logo';
import { CyberBadge } from './CyberBadge';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  protectedMode: boolean;
  mobileMenuOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  protectedMode,
  mobileMenuOpen,
  onCloseMobile
}) => {
  const sections: NavSection[] = [
    {
      group: 'Core Operations',
      items: [
        { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard, badge: 'Live DB' },
        { id: 'playground', label: 'AI Agent Playground', icon: Bot, badge: 'Sandbox' },
        { id: 'attack-lab', label: 'Attack Simulation Lab', icon: Flame, badge: '8 Scenarios', highlight: true },
        { id: 'gateway', label: 'Security Gateway', icon: Shield, badge: 'Pipeline' },
      ]
    },
    {
      group: 'Security Enforcement',
      items: [
        { id: 'policies', label: 'Security Policy Centre', icon: Sliders },
        { id: 'threats', label: 'Threat Explorer', icon: AlertTriangle, badge: 'Alerts' },
        { id: 'audit', label: 'Forensic Audit Logs', icon: FileText, badge: 'CSV' },
      ]
    },
    {
      group: 'Evaluation & AI Tools',
      items: [
        { id: 'benchmark', label: 'Evaluation & Benchmarks', icon: BarChart3, badge: 'Metrics' },
        { id: 'assistant', label: 'Intelligence Assistant', icon: Sparkles, badge: 'AI Copilot' },
        { id: 'judge-demo', label: 'Judge Demo Walkthrough', icon: Award, highlight: true },
      ]
    },
    {
      group: 'Contributors',
      items: [
        { id: 'team', label: 'Engineering Team', icon: Users },
      ]
    }
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Spacious Deep Olive Enterprise Sidebar */}
      <aside
        className={`fixed md:sticky top-18 z-40 h-[calc(100vh-4.5rem)] w-72 shrink-0 flex flex-col justify-between border-r border-olive-border bg-olive-deep text-ivory transition-transform duration-300 shadow-xl ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Back to landing page button */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl bg-olive-surface/90 hover:bg-olive-primary/40 border border-olive-border hover:border-olive-muted text-xs font-mono text-ivory hover:text-white transition-all cursor-pointer mb-2 font-semibold shadow-sm group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sage group-hover:text-white transition-colors" />
            <span>Return to Landing Page</span>
          </button>

          {/* Navigation Groups */}
          {sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <div className="px-3 text-[11px] font-mono uppercase tracking-wider text-sage font-bold">
                {sec.group}
              </div>

              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`group flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-olive-primary text-white border border-olive-muted shadow-md font-bold'
                        : 'text-ivory/90 hover:text-white hover:bg-olive-surface border border-transparent font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-white'
                            : item.highlight
                            ? 'text-gold group-hover:text-white'
                            : 'text-taupe-light group-hover:text-white'
                        }`}
                      />
                      <span className="font-sans">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold ${
                            isActive
                              ? 'bg-white/20 text-white border border-white/30'
                              : item.highlight
                              ? 'bg-gold/20 text-gold-subtle border border-gold/40'
                              : 'bg-olive-surface text-ivory border border-olive-border/90'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Gateway Health Card */}
        <div className="p-4 border-t border-olive-border bg-olive-surface/90">
          <div className="p-3.5 rounded-xl border border-olive-border/90 bg-olive-deep/95 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-sage uppercase font-bold tracking-wider">GATEWAY STATUS</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                protectedMode ? 'bg-olive-primary text-white' : 'bg-rose-600 text-white'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {protectedMode ? 'ENFORCING' : 'BYPASSED'}
              </span>
            </div>
            <p className="text-[11px] text-ivory font-mono leading-tight font-medium">
              {protectedMode ? 'Python FastAPI policy engine active & persisting to SQLite.' : 'Controlled unprotected testing mode enabled.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
