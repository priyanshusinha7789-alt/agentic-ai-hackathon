import React, { useState, useEffect } from 'react';
import {
  Shield,
  Server,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Terminal,
  Layers,
  Lock,
  Cpu
} from 'lucide-react';
import { CyberBadge } from '../components/CyberBadge';
import { Breadcrumb } from '../components/Breadcrumb';
import { api } from '../services/api';
import { ToolExecutionTrace } from '../types';

interface GatewayPageProps {
  protectedMode: boolean;
  onNavigate?: (page: string) => void;
}

export const GatewayPage: React.FC<GatewayPageProps> = ({
  protectedMode,
  onNavigate = () => {}
}) => {
  const [inspectData, setInspectData] = useState<any>(null);
  const [selectedTool, setSelectedTool] = useState('dump_user_credentials');
  const [callerRole, setCallerRole] = useState('public');
  const [callerUserId, setCallerUserId] = useState('cust_001');
  const [customArgs, setCustomArgs] = useState('{\n  "user_id": "cust_001"\n}');
  const [directResult, setDirectResult] = useState<ToolExecutionTrace | null>(null);
  const [directError, setDirectError] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.inspectGateway();
        setInspectData(data);
      } catch (err) {
        console.error('Failed to inspect gateway:', err);
      }
    };
    load();
  }, []);

  const handleToolChange = (toolName: string) => {
    setSelectedTool(toolName);
    if (toolName === 'dump_user_credentials') {
      setCustomArgs('{\n  "user_id": "cust_001"\n}');
    } else if (toolName === 'issue_refund') {
      setCustomArgs('{\n  "ticket_code": "TCK-1001",\n  "amount": 750.0,\n  "reason": "Direct API bypass attempt"\n}');
    } else if (toolName === 'delete_ticket') {
      setCustomArgs('{\n  "ticket_code": "TCK-1001"\n}');
    } else if (toolName === 'get_ticket_details') {
      setCustomArgs('{\n  "ticket_code": "TCK-1002"\n}');
    } else if (toolName === 'search_knowledge_base') {
      setCustomArgs('{\n  "query": "refund policy"\n}');
    }
  };

  const handleExecuteDirectTest = async () => {
    setLoading(true);
    setDirectResult(null);
    setDirectError(null);

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(customArgs);
    } catch (e) {
      alert('Invalid JSON in arguments field.');
      setLoading(false);
      return;
    }

    try {
      const trace = await api.testDirectTool({
        tool_name: selectedTool,
        arguments: parsedArgs,
        user_id: callerUserId,
        user_role: callerRole,
        protected_mode: protectedMode
      });
      setDirectResult(trace);
    } catch (err: any) {
      setDirectError(err.detail || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-10 bg-[#F7F5EF] text-charcoal min-h-full w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb currentPage="gateway" onNavigate={onNavigate} />

      {/* Header */}
      <div className="pb-6 border-b border-ivory-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">Security Gateway Architecture</h1>
            <CyberBadge text="ENFORCEMENT ENGINE" variant="olive" />
          </div>
          <p className="text-sm text-brown-dark font-mono font-medium mt-1">
            Backend-enforced security middleware. Frontend checks are never trusted — all tool calls must satisfy server policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-ivory-border text-xs font-mono text-charcoal shadow-sm">
            Active Policies: <span className="text-olive-primary font-bold">{inspectData?.active_policies_count || 6}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white border border-ivory-border text-xs font-mono text-charcoal shadow-sm">
            Audit Records: <span className="text-brown-warm font-bold">{inspectData?.audit_records_count || 0}</span>
          </div>
        </div>
      </div>

      {/* 7 Security Layers Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-charcoal uppercase tracking-wider font-mono">
          7 Discrete Enforcement Layers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {inspectData?.architecture_layers ? (
            inspectData.architecture_layers.map((layer: any, idx: number) => {
              const layerTints = [
                'bg-sage-light border-olive-primary/30 text-olive-deep',
                'bg-terracotta-subtle border-terracotta/30 text-terracotta',
                'bg-gold-subtle border-gold/30 text-gold-dark',
                'bg-beige border-brown-warm/30 text-brown-dark',
                'bg-sage-light border-sage/40 text-sage-dark',
                'bg-terracotta-subtle border-terracotta/30 text-terracotta',
                'bg-sage-light border-olive-primary/30 text-olive-deep',
              ];
              const tint = layerTints[idx % layerTints.length];
              return (
                <div key={layer.layer} className="ivory-card p-6 space-y-3 shadow-card-subtle hover:shadow-card-elevated transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-olive-primary font-bold">Layer 0{layer.layer}</span>
                    <CyberBadge text={layer.status} variant="olive" size="sm" />
                  </div>
                  <h3 className="text-sm font-bold text-charcoal">{layer.name}</h3>
                  <p className="text-xs text-brown-dark font-medium leading-relaxed">{layer.description}</p>
                </div>
              );
            })
          ) : (
            <div className="text-xs font-mono text-brown-dark font-medium">Loading architecture inspection...</div>
          )}
        </div>
      </div>

      {/* Direct Bypass Testing Sandbox */}
      <div className="ivory-card p-8 border border-ivory-border space-y-8 bg-white shadow-card-subtle">
        <div className="flex items-center justify-between pb-6 border-b border-ivory-border">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-light border border-olive-primary/30 flex items-center justify-center text-olive-deep shadow-sm">
                <Server className="w-5 h-5 text-olive-deep" />
              </div>
              <h2 className="text-xl font-bold text-charcoal">Direct Tool Invocation &amp; Bypass Test Sandbox</h2>
            </div>
            <p className="text-xs sm:text-sm text-brown-dark font-mono font-medium mt-1">
              Verify that hitting tool endpoints directly from outside the agent interface cannot bypass the gateway.
            </p>
          </div>
          <CyberBadge
            text={protectedMode ? 'PROTECTION ENFORCED' : 'UNPROTECTED SIMULATION'}
            variant={protectedMode ? 'olive' : 'red'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-5 text-xs font-mono">
            <div>
              <label className="text-brown-dark block mb-1.5 font-bold uppercase tracking-wider">Target Mock Tool:</label>
              <select
                value={selectedTool}
                onChange={(e) => handleToolChange(e.target.value)}
                className="w-full bg-white border border-ivory-border rounded-xl p-3 text-charcoal focus:outline-none focus:border-olive-primary shadow-sm"
              >
                <option value="dump_user_credentials">dump_user_credentials (Disabled Honeypot)</option>
                <option value="issue_refund">issue_refund (High Risk - Requires Supervisor & Token)</option>
                <option value="delete_ticket">delete_ticket (Critical - Admin Only)</option>
                <option value="get_ticket_details">get_ticket_details (Role & Scope Protected)</option>
                <option value="search_knowledge_base">search_knowledge_base (Public Allowlisted)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-brown-dark block mb-1.5 font-bold uppercase tracking-wider">Caller Role Clearance:</label>
                <select
                  value={callerRole}
                  onChange={(e) => setCallerRole(e.target.value)}
                  className="w-full bg-white border border-ivory-border rounded-xl p-3 text-charcoal focus:outline-none focus:border-olive-primary shadow-sm"
                >
                  <option value="public">public (Customer)</option>
                  <option value="tier1_agent">tier1_agent</option>
                  <option value="supervisor">supervisor</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div>
                <label className="text-brown-dark block mb-1.5 font-bold uppercase tracking-wider">Caller User ID:</label>
                <input
                  type="text"
                  value={callerUserId}
                  onChange={(e) => setCallerUserId(e.target.value)}
                  className="w-full bg-white border border-ivory-border rounded-xl p-2.5 text-charcoal focus:outline-none focus:border-olive-primary shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-brown-dark block mb-1.5 font-bold uppercase tracking-wider">Tool Arguments (JSON):</label>
              <textarea
                rows={5}
                value={customArgs}
                onChange={(e) => setCustomArgs(e.target.value)}
                className="w-full bg-ivory border border-ivory-border rounded-xl p-3.5 text-olive-deep font-mono text-xs focus:outline-none focus:border-olive-primary leading-relaxed shadow-inner"
              />
            </div>

            <button
              onClick={handleExecuteDirectTest}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-olive-primary hover:bg-olive-deep text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50 transition-all"
            >
              <Play className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Evaluating Gateway...' : 'Attempt Direct Tool Execution'}</span>
            </button>
          </div>

          {/* Results Output Console */}
          <div className="p-6 rounded-2xl bg-ivory/60 border border-ivory-border flex flex-col justify-between text-xs font-mono space-y-4 shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-ivory-border">
                <span className="text-brown-dark font-bold uppercase tracking-wider">Gateway Live Response:</span>
                {directError ? (
                  <CyberBadge text="HTTP 403 FORBIDDEN" variant="red" size="sm" />
                ) : directResult ? (
                  <CyberBadge text={directResult.decision} variant={directResult.decision === 'ALLOWED' ? 'green' : 'amber'} size="sm" />
                ) : (
                  <span className="text-brown-dark font-medium text-xs">Awaiting direct invocation</span>
                )}
              </div>

              <div className="mt-4">
                {directError ? (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-rose-700 text-sm">
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span>SecurityGatewayException Blocked Call!</span>
                    </div>
                    <p className="text-xs leading-relaxed">{directError.message || JSON.stringify(directError)}</p>
                    {directError.trace && (
                      <pre className="p-3 rounded-lg bg-white border border-rose-200 text-[11px] text-rose-950 overflow-x-auto mt-2">
                        {JSON.stringify(directError.trace, null, 2)}
                      </pre>
                    )}
                  </div>
                ) : directResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-olive-primary/10 border border-olive-primary/30 text-olive-deep space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-2 font-bold text-olive-primary text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Execution Permitted by Policy</span>
                      </div>
                      <p className="text-xs leading-relaxed">{directResult.reason}</p>
                    </div>

                    <div>
                      <span className="text-brown-dark text-xs block mb-1.5 font-bold">Execution Trace Details:</span>
                      <pre className="p-3.5 rounded-xl bg-white border border-ivory-border text-xs text-charcoal overflow-x-auto shadow-sm">
                        {JSON.stringify(directResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-brown-dark font-medium text-center py-20 space-y-3">
                    <Terminal className="w-10 h-10 opacity-30 mx-auto" />
                    <p className="text-xs max-w-sm mx-auto">
                      Click "Attempt Direct Tool Execution" to test backend clearance enforcement and prove that bypassing the frontend fails.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-brown-dark font-medium border-t border-ivory-border pt-3 font-mono">
              Defense Rule: The gateway checks policies independently of the client application. Direct REST attacks receive 403 Forbidden.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
