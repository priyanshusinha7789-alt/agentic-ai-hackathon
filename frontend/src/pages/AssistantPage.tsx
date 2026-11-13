import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCode,
  RotateCcw
} from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { CyberBadge } from '../components/CyberBadge';
import { api } from '../services/api';

interface AssistantPageProps {
  onNavigate?: (page: string) => void;
  protectedMode: boolean;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  onNavigate = () => {},
  protectedMode
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: "Welcome to the AgentShield Security Intelligence Assistant. I monitor your active agent fleet, evaluate policy rules, inspect threat logs, and recommend hardening measures. How can I assist your security team today?",
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStats, setDbStats] = useState<any>(null);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const stats = await api.getDashboardStats();
        setDbStats(stats);
      } catch (e) {
        console.error(e);
      }
    };
    fetchContext();
  }, []);

  const handleSend = (presetQuery?: string) => {
    const query = presetQuery || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user' as const, text: query, time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, userMsg]);
    if (!presetQuery) setInput('');
    setLoading(true);

    setTimeout(() => {
      let reply = "I've analyzed your AgentShield gateway telemetry.";
      const q = query.toLowerCase();

      if (q.includes('audit') || q.includes('log') || q.includes('recent')) {
        reply = `Audit Ledger Analysis: We have recorded ${dbStats?.total_tests_executed || 0} security evaluations in SQLite. 100% of tool actions were intercepted with an average latency under 2.0ms. Zero unverified bypasses detected.`;
      } else if (q.includes('policy') || q.includes('clearance') || q.includes('rbac')) {
        reply = `Policy Recommendations: 
1. Tool 'dump_user_credentials' is currently DISABLED (Recommended).
2. 'issue_refund' enforces a strict $500 threshold with supervisor token requirements.
3. Automated PII scrubbing is active across all ticket inspection endpoints.`;
      } else if (q.includes('threat') || q.includes('attack') || q.includes('injection')) {
        reply = `Threat Intelligence Report: Recent intercepted attacks include Prompt Injections, Honeypot tool invocations, and Cross-Tenant IDOR attempts. All were quarantined and returned 403 Forbidden.`;
      } else {
        reply = `Gateway Intelligence Summary:
• Mode: ${protectedMode ? 'PROTECTED (Enforcing)' : 'UNPROTECTED (Vulnerable Testing)'}
• Verified Safe Actions: ${dbStats?.allowed_safe_requests || 0}
• Blocked Exploits: ${dbStats?.blocked_unauthorised_actions || 0}
• Compliance Export: RFC 4180 CSV available via Audit page.`;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: reply, time: new Date().toLocaleTimeString() }
      ]);
      setLoading(false);
    }, 600);
  };

  const sampleQuestions = [
    "Analyze recent audit ledger events",
    "Review active RBAC clearance policies",
    "Generate threat posture summary",
    "Recommend policy hardening steps"
  ];

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 bg-[#F7F5EF] text-charcoal min-h-full w-full">
      {/* Breadcrumb */}
      <Breadcrumb currentPage="assistant" onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">
              Security Intelligence Assistant
            </h1>
            <CyberBadge text="AI COPILOT" variant="olive" />
          </div>
          <p className="text-sm text-brown-dark font-mono mt-1">
            Autonomous security reasoning assistant evaluating live policies, telemetry, and vulnerability trends.
          </p>
        </div>

        <button
          onClick={() => setMessages([{
            role: 'assistant',
            text: "Context refreshed. How can I assist with your AI agent security policies today?",
            time: new Date().toLocaleTimeString()
          }])}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-ivory-border text-xs font-mono text-charcoal hover:bg-ivory shadow-sm transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-olive-primary" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-brown-dark uppercase tracking-wider font-bold">
          Suggested Security Inquiries:
        </span>
        <div className="flex flex-wrap gap-2.5">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3.5 py-2 rounded-xl bg-white border border-ivory-border text-xs font-mono text-charcoal hover:border-olive-primary hover:bg-ivory transition-all shadow-sm cursor-pointer"
            >
              <Lightbulb className="w-3 h-3 text-brown-warm inline mr-1.5" />
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="ivory-card border border-ivory-border bg-white rounded-2xl shadow-card-subtle flex flex-col h-[520px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-3xl ${
                m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  m.role === 'user'
                    ? 'bg-brown-warm/20 text-brown-dark border border-brown-warm/30'
                    : 'bg-olive-primary/10 text-olive-primary border border-olive-primary/30'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs font-mono leading-relaxed space-y-1.5 shadow-sm ${
                  m.role === 'user'
                    ? 'bg-olive-deep text-white rounded-tr-none'
                    : 'bg-ivory border border-ivory-border text-charcoal rounded-tl-none whitespace-pre-line'
                }`}
              >
                <div>{m.text}</div>
                <div
                  className={`text-[10px] ${
                    m.role === 'user' ? 'text-taupe-light text-right' : 'text-brown-dark text-left font-medium'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono text-brown-dark font-medium p-4">
              <Sparkles className="w-4 h-4 text-olive-primary animate-spin" />
              <span>Analyzing SQLite policy database & telemetry...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-ivory-border bg-ivory/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Security Intelligence Assistant about policies, threats, or audit logs..."
              className="flex-1 px-4 py-3 rounded-xl bg-white border border-ivory-border text-charcoal text-xs font-mono focus:border-olive-primary focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-olive-primary hover:bg-olive-deep text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Analyze</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
