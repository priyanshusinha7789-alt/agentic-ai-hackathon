import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPage, onNavigate }) => {
  const pageTitles: Record<string, string> = {
    dashboard: 'Overview Dashboard',
    playground: 'AI Agent Playground',
    'attack-lab': 'Attack Simulation Lab',
    gateway: 'Security Gateway',
    policies: 'Security Policy Centre',
    threats: 'Threat Explorer',
    audit: 'Forensic Audit Logs',
    benchmark: 'Evaluation & Benchmarks',
    assistant: 'Security Intelligence Assistant',
    'judge-demo': 'Judge Demo Walkthrough',
    team: 'Engineering Team',
  };

  const title = pageTitles[currentPage] || currentPage;

  return (
    <nav className="flex items-center gap-2 text-xs font-mono text-brown-dark font-medium mb-6">
      <button
        onClick={() => onNavigate('landing')}
        className="flex items-center gap-1.5 hover:text-olive-primary transition-colors cursor-pointer font-semibold"
      >
        <Home className="w-3.5 h-3.5 text-olive-deep" />
        <span>Platform</span>
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-brown-dark" />

      <button
        onClick={() => onNavigate('dashboard')}
        className={`hover:text-olive-primary transition-colors cursor-pointer ${
          currentPage === 'dashboard' ? 'text-charcoal font-bold' : 'text-brown-dark font-semibold'
        }`}
      >
        Console
      </button>

      {currentPage !== 'dashboard' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-brown-dark" />
          <span className="text-olive-deep font-bold">{title}</span>
        </>
      )}
    </nav>
  );
};
