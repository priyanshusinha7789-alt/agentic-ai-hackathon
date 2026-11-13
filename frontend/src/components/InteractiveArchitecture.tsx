import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Bot,
  Shield,
  Sliders,
  Cpu,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  ArrowRight,
  Info,
  Clock,
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';
import { CyberBadge } from './CyberBadge';
import { api } from '../services/api';

export const InteractiveArchitecture: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('gateway');
  const [activePathMode, setActivePathMode] = useState<'green' | 'red'>('green');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [liveProbeRunning, setLiveProbeRunning] = useState<boolean>(false);
  const [liveProbeResult, setLiveProbeResult] = useState<any | null>(null);

  // Core Pipeline Nodes in Olive/Brown Enterprise Identity
  const pipelineNodes = [
    {
      id: 'user',
      title: 'USER REQUEST',
      stageNum: '01',
      subtitle: 'Input Boundary Inspection',
      icon: User,
      color: 'olive',
      badge: 'INGESTION LAYER',
      description: 'Incoming user instructions, client queries, and contextual retrieved data from knowledge bases.',
      securityDetails: [
        'Raw prompt character boundary validation',
        'Delimiter sequence normalization',
        'Authentication context and session token attachment',
        'Zero privileged access granted at client layer'
      ],
      samplePayload: 'User asks: "Can you refund $150 on ticket TCK-1001?" or hostile jailbreak payload.'
    },
    {
      id: 'agent',
      title: 'AI AGENT',
      stageNum: '02',
      subtitle: 'Reasoning Engine',
      icon: Bot,
      color: 'brown',
      badge: 'LLM REASONER',
      description: 'NovaSupport AI model processes input intent, consults context, and formulates planned tool invocations.',
      securityDetails: [
        'Sandboxed task planning without OS execution access',
        'Synthesizes tool call intentions as structured JSON parameters',
        'Must route 100% of tool executions through Security Gateway',
        'Cannot directly invoke databases, shells, or external networks'
      ],
      samplePayload: 'Agent plans: { "tool": "issue_refund", "args": { "amount": 150, "ticket": "TCK-1001" } }'
    },
    {
      id: 'gateway',
      title: 'SECURITY GATEWAY',
      stageNum: '03',
      subtitle: 'Interception Core',
      icon: Shield,
      color: 'olive',
      badge: 'BACKEND FIREWALL',
      isCore: true,
      description: 'The non-bypassable backend proxy running in Python FastAPI. Intercepts and parses every tool request.',
      securityDetails: [
        'Strict allowlist validation (rejects unregistered tools)',
        'Prompt injection multi-signature detector (DAN, jailbreaks, hidden comments)',
        'Blocks honeypot endpoints (dump_user_credentials, execute_raw_command)',
        'Direct tool REST invocations return immediate 403 Forbidden'
      ],
      samplePayload: 'Gateway evaluates: Tool "issue_refund" recognized. Passing to Policy Engine for clearance.'
    },
    {
      id: 'policy',
      title: 'POLICY ENGINE',
      stageNum: '04',
      subtitle: 'RBAC & Scope Governance',
      icon: Sliders,
      color: 'brown',
      badge: 'POLICY EVALUATOR',
      description: 'Dynamic database rules evaluating user role, numerical financial thresholds, tenant ownership, and tokens.',
      securityDetails: [
        'Role Clearance Hierarchy (public < tier1_agent < supervisor < admin)',
        'Financial limit enforcement (Refunds > $500 require supervisor)',
        'Cross-Tenant IDOR Scope validation (Checks customer_id match)',
        'Cryptographic confirmation token verification'
      ],
      samplePayload: 'Policy check: Role = tier1_agent. Amount = $150 (< $500 limit). Result = APPROVED.'
    },
    {
      id: 'tools',
      title: 'APPROVED MOCK TOOLS',
      stageNum: '05',
      subtitle: 'Safe Execution',
      icon: Cpu,
      color: 'olive',
      badge: 'ISOLATED SANDBOX',
      description: 'Synthetic enterprise tools executing safely within sandbox after authorization, with automatic PII masking.',
      securityDetails: [
        'Synthetic knowledge base search & mock ticketing API',
        'Automated PII scrubbing (Credit cards, SSNs, API tokens masked)',
        'Output sanitization before returning context to caller',
        'Cryptographic audit payload hashing'
      ],
      samplePayload: 'Execution response: { "status": "APPROVED", "txn_id": "TXN-REF-8921", "amount": 150 }'
    }
  ];

  const activeNodeData = pipelineNodes.find((n) => n.id === selectedNode) || pipelineNodes[2];

  // Trigger step-by-step automated animation
  const handleTriggerSimulation = (mode: 'green' | 'red') => {
    setActivePathMode(mode);
    setIsSimulating(true);
    setSimulationStep(0);
    setLiveProbeResult(null);

    const stepInterval = setInterval(() => {
      setSimulationStep((prev) => {
        if (prev >= 4) {
          clearInterval(stepInterval);
          setIsSimulating(false);
          return 4;
        }
        return prev + 1;
      });
    }, 650);
  };

  // Run live backend check via real FastAPI endpoint
  const handleRunLiveBackendProbe = async (pathMode: 'green' | 'red') => {
    setLiveProbeRunning(true);
    setLiveProbeResult(null);

    try {
      if (pathMode === 'green') {
        const res = await api.testDirectTool({
          tool_name: 'search_knowledge_base',
          arguments: { query: 'standard refund policy' },
          user_role: 'public',
          protected_mode: true
        });
        setLiveProbeResult({
          decision: res.decision,
          response: `Knowledge search approved: "${res.reason}". Enforced policy rule: ${res.policy_rule}.`,
          tool: res.tool_name,
          violation_reason: res.policy_rule
        });
      } else {
        try {
          await api.testDirectTool({
            tool_name: 'dump_user_credentials',
            arguments: { user_id: 'cust_001' },
            user_role: 'public',
            protected_mode: true
          });
        } catch (err: any) {
          setLiveProbeResult({
            decision: 'BLOCKED',
            response: err.detail?.message || err.message || 'Execution prohibited by active policy rule.',
            tool: 'dump_user_credentials',
            violation_reason: err.detail?.trace?.policy_rule || 'TOOL_DISABLED_HONEYPOT'
          });
        }
      }
    } catch (err: any) {
      setLiveProbeResult({
        decision: 'BLOCKED',
        response: err.message || 'Gateway intercepted unauthorized operation.',
        tool: 'gateway_probe',
        violation_reason: 'SECURITY_GATEWAY_INTERCEPTION'
      });
    } finally {
      setLiveProbeRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Interactive Flow Container Card */}
      <div className="ivory-card p-6 sm:p-10 border border-ivory-border bg-white rounded-2xl shadow-card-elevated space-y-8 relative overflow-hidden text-charcoal">
        {/* Subtle Ivory Grid */}
        <div className="absolute inset-0 ivory-grid-light opacity-60 pointer-events-none" />

        {/* Top Control Bar with Path Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-ivory-border relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-olive-primary animate-pulse" />
              <h3 className="text-xl font-bold text-charcoal tracking-tight">Security Gateway Architecture Pipeline</h3>
              <CyberBadge text="LIVE GATEWAY" variant="olive" size="sm" />
            </div>
            <p className="text-xs text-brown-dark font-mono font-medium mt-1">
              Select or simulate either path to observe how requests navigate the security layer.
            </p>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleTriggerSimulation('green')}
              disabled={isSimulating || liveProbeRunning}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activePathMode === 'green'
                  ? 'bg-olive-primary text-white shadow-md'
                  : 'bg-ivory border border-ivory-border text-charcoal hover:bg-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simulate Approved Flow</span>
            </button>

            <button
              onClick={() => handleTriggerSimulation('red')}
              disabled={isSimulating || liveProbeRunning}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activePathMode === 'red'
                  ? 'bg-terracotta text-white shadow-md'
                  : 'bg-ivory border border-ivory-border text-charcoal hover:bg-white'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Simulate Blocked Attack</span>
            </button>

            <button
              onClick={() => handleRunLiveBackendProbe(activePathMode)}
              disabled={liveProbeRunning || isSimulating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-olive-deep hover:bg-olive-surface text-white font-mono text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${liveProbeRunning ? 'animate-spin' : ''}`} />
              <span>{liveProbeRunning ? 'Probing Gateway...' : 'Run Real Backend Probe'}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            THE 5 SEQUENTIAL PIPELINE NODES (USER -> AI AGENT -> GATEWAY -> POLICY -> MOCK TOOLS)
        ========================================================================= */}
        <div className="py-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {pipelineNodes.map((node, index) => {
              const Icon = node.icon;
              const isSelected = selectedNode === node.id;
              const isNodeActiveInSimulation = isSimulating && simulationStep >= index;
              const isCurrentStep = isSimulating && simulationStep === index;

              const nodeStyles = [
                { iconBg: 'bg-beige border-ivory-border text-charcoal' },
                { iconBg: 'bg-gold-subtle border-gold/30 text-gold-dark' },
                { iconBg: 'bg-sage-light border-olive-primary/40 text-olive-deep' },
                { iconBg: 'bg-terracotta-subtle border-terracotta/30 text-terracotta' },
                { iconBg: 'bg-sage-light border-sage/40 text-sage-dark' },
              ][index] || { iconBg: 'bg-beige text-charcoal' };

              return (
                <div key={node.id} className="relative flex flex-col">
                  {/* Step Card */}
                  <button
                    onClick={() => setSelectedNode(node.id)}
                    className={`w-full p-5 rounded-xl text-left transition-all duration-300 flex flex-col justify-between h-full cursor-pointer relative group ${
                      isSelected
                        ? 'bg-ivory border-2 border-olive-primary shadow-card-hover scale-105 z-20'
                        : isCurrentStep
                        ? 'bg-ivory border-2 border-olive-muted shadow-card-elevated scale-105 z-20'
                        : node.isCore
                        ? 'bg-ivory border border-olive-primary/40 hover:border-olive-primary'
                        : 'bg-white border border-ivory-border hover:border-olive-primary/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-brown-dark group-hover:text-olive-deep">
                          STAGE {node.stageNum}
                        </span>
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 ${nodeStyles.iconBg}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="text-sm font-extrabold text-charcoal tracking-wide mb-1">{node.title}</div>
                      <div className="text-xs font-mono text-brown-dark font-medium">{node.subtitle}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-ivory-border flex items-center justify-between">
                      <span className="text-[10px] font-mono text-olive-deep uppercase tracking-wider font-bold">
                        {node.badge}
                      </span>
                      {isSelected ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-olive-primary" />
                      ) : (
                        <Info className="w-4 h-4 text-brown-dark group-hover:text-olive-deep" />
                      )}
                    </div>
                  </button>

                  {/* Flow Arrow (Desktop Horizontal) */}
                  {index < pipelineNodes.length - 1 && (
                    <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center pointer-events-none">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono transition-colors font-bold ${
                        isNodeActiveInSimulation ? 'bg-olive-primary text-white shadow-sm' : 'bg-ivory text-charcoal border border-ivory-border shadow-sm'
                      }`}>
                        ➔
                      </div>
                    </div>
                  )}

                  {/* Flow Arrow (Mobile Vertical) */}
                  {index < pipelineNodes.length - 1 && (
                    <div className="md:hidden py-2 text-center text-olive-deep font-mono text-xs font-bold">
                      ↓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            DUAL PATHWAY VISUALIZATION (APPROVED vs BLOCKED)
        ========================================================================= */}
        <div className="pt-6 border-t border-ivory-border grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          {/* GREEN APPROVED PATHWAY BOX */}
          <div
            onClick={() => handleTriggerSimulation('green')}
            className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
              activePathMode === 'green'
                ? 'bg-sage-light border-2 border-sage/60 shadow-md'
                : 'bg-ivory border-ivory-border hover:border-olive-primary/40'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-olive-primary/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-olive-primary animate-pulse" />
                <span className="text-xs font-bold text-olive-deep font-mono uppercase tracking-wider">
                  APPROVED PATH: Authorized Request Flow
                </span>
              </div>
              <CyberBadge text="RBAC CLEARANCE VERIFIED" variant="sage" size="sm" />
            </div>

            <div className="py-4 flex flex-wrap items-center gap-2 font-mono text-xs text-olive-deep font-bold">
              <span className="px-2.5 py-1 rounded-md bg-white border border-ivory-border shadow-sm text-charcoal">
                1. User Request
              </span>
              <span>➔</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-ivory-border shadow-sm text-charcoal">
                2. AI Agent
              </span>
              <span>➔</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-ivory-border shadow-sm text-charcoal">
                3. Gateway Pass
              </span>
              <span>➔</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-ivory-border shadow-sm text-charcoal">
                4. Policy Validated
              </span>
              <span>➔</span>
              <span className="px-2.5 py-1 rounded-md bg-olive-primary text-white font-bold shadow-sm">
                5. Mock Tool Executed
              </span>
            </div>

            <p className="text-xs text-brown-dark font-mono font-medium">
              Legitimate user requests pass policy bounds, invoke sandboxed mock tools, have PII scrubbed, and return clean results.
            </p>
          </div>

          {/* RED BLOCKED PATHWAY BOX */}
          <div
            onClick={() => handleTriggerSimulation('red')}
            className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
              activePathMode === 'red'
                ? 'bg-terracotta-subtle border-2 border-terracotta/40 shadow-md'
                : 'bg-ivory border-ivory-border hover:border-brown-warm/40'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-terracotta/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-terracotta animate-ping" />
                <span className="text-xs font-bold text-terracotta-dark font-mono uppercase tracking-wider">
                  BLOCKED PATH: Unauthorised Request Intercepted
                </span>
              </div>
              <CyberBadge text="THREAT QUARANTINED" variant="terracotta" size="sm" />
            </div>

            <div className="py-4 flex flex-wrap items-center gap-2 font-mono text-xs text-brown-dark font-bold">
              <span className="px-2.5 py-1 rounded-md bg-white border border-ivory-border shadow-sm text-charcoal">
                1. Injection Detected
              </span>
              <span>➔</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-ivory-border shadow-sm text-charcoal">
                2. Gateway Halts Execution
              </span>
              <span>➔</span>
              <span className="px-2.5 py-1 rounded-md bg-terracotta text-white font-bold shadow-sm">
                3. Quarantined
              </span>
              <span>➔</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-ivory-border shadow-sm text-charcoal">
                4. Audit Logged
              </span>
              <span>➔</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-ivory-border shadow-sm text-charcoal">
                5. 403 Forbidden
              </span>
            </div>

            <p className="text-xs text-brown-dark font-mono font-medium">
              Hostile prompts or unauthorized tool actions are intercepted before execution, quarantine-logged, and blocked with 403 Forbidden.
            </p>
          </div>
        </div>

        {/* Live Probe Telemetry Output Banner (if probe was triggered) */}
        {liveProbeResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 rounded-xl bg-ivory border border-olive-primary/40 font-mono text-xs space-y-2 relative z-10"
          >
            <div className="flex items-center justify-between pb-2 border-b border-ivory-border">
              <div className="flex items-center gap-2">
                <span className="text-olive-deep font-bold">LIVE BACKEND PROBE TELEMETRY:</span>
                <CyberBadge
                  text={`DECISION: ${liveProbeResult.decision}`}
                  variant={liveProbeResult.decision === 'ALLOWED' ? 'green' : 'red'}
                  size="sm"
                />
              </div>
              <span className="text-xs text-brown-dark font-bold">FastAPI Engine • Port 8000</span>
            </div>
            <p className="text-charcoal leading-relaxed font-semibold">{liveProbeResult.response}</p>
            <div className="text-xs text-olive-deep font-bold">
              Rule Citation: {liveProbeResult.violation_reason}
            </div>
          </motion.div>
        )}
      </div>

      {/* Selected Node Component Deep-Dive Inspector */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeNodeData.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="ivory-card p-6 sm:p-8 border border-ivory-border bg-white space-y-6 shadow-card-subtle text-charcoal"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ivory-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-olive-primary/15 text-olive-deep font-bold border border-olive-primary/30">
                <activeNodeData.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-charcoal">{activeNodeData.title} Component Details</h3>
                  <CyberBadge text={activeNodeData.badge} variant="olive" size="sm" />
                </div>
                <span className="text-xs font-mono text-olive-deep font-bold">{activeNodeData.subtitle}</span>
              </div>
            </div>

            <p className="text-xs text-brown-dark max-w-lg font-mono font-medium leading-relaxed">
              {activeNodeData.description}
            </p>
          </div>

          {/* Active Security Controls Grid */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-charcoal uppercase tracking-wider block font-bold">
              Enforced Security Controls at This Stage:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeNodeData.securityDetails.map((detail: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-ivory border border-ivory-border text-xs text-charcoal font-mono font-medium flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-olive-primary shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Payload Representation */}
          {activeNodeData.samplePayload && (
            <div className="p-4 rounded-xl bg-ivory border border-ivory-border space-y-1.5 font-mono text-xs">
              <span className="text-xs text-charcoal uppercase tracking-wider font-bold">
                Typical Stage Payload &amp; Evaluation:
              </span>
              <div className="text-olive-deep font-bold leading-relaxed whitespace-pre-wrap">
                {activeNodeData.samplePayload}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
