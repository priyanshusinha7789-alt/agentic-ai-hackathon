import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Menu,
  Activity,
  ArrowRight,
  ExternalLink,
  Home,
  LayoutDashboard,
  Layers,
  Terminal,
  BarChart3,
  Users
} from 'lucide-react';
import { AgentShieldLogo } from './Logo';
import { CyberBadge } from './CyberBadge';

interface NavbarProps {
  protectedMode: boolean;
  onToggleProtectedMode: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  protectedMode,
  onToggleProtectedMode,
  activePage,
  onNavigate,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const isLanding = activePage === 'landing';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        isLanding
          ? 'border-b border-olive-border bg-olive-deep/95 text-ivory backdrop-blur-md'
          : 'border-b border-ivory-border bg-white/95 text-charcoal shadow-sm backdrop-blur-md'
      }`}
    >
      <div className="flex h-18 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Brand & Logo */}
        <div
          className="cursor-pointer group flex items-center"
          onClick={() => onNavigate('landing')}
        >
          <AgentShieldLogo size="md" variant={isLanding ? "light" : "dark"} />
        </div>

        {/* Center Navigation Links (Visible on Landing Page) */}
        {isLanding ? (
          <nav className="hidden lg:flex items-center gap-8 text-xs font-mono text-taupe-light">
            <button
              onClick={() => {
                const el = document.getElementById('the-threat-surface');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Problem Overview
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('solution-architecture');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Architecture
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('platform-showcase');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Capabilities
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('attack-defense-lab');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Attack Lab
            </button>
            <button
              onClick={() => onNavigate('benchmark')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Benchmarks
            </button>
            <button
              onClick={() => onNavigate('team')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Team
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-brown-dark font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-olive-primary animate-pulse" />
            <span>FastAPI Gateway: <span className="text-olive-deep font-bold">ACTIVE ENFORCING</span></span>
            <span className="text-olive-primary/40 font-bold">|</span>
            <span className="text-brown-dark font-bold">Port 8000</span>
            <span className="text-olive-primary/40 font-bold">|</span>
            <span className="text-olive-deep font-bold">SQLite Ledger</span>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Defense Mode Switcher */}
          <button
            onClick={onToggleProtectedMode}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all duration-300 cursor-pointer border ${
              protectedMode
                ? isLanding
                  ? 'bg-olive-primary/20 text-white border-olive-primary/50 hover:bg-olive-primary/30'
                  : 'bg-olive-primary/10 text-olive-deep border-olive-primary/30 hover:bg-olive-primary/20'
                : isLanding
                ? 'bg-rose-500/20 text-rose-200 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-rose-500/10 text-rose-700 border-rose-500/30 hover:bg-rose-500/20'
            }`}
            title="Toggle AgentShield Gateway Defense Mode"
          >
            {protectedMode ? (
              <>
                <ShieldCheck className={`w-4 h-4 shrink-0 ${isLanding ? 'text-olive-muted' : 'text-olive-primary'}`} />
                <span className="hidden sm:inline font-bold">PROTECTED MODE</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
                <span className="hidden sm:inline font-bold">UNPROTECTED</span>
              </>
            )}
          </button>

          {/* Primary Action Button */}
          {isLanding ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-mono text-white bg-olive-primary hover:bg-olive-deep border border-olive-muted transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4 text-white" />
              <span>Launch Dashboard</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono text-charcoal bg-ivory hover:bg-white border border-ivory-border transition-all cursor-pointer font-medium shadow-sm"
            >
              <Home className="w-3.5 h-3.5 text-olive-primary" />
              <span>Platform Site</span>
            </button>
          )}

          {/* Mobile Menu Button for Console Drawer */}
          {!isLanding && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl bg-ivory border border-ivory-border text-charcoal hover:bg-white"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
