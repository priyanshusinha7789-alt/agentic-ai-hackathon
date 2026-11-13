import React from 'react';
import {
  GraduationCap,
  Shield,
  ExternalLink,
  Users
} from 'lucide-react';
import { CyberBadge } from '../components/CyberBadge';
import { Breadcrumb } from '../components/Breadcrumb';

interface TeamPageProps {
  onNavigate?: (page: string) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({
  onNavigate = () => {}
}) => {
  const teamMembers = [
    {
      name: 'Priyanshu Kumar Sinha',
      institution: 'Haldia Institute of Technology',
      role: 'Lead Architect & Full-Stack Engineer',
      focus: 'Security Gateway Architecture, API Design & Backend Policy Engine',
      initials: 'PKS',
      badgeVariant: 'olive' as const,
      linkedinUrl: 'https://www.linkedin.com/in/'
    },
    {
      name: 'Muskan Bharti',
      institution: 'Central University of Punjab, Bathinda',
      role: 'Cybersecurity & Threat Researcher',
      focus: 'Prompt Injection Defense, PII Sanitization & Threat Classification',
      initials: 'MB',
      badgeVariant: 'brown' as const,
      linkedinUrl: 'https://www.linkedin.com/in/muskan-bharti-b8000a380/'
    },
    {
      name: 'Vishesh',
      institution: 'SVNIT Surat',
      role: 'Systems & Benchmark Engineer',
      focus: 'Evaluation Framework, Attack Lab Simulation & UI/UX Experience',
      initials: 'VR',
      badgeVariant: 'gold' as const,
      linkedinUrl: 'https://www.linkedin.com/in/vishesh-ruparel-744a8b36a/'
    }
  ];

  const avatarStyles = [
    'bg-sage-light border border-olive-primary/40 text-olive-deep',
    'bg-beige border border-brown-warm/30 text-brown-dark',
    'bg-gold-subtle border border-gold/30 text-gold-dark'
  ];

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-10 bg-[#F7F5EF] text-charcoal min-h-full w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb currentPage="team" onNavigate={onNavigate} />

      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto pb-4 border-b border-ivory-border">
        <div className="inline-flex items-center gap-2">
          <CyberBadge text="PROJECT CONTRIBUTORS" variant="olive" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-charcoal tracking-tight">
          Engineering Team Behind AgentShield AI
        </h1>
        <p className="text-sm text-brown-dark font-mono font-medium">
          Developed for autonomous systems security, prompt injection defense, and enterprise tool governance.
        </p>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="ivory-card p-8 flex flex-col justify-between space-y-8 hover:border-olive-primary/50 transition-all duration-300 group shadow-card"
          >
            <div className="space-y-6">
              {/* Profile Avatar Graphics */}
              <div className="flex items-center justify-between">
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center font-mono font-bold text-xl shadow-sm group-hover:scale-105 transition-transform ${avatarStyles[index] || avatarStyles[0]}`}>
                  {member.initials}
                </div>
                <CyberBadge text={`TEAM #${index + 1}`} variant={member.badgeVariant} size="sm" />
              </div>

              {/* Name & Role */}
              <div>
                <h3 className="text-xl font-bold text-charcoal group-hover:text-olive-primary transition-colors">
                  {member.name}
                </h3>
                <div className="text-xs font-mono text-olive-primary font-semibold mt-1">{member.role}</div>
              </div>

              {/* Institution */}
              <div className="flex items-start gap-2.5 pt-3 border-t border-ivory-border text-xs text-charcoal">
                <GraduationCap className="w-4 h-4 text-brown-warm shrink-0 mt-0.5" />
                <span className="font-mono leading-tight">{member.institution}</span>
              </div>

              {/* Core Focus */}
              <div className="p-3.5 rounded-xl bg-ivory border border-ivory-border text-xs font-mono text-charcoal/80 leading-relaxed">
                <span className="text-charcoal font-bold block mb-1">Core Focus:</span>
                {member.focus}
              </div>
            </div>

            {/* LinkedIn Action Button */}
            <div className="pt-4 border-t border-ivory-border">
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white hover:bg-ivory border border-ivory-border hover:border-olive-primary/40 text-charcoal hover:text-olive-deep text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4 fill-current text-olive-primary" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z"/>
                </svg>
                <span>LinkedIn Profile</span>
                <ExternalLink className="w-3.5 h-3.5 text-brown-dark" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Project Mission Banner */}
      <div className="p-8 max-w-4xl mx-auto rounded-2xl border border-olive-primary/30 bg-olive-deep text-center space-y-3 shadow-card">
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-taupe-light">
          <Shield className="w-4 h-4 text-olive-primary" />
          <span className="font-bold">Core Architectural Axiom</span>
        </div>
        <p className="text-sm sm:text-base text-ivory font-mono italic max-w-2xl mx-auto leading-relaxed">
          "Security cannot be left to an LLM's own judgement. Security must be enforced by a backend gateway with deterministic validation, immutable auditing, and non-bypassable policies."
        </p>
      </div>
    </div>
  );
};
